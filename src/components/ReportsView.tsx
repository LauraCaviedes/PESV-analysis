import React, { useState, useRef, useMemo } from 'react';
import {
  FileText,
  FileSpreadsheet,
  Printer,
  Calendar,
  PieChart,
  Calculator,
  CheckCircle2,
  AlertOctagon,
} from 'lucide-react';
import { EmpresaPESV } from '../types/pesv';
import { exportarLibroPESVExcel, exportarParticionFormularios } from '../utils/excelExporter';
import { calcularMetricaConIncertidumbre } from '../utils/pesvCalculations';
import {
  obtenerFrecuenciaPaso20,
  generarSerieTemporalEmpresa,
  consolidarSerieTemporalPoblacional,
} from '../utils/temporalSeriesGenerator';

interface ReportsViewProps {
  empresas: EmpresaPESV[];
  empresaFoco?: EmpresaPESV | null;
}

interface InfraccionItemPie {
  codigo: string;
  nombre: string;
  cantidad: number;
  color: string;
}

const COLORES_INFRACCIONES: Record<string, string> = {
  C29: '#ef4444',
  C14: '#f97316',
  C02: '#eab308',
  C38: '#8b5cf6',
  D01: '#ec4899',
  D04: '#06b6d4',
  E03: '#b91c1c',
  H04: '#3b82f6',
  otrasInf: '#64748b',
};

// Configuración completa de los 13 indicadores para el reporte PDF
const INDICADORES_REPORTE_CONFIG = [
  {
    id: 'ind1',
    codigo: 'TSV',
    nombre: 'Tasa Siniestros Viales por Nivel de Pérdida',
    paso: 'Paso 20 · Ind 1',
    unidad: '/1M km',
    extractor: (e: EmpresaPESV) => e.indicadores.tsvTotal,
  },
  {
    id: 'ind4',
    codigo: 'CM PESV',
    nombre: 'Cumplimiento de Metas del PESV',
    paso: 'Paso 20 · Ind 4',
    unidad: '%',
    extractor: (e: EmpresaPESV) => e.indicadores.cmPesv,
  },
  {
    id: 'ind5',
    codigo: 'CPlan PESV',
    nombre: 'Cumplimiento Plan Anual de Trabajo',
    paso: 'Paso 20 · Ind 5',
    unidad: '%',
    extractor: (e: EmpresaPESV) => e.indicadores.cPlanPesv,
  },
  {
    id: 'ind10',
    codigo: 'CPMVh',
    nombre: 'Plan Mantenimiento Preventivo',
    paso: 'Paso 20 · Ind 10',
    unidad: '%',
    extractor: (e: EmpresaPESV) => e.indicadores.cpmvh,
  },
  {
    id: 'ind12',
    codigo: 'CPFSV Cob.',
    nombre: 'Cobertura Plan Formación Vial',
    paso: 'Paso 20 · Ind 12',
    unidad: '%',
    extractor: (e: EmpresaPESV) => e.indicadores.cpfCobertura,
  },
  {
    id: 'ind6',
    codigo: '%EJLC',
    nombre: 'Exceso Jornadas de Conducción',
    paso: 'Paso 20 · Ind 6',
    unidad: '%',
    extractor: (e: EmpresaPESV) => e.indicadores.porcExcesoJornada,
  },
  {
    id: 'ind8',
    codigo: 'ELVL',
    nombre: 'Excesos Límite Velocidad Laboral',
    paso: 'Paso 20 · Ind 8',
    unidad: '%',
    extractor: (e: EmpresaPESV) => e.indicadores.elvl,
  },
  {
    id: 'ind9',
    codigo: 'IDP',
    nombre: 'Inspecciones Diarias Preoperacionales',
    paso: 'Paso 20 · Ind 9',
    unidad: '%',
    extractor: (e: EmpresaPESV) => e.indicadores.idp,
  },
  {
    id: 'ind3',
    codigo: 'RSVI',
    nombre: 'Riesgos Viales Identificados y Medidas',
    paso: 'Paso 20 · Ind 3',
    unidad: 'riesgos',
    extractor: (e: EmpresaPESV) => e.indicadores.rsvi,
  },
  {
    id: 'ind13',
    codigo: 'NCAC',
    nombre: 'Cierre de No Conformidades Auditoría',
    paso: 'Paso 20 · Ind 13',
    unidad: '%',
    extractor: (e: EmpresaPESV) => e.indicadores.ncac,
  },
];

// Configuración detallada de los 13 indicadores para la sábana de auditoría en la Ficha PDF
const INDICADORES_AUDITORIA_PDF = [
  { 
    id: '1', titulo: 'Indicador 1: Tasa de Siniestros Viales (TSV)', freq: 'TRIMESTRAL',
    sub: [
      { n: 'I1_Nivel1_n', d: 'I1_km', rep: 'I1_TSV_Nivel1', mult: 1000000, type: 'division', label: 'Nivel 1 (Fatalidades)' },
      { n: 'I1_Nivel2_n', d: 'I1_km', rep: 'I1_TSV_Nivel2', mult: 1000000, type: 'division', label: 'Nivel 2 (Graves)' },
      { n: 'I1_Nivel3_n', d: 'I1_km', rep: 'I1_TSV_Nivel3', mult: 1000000, type: 'division', label: 'Nivel 3 (Leves)' },
      { n: 'I1_Nivel4_n', d: 'I1_km', rep: 'I1_TSV_Nivel4', mult: 1000000, type: 'division', label: 'Nivel 4 (Daños)' }
    ]
  },
  { 
    id: '2', titulo: 'Indicador 2: Costos de Siniestros Viales ($SVT)', freq: 'TRIMESTRAL',
    sub: [
      { n: 'I2_Nivel1_directos', d: 'I2_Nivel1_indirectos', rep: 'I2_SV_Nivel1', type: 'suma', label: 'Costos Nivel 1' },
      { n: 'I2_Nivel2_directos', d: 'I2_Nivel2_indirectos', rep: 'I2_SV_Nivel2', type: 'suma', label: 'Costos Nivel 2' },
      { n: 'I2_Nivel3_directos', d: 'I2_Nivel3_indirectos', rep: 'I2_SV_Nivel3', type: 'suma', label: 'Costos Nivel 3' },
      { n: 'I2_Nivel4_directos', d: 'I2_Nivel4_indirectos', rep: 'I2_SV_Nivel4', type: 'suma', label: 'Costos Nivel 4' }
    ]
  },
  { 
    id: '3', titulo: 'Indicador 3: Riesgos Viales Identificados', freq: 'ANUAL',
    sub: [
      { n: 'I3_RSVI_fin', d: 'I3_RSVI_inicio', rep: 'I3_RSVI', type: 'resta', label: 'RSVI (Todos los Riesgos)' },
      { n: 'I3_GRV_fin', d: 'I3_GRV_inicio', rep: 'I3_GRV', type: 'resta', label: 'GRV (Riesgos Altos)' }
    ]
  },
  { id: '4', titulo: 'Indicador 4: Cumplimiento de Metas del PESV', freq: 'TRIMESTRAL', sub: [{ n: 'I4_nMetasAlcanzadas', d: 'I4_nMetasDefinidas', rep: 'I4_CM', mult: 100, type: 'division', label: 'Cumplimiento de Metas (%)' }] },
  { id: '5', titulo: 'Indicador 5: Cumplimiento Plan Anual de Trabajo', freq: 'TRIMESTRAL', sub: [{ n: 'I5_nActividadesEjecutadas', d: 'I5_nActividadesProgramadas', rep: 'I5_CPlan', mult: 100, type: 'division', label: 'Plan de Trabajo (%)' }] },
  { id: '6', titulo: 'Indicador 6: % Exceso de Jornadas Laborales', freq: 'MENSUAL', sub: [{ n: 'I6_nEJLdiarias', d: 'I6_sumaDiasTrabajados', rep: 'I6_%EJLC', mult: 100, type: 'division', label: 'Exceso Jornadas (%)' }] },
  { id: '7', titulo: 'Indicador 7: Cobertura Gestión de Velocidad', freq: 'MENSUAL', sub: [{ n: 'I7_nIncluidos', d: 'I7_nUtilizados', rep: 'I7_nDe', mult: 100, type: 'division', label: 'Cobertura GVE (%)' }] },
  { id: '8', titulo: 'Indicador 8: Excesos Límite de Velocidad', freq: 'MENSUAL', sub: [{ n: 'I8_nExcesoVel', d: 'I8_nDesplazamientos', rep: 'I8_ELVL', mult: 100, type: 'division', label: 'Excesos Velocidad ELVL (%)' }] },
  { id: '9', titulo: 'Indicador 9: Inspecciones Preoperacionales', freq: 'MENSUAL', sub: [{ n: 'I9_nInspeccionados', d: 'I9_nVehículos', d2: 'I9_nVehiculos', rep: 'I9_IDP', mult: 100, type: 'division', label: 'Inspecciones IDP (%)' }] },
  { id: '10', titulo: 'Indicador 10: Mantenimiento Preventivo CPMVh', freq: 'TRIMESTRAL', sub: [{ n: 'I10_nActividades', d: 'I10_nProgramadas', rep: 'I10_CPMV', mult: 100, type: 'division', label: 'Mantenimiento CPMVh (%)' }] },
  { id: '11', titulo: 'Indicador 11: Cumplimiento Formación CPFSV', freq: 'TRIMESTRAL', sub: [{ n: 'I11_nEjecutadas', d: 'I11_nProgramadas', rep: 'I11_CPFSV', mult: 100, type: 'division', label: 'Cumplimiento Formación (%)' }] },
  { id: '12', titulo: 'Indicador 12: Cobertura Formación', freq: 'TRIMESTRAL', sub: [{ n: 'I12_nCapacitados', d: 'I12_nTotal', rep: 'I12_CPF', mult: 100, type: 'division', label: 'Cobertura Formación (%)' }] },
  { id: '13', titulo: 'Indicador 13: Cierre de No Conformidades', freq: 'ANUAL', sub: [{ n: 'I13_NCcerradas', d: 'I13_NCidentificadas', rep: 'I13_NCAC', mult: 100, type: 'division', label: 'Cierre NCAC (%)' }] }
];

const OBTENER_PERIODOS_PDF = (freq: string) => {
  if (freq === 'TRIMESTRAL') return [
    { label: 'T1', suf: 'primer_trimestre' }, { label: 'T2', suf: 'segundo_trimestre' },
    { label: 'T3', suf: 'tercer_trimestre' }, { label: 'T4', suf: 'cuarto_trimestre' },
    { label: 'Año (Acumulado Real)', suf: 'año', esAcumuladoReal: true }
  ];
  if (freq === 'MENSUAL') return [
    { label: 'Ene', suf: 'enero' }, { label: 'Feb', suf: 'febrero' }, { label: 'Mar', suf: 'marzo' },
    { label: 'Abr', suf: 'abril' }, { label: 'May', suf: 'mayo' }, { label: 'Jun', suf: 'junio' },
    { label: 'Jul', suf: 'julio' }, { label: 'Ago', suf: 'agosto' }, { label: 'Sep', suf: 'septiembre' },
    { label: 'Oct', suf: 'octubre' }, { label: 'Nov', suf: 'noviembre' }, { label: 'Dic', suf: 'diciembre' },
    { label: 'Año (Acumulado Real)', suf: 'año', esAcumuladoReal: true }
  ];
  return [{ label: 'Acumulado Año', suf: 'año', esAcumuladoReal: false }];
};

const PieChartInfracciones: React.FC<{ items: InfraccionItemPie[]; total: number; subtitulo?: string }> = ({
  items,
  total,
  subtitulo,
}) => {
  if (total === 0) {
    return (
      <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg text-center text-slate-400 text-xs">
        Sin infracciones ni comparendos viales registrados en la vigencia.
      </div>
    );
  }

  let acumulado = 0;
  const slices = items
    .filter(it => it.cantidad > 0)
    .map(item => {
      const porcentaje = item.cantidad / total;
      const startAngle = (acumulado / total) * 360;
      acumulado += item.cantidad;
      const endAngle = (acumulado / total) * 360;

      const r = 50;
      const cx = 65;
      const cy = 65;

      const startRad = ((startAngle - 90) * Math.PI) / 180.0;
      const endRad =
        (((endAngle - startAngle >= 359.99 ? startAngle + 359.99 : endAngle) - 90) * Math.PI) /
        180.0;

      const x1 = cx + r * Math.cos(startRad);
      const y1 = cy + r * Math.sin(startRad);
      const x2 = cx + r * Math.cos(endRad);
      const y2 = cy + r * Math.sin(endRad);

      const largeArc = endAngle - startAngle > 180 ? 1 : 0;
      const pathD = `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2} Z`;

      return {
        ...item,
        porcentaje: porcentaje * 100,
        pathD,
      };
    });

  return (
    <div className="flex flex-col sm:flex-row items-center gap-6 p-4 bg-slate-50/70 border border-slate-200 rounded-xl">
      <div className="relative w-36 h-36 shrink-0 flex items-center justify-center">
        <svg viewBox="0 0 130 130" className="w-full h-full drop-shadow-xs">
          {slices.map((s, idx) => (
            <path key={idx} d={s.pathD} fill={s.color} stroke="#ffffff" strokeWidth="1.5" />
          ))}
          <circle cx="65" cy="65" r="24" fill="#ffffff" stroke="#e2e8f0" strokeWidth="1" />
          <text
            x="65"
            y="62"
            textAnchor="middle"
            className="text-[11px] font-mono font-bold fill-slate-800"
          >
            {total}
          </text>
          <text
            x="65"
            y="73"
            textAnchor="middle"
            className="text-[8px] font-sans fill-slate-400"
          >
            casos
          </text>
        </svg>
      </div>

      <div className="flex-1 w-full space-y-1">
        {subtitulo && (
          <span className="text-[11px] font-semibold text-slate-500 block mb-1">
            {subtitulo}
          </span>
        )}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1.5 text-[11px]">
          {slices.map((s, idx) => (
            <div key={idx} className="flex items-center justify-between gap-1.5">
              <div className="flex items-center gap-1.5 truncate">
                <span
                  className="w-2.5 h-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: s.color }}
                />
                <span className="font-semibold text-slate-800 truncate" title={s.nombre}>
                  {s.codigo}: {s.nombre}
                </span>
              </div>
              <span className="font-mono text-slate-600 shrink-0 font-medium">
                {s.cantidad} ({s.porcentaje.toFixed(1)}%)
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// COMPONENTE NUEVO: Top 10 Alertas Críticas (Integrado en el Nacional)
// ============================================================================
const Top10AlertasTable: React.FC<{ empresas: EmpresaPESV[] }> = ({ empresas }) => {
  // Extraer los años de la propiedad anoReporte de cada empresa
  const aniosReporte = useMemo(() => {
    if (!empresas || empresas.length === 0) return new Date().getFullYear().toString();
    const years = new Set<number>();
    empresas.forEach(emp => {
      // Tomamos el anoReporte, y si no existe ponemos el año actual como fallback
      const year = emp.anoReporte ? Number(emp.anoReporte) : new Date().getFullYear();
      years.add(year);
    });
    
    const yearsArray = Array.from(years).sort();
    return yearsArray.length > 1 
      ? `${yearsArray[0]} - ${yearsArray[yearsArray.length - 1]}` 
      : yearsArray[0].toString();
  }, [empresas]);

  const top10Alertas = useMemo(() => {
    const empresasConAlertas = [...empresas];
    empresasConAlertas.sort((a, b) => {
      const discrepanciaA = a.esClasificacionCorrecta ? 0 : 1;
      const discrepanciaB = b.esClasificacionCorrecta ? 0 : 1;
      if (discrepanciaA !== discrepanciaB) return discrepanciaB - discrepanciaA;
      if (b.infracciones.totalInfracciones !== a.infracciones.totalInfracciones) {
        return b.infracciones.totalInfracciones - a.infracciones.totalInfracciones;
      }
      return b.indicadores.tsvTotal - a.indicadores.tsvTotal;
    });
    return empresasConAlertas.slice(0, 10);
  }, [empresas]);

  if (empresas.length === 0) return null;

  return (
    <div className="mt-6 pt-4 border-t border-slate-200">
      <div className="flex items-center justify-between border-b border-slate-200 pb-1 mb-3">
        <h3 className="font-bold text-sm text-slate-900 flex items-center gap-1.5">
          <AlertOctagon className="w-4 h-4 text-red-600" />
          3. Top 10 - Organizaciones con Alertas Críticas (ANSV)
        </h3>
        <span className="text-[10px] font-mono font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
          Vigencia(s): {aniosReporte}
        </span>
      </div>
      
      <div className="overflow-x-auto rounded-lg border border-slate-200">
        <table className="w-full text-left text-[11px]">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-600">
            <tr>
              <th className="py-2 px-3 font-semibold">Organización / NIT</th>
              <th className="py-2 px-3 font-semibold text-center">Nivel Calculado</th>
              <th className="py-2 px-3 font-semibold text-center">Discrepancia</th>
              <th className="py-2 px-3 font-semibold text-center">Infracciones</th>
              <th className="py-2 px-3 font-semibold text-center">TSV</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {top10Alertas.map((emp) => (
              <tr key={emp.id} className="hover:bg-slate-50/50">
                <td className="py-2 px-3">
                  <div className="font-semibold text-slate-900 truncate max-w-[200px]">
                    {emp.razonSocial}
                  </div>
                  <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                    NIT: {emp.numeroDocumento}
                  </div>
                </td>
                <td className="py-2 px-3 text-center">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-medium ${
                    emp.clasificacionCalculada === 'AVANZADO' ? 'bg-purple-100 text-purple-800' :
                    emp.clasificacionCalculada === 'ESTÁNDAR' ? 'bg-blue-100 text-blue-800' :
                    'bg-slate-100 text-slate-800'
                  }`}>
                    {emp.clasificacionCalculada}
                  </span>
                </td>
                <td className="py-2 px-3 text-center">
                  {!emp.esClasificacionCorrecta ? (
                    <span className="px-2 py-0.5 rounded bg-red-50 text-red-700 text-[10px] font-bold border border-red-200 inline-block">
                      SÍ (Reportó: {emp.clasificacionReportada || emp.clasificacionReportada})
                    </span>
                  ) : (
                    <span className="text-slate-400 font-mono">-</span>
                  )}
                </td>
                <td className="py-2 px-3 text-center font-mono font-bold text-amber-700 bg-amber-50/30">
                  {emp.infracciones.totalInfracciones}
                </td>
                <td className="py-2 px-3 text-center font-mono font-bold text-blue-700 bg-blue-50/30">
                  {emp.indicadores.tsvTotal.toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};


export const ReportsView: React.FC<ReportsViewProps> = ({
  empresas,
  empresaFoco,
}) => {
  const [tipoReporte, setTipoReporte] = useState<'NACIONAL' | 'EMPRESA'>(
    empresaFoco ? 'EMPRESA' : 'NACIONAL'
  );
  const [empresaIdSeleccionada, setEmpresaIdSeleccionada] = useState<string>(
    empresaFoco?.id || empresas[0]?.id || ''
  );

  const reportRef = useRef<HTMLDivElement>(null);

  const empresaSeleccionada =
    empresas.find(e => e.id === empresaIdSeleccionada) || empresas[0];

  const dataEmpresa = empresaSeleccionada?.datosEstandarizados || {};

  // Cálculos consolidados para el reporte nacional
  const tsvValores = empresas.map(e => e.indicadores.tsvTotal);
  const tsvDeltas = empresas.map(e => e.deltasIncertidumbre.tsvTotal || 0);
  const tsvRes = calcularMetricaConIncertidumbre(tsvValores, tsvDeltas, 'por 1M km');

  const metasVal = empresas.map(e => e.indicadores.cmPesv);
  const metasDeltas = empresas.map(e => e.deltasIncertidumbre.cmPesv || 0);
  const metasRes = calcularMetricaConIncertidumbre(metasVal, metasDeltas, '%');

  const idpVal = empresas.map(e => e.indicadores.idp);
  const idpDeltas = empresas.map(e => e.deltasIncertidumbre.idp || 0);
  const idpRes = calcularMetricaConIncertidumbre(idpVal, idpDeltas, '%');

  const mantVal = empresas.map(e => e.indicadores.cpmvh);
  const mantDeltas = empresas.map(e => e.deltasIncertidumbre.cpmvh || 0);
  const mantRes = calcularMetricaConIncertidumbre(mantVal, mantDeltas, '%');

  const discrepantes = empresas.filter(e => !e.esClasificacionCorrecta);
  const criticas = empresas.flatMap(e => e.alertas).filter(a => a.severidad === 'CRÍTICA');

  // Infracciones Consolidadas a Nivel Nacional
  const totalesInfraccionesNacional = useMemo(() => {
    const counts: Record<string, number> = {
      C29: 0, C14: 0, C02: 0, C38: 0, D01: 0, D04: 0, E03: 0, H04: 0, otrasInfracciones: 0,
    };
    for (const emp of empresas) {
      counts.C29 += emp.infracciones.C29 || 0;
      counts.C14 += emp.infracciones.C14 || 0;
      counts.C02 += emp.infracciones.C02 || 0;
      counts.C38 += emp.infracciones.C38 || 0;
      counts.D01 += emp.infracciones.D01 || 0;
      counts.D04 += emp.infracciones.D04 || 0;
      counts.E03 += emp.infracciones.E03 || 0;
      counts.H04 += emp.infracciones.H04 || 0;
      counts.otrasInfracciones += emp.infracciones.otrasInfracciones || 0;
    }
    const total = Object.values(counts).reduce((a, b) => a + b, 0);
    const items: InfraccionItemPie[] = [
      { codigo: 'C29', nombre: 'Exceso Velocidad', cantidad: counts.C29, color: COLORES_INFRACCIONES.C29 },
      { codigo: 'C14', nombre: 'Restricción / Pico y Placa', cantidad: counts.C14, color: COLORES_INFRACCIONES.C14 },
      { codigo: 'C38', nombre: 'Revisión Técnico-Mecánica', cantidad: counts.C38, color: COLORES_INFRACCIONES.C38 },
      { codigo: 'D04', nombre: 'SOAT Vencido', cantidad: counts.D04, color: COLORES_INFRACCIONES.D04 },
      { codigo: 'H04', nombre: 'Exceso Jornada / Fatiga', cantidad: counts.H04, color: COLORES_INFRACCIONES.H04 },
      { codigo: 'C02', nombre: 'Estacionamiento Indebido', cantidad: counts.C02, color: COLORES_INFRACCIONES.C02 },
      { codigo: 'D01', nombre: 'Sin Licencia Conducción', cantidad: counts.D01, color: COLORES_INFRACCIONES.D01 },
      { codigo: 'E03', nombre: 'Alcohol / Sustancias', cantidad: counts.E03, color: COLORES_INFRACCIONES.E03 },
      { codigo: 'Otras', nombre: 'Otras Infracciones', cantidad: counts.otrasInfracciones, color: COLORES_INFRACCIONES.otrasInf },
    ];
    return { items, total };
  }, [empresas]);

  // Infracciones Específicas de la Empresa Seleccionada
  const infraccionesEmpresaPie = useMemo(() => {
    if (!empresaSeleccionada) return { items: [], total: 0 };
    const inf = empresaSeleccionada.infracciones;
    const total = inf.totalInfracciones || 0;
    const items: InfraccionItemPie[] = [
      { codigo: 'C29', nombre: 'Exceso Velocidad', cantidad: inf.C29 || 0, color: COLORES_INFRACCIONES.C29 },
      { codigo: 'C14', nombre: 'Restricción / Pico y Placa', cantidad: inf.C14 || 0, color: COLORES_INFRACCIONES.C14 },
      { codigo: 'C38', nombre: 'Revisión Técnico-Mecánica', cantidad: inf.C38 || 0, color: COLORES_INFRACCIONES.C38 },
      { codigo: 'D04', nombre: 'SOAT Vencido', cantidad: inf.D04 || 0, color: COLORES_INFRACCIONES.D04 },
      { codigo: 'H04', nombre: 'Exceso Jornada / Fatiga', cantidad: inf.H04 || 0, color: COLORES_INFRACCIONES.H04 },
      { codigo: 'C02', nombre: 'Estacionamiento Indebido', cantidad: inf.C02 || 0, color: COLORES_INFRACCIONES.C02 },
      { codigo: 'D01', nombre: 'Sin Licencia Conducción', cantidad: inf.D01 || 0, color: COLORES_INFRACCIONES.D01 },
      { codigo: 'E03', nombre: 'Alcohol / Sustancias', cantidad: inf.E03 || 0, color: COLORES_INFRACCIONES.E03 },
      { codigo: 'Otras', nombre: 'Otras Infracciones', cantidad: inf.otrasInfracciones || 0, color: COLORES_INFRACCIONES.otrasInf },
    ];
    return { items, total };
  }, [empresaSeleccionada]);

  // Series Temporales Consolidadas Nacionales
  const seriesNacionales = useMemo(() => {
    return INDICADORES_REPORTE_CONFIG.map(cfg => {
      const serie = consolidarSerieTemporalPoblacional(empresas, cfg.id, cfg.extractor, cfg.unidad);
      const freq = obtenerFrecuenciaPaso20(cfg.id);
      return { cfg, serie, freq };
    });
  }, [empresas]);

  const imprimirPDF = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Controles de Configuración y Exportación de Reportes */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs print:hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <FileText className="w-5 h-5 text-blue-600" />
              Centro de Reportes Oficiales ANSV (PDF & Excel)
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Genera dictámenes técnicos formales para auditoría, visitas de verificación y reportes de autogestión anual.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={imprimirPDF}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-lg transition-colors cursor-pointer shadow-xs whitespace-nowrap"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Imprimir / Descargar PDF</span>
            </button>
          </div>
        </div>

        {/* Opciones de Selección */}
        <div className="mt-4 flex flex-wrap items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-700">Tipo de Dictamen:</span>
            <div className="flex rounded-lg bg-slate-100 p-0.5 border border-slate-200">
              <button
                onClick={() => setTipoReporte('NACIONAL')}
                className={`px-3 py-1.5 rounded-md font-semibold transition-colors cursor-pointer ${
                  tipoReporte === 'NACIONAL' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Informe Consolidado Nacional
              </button>
              <button
                onClick={() => setTipoReporte('EMPRESA')}
                className={`px-3 py-1.5 rounded-md font-semibold transition-colors cursor-pointer ${
                  tipoReporte === 'EMPRESA' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Ficha Individual por Empresa
              </button>
            </div>
          </div>

          {tipoReporte === 'EMPRESA' && (
            <div className="flex items-center gap-2 flex-1 max-w-md">
              <span className="font-semibold text-slate-700 shrink-0">Seleccionar Empresa:</span>
              <select
                value={empresaIdSeleccionada}
                onChange={e => setEmpresaIdSeleccionada(e.target.value)}
                className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 cursor-pointer truncate font-medium"
              >
                {empresas.map(e => (
                  <option key={e.id} value={e.id}>
                    {e.razonSocial} (NIT: {e.numeroDocumento}) — Vigencia {e.anoReporte}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Acceso Rápido a Descargas en Excel */}
        <div className="mt-4 pt-4 border-t border-slate-100 flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold text-slate-500 mr-2">Descargas Excel Rápidas:</span>
          <button
            onClick={() => exportarLibroPESVExcel(empresas)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors cursor-pointer"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
            <span>Base Completa Multi-Pestaña (.xlsx)</span>
          </button>
          <button
            onClick={() => exportarParticionFormularios(empresas, true)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition-colors cursor-pointer"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
            <span>Solo Cat. A (Formularios Completos)</span>
          </button>
          <button
            onClick={() => exportarParticionFormularios(empresas, false)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-lg transition-colors cursor-pointer"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-amber-600" />
            <span>Solo Cat. B/C (Incompletos)</span>
          </button>
        </div>
      </div>

      {/* DOCUMENTO OFICIAL FORMATEADO PARA IMPRESIÓN Y PDF */}
      <div
        ref={reportRef}
        className="bg-white border border-slate-300 rounded-xl p-8 sm:p-12 shadow-sm max-w-4xl mx-auto text-slate-900 space-y-6 print:border-none print:shadow-none print:p-0"
      >
        {/* Encabezado Oficial Institucional */}
        <div className="border-b-2 border-slate-900 pb-5 flex items-start justify-between">
          <div>
            <div className="text-[10px] tracking-widest font-mono text-slate-500 uppercase font-bold">
              República de Colombia · Ministerio de Transporte
            </div>
            <h1 className="text-lg sm:text-xl font-bold tracking-tight text-slate-900 mt-1">
              AGENCIA NACIONAL DE SEGURIDAD VIAL (ANSV)
            </h1>
            <p className="text-xs text-slate-600 mt-0.5">
              Dirección de Comportamiento · Grupo de Regulación y Planes Estratégicos PESV
            </p>
            <div className="text-[11px] font-mono text-slate-500 mt-1">
              Marco Legal: Ley 1503 de 2011 · Ley 2050 de 2020 · Metodología Oficial 24 Pasos
            </div>
          </div>

          <div className="text-right">
            <div className="inline-block px-2.5 py-1 bg-slate-100 rounded text-[11px] font-mono font-bold text-slate-800">
              RAD: ANSV-PESV-{new Date().getFullYear()}-0492
            </div>
            <div className="text-[10px] text-slate-500 mt-1 font-mono">
              Fecha de Emisión: {new Date().toLocaleDateString('es-CO')}
            </div>
          </div>
        </div>

        {/* Título del Documento */}
        <div className="text-center py-2 bg-slate-50 border border-slate-200 rounded-lg">
          <h2 className="text-sm font-bold tracking-wide uppercase text-slate-900">
            {tipoReporte === 'NACIONAL'
              ? 'DICTAMEN TÉCNICO Y AUDITORÍA POBLACIONAL DE PLANES ESTRATÉGICOS DE SEGURIDAD VIAL'
              : `INFORME TÉCNICO DE AUDITORÍA PESV: ${empresaSeleccionada.razonSocial}`}
          </h2>
          <p className="text-[11px] text-slate-600 mt-0.5">
            {tipoReporte === 'NACIONAL'
              ? `Consolidado de ${empresas.length} organizaciones evaluadas con modelo de propagación de incertidumbre`
              : `NIT: ${empresaSeleccionada.numeroDocumento} · Nivel Calculado: ${empresaSeleccionada.clasificacionCalculada}`}
          </p>
        </div>

        {/* CONTENIDO 1: REPORTE NACIONAL */}
        {tipoReporte === 'NACIONAL' ? (
          <div className="space-y-6 text-xs text-slate-800">
            <div>
              <h3 className="font-bold text-sm text-slate-900 border-b border-slate-200 pb-1 mb-2">
                1. Resumen Ejecutivo de Cumplimiento
              </h3>
              <p className="leading-relaxed text-slate-700">
                Se realizó la consolidación y evaluación sistemática de los informes de autogestión reportados por{' '}
                <strong className="font-mono">{empresas.length}</strong> entidades y empresas vigiladas. La metodología aplicada integró la triangulación de razones sociales, la normalización de identificaciones tributarias y el cálculo de la incertidumbre global (
                <span className="font-mono">X̄ ± δx</span>) según el modelo de datos duplicados y dispersión poblacional.
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-3">
                <div className="p-3 rounded bg-slate-50 border border-slate-200">
                  <span className="text-[11px] text-slate-500 block">Total Evaluadas:</span>
                  <span className="font-bold font-mono text-base">{empresas.length}</span>
                </div>
                <div className="p-3 rounded bg-slate-50 border border-slate-200">
                  <span className="text-[11px] text-slate-500 block">Formularios Completos (Cat A):</span>
                  <span className="font-bold font-mono text-base text-emerald-700">
                    {empresas.filter(e => e.categoriaFormulario === 'A').length}
                  </span>
                </div>
                <div className="p-3 rounded bg-slate-50 border border-slate-200">
                  <span className="text-[11px] text-slate-500 block">Discrepancias de Nivel:</span>
                  <span className="font-bold font-mono text-base text-red-700">
                    {discrepantes.length} ({((discrepantes.length / (empresas.length || 1)) * 100).toFixed(1)}%)
                  </span>
                </div>
                <div className="p-3 rounded bg-slate-50 border border-slate-200">
                  <span className="text-[11px] text-slate-500 block">Alertas Críticas ANSV:</span>
                  <span className="font-bold font-mono text-base text-amber-700">
                    {criticas.length}
                  </span>
                </div>
              </div>
            </div>

            <div>
              <h3 className="font-bold text-sm text-slate-900 border-b border-slate-200 pb-1 mb-2">
                2. Indicadores Oficiales con Incertidumbre Global Calculada
              </h3>
              <table className="w-full text-left border-collapse border border-slate-300 text-xs">
                <thead>
                  <tr className="bg-slate-100 text-slate-800 font-bold">
                    <th className="p-2 border border-slate-300">Indicador PESV (Paso 20)</th>
                    <th className="p-2 border border-slate-300">Fórmula Normativa</th>
                    <th className="p-2 border border-slate-300 text-right">Promedio Poblacional (X̄ ± δx)</th>
                    <th className="p-2 border border-slate-300 text-center">Criterio / Estado</th>
                  </tr>
                </thead>
                <tbody className="font-mono divide-y divide-slate-200">
                  <tr>
                    <td className="p-2 border border-slate-300 font-sans font-medium">Tasa Siniestros Viales (TSV)</td>
                    <td className="p-2 border border-slate-300 text-[10px]">SV(tn) * 1.000.000 / km(t)</td>
                    <td className="p-2 border border-slate-300 text-right font-bold">
                      {tsvRes.media.toFixed(2)} ± {tsvRes.deltaX.toFixed(2)} / 1M km
                    </td>
                    <td className="p-2 border border-slate-300 text-center font-sans text-emerald-700 font-semibold">
                      En tolerancia
                    </td>
                  </tr>
                  <tr>
                    <td className="p-2 border border-slate-300 font-sans font-medium">Cumplimiento Metas (CM)</td>
                    <td className="p-2 border border-slate-300 text-[10px]">(MA / TM) * 100</td>
                    <td className="p-2 border border-slate-300 text-right font-bold">
                      {metasRes.media.toFixed(1)}% ± {metasRes.deltaX.toFixed(1)}%
                    </td>
                    <td className="p-2 border border-slate-300 text-center font-sans text-emerald-700 font-semibold">
                      ≥ 85% meta
                    </td>
                  </tr>
                  <tr>
                    <td className="p-2 border border-slate-300 font-sans font-medium">Inspecciones Preoperacionales (IDP)</td>
                    <td className="p-2 border border-slate-300 text-[10px]">(#VID / #TV) * 100</td>
                    <td className="p-2 border border-slate-300 text-right font-bold">
                      {idpRes.media.toFixed(1)}% ± {idpRes.deltaX.toFixed(1)}%
                    </td>
                    <td className="p-2 border border-slate-300 text-center font-sans text-amber-700 font-semibold">
                      Control requerido
                    </td>
                  </tr>
                  <tr>
                    <td className="p-2 border border-slate-300 font-sans font-medium">Mantenimiento Preventivo (CPMVh)</td>
                    <td className="p-2 border border-slate-300 text-[10px]">(MEVh / MPVh) * 100</td>
                    <td className="p-2 border border-slate-300 text-right font-bold">
                      {mantRes.media.toFixed(1)}% ± {mantRes.deltaX.toFixed(1)}%
                    </td>
                    <td className="p-2 border border-slate-300 text-center font-sans text-emerald-700 font-semibold">
                      Aceptable
                    </td>
                  </tr>
                </tbody>
              </table>

              <div className="mt-4 pt-3 border-t border-slate-200">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-bold text-xs text-slate-800 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-blue-600" />
                    2.1 Mediciones Temporales Consolidadas (Trimestral, Mensual y Acumulado Anual)
                  </h4>
                  <span className="text-[10px] font-mono text-slate-500">
                    Paso 20 · Tabla 10 (Res. 40595 de 2022)
                  </span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse border border-slate-300 text-[11px]">
                    <thead>
                      <tr className="bg-slate-50 text-slate-700 font-semibold">
                        <th className="p-1.5 border border-slate-300">Indicador</th>
                        <th className="p-1.5 border border-slate-300">Frecuencia Oficial</th>
                        <th className="p-1.5 border border-slate-300">Valores por Periodo</th>
                        <th className="p-1.5 border border-slate-300 text-right">Acumulado Anual</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 font-mono text-[11px]">
                      {seriesNacionales.map(({ cfg, serie, freq }) => (
                        <tr key={cfg.id} className="hover:bg-slate-50/50">
                          <td className="p-1.5 border border-slate-300 font-sans">
                            <span className="font-bold text-slate-900">{cfg.codigo}</span>
                            <span className="text-slate-500 text-[10px] block font-sans truncate max-w-[200px]" title={cfg.nombre}>
                              {cfg.nombre}
                            </span>
                          </td>
                          <td className="p-1.5 border border-slate-300 font-sans text-[10px]">
                            <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                              {freq.etiqueta}
                            </span>
                          </td>
                          <td className="p-1.5 border border-slate-300 text-[10px]">
                            {freq.tipoPeriodo === 'TRIMESTRAL' ? (
                              <div className="flex items-center gap-2">
                                {serie.puntos.map(p => (
                                  <span key={p.periodo} className="px-1 py-0.2 rounded bg-blue-50/70 border border-blue-100 text-blue-900 font-semibold">
                                    {p.periodo}: {p.valor}{cfg.unidad}
                                  </span>
                                ))}
                              </div>
                            ) : (
                              <span className="text-slate-600 text-[10px]">
                                Prom. mensual: {(serie.puntos.reduce((acc, p) => acc + p.valor, 0) / (serie.puntos.length || 1)).toFixed(1)}{cfg.unidad}
                              </span>
                            )}
                          </td>
                          <td className="p-1.5 border border-slate-300 text-right font-bold text-blue-950 font-mono">
                            {serie.acumuladoAnual} {cfg.unidad}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-200">
                <h4 className="font-bold text-xs text-slate-800 flex items-center gap-1.5 mb-2">
                  <PieChart className="w-3.5 h-3.5 text-blue-600" />
                  2.2 Distribución de Infracciones de Tránsito Detectadas (Nacional)
                </h4>
                <PieChartInfracciones
                  items={totalesInfraccionesNacional.items}
                  total={totalesInfraccionesNacional.total}
                  subtitulo="Comparendos acumulados en el censo total de organizaciones evaluadas"
                />
              </div>
            </div>

            {/* SECCIÓN AÑADIDA: Top 10 Alertas */}
            <Top10AlertasTable empresas={empresas} />

          </div>
        ) : (
          /* CONTENIDO 2: FICHA TÉCNICA INDIVIDUAL POR EMPRESA (SÁBANA DE AUDITORÍA 1 AL 13) */
          <div className="space-y-6 text-xs text-slate-800">
            <div>
              <h3 className="font-bold text-sm text-slate-900 border-b border-slate-200 pb-1 mb-3">
                1. Datos de Identificación y Diagnóstico Operativo
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-3 bg-slate-50 border border-slate-200 rounded-lg">
                <div>
                  <span className="text-slate-500 block text-[11px]">Razón Social:</span>
                  <span className="font-bold text-slate-900">{empresaSeleccionada.razonSocial}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[11px]">NIT / Documento:</span>
                  <span className="font-mono text-slate-900">{empresaSeleccionada.numeroDocumento}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[11px]">Misionalidad:</span>
                  <span className="font-semibold text-slate-800">{empresaSeleccionada.misionalidad}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[11px]">Sector Productivo:</span>
                  <span>{empresaSeleccionada.sectorEconomico} (CIIU {empresaSeleccionada.codigoCIIU})</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[11px]">Sede Principal:</span>
                  <span>{empresaSeleccionada.municipio}, {empresaSeleccionada.departamento}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[11px]">Correo Notificaciones:</span>
                  <span className="font-mono text-slate-700">{empresaSeleccionada.correo}</span>
                </div>
              </div>
            </div>

            <div>
              <h3 className="font-bold text-sm text-slate-900 border-b border-slate-200 pb-1 mb-3">
                2. Evaluación de Clasificación Normativa
              </h3>
              <div className="grid grid-cols-3 gap-3">
                <div className="p-3 rounded bg-slate-50 border border-slate-200">
                  <span className="text-[11px] text-slate-500 block">Nivel Reportado por Empresa:</span>
                  <span className="font-bold text-slate-800">{empresaSeleccionada.clasificacionReportada}</span>
                </div>
                <div className="p-3 rounded bg-slate-50 border border-slate-200">
                  <span className="text-[11px] text-slate-500 block">Nivel Legal Exigido (Norma):</span>
                  <span className="font-bold text-blue-700">{empresaSeleccionada.clasificacionCalculada}</span>
                </div>
                <div className="p-3 rounded bg-slate-50 border border-slate-200">
                  <span className="text-[11px] text-slate-500 block">Flota Total y Conductores:</span>
                  <span className="font-mono font-bold text-slate-800">
                    {empresaSeleccionada.flota.totalVehiculos} veh / {empresaSeleccionada.conductores.totalConductoresNorma} cond
                  </span>
                </div>
              </div>

              {!empresaSeleccionada.esClasificacionCorrecta && (
                <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg text-red-900">
                  <span className="font-bold">Hallazgo de Discrepancia: </span>
                  <span>{empresaSeleccionada.discrepanciaClasificacion}. La empresa debe adoptar de inmediato los requisitos del nivel {empresaSeleccionada.clasificacionCalculada}.</span>
                </div>
              )}
            </div>

            {/* AUDITORÍA INTEGRAL DE LOS 13 INDICADORES PESV */}
            <div className="space-y-4 pt-2">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-200">
                <Calculator className="w-5 h-5 text-blue-600" />
                <h3 className="font-bold text-slate-900 text-sm">
                  3. Auditoría Integral de Indicadores PESV (1 al 13): Valores Calculados vs. Reportados
                </h3>
              </div>

              {INDICADORES_AUDITORIA_PDF.map((ind) => {
                let indicadorTieneError = false;
                const periodos = OBTENER_PERIODOS_PDF(ind.freq);

                const filasAuditoria = ind.sub.flatMap(cfg => {
                  return periodos.map(per => {
                    let n = 0;
                    let d = 0;

                    if (per.esAcumuladoReal && ind.freq !== 'ANUAL') {
                      const sufijosPeriodos = ind.freq === 'TRIMESTRAL' 
                        ? ['primer_trimestre', 'segundo_trimestre', 'tercer_trimestre', 'cuarto_trimestre']
                        : ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];

                      sufijosPeriodos.forEach(suf => {
                        n += Number(dataEmpresa[`${cfg.n}_${suf}`]) || 0;
                        d += Number(dataEmpresa[`${cfg.d}_${suf}`]) || Number(dataEmpresa[`${(cfg as any).d2}_${suf}`]) || 0;
                      });
                    } else {
                      n = Number(dataEmpresa[`${cfg.n}_${per.suf}`]) || 0;
                      d = Number(dataEmpresa[`${cfg.d}_${per.suf}`]) || Number(dataEmpresa[`${(cfg as any).d2}_${per.suf}`]) || 0;
                    }

                    const reportado = Number(dataEmpresa[`${cfg.rep}_${per.suf}`]);

                    if (!n && !d && isNaN(reportado)) return null;

                    const valReportado = isNaN(reportado) ? 0 : reportado;
                    let valCalculado = 0;

                    if (cfg.type === 'division') {
                      const multVal = (cfg as any).mult || 1;
                      valCalculado = d > 0 ? (n / d) * multVal : 0;
                    } else if (cfg.type === 'suma') {
                      valCalculado = n + d;
                    } else if (cfg.type === 'resta') {
                      valCalculado = n - d;
                    }

                    const diferencia = Math.abs(valCalculado - valReportado);
                    const limiteError = cfg.type === 'division' ? 0.5 : 1;
                    const hayError = (cfg.type === 'division' ? d > 0 : (n > 0 || d > 0)) && diferencia > limiteError;

                    if (hayError) indicadorTieneError = true;

                    return (
                      <tr key={`${cfg.label}-${per.suf}`} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/50">
                        <td className="py-2 px-3 text-[11px] font-sans text-slate-700 font-medium">{cfg.label}</td>
                        <td className="py-2 px-3 text-[11px] font-mono font-bold text-slate-500 bg-slate-50/50">{per.label}</td>
                        <td className="py-2 px-3 text-right text-[11px] font-mono text-slate-600">
                          {cfg.type !== 'resta' && cfg.type !== 'suma' ? `${n.toLocaleString()} / ${d.toLocaleString()}` : `${n.toLocaleString()} | ${d.toLocaleString()}`}
                        </td>
                        <td className="py-2 px-3 text-right text-[11px] font-mono font-bold text-blue-700 bg-blue-50/30">
                          {valCalculado.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                        </td>
                        <td className={`py-2 px-3 text-right text-[11px] font-mono font-bold transition-colors ${
                          hayError 
                            ? 'text-red-700 bg-red-50 underline decoration-red-400 decoration-wavy underline-offset-2' 
                            : 'text-emerald-700 bg-emerald-50/30'
                        }`}>
                          {valReportado.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                        </td>
                      </tr>
                    );
                  }).filter(Boolean);
                });

                if (filasAuditoria.length === 0) return null;

                return (
                  <div key={ind.id} className={`bg-white border rounded-xl overflow-hidden shadow-xs transition-colors ${indicadorTieneError ? 'border-red-200' : 'border-slate-200'}`}>
                    <div className={`px-4 py-2.5 border-b flex justify-between items-center ${indicadorTieneError ? 'bg-red-50/50 border-red-100' : 'bg-slate-50 border-slate-200'}`}>
                      <h5 className="font-bold text-xs text-slate-800 flex items-center gap-1.5">
                        <Calculator className="w-3.5 h-3.5 text-blue-600" />
                        {ind.titulo}
                      </h5>
                      {indicadorTieneError ? (
                        <span className="flex items-center gap-1 text-[10px] uppercase font-bold text-red-600 bg-red-100 px-2 py-0.5 rounded">
                          <AlertOctagon className="w-3 h-3" /> Incoherencia Detectada
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-[10px] uppercase font-bold text-emerald-600 bg-emerald-100 px-2 py-0.5 rounded">
                          <CheckCircle2 className="w-3 h-3" /> Consistente
                        </span>
                      )}
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full text-left">
                        <thead>
                          <tr className="bg-slate-100 text-slate-500 text-[10px] uppercase tracking-wider">
                            <th className="py-2 px-3 font-semibold">Sub-Nivel / Variable</th>
                            <th className="py-2 px-3 font-semibold">Periodo</th>
                            <th className="py-2 px-3 font-semibold text-right">Variables Base (N / D)</th>
                            <th className="py-2 px-3 font-semibold text-right bg-blue-100/50">Valor Calculado</th>
                            <th className="py-2 px-3 font-semibold text-right">Valor Reportado</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filasAuditoria}
                        </tbody>
                      </table>
                    </div>

                    {indicadorTieneError && (
                      <div className="bg-red-50 p-3 border-t border-red-100 flex items-start gap-2.5">
                        <AlertOctagon className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                        <div>
                          <span className="font-bold text-red-900 text-[11px]">Alerta de Asistencia Técnica (Cálculo Incorrecto): </span>
                          <span className="text-[11px] text-red-700">
                            La organización reportó un valor final diferente al calculado mediante sus variables base. Los periodos con error se encuentran subrayados en rojo.
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Infracciones de Tránsito de la Empresa */}
            <div className="mt-4 pt-3 border-t border-slate-200">
              <h4 className="font-bold text-xs text-slate-800 flex items-center gap-1.5 mb-2">
                <PieChart className="w-3.5 h-3.5 text-blue-600" />
                4. Infracciones de Tránsito de la Organización (Gráfica de Torta)
              </h4>
              <PieChartInfracciones
                items={infraccionesEmpresaPie.items}
                total={infraccionesEmpresaPie.total}
                subtitulo={`Comparendos reportados para ${empresaSeleccionada.razonSocial}`}
              />
            </div>

            {/* Alertas y Plan de Asistencia Técnica ANSV */}
            <div>
              <h3 className="font-bold text-sm text-slate-900 border-b border-slate-200 pb-1 mb-3">
                5. Plan de Asistencia Técnica Focalizada ANSV
              </h3>
              {empresaSeleccionada.alertas.length === 0 ? (
                <div className="p-3 bg-emerald-50 text-emerald-800 rounded-lg text-xs">
                  La organización no presenta alertas críticas en la vigencia evaluada. Cumplimiento satisfactorio.
                </div>
              ) : (
                <div className="space-y-2">
                  {empresaSeleccionada.alertas.map((al, idx) => (
                    <div key={idx} className="p-3 rounded-lg border border-slate-200 bg-slate-50/70">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900">{al.titulo}</span>
                        <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-amber-100 text-amber-800 font-bold">
                          {al.severidad}
                        </span>
                      </div>
                      <p className="text-slate-600 text-[11px] mt-1">{al.descripcion}</p>
                      <div className="mt-1.5 text-blue-800 text-[11px] font-medium">
                        <strong>Recomendación ANSV:</strong> {al.recomendacionANSV}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Firmas de Autoridad Verificadora */}
        <div className="pt-8 border-t border-slate-300 grid grid-cols-2 gap-8 text-xs text-center font-sans">
          <div>
            <div className="border-b border-slate-400 w-48 mx-auto mb-2"></div>
            <div className="font-bold text-slate-900">Auditor Líder de Verificación</div>
            <div className="text-slate-500 text-[11px]">Agencia Nacional de Seguridad Vial</div>
            <div className="text-slate-400 text-[10px] font-mono mt-0.5">Ley 2050 de 2020 · Verificación Oficial</div>
          </div>
          <div>
            <div className="border-b border-slate-400 w-48 mx-auto mb-2"></div>
            
          </div>
        </div>
      </div>
    </div>
  );
};