import React, { useState, useMemo } from 'react';
import {
  Calendar, Clock, AlertTriangle, CheckCircle2, SearchCode, Database
} from 'lucide-react';
import { EmpresaPESV } from '../types/pesv';
import { obtenerFrecuenciaPaso20 } from '../utils/temporalSeriesGenerator';

interface IndicatorTemporalAnalysisProps {
  empresas: EmpresaPESV[];
  indicadorId: string;
  nombreIndicador: string;
  codigoIndicador: string;
  unidad: string;
  extractorValor: (e: EmpresaPESV) => number;
  onSeleccionarEmpresa?: (empresa: EmpresaPESV) => void;
}

const MAPA_PERIODOS_EXCEL: Record<string, string> = {
  'T1': 'primer_trimestre', 'T2': 'segundo_trimestre', 'T3': 'tercer_trimestre', 'T4': 'cuarto_trimestre',
  'Ene': 'enero', 'Feb': 'febrero', 'Mar': 'marzo', 'Abr': 'abril',
  'May': 'mayo', 'Jun': 'junio', 'Jul': 'julio', 'Ago': 'agosto',
  'Sep': 'septiembre', 'Oct': 'octubre', 'Nov': 'noviembre', 'Dic': 'diciembre',
};

// Diccionario puro de variables exactas
const getConfigVariables = (indId: string) => {
  const configs: Record<string, any> = {
    'ind1_1': { n: 'I1_Nivel1_n', d: 'I1_km', rep: 'I1_TSV_Nivel1', mult: 1000000, type: 'division' },
    'ind1_2': { n: 'I1_Nivel2_n', d: 'I1_km', rep: 'I1_TSV_Nivel2', mult: 1000000, type: 'division' },
    'ind1_3': { n: 'I1_Nivel3_n', d: 'I1_km', rep: 'I1_TSV_Nivel3', mult: 1000000, type: 'division' },
    'ind1_4': { n: 'I1_Nivel4_n', d: 'I1_km', rep: 'I1_TSV_Nivel4', mult: 1000000, type: 'division' },
    'ind2_1': { n: 'I2_Nivel1_directos', d: 'I2_Nivel1_indirectos', rep: 'I2_SV_Nivel1', type: 'suma' },
    'ind2_2': { n: 'I2_Nivel2_directos', d: 'I2_Nivel2_indirectos', rep: 'I2_SV_Nivel2', type: 'suma' },
    'ind2_3': { n: 'I2_Nivel3_directos', d: 'I2_Nivel3_indirectos', rep: 'I2_SV_Nivel3', type: 'suma' },
    'ind2_4': { n: 'I2_Nivel4_directos', d: 'I2_Nivel4_indirectos', rep: 'I2_SV_Nivel4', type: 'suma' },
    'ind3_1': { n: 'I3_RSVI_fin', d: 'I3_RSVI_inicio', rep: 'I3_RSVI', type: 'resta' },
    'ind3_2': { n: 'I3_GRV_fin', d: 'I3_GRV_inicio', rep: 'I3_GRV', type: 'resta' },
    'ind4': { n: 'I4_nMetasAlcanzadas', d: 'I4_nMetasDefinidas', rep: 'I4_CM', mult: 100, type: 'division' },
    'ind5': { n: 'I5_nActividadesEjecutadas', d: 'I5_nActividadesProgramadas', rep: 'I5_CPlan', mult: 100, type: 'division' },
    'ind6': { n: 'I6_nEJLdiarias', d: 'I6_sumaDiasTrabajados', rep: 'I6_%EJLC', mult: 100, type: 'division' },
    'ind7': { n: 'I7_nIncluidos', d: 'I7_nUtilizados', rep: 'I7_nDe', mult: 100, type: 'division' },
    'ind8': { n: 'I8_nExcesoVel', d: 'I8_nDesplazamientos', rep: 'I8_ELVL', mult: 100, type: 'division' },
    'ind9': { n: 'I9_nInspeccionados', d: 'I9_nVehículos', d2: 'I9_nVehiculos', rep: 'I9_IDP', mult: 100, type: 'division' },
    'ind10': { n: 'I10_nActividades', d: 'I10_nProgramadas', rep: 'I10_CPMV', mult: 100, type: 'division' },
    'ind11': { n: 'I11_nEjecutadas', d: 'I11_nProgramadas', rep: 'I11_CPFSV', mult: 100, type: 'division' },
    'ind12': { n: 'I12_nCapacitados', d: 'I12_nTotal', rep: 'I12_CPF', mult: 100, type: 'division' },
    'ind13': { n: 'I13_NCcerradas', d: 'I13_NCidentificadas', rep: 'I13_NCAC', mult: 100, type: 'division' },
  };
  return configs[indId] || null;
};

export const IndicatorTemporalAnalysis: React.FC<IndicatorTemporalAnalysisProps> = ({
  empresas, indicadorId, unidad, extractorValor,
}) => {
  const [empresaFiltroId, setEmpresaFiltroId] = useState<string>('CONSOLIDADO');
  const [puntoHovered, setPuntoHovered] = useState<number | null>(null);

  const configFrecuencia = useMemo(() => obtenerFrecuenciaPaso20(indicadorId), [indicadorId]);
  const cfgAudit = useMemo(() => getConfigVariables(indicadorId), [indicadorId]);

  const empresaSeleccionada = useMemo(() => {
    if (empresaFiltroId === 'CONSOLIDADO') return null;
    return empresas.find(e => e.id === empresaFiltroId) || null;
  }, [empresas, empresaFiltroId]);

  const periodosActivos = useMemo(() => {
    if (configFrecuencia.tipoPeriodo === 'TRIMESTRAL') return [{ id: 'T1' }, { id: 'T2' }, { id: 'T3' }, { id: 'T4' }];
    if (configFrecuencia.tipoPeriodo === 'MENSUAL') return [
      { id: 'Ene' }, { id: 'Feb' }, { id: 'Mar' }, { id: 'Abr' }, { id: 'May' }, { id: 'Jun' },
      { id: 'Jul' }, { id: 'Ago' }, { id: 'Sep' }, { id: 'Oct' }, { id: 'Nov' }, { id: 'Dic' }
    ];
    return [];
  }, [configFrecuencia.tipoPeriodo]);

  // Motor de Análisis: Calcula valor para Empresa o Promedio Poblacional Periódico
  const serie = useMemo(() => {
    if (empresaSeleccionada) {
      const data = empresaSeleccionada.datosEstandarizados || {};
      const puntos = periodosActivos.map(p => {
        const suf = MAPA_PERIODOS_EXCEL[p.id];
        let val = 0;
        if (indicadorId === 'ind1') {
          const nTot = [1, 2, 3, 4].reduce((a, l) => a + (Number(data[`I1_Nivel${l}_n_${suf}`]) || 0), 0);
          const dTot = Number(data[`I1_km_${suf}`]) || 0;
          val = dTot > 0 ? (nTot / dTot) * 1000000 : 0;
        } else if (indicadorId === 'ind2') {
          val = [1, 2, 3, 4].reduce((a, l) => a + (Number(data[`I2_Nivel${l}_directos_${suf}`]) || 0) + (Number(data[`I2_Nivel${l}_indirectos_${suf}`]) || 0), 0);
        } else if (cfgAudit) {
          const n = Number(data[`${cfgAudit.n}_${suf}`]) || 0;
          const d = Number(data[`${cfgAudit.d}_${suf}`]) || Number(data[`${cfgAudit.d2}_${suf}`]) || 0;
          if (cfgAudit.type === 'division') val = d > 0 ? (n / d) * cfgAudit.mult : 0;
          else if (cfgAudit.type === 'suma') val = n + d;
          else if (cfgAudit.type === 'resta') val = n - d;
        }
        return { periodo: p.id, periodoEtiqueta: p.id, valor: val };
      });
      return { puntos, acumuladoAnual: extractorValor(empresaSeleccionada) };
    } else {
      // Cálculo Nacional
      const puntos = periodosActivos.map(p => {
        const suf = MAPA_PERIODOS_EXCEL[p.id];
        let sumaValores = 0;
        let empValidas = 0;

        empresas.forEach(emp => {
          const data = emp.datosEstandarizados || {};
          let val = 0;
          if (indicadorId === 'ind1') {
            const nTot = [1, 2, 3, 4].reduce((a, l) => a + (Number(data[`I1_Nivel${l}_n_${suf}`]) || 0), 0);
            const dTot = Number(data[`I1_km_${suf}`]) || 0;
            val = dTot > 0 ? (nTot / dTot) * 1000000 : 0;
          } else if (indicadorId === 'ind2') {
            val = [1, 2, 3, 4].reduce((a, l) => a + (Number(data[`I2_Nivel${l}_directos_${suf}`]) || 0) + (Number(data[`I2_Nivel${l}_indirectos_${suf}`]) || 0), 0);
          } else if (cfgAudit) {
            const n = Number(data[`${cfgAudit.n}_${suf}`]) || 0;
            const d = Number(data[`${cfgAudit.d}_${suf}`]) || Number(data[`${cfgAudit.d2}_${suf}`]) || 0;
            if (cfgAudit.type === 'division') val = d > 0 ? (n / d) * cfgAudit.mult : 0;
            else if (cfgAudit.type === 'suma') val = n + d;
            else if (cfgAudit.type === 'resta') val = n - d;
          }

          if (val > 0 || data[`${cfgAudit?.rep}_${suf}`] !== undefined) {
            sumaValores += val;
            empValidas++;
          }
        });

        const promedio = empValidas > 0 ? sumaValores / empValidas : 0;
        return { periodo: p.id, periodoEtiqueta: p.id, valor: promedio };
      });
      
      const anualMedia = empresas.reduce((acc, e) => acc + extractorValor(e), 0) / (empresas.length || 1);
      return { puntos, acumuladoAnual: anualMedia };
    }
  }, [empresas, empresaSeleccionada, cfgAudit, periodosActivos, extractorValor, indicadorId]);

  const svgWidth = 680;
  const svgHeight = 220;
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

  const scaleX = (idx: number, total: number) => total <= 1 ? padLeft + chartW / 2 : padLeft + (idx / (total - 1)) * chartW;
  const scaleY = (val: number) => padTop + chartH - ((val - minVal) / range) * chartH;

  const puntosCoord = serie.puntos.map((p, idx) => ({
    x: scaleX(idx, serie.puntos.length),
    y: scaleY(p.valor),
    periodo: p.periodo,
    valor: p.valor,
  }));

  const linePathD = puntosCoord.reduce((acc, pt, idx) => idx === 0 ? `M ${pt.x},${pt.y}` : `${acc} L ${pt.x},${pt.y}`, '');
  const areaPathD = puntosCoord.length > 0 ? `${linePathD} L ${puntosCoord[puntosCoord.length - 1].x},${padTop + chartH} L ${puntosCoord[0].x},${padTop + chartH} Z` : '';

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-5">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-3 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-indigo-100 text-indigo-800 border border-indigo-200 flex items-center gap-1">
              <Clock className="w-3 h-3 text-indigo-600" />
              Paso 20 · {configFrecuencia.etiqueta}
            </span>
          </div>
          <h3 className="text-sm font-bold text-slate-900 mt-1 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-indigo-600" />
            Análisis Temporal de Evolución
          </h3>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-xs text-slate-500 font-semibold whitespace-nowrap">Ámbito Temporal:</label>
          <select
            value={empresaFiltroId}
            onChange={e => { setEmpresaFiltroId(e.target.value); setPuntoHovered(null); }}
            className="text-xs font-medium bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-indigo-500 text-slate-800 cursor-pointer max-w-[300px] truncate"
          >
            <option value="CONSOLIDADO">Consolidado Nacional (Promedio)</option>
            {empresas.map(emp => (
              <option key={emp.id} value={emp.id}>{emp.razonSocial} (Año {emp.anoReporte})</option>
            ))}
          </select>
        </div>
      </div>

      <div className="relative bg-slate-50/60 rounded-xl border border-slate-200 p-4 overflow-hidden">
        {configFrecuencia.tipoPeriodo === 'ANUAL' ? (
          <div className="py-8 text-center space-y-2">
            <span className="text-xs text-slate-500">Este indicador es exclusivamente <strong>Acumulado Anual</strong>.</span>
            <div className="flex items-center justify-center pt-2">
              <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs text-center">
                <span className="text-xs text-slate-400 block font-mono">Resultado Anual:</span>
                <span className="text-2xl font-black font-mono text-blue-900 mt-1 block">
                  {serie.acumuladoAnual.toLocaleString(undefined, { maximumFractionDigits: 2 })} {unidad}
                </span>
              </div>
            </div>
          </div>
        ) : (
          <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="w-full h-auto select-none overflow-visible">
            {[0, 0.33, 0.66, 1].map((pct, i) => {
              const y = padTop + chartH * (1 - pct);
              const valGrid = minVal + range * pct;
              return (
                <g key={i}>
                  <line x1={padLeft} y1={y} x2={padLeft + chartW} y2={y} stroke="#e2e8f0" strokeDasharray="3 3" />
                  <text x={padLeft - 6} y={y + 3} textAnchor="end" className="text-[9px] font-mono fill-slate-400">
                    {valGrid.toLocaleString(undefined, { maximumFractionDigits: 1 })}
                  </text>
                </g>
              );
            })}
            
            {serie.acumuladoAnual > 0 && (
              <g>
                <line x1={padLeft} y1={scaleY(serie.acumuladoAnual)} x2={padLeft + chartW} y2={scaleY(serie.acumuladoAnual)} stroke="#3b82f6" strokeWidth="1.5" strokeDasharray="4 3" opacity="0.8" />
                <text x={padLeft + chartW + 4} y={scaleY(serie.acumuladoAnual) + 3} className="text-[9px] font-mono font-bold fill-blue-700">
                  Acum: {serie.acumuladoAnual.toLocaleString(undefined, { maximumFractionDigits: 1 })}
                </text>
              </g>
            )}

            {areaPathD && <path d={areaPathD} fill="#6366f1" fillOpacity="0.1" className="pointer-events-none" />}
            {linePathD && <path d={linePathD} fill="none" stroke="#4f46e5" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="pointer-events-none" />}

            {puntosCoord.map((pt, idx) => {
              const isHovered = puntoHovered === idx;
              return (
                <g key={pt.periodo} className="cursor-pointer" onMouseEnter={() => setPuntoHovered(idx)} onMouseLeave={() => setPuntoHovered(null)}>
                  <circle cx={pt.x} cy={pt.y} r={isHovered ? 6 : 4} fill={isHovered ? '#4338ca' : '#ffffff'} stroke="#4f46e5" strokeWidth={isHovered ? 2.5 : 2} className="transition-all" />
                  <text x={pt.x} y={pt.y - 8} textAnchor="middle" className="text-[10px] font-mono font-bold fill-slate-800">
                    {pt.valor.toLocaleString(undefined, { maximumFractionDigits: 1 })}
                  </text>
                  <text x={pt.x} y={padTop + chartH + 16} textAnchor="middle" className={`text-[10px] font-mono ${isHovered ? 'fill-indigo-900 font-bold' : 'fill-slate-500'}`}>
                    {pt.periodo}
                  </text>
                </g>
              );
            })}
            <line x1={padLeft} y1={padTop + chartH} x2={padLeft + chartW} y2={padTop + chartH} stroke="#cbd5e1" strokeWidth="1.5" />
          </svg>
        )}
      </div>

      {/* MODULO DE AUDITORÍA (Solo visible si hay empresa y hay configuración de variables) */}
      {empresaSeleccionada && configFrecuencia.tipoPeriodo !== 'ANUAL' && (
        <div className="mt-6 border border-slate-200 rounded-xl overflow-hidden shadow-xs">
          <div className="bg-slate-800 px-4 py-3 flex items-center justify-between">
            <h4 className="font-bold text-xs text-white flex items-center gap-2">
              <SearchCode className="w-4 h-4 text-amber-400" />
              Auditoría de Consistencia (Calculado Matemáticamente vs. Auto-reportado)
            </h4>
          </div>
          
          {cfgAudit ? (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold text-[10px] uppercase">
                  <th className="py-2.5 px-3">Periodo (Sufijo Excel)</th>
                  <th className="py-2.5 px-3 text-right font-mono" title={cfgAudit.n}>[{cfgAudit.n}]</th>
                  <th className="py-2.5 px-3 text-right font-mono" title={cfgAudit.d}>[{cfgAudit.d}]</th>
                  <th className="py-2.5 px-3 text-right bg-blue-50/50">Calculado</th>
                  <th className="py-2.5 px-3 text-right bg-slate-50 font-mono" title={cfgAudit.rep}>[{cfgAudit.rep}]</th>
                  <th className="py-2.5 px-3 text-center">Estado Auditoría</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
                {serie.puntos.map(pt => {
                  const sufijo = MAPA_PERIODOS_EXCEL[pt.periodo];
                  if (!sufijo) return null;

                  const rawDatos = empresaSeleccionada.datosEstandarizados || {};
                  const n = Number(rawDatos[`${cfgAudit.n}_${sufijo}`]) || 0;
                  const d = Number(rawDatos[`${cfgAudit.d}_${sufijo}`]) || Number(rawDatos[`${cfgAudit.d2}_${sufijo}`]) || 0;
                  const valorReportado = Number(rawDatos[`${cfgAudit.rep}_${sufijo}`]) || 0;
                  
                  const valorCalculado = cfgAudit.type === 'division' ? (d > 0 ? (n / d) * cfgAudit.mult : 0)
                                       : cfgAudit.type === 'suma' ? n + d
                                       : cfgAudit.type === 'resta' ? n - d : 0;
                  
                  const diferencia = Math.abs(valorCalculado - valorReportado);
                  const limiteError = cfgAudit.type === 'division' ? 0.5 : 1; 
                  const tieneAlerta = (cfgAudit.type === 'division' ? d > 0 : (n > 0 || d > 0)) && diferencia > limiteError;

                  return (
                    <tr key={pt.periodo} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-2.5 px-3 font-sans font-medium text-slate-700">
                        {pt.periodoEtiqueta} <span className="text-[9px] text-slate-400 block font-mono">..._{sufijo}</span>
                      </td>
                      <td className="py-2.5 px-3 text-right text-slate-600">{n.toLocaleString()}</td>
                      <td className="py-2.5 px-3 text-right text-slate-600">{d.toLocaleString()}</td>
                      <td className="py-2.5 px-3 text-right font-bold text-blue-700 bg-blue-50/30">
                        {valorCalculado.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                      </td>
                      <td className="py-2.5 px-3 text-right font-bold text-slate-800 bg-slate-50">
                        {valorReportado.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                      </td>
                      <td className="py-2.5 px-3 text-center font-sans">
                        {tieneAlerta ? (
                          <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-50 text-red-700 border border-red-200">
                            <AlertTriangle className="w-3 h-3" />
                            <span className="text-[10px] font-bold">Incoherencia</span>
                          </div>
                        ) : (
                          <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <CheckCircle2 className="w-3 h-3" />
                            <span className="text-[10px] font-bold">Consistente</span>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          ) : (
            <div className="p-4 bg-slate-50 text-slate-500 text-xs">
              Este es un indicador total consolidado dinámicamente sumando los diferentes niveles de pérdida. Audite los subniveles individuales para ver el detalle de incoherencias.
            </div>
          )}
        </div>
      )}
    </div>
  );
};