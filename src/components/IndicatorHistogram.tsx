import React, { useMemo, useState } from 'react';
import { BarChart2, TrendingUp, Info, HelpCircle } from 'lucide-react';
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
  const [binHovered, setBinHovered] = useState<number | null>(null);

  // Extraer valores
  const valores = useMemo(() => {
    return empresas.map(extractorValor).filter(v => typeof v === 'number' && !isNaN(v));
  }, [empresas, extractorValor]);

  // Cálculos estadísticos
  const stats = useMemo(() => {
    if (valores.length === 0) {
      return {
        media: 0,
        sigma: 0,
        mediana: 0,
        min: 0,
        max: 0,
        q1: 0,
        q3: 0,
        bins: [],
        kdePoints: [],
        maxCount: 1,
        maxDensity: 1,
      };
    }

    const n = valores.length;
    const sorted = [...valores].sort((a, b) => a - b);
    const min = sorted[0];
    const max = sorted[n - 1];
    const suma = sorted.reduce((acc, v) => acc + v, 0);
    const media = suma / n;

    // Desviación estándar
    const varianza = sorted.reduce((acc, v) => acc + Math.pow(v - media, 2), 0) / (n > 1 ? n - 1 : 1);
    const sigma = Math.sqrt(varianza);

    // Mediana y cuartiles
    const mediana = n % 2 === 0 ? (sorted[n / 2 - 1] + sorted[n / 2]) / 2 : sorted[Math.floor(n / 2)];
    const q1 = sorted[Math.floor(n * 0.25)] ?? min;
    const q3 = sorted[Math.floor(n * 0.75)] ?? max;

    // Número de Bins (Regla de Sturges / Freedman)
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
        index: i,
        start,
        end,
        label: `${start.toFixed(1)} - ${end.toFixed(1)}`,
        conteo: empresasEnBin.length,
        porcentaje: (empresasEnBin.length / n) * 100,
        empresas: empresasEnBin,
      };
    });

    const maxCount = Math.max(...bins.map(b => b.conteo), 1);

    // Curva de densidad Kernel Gaussian (KDE)
    const bandwidth = sigma > 0 ? 1.06 * sigma * Math.pow(n, -0.2) : binWidth * 0.8;
    const numKdeSteps = 60;
    const kdePoints: { x: number; density: number }[] = [];
    const stepSize = range / numKdeSteps;

    let maxDensity = 0;
    for (let i = 0; i <= numKdeSteps; i++) {
      const x = min + i * stepSize;
      let sumKernel = 0;
      for (const xi of sorted) {
        const u = (x - xi) / bandwidth;
        // Kernel Gaussiano
        sumKernel += Math.exp(-0.5 * u * u) / (Math.sqrt(2 * Math.PI) * bandwidth);
      }
      const density = sumKernel / n;
      if (density > maxDensity) maxDensity = density;
      kdePoints.push({ x, density });
    }

    return {
      media,
      sigma,
      mediana,
      min,
      max,
      q1,
      q3,
      bins,
      maxCount,
      kdePoints,
      maxDensity: maxDensity || 1,
    };
  }, [valores, empresas, extractorValor]);

  // Dimensiones SVG
  const svgWidth = 720;
  const svgHeight = 280;
  const padLeft = 45;
  const padRight = 35;
  const padTop = 30;
  const padBottom = 40;
  const chartW = svgWidth - padLeft - padRight;
  const chartH = svgHeight - padTop - padBottom;

  // Escalas
  const scaleX = (val: number) => {
    const range = stats.max - stats.min || 1;
    return padLeft + ((val - stats.min) / range) * chartW;
  };

  const scaleY = (conteo: number) => {
    return padTop + chartH - (conteo / (stats.maxCount || 1)) * chartH;
  };

  const scaleKdeY = (density: number) => {
    return padTop + chartH - (density / (stats.maxDensity || 1)) * chartH * 0.95;
  };

  // Línea Media X
  const mediaX = scaleX(stats.media);

  // Línea de Curva KDE en SVG Path
  const kdePathD = useMemo(() => {
    if (stats.kdePoints.length === 0) return '';
    return stats.kdePoints.reduce((acc, pt, idx) => {
      const x = scaleX(pt.x);
      const y = scaleKdeY(pt.density);
      return idx === 0 ? `M ${x},${y}` : `${acc} L ${x},${y}`;
    }, '');
  }, [stats.kdePoints, stats.min, stats.max, stats.maxDensity]);

  const kdeAreaD = useMemo(() => {
    if (!kdePathD) return '';
    const lastPt = stats.kdePoints[stats.kdePoints.length - 1];
    const firstPt = stats.kdePoints[0];
    const xLast = scaleX(lastPt.x);
    const xFirst = scaleX(firstPt.x);
    const yZero = padTop + chartH;
    return `${kdePathD} L ${xLast},${yZero} L ${xFirst},${yZero} Z`;
  }, [kdePathD, stats.kdePoints, stats.min, stats.max]);

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-5">
      {/* Header del Histograma */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-800 border border-blue-200">
              {codigoIndicador}
            </span>
            <span className="text-xs text-slate-500 font-semibold">
              Análisis Estadístico Poblacional
            </span>
          </div>
          <h3 className="text-sm font-bold text-slate-900 mt-1 flex items-center gap-2">
            <BarChart2 className="w-4 h-4 text-blue-600" />
            Histograma de Frecuencias con Curva de Tendencia y Distribución (KDE)
          </h3>
          <p className="text-xs text-slate-500">
            Distribución fáctica de los valores reportados en las organizaciones, línea de media general (μ) y dispersión típica (σ).
          </p>
        </div>

        {/* Resumen numérico rápido */}
        <div className="flex items-center gap-3 bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs font-mono">
          <div>
            <span className="text-slate-400 block text-[10px]">Media (μ):</span>
            <span className="font-bold text-blue-900 text-sm">
              {stats.media.toFixed(2)} {unidad}
            </span>
          </div>
          <div className="border-l border-slate-200 pl-3">
            <span className="text-slate-400 block text-[10px]">Desv. Est. (σ):</span>
            <span className="font-bold text-slate-700 text-sm">
              ± {stats.sigma.toFixed(2)}
            </span>
          </div>
          <div className="border-l border-slate-200 pl-3">
            <span className="text-slate-400 block text-[10px]">Mediana:</span>
            <span className="font-bold text-slate-700 text-sm">
              {stats.mediana.toFixed(2)}
            </span>
          </div>
        </div>
      </div>

      {/* Tarjetas de Estadísticas Descriptivas */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-xs">
        <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
          <span className="text-[11px] text-slate-500 font-medium">Mínimo Registrado:</span>
          <span className="text-sm font-bold font-mono text-slate-900 block mt-0.5">
            {stats.min.toFixed(2)} {unidad}
          </span>
        </div>
        <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
          <span className="text-[11px] text-slate-500 font-medium">Primer Cuartil (Q1 - 25%):</span>
          <span className="text-sm font-bold font-mono text-slate-900 block mt-0.5">
            {stats.q1.toFixed(2)} {unidad}
          </span>
        </div>
        <div className="p-3 bg-blue-50/70 rounded-xl border border-blue-200">
          <span className="text-[11px] text-blue-700 font-semibold">Media General (μ):</span>
          <span className="text-sm font-bold font-mono text-blue-900 block mt-0.5">
            {stats.media.toFixed(2)} {unidad}
          </span>
        </div>
        <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
          <span className="text-[11px] text-slate-500 font-medium">Tercer Cuartil (Q3 - 75%):</span>
          <span className="text-sm font-bold font-mono text-slate-900 block mt-0.5">
            {stats.q3.toFixed(2)} {unidad}
          </span>
        </div>
        <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
          <span className="text-[11px] text-slate-500 font-medium">Máximo Registrado:</span>
          <span className="text-sm font-bold font-mono text-slate-900 block mt-0.5">
            {stats.max.toFixed(2)} {unidad}
          </span>
        </div>
      </div>

      {/* Lienzo SVG del Histograma + KDE */}
      <div className="relative bg-slate-50/60 rounded-xl border border-slate-200 p-3 overflow-hidden">
        <svg
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          className="w-full h-auto select-none overflow-visible"
        >
          {/* Cuadrícula horizontal */}
          {[0, 0.25, 0.5, 0.75, 1].map((pct, i) => {
            const y = padTop + chartH * (1 - pct);
            const countLabel = Math.round(stats.maxCount * pct);
            return (
              <g key={i}>
                <line
                  x1={padLeft}
                  y1={y}
                  x2={padLeft + chartW}
                  y2={y}
                  stroke="#e2e8f0"
                  strokeDasharray="3 3"
                />
                <text
                  x={padLeft - 6}
                  y={y + 3}
                  textAnchor="end"
                  className="text-[10px] font-mono fill-slate-400"
                >
                  {countLabel}
                </text>
              </g>
            );
          })}

          {/* Zona de 1 Desviación Estándar [μ - σ, μ + σ] */}
          {stats.sigma > 0 && (
            <rect
              x={Math.max(padLeft, scaleX(stats.media - stats.sigma))}
              y={padTop}
              width={Math.min(
                chartW,
                scaleX(stats.media + stats.sigma) - Math.max(padLeft, scaleX(stats.media - stats.sigma))
              )}
              height={chartH}
              fill="#3b82f6"
              fillOpacity="0.06"
            />
          )}

          {/* Barras del Histograma */}
          {stats.bins.map(bin => {
            const x0 = scaleX(bin.start);
            const x1 = scaleX(bin.end);
            const barW = Math.max(2, x1 - x0 - 3);
            const y = scaleY(bin.conteo);
            const h = padTop + chartH - y;
            const isHovered = binHovered === bin.index;

            return (
              <g
                key={bin.index}
                className="cursor-pointer transition-opacity"
                onMouseEnter={() => setBinHovered(bin.index)}
                onMouseLeave={() => setBinHovered(null)}
              >
                <rect
                  x={x0}
                  y={y}
                  width={barW}
                  height={h}
                  rx="3"
                  className={`transition-colors ${
                    isHovered ? 'fill-blue-600' : 'fill-blue-400/80 hover:fill-blue-500'
                  }`}
                />
                {/* Conteo superior si hay espacio */}
                {bin.conteo > 0 && (
                  <text
                    x={x0 + barW / 2}
                    y={y - 4}
                    textAnchor="middle"
                    className="text-[10px] font-mono font-bold fill-slate-700"
                  >
                    {bin.conteo}
                  </text>
                )}
                {/* Etiqueta Eje X */}
                <text
                  x={x0 + barW / 2}
                  y={padTop + chartH + 16}
                  textAnchor="middle"
                  className="text-[9px] font-mono fill-slate-500"
                >
                  {bin.start.toFixed(1)}
                </text>
              </g>
            );
          })}

          {/* Sombra de Curva KDE (Distribución/Densidad) */}
          {kdeAreaD && (
            <path
              d={kdeAreaD}
              fill="#6366f1"
              fillOpacity="0.12"
            />
          )}

          {/* Línea de Curva KDE (Densidad) */}
          {kdePathD && (
            <path
              d={kdePathD}
              fill="none"
              stroke="#4f46e5"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}

          {/* Línea Vertical de la Media (μ) */}
          <line
            x1={mediaX}
            y1={padTop - 8}
            x2={mediaX}
            y2={padTop + chartH}
            stroke="#dc2626"
            strokeWidth="2"
            strokeDasharray="4 2"
          />

          {/* Etiqueta de la Media General */}
          <g transform={`translate(${mediaX}, ${padTop - 12})`}>
            <rect
              x="-42"
              y="-12"
              width="84"
              height="16"
              rx="4"
              fill="#dc2626"
            />
            <text
              x="0"
              y="0"
              textAnchor="middle"
              className="text-[10px] font-mono font-bold fill-white"
            >
              μ = {stats.media.toFixed(1)}
            </text>
          </g>

          {/* Eje X Línea Base */}
          <line
            x1={padLeft}
            y1={padTop + chartH}
            x2={padLeft + chartW}
            y2={padTop + chartH}
            stroke="#94a3b8"
            strokeWidth="1.5"
          />
        </svg>

        {/* Leyenda interactiva */}
        <div className="flex flex-wrap items-center justify-between gap-4 mt-3 pt-2 border-t border-slate-200 text-xs text-slate-600">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-blue-400" />
              <span>Frecuencia de Empresas (Histograma)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-4 h-0.5 bg-indigo-600 inline-block" />
              <span>Curva de Tendencia y Densidad (KDE)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-4 h-0.5 bg-red-600 inline-block border-b-2 border-dashed border-red-600" />
              <span className="text-red-700 font-semibold">Media General (μ)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-blue-50 border border-blue-200" />
              <span>Intervalo de 1 Desv. Típica (±1σ)</span>
            </div>
          </div>

          {binHovered !== null && (
            <div className="font-mono text-xs font-bold text-slate-900 bg-white px-2 py-0.5 rounded border border-slate-200">
              Rango: {stats.bins[binHovered]?.label} {unidad} ({stats.bins[binHovered]?.conteo} empresas · {stats.bins[binHovered]?.porcentaje.toFixed(1)}%)
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
