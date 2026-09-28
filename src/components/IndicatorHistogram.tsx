import React, { useMemo, useState } from 'react';
import { BarChart2 } from 'lucide-react';
import { EmpresaPESV } from '../types/pesv';

interface IndicatorHistogramProps {
  empresas: EmpresaPESV[];
  nombreIndicador: string;
  codigoIndicador: string;
  unidad: string;
  extractorValor: (e: EmpresaPESV) => number;
}

export const IndicatorHistogram: React.FC<IndicatorHistogramProps> = ({
  empresas,
  nombreIndicador,
  codigoIndicador,
  unidad,
  extractorValor,
}) => {
  const [binSelected, setBinSelected] = useState<number | null>(null);

  const valores = useMemo(() => {
    const raw = empresas.map(extractorValor).filter(v => typeof v === 'number' && !isNaN(v));
    const sortedRaw = [...raw].sort((a, b) => a - b);
    const p98 = sortedRaw[Math.floor(sortedRaw.length * 0.98)] || 0;
    const techoLogico = Math.max(p98 * 2, 100); 
    return raw.filter(v => v <= techoLogico);
  }, [empresas, extractorValor]);

  const stats = useMemo(() => {
    if (valores.length === 0) return { media: 0, sigma: 0, mediana: 0, min: 0, max: 0, q1: 0, q3: 0, bins: [], kdePoints: [], maxCount: 1, maxDensity: 1 };

    const n = valores.length;
    const sorted = [...valores].sort((a, b) => a - b);
    const min = sorted[0];
    const max = sorted[n - 1];
    const suma = sorted.reduce((acc, v) => acc + v, 0);
    const media = suma / n;
    const varianza = sorted.reduce((acc, v) => acc + Math.pow(v - media, 2), 0) / (n > 1 ? n - 1 : 1);
    const sigma = Math.sqrt(varianza);

    const numBins = Math.max(6, Math.min(10, Math.ceil(Math.log2(n) + 1)));
    const range = max - min || 1;
    const binWidth = range / numBins;

    const bins = Array.from({ length: numBins }, (_, i) => {
      const start = min + i * binWidth;
      const end = i === numBins - 1 ? max : start + binWidth;
      const empresasEnBin = empresas.filter(emp => {
        const v = extractorValor(emp);
        if (i === numBins - 1) return v >= start && v <= end;
        return v >= start && v < end;
      });

      return {
        index: i, start, end,
        label: `${start.toFixed(1)} - ${end.toFixed(1)}`,
        conteo: empresasEnBin.length,
        porcentaje: (empresasEnBin.length / n) * 100,
        empresas: empresasEnBin,
      };
    });

    const maxCount = Math.max(...bins.map(b => b.conteo), 1);
    const bandwidth = sigma > 0 ? 1.06 * sigma * Math.pow(n, -0.2) : binWidth * 0.8;
    const numKdeSteps = 60;
    const kdePoints: { x: number; density: number }[] = [];
    let maxDensity = 0;
    for (let i = 0; i <= numKdeSteps; i++) {
      const x = min + i * (range / numKdeSteps);
      let sumKernel = 0;
      for (const xi of sorted) {
        const u = (x - xi) / bandwidth;
        sumKernel += Math.exp(-0.5 * u * u) / (Math.sqrt(2 * Math.PI) * bandwidth);
      }
      const density = sumKernel / n;
      if (density > maxDensity) maxDensity = density;
      kdePoints.push({ x, density });
    }

    return { media, sigma, min, max, bins, maxCount, kdePoints, maxDensity: maxDensity || 1 };
  }, [valores, empresas, extractorValor]);

  const svgWidth = 720;
  const svgHeight = 280;
  const padLeft = 45;
  const padRight = 35;
  const padTop = 30;
  const padBottom = 40;
  const chartW = svgWidth - padLeft - padRight;
  const chartH = svgHeight - padTop - padBottom;

  const scaleX = (val: number) => padLeft + ((val - stats.min) / (stats.max - stats.min || 1)) * chartW;
  const scaleY = (conteo: number) => padTop + chartH - (conteo / (stats.maxCount || 1)) * chartH;
  const scaleKdeY = (density: number) => padTop + chartH - (density / (stats.maxDensity || 1)) * chartH * 0.95;
  const mediaX = scaleX(stats.media);

  const kdePathD = useMemo(() => {
    if (stats.kdePoints.length === 0) return '';
    return stats.kdePoints.reduce((acc, pt, idx) => idx === 0 ? `M ${scaleX(pt.x)},${scaleKdeY(pt.density)}` : `${acc} L ${scaleX(pt.x)},${scaleKdeY(pt.density)}`, '');
  }, [stats.kdePoints, stats.min, stats.max, stats.maxDensity]);

  const kdeAreaD = useMemo(() => {
    if (!kdePathD) return '';
    const yZero = padTop + chartH;
    return `${kdePathD} L ${scaleX(stats.kdePoints[stats.kdePoints.length - 1].x)},${yZero} L ${scaleX(stats.kdePoints[0].x)},${yZero} Z`;
  }, [kdePathD, stats.kdePoints, stats.min, stats.max]);

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-800 border border-blue-200">
              {codigoIndicador}
            </span>
            <span className="text-xs text-slate-500 font-semibold">Análisis Estadístico Poblacional</span>
          </div>
          <h3 className="text-sm font-bold text-slate-900 mt-1 flex items-center gap-2">
            <BarChart2 className="w-4 h-4 text-blue-600" />
            Histograma Interactivo (Haz clic en una barra para ver detalles)
          </h3>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-5 items-start">
        <div className="flex-1 w-full bg-slate-50/60 rounded-xl border border-slate-200 p-3 overflow-hidden relative">
          <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="w-full h-auto select-none overflow-visible">
            {[0, 0.25, 0.5, 0.75, 1].map((pct, i) => {
              const y = padTop + chartH * (1 - pct);
              return (
                <g key={i}>
                  <line x1={padLeft} y1={y} x2={padLeft + chartW} y2={y} stroke="#e2e8f0" strokeDasharray="3 3" />
                  <text x={padLeft - 6} y={y + 3} textAnchor="end" className="text-[10px] font-mono fill-slate-400">
                    {Math.round(stats.maxCount * pct)}
                  </text>
                </g>
              );
            })}

            {stats.bins.map(bin => {
              const x0 = scaleX(bin.start);
              const barW = Math.max(2, scaleX(bin.end) - x0 - 3);
              const y = scaleY(bin.conteo);
              const h = padTop + chartH - y;
              const isSelected = binSelected === bin.index;

              return (
                <g
                  key={bin.index}
                  className="cursor-pointer transition-opacity"
                  onClick={() => setBinSelected(isSelected ? null : bin.index)}
                >
                  {/* Se agregó un rect invisible más alto para hacer más fácil el clic sobre barras pequeñas */}
                  <rect x={x0} y={padTop} width={barW} height={chartH} fill="transparent" />
                  <rect
                    x={x0} y={y} width={barW} height={h} rx="3"
                    className={`transition-colors ${isSelected ? 'fill-blue-600' : 'fill-blue-400 hover:fill-blue-500'}`}
                  />
                  {bin.conteo > 0 && (
                    <text x={x0 + barW / 2} y={y - 4} textAnchor="middle" className="text-[10px] font-mono font-bold fill-slate-700">
                      {bin.conteo}
                    </text>
                  )}
                  <text x={x0 + barW / 2} y={padTop + chartH + 16} textAnchor="middle" className="text-[9px] font-mono fill-slate-500">
                    {bin.start.toLocaleString(undefined, { maximumFractionDigits: 1 })}
                  </text>
                </g>
              );
            })}

            {/* Crucial: pointer-events-none para que la curva no tape los clics */}
            {kdeAreaD && <path d={kdeAreaD} fill="#6366f1" fillOpacity="0.12" className="pointer-events-none" />}
            {kdePathD && <path d={kdePathD} fill="none" stroke="#4f46e5" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="pointer-events-none" />}

            <line x1={mediaX} y1={padTop - 8} x2={mediaX} y2={padTop + chartH} stroke="#dc2626" strokeWidth="2" strokeDasharray="4 2" />
            <g transform={`translate(${mediaX}, ${padTop - 12})`}>
              <rect x="-42" y="-12" width="84" height="16" rx="4" fill="#dc2626" />
              <text x="0" y="0" textAnchor="middle" className="text-[10px] font-mono font-bold fill-white">
                μ = {stats.media.toLocaleString(undefined, { maximumFractionDigits: 1 })}
              </text>
            </g>
            <line x1={padLeft} y1={padTop + chartH} x2={padLeft + chartW} y2={padTop + chartH} stroke="#94a3b8" strokeWidth="1.5" />
          </svg>
        </div>

        {/* Panel lateral que se queda fijo al dar clic */}
        {binSelected !== null && stats.bins[binSelected] && (
          <div className="w-full lg:w-72 shrink-0 bg-white border border-blue-200 rounded-xl shadow-lg flex flex-col h-[300px]">
            <div className="bg-blue-50 px-4 py-3 border-b border-blue-100 rounded-t-xl flex justify-between items-start">
              <div>
                <h4 className="font-bold text-blue-900 text-xs font-mono">
                  Rango: {stats.bins[binSelected].label} {unidad}
                </h4>
                <p className="text-[10px] text-blue-700 mt-0.5">
                  {stats.bins[binSelected].conteo} organizaciones ({stats.bins[binSelected].porcentaje.toFixed(1)}%)
                </p>
              </div>
              <button onClick={() => setBinSelected(null)} className="text-blue-500 hover:text-blue-800 cursor-pointer">✕</button>
            </div>
            <div className="overflow-y-auto p-2 space-y-1.5 flex-1 scrollbar-thin">
              {stats.bins[binSelected].empresas.map(e => (
                <div key={e.id} className="flex justify-between items-center bg-slate-50 px-2 py-1.5 rounded border border-slate-100">
                  <span className="truncate pr-2 font-medium text-[10px] text-slate-700" title={e.razonSocial}>
                    {e.razonSocial}
                  </span>
                  <span className="font-mono font-bold text-blue-700 text-[10px] shrink-0">
                    {extractorValor(e).toLocaleString(undefined, { maximumFractionDigits: 2 })}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};