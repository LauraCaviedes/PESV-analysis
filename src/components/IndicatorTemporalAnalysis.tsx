import React, { useState, useMemo } from 'react';
import {
  Calendar,
  Clock,
  TrendingUp,
  TrendingDown,
  Minus,
  Building2,
  Filter,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';
import { EmpresaPESV } from '../types/pesv';
import {
  obtenerFrecuenciaPaso20,
  generarSerieTemporalEmpresa,
  consolidarSerieTemporalPoblacional,
} from '../utils/temporalSeriesGenerator';

interface IndicatorTemporalAnalysisProps {
  empresas: EmpresaPESV[];
  indicadorId: string;
  nombreIndicador: string;
  codigoIndicador: string;
  unidad: string;
  extractorValor: (e: EmpresaPESV) => number;
  onSeleccionarEmpresa?: (empresa: EmpresaPESV) => void;
}

export const IndicatorTemporalAnalysis: React.FC<IndicatorTemporalAnalysisProps> = ({
  empresas,
  indicadorId,
  nombreIndicador,
  codigoIndicador,
  unidad,
  extractorValor,
  onSeleccionarEmpresa,
}) => {
  const [empresaFiltroId, setEmpresaFiltroId] = useState<string>('CONSOLIDADO');
  const [puntoHovered, setPuntoHovered] = useState<number | null>(null);

  const configFrecuencia = useMemo(() => {
    return obtenerFrecuenciaPaso20(indicadorId);
  }, [indicadorId]);

  // Empresa seleccionada o Consolidado
  const empresaSeleccionada = useMemo(() => {
    if (empresaFiltroId === 'CONSOLIDADO') return null;
    return empresas.find(e => e.id === empresaFiltroId) || null;
  }, [empresas, empresaFiltroId]);

  // Serie temporal activa (individual o consolidada)
  const serie = useMemo(() => {
    if (empresaSeleccionada) {
      const valAnual = extractorValor(empresaSeleccionada);
      return generarSerieTemporalEmpresa(empresaSeleccionada, indicadorId, valAnual, unidad);
    }
    return consolidarSerieTemporalPoblacional(empresas, indicadorId, extractorValor, unidad);
  }, [empresas, empresaSeleccionada, indicadorId, extractorValor, unidad]);

  // Dimensiones SVG
  const svgWidth = 680;
  const svgHeight = 240;
  const padLeft = 45;
  const padRight = 35;
  const padTop = 30;
  const padBottom = 40;
  const chartW = svgWidth - padLeft - padRight;
  const chartH = svgHeight - padTop - padBottom;

  const valoresPeriodos = serie.puntos.map(p => p.valor);
  const minVal = Math.min(0, ...valoresPeriodos);
  const maxVal = Math.max(1, ...valoresPeriodos, serie.acumuladoAnual) * 1.15;
  const range = maxVal - minVal || 1;

  const scaleX = (idx: number, total: number) => {
    if (total <= 1) return padLeft + chartW / 2;
    return padLeft + (idx / (total - 1)) * chartW;
  };

  const scaleY = (val: number) => {
    return padTop + chartH - ((val - minVal) / range) * chartH;
  };

  // Coordenadas de los puntos
  const puntosCoord = serie.puntos.map((p, idx) => ({
    x: scaleX(idx, serie.puntos.length),
    y: scaleY(p.valor),
    periodo: p.periodo,
    etiqueta: p.periodoEtiqueta,
    valor: p.valor,
  }));

  // Path SVG de la curva
  const linePathD = puntosCoord.reduce((acc, pt, idx) => {
    return idx === 0 ? `M ${pt.x},${pt.y}` : `${acc} L ${pt.x},${pt.y}`;
  }, '');

  const areaPathD = puntosCoord.length > 0
    ? `${linePathD} L ${puntosCoord[puntosCoord.length - 1].x},${padTop + chartH} L ${puntosCoord[0].x},${padTop + chartH} Z`
    : '';

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-5">
      {/* Header y Filtro por Empresa */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-3 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-indigo-100 text-indigo-800 border border-indigo-200 flex items-center gap-1">
              <Clock className="w-3 h-3 text-indigo-600" />
              Paso 20 · Tabla 10
            </span>
            <span className="text-xs text-slate-500 font-semibold">
              Frecuencia Oficial: {configFrecuencia.etiqueta}
            </span>
          </div>
          <h3 className="text-sm font-bold text-slate-900 mt-1 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-indigo-600" />
            Análisis Temporal y Comparativa con Acumulado Anual
          </h3>
          <p className="text-xs text-slate-500">
            Evolución de mediciones periódicas y contraste frente a la meta o consolidado anual.
          </p>
        </div>

        {/* Selector de Ámbito: Consolidado o Empresa Individual */}
        <div className="flex items-center gap-2">
          <label className="text-xs text-slate-500 font-semibold whitespace-nowrap">
            Ámbito Temporal:
          </label>
          <select
            value={empresaFiltroId}
            onChange={e => {
              setEmpresaFiltroId(e.target.value);
              setPuntoHovered(null);
            }}
            className="text-xs font-medium bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-indigo-500 text-slate-800 cursor-pointer max-w-[240px] truncate"
          >
            <option value="CONSOLIDADO">
              Consolidado Nacional (Media de {empresas.length} empresas)
            </option>
            {empresas.map(emp => (
              <option key={emp.id} value={emp.id}>
                {emp.razonSocial} (Año {emp.anoReporte})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Tarjetas de Resumen del Periodo */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
          <div>
            <span className="text-[11px] text-slate-500 font-medium">Frecuencia Normativa:</span>
            <span className="text-xs font-bold text-slate-800 block mt-0.5">
              {configFrecuencia.etiqueta}
            </span>
          </div>
          <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200">
            {serie.puntos.length} {serie.puntos.length === 1 ? 'periodo' : 'periodos'}
          </span>
        </div>

        <div className="p-3 bg-blue-50/70 rounded-xl border border-blue-200 flex items-center justify-between">
          <div>
            <span className="text-[11px] text-blue-700 font-semibold">Acumulado Anual:</span>
            <span className="text-sm font-black font-mono text-blue-900 block mt-0.5">
              {serie.acumuladoAnual.toFixed(2)} {unidad}
            </span>
          </div>
          <span className="text-[11px] text-blue-600 font-semibold font-mono">
            Vigencia Oficial
          </span>
        </div>

        <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
          <div>
            <span className="text-[11px] text-slate-500 font-medium">Tendencia Interperiódica:</span>
            <span className="text-xs font-bold flex items-center gap-1 mt-0.5">
              {serie.tendencia === 'MEJORANDO' ? (
                <span className="text-emerald-700 flex items-center gap-1">
                  <TrendingUp className="w-3.5 h-3.5" />
                  Evolución Favorable
                </span>
              ) : serie.tendencia === 'DETERIORANDO' ? (
                <span className="text-red-700 flex items-center gap-1">
                  <TrendingDown className="w-3.5 h-3.5" />
                  Tendencia Desfavorable
                </span>
              ) : (
                <span className="text-slate-600 flex items-center gap-1">
                  <Minus className="w-3.5 h-3.5" />
                  Comportamiento Estable
                </span>
              )}
            </span>
          </div>
          <span className="text-[11px] font-mono text-slate-500">
            {empresaSeleccionada ? empresaSeleccionada.municipio : 'Nacional'}
          </span>
        </div>
      </div>

      {/* Gráfico de Línea Temporal con Curva y Acumulado */}
      <div className="relative bg-slate-50/60 rounded-xl border border-slate-200 p-4 overflow-hidden">
        {configFrecuencia.tipoPeriodo === 'ANUAL' ? (
          /* Visualización para indicadores exclusivamente anuales (Ind 3 y 13) */
          <div className="py-8 text-center space-y-2">
            <span className="text-xs text-slate-500">
              Este indicador normativo se mide <strong>exclusivamente como Acumulado Anual</strong> según la Tabla 10 del Paso 20.
            </span>
            <div className="flex items-center justify-center gap-4 pt-2">
              <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs text-center">
                <span className="text-xs text-slate-400 block font-mono">Resultado Anual Consolidado:</span>
                <span className="text-2xl font-black font-mono text-blue-900 mt-1 block">
                  {serie.acumuladoAnual.toFixed(2)} {unidad}
                </span>
                <span className="text-[11px] text-slate-500 font-medium mt-1 block">
                  {empresaSeleccionada ? empresaSeleccionada.razonSocial : 'Promedio Nacional de Organizaciones'}
                </span>
              </div>
            </div>
          </div>
        ) : (
          /* Visualización de curva temporal para Trimestral / Mensual */
          <svg
            viewBox={`0 0 ${svgWidth} ${svgHeight}`}
            className="w-full h-auto select-none overflow-visible"
          >
            {/* Cuadrícula horizontal */}
            {[0, 0.33, 0.66, 1].map((pct, i) => {
              const y = padTop + chartH * (1 - pct);
              const valGrid = minVal + range * pct;
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
                    className="text-[9px] font-mono fill-slate-400"
                  >
                    {valGrid.toFixed(1)}
                  </text>
                </g>
              );
            })}

            {/* Línea horizontal de referencia del Acumulado Anual */}
            {serie.acumuladoAnual > 0 && (
              <g>
                <line
                  x1={padLeft}
                  y1={scaleY(serie.acumuladoAnual)}
                  x2={padLeft + chartW}
                  y2={scaleY(serie.acumuladoAnual)}
                  stroke="#3b82f6"
                  strokeWidth="1.5"
                  strokeDasharray="4 3"
                  opacity="0.8"
                />
                <text
                  x={padLeft + chartW + 4}
                  y={scaleY(serie.acumuladoAnual) + 3}
                  className="text-[9px] font-mono font-bold fill-blue-700"
                >
                  Acum: {serie.acumuladoAnual.toFixed(1)}
                </text>
              </g>
            )}

            {/* Área sombreada bajo la curva */}
            {areaPathD && (
              <path
                d={areaPathD}
                fill="#6366f1"
                fillOpacity="0.1"
              />
            )}

            {/* Línea de tendencia */}
            {linePathD && (
              <path
                d={linePathD}
                fill="none"
                stroke="#4f46e5"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            )}

            {/* Nodos interactivos de cada periodo */}
            {puntosCoord.map((pt, idx) => {
              const isHovered = puntoHovered === idx;
              return (
                <g
                  key={pt.periodo}
                  className="cursor-pointer"
                  onMouseEnter={() => setPuntoHovered(idx)}
                  onMouseLeave={() => setPuntoHovered(null)}
                >
                  <circle
                    cx={pt.x}
                    cy={pt.y}
                    r={isHovered ? 6 : 4}
                    fill={isHovered ? '#4338ca' : '#ffffff'}
                    stroke="#4f46e5"
                    strokeWidth={isHovered ? 2.5 : 2}
                    className="transition-all"
                  />
                  {/* Valor sobre el nodo */}
                  <text
                    x={pt.x}
                    y={pt.y - 8}
                    textAnchor="middle"
                    className="text-[10px] font-mono font-bold fill-slate-800"
                  >
                    {pt.valor.toFixed(1)}
                  </text>
                  {/* Etiqueta del periodo en el Eje X */}
                  <text
                    x={pt.x}
                    y={padTop + chartH + 16}
                    textAnchor="middle"
                    className={`text-[10px] font-mono ${
                      isHovered ? 'fill-indigo-900 font-bold' : 'fill-slate-500'
                    }`}
                  >
                    {pt.periodo}
                  </text>
                </g>
              );
            })}

            {/* Eje X Base */}
            <line
              x1={padLeft}
              y1={padTop + chartH}
              x2={padLeft + chartW}
              y2={padTop + chartH}
              stroke="#cbd5e1"
              strokeWidth="1.5"
            />
          </svg>
        )}

        {/* Leyenda y Tooltip */}
        <div className="flex flex-wrap items-center justify-between gap-4 mt-3 pt-2 border-t border-slate-200 text-xs text-slate-600">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-1.5">
              <span className="w-4 h-0.5 bg-indigo-600 inline-block" />
              <span>Medición por Periodo ({configFrecuencia.tipoPeriodo === 'TRIMESTRAL' ? 'Trimestres T1-T4' : 'Meses'})</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-4 h-0.5 bg-blue-600 inline-block border-b-2 border-dashed border-blue-600" />
              <span className="text-blue-700 font-semibold">Línea de Acumulado Anual ({serie.acumuladoAnual.toFixed(1)} {unidad})</span>
            </div>
          </div>

          {puntoHovered !== null && serie.puntos[puntoHovered] && (
            <div className="font-mono text-xs font-bold text-slate-900 bg-white px-2.5 py-0.5 rounded border border-slate-200">
              Periodo {serie.puntos[puntoHovered].periodoEtiqueta}: {serie.puntos[puntoHovered].valor.toFixed(2)} {unidad}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
