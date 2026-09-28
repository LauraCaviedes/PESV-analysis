import React from 'react';
import {
  X,
  Building2,
  Truck,
  Users,
  AlertTriangle,
  CheckCircle2,
  Calculator,
  LifeBuoy,
  FileSpreadsheet,
  FileText,
  Calendar,
  History,
  AlertOctagon,
} from 'lucide-react';
import { EmpresaPESV } from '../types/pesv';
import { exportarLibroPESVExcel } from '../utils/excelExporter';

interface CompanyDetailModalProps {
  empresa: EmpresaPESV | null;
  todasLasEmpresas?: EmpresaPESV[];
  onSeleccionarEmpresa?: (empresa: EmpresaPESV) => void;
  onClose: () => void;
  onIrAAsistencia: (empresa: EmpresaPESV) => void;
  onIrAReportes: (empresa: EmpresaPESV) => void;
}

// Configuración de los 13 indicadores con sus variables base
const INDICADORES_MODAL = [
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

const OBTENER_PERIODOS_MODAL = (freq: string) => {
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

export const CompanyDetailModal: React.FC<CompanyDetailModalProps> = ({
  empresa,
  todasLasEmpresas = [],
  onSeleccionarEmpresa,
  onClose,
  onIrAAsistencia,
  onIrAReportes,
}) => {
  if (!empresa) return null;

  const reportesHistoricos = todasLasEmpresas
    .filter(e => e.numeroDocumento === empresa.numeroDocumento)
    .sort((a, b) => b.anoReporte - a.anoReporte);

  const data = empresa.datosEstandarizados || {};

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-5xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200">
        {/* Header Modal */}
        <div className="sticky top-0 bg-slate-900 text-white px-6 py-4 rounded-t-2xl flex items-center justify-between z-10">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-blue-600 text-white">
                {empresa.tipoDocumento}: {empresa.numeroDocumento}
              </span>
              <span className="text-xs text-slate-400">
                {empresa.municipio}, {empresa.departamento}
              </span>
              <span className="inline-flex items-center gap-1 text-xs font-bold font-mono px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-400/30">
                <Calendar className="w-3 h-3 text-indigo-300" />
                Vigencia {empresa.anoReporte}
              </span>
            </div>
            <h3 className="text-base sm:text-lg font-bold tracking-tight text-white mt-1">
              {empresa.razonSocial}
            </h3>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => exportarLibroPESVExcel([empresa], `Ficha_PESV_${empresa.numeroDocumento}_${empresa.anoReporte}.xlsx`)}
              className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
              title="Descargar Ficha en Excel"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6 text-xs text-slate-800">
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <History className="w-4 h-4 text-indigo-600" />
                <span className="font-bold text-slate-900 text-xs">Año de Autogestión Seleccionado:</span>
                <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-indigo-100 text-indigo-800 border border-indigo-200">
                  Año {empresa.anoReporte}
                </span>
              </div>

              {reportesHistoricos.length > 1 && (
                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] text-slate-500 font-medium mr-1">Cambiar a otro año:</span>
                  {reportesHistoricos.map(rep => {
                    const esActual = rep.anoReporte === empresa.anoReporte;
                    return (
                      <button
                        key={rep.id}
                        onClick={() => onSeleccionarEmpresa && onSeleccionarEmpresa(rep)}
                        className={`px-2.5 py-1 text-xs font-mono font-bold rounded-lg transition-all cursor-pointer ${
                          esActual ? 'bg-indigo-600 text-white shadow-xs' : 'bg-white text-slate-700 hover:bg-indigo-50 border border-slate-200'
                        }`}
                      >
                        {rep.anoReporte} {esActual ? '★' : ''}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Fila 1: Auditoría de Clasificación */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-[11px] text-slate-500 block">Nivel Reportado por Empresa:</span>
              <span className="text-sm font-bold text-slate-900 mt-0.5 block">{empresa.clasificacionReportada}</span>
            </div>
            <div className="p-3 rounded-xl bg-blue-50/60 border border-blue-200">
              <span className="text-[11px] text-blue-700 block font-semibold">Nivel Calculado por Norma:</span>
              <span className="text-sm font-bold text-blue-900 mt-0.5 block">{empresa.clasificacionCalculada}</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-[11px] text-slate-500 block">Formulario de Autogestión:</span>
              <span className={`text-sm font-bold font-mono mt-0.5 block ${empresa.categoriaFormulario === 'A' ? 'text-emerald-700' : 'text-amber-700'}`}>
                Categoría {empresa.categoriaFormulario} ({empresa.cantidadFormularios}/3)
              </span>
            </div>
          </div>

          {!empresa.esClasificacionCorrecta && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-900 flex items-start gap-2.5">
              <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold">Inconsistencia en Clasificación PESV: </span>
                <span>{empresa.discrepanciaClasificacion}</span>
              </div>
            </div>
          )}

          {/* Sábana Completa de Indicadores 1 al 13 con Acumulado Real Sumado */}
          <div className="space-y-4 pt-2">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-200">
              <Calculator className="w-5 h-5 text-blue-600" />
              <h4 className="font-bold text-slate-900 text-sm">
                Auditoría Integral de Indicadores PESV (1 al 13): Valores Calculados vs. Reportados
              </h4>
            </div>

            {INDICADORES_MODAL.map((ind) => {
              let indicadorTieneError = false;
              const periodos = OBTENER_PERIODOS_MODAL(ind.freq);

              const filasAuditoria = ind.sub.flatMap(cfg => {
                return periodos.map(per => {
                  let n = 0;
                  let d = 0;

                  // REGLA DE ACUMULADO ANUAL REAL (Suma de los periodos anteriores)
                  if (per.esAcumuladoReal && ind.freq !== 'ANUAL') {
                    const sufijosPeriodos = ind.freq === 'TRIMESTRAL' 
                      ? ['primer_trimestre', 'segundo_trimestre', 'tercer_trimestre', 'cuarto_trimestre']
                      : ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];

                    sufijosPeriodos.forEach(suf => {
                      n += Number(data[`${cfg.n}_${suf}`]) || 0;
                      d += Number(data[`${cfg.d}_${suf}`]) || Number(data[`${(cfg as any).d2}_${suf}`]) || 0;
                    });
                  } else {
                    n = Number(data[`${cfg.n}_${per.suf}`]) || 0;
                    d = Number(data[`${cfg.d}_${per.suf}`]) || Number(data[`${(cfg as any).d2}_${per.suf}`]) || 0;
                  }

                  const reportado = Number(data[`${cfg.rep}_${per.suf}`]);

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

          {/* Infracciones de Tránsito / Comparendos */}
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50">
            <span className="font-bold text-slate-900 block mb-2">
              Comparendos de Tránsito Registrados ({empresa.infracciones.totalInfracciones} comparendos)
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 font-mono text-[11px]">
              <div className="p-2 rounded bg-white border border-slate-200">
                <span className="text-slate-500 font-sans block text-[10px]">C29 (Velocidad):</span>
                <span className="font-bold text-red-700">{empresa.infracciones.C29}</span>
              </div>
              <div className="p-2 rounded bg-white border border-slate-200">
                <span className="text-slate-500 font-sans block text-[10px]">C14 (Pico y Placa):</span>
                <span className="font-bold text-slate-800">{empresa.infracciones.C14}</span>
              </div>
              <div className="p-2 rounded bg-white border border-slate-200">
                <span className="text-slate-500 font-sans block text-[10px]">C38 (Técnico-Mecánica):</span>
                <span className="font-bold text-slate-800">{empresa.infracciones.C38}</span>
              </div>
              <div className="p-2 rounded bg-white border border-slate-200">
                <span className="text-slate-500 font-sans block text-[10px]">H04 (Jornada Conducción):</span>
                <span className="font-bold text-amber-700">{empresa.infracciones.H04}</span>
              </div>
            </div>
          </div>

          {/* Alertas Activas de Asistencia Técnica ANSV */}
          {empresa.alertas && empresa.alertas.length > 0 && (
            <div className="space-y-2">
              <span className="font-bold text-slate-900 block">
                Alertas Activas de Asistencia Técnica ANSV:
              </span>
              {empresa.alertas.map(a => (
                <div key={a.id} className="p-3 rounded-lg border border-amber-200 bg-amber-50/60">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-amber-200 text-amber-900 font-bold">
                      {a.severidad}
                    </span>
                    <span className="font-bold text-amber-950">{a.titulo}</span>
                  </div>
                  <p className="text-amber-900 text-[11px] mt-1">{a.descripcion}</p>
                  <p className="text-blue-900 text-[11px] mt-1 font-medium">
                    <strong>Orientación ANSV:</strong> {a.recomendacionANSV}
                  </p>
                </div>
              ))}
            </div>
          )}

          <div className="pt-4 border-t border-slate-200 flex items-center justify-between">
            <button
              onClick={() => onIrAReportes(empresa)}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg cursor-pointer"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Ver Ficha Oficial de Dictamen PDF</span>
            </button>
            <button
              onClick={() => onIrAAsistencia(empresa)}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-lg cursor-pointer"
            >
              <LifeBuoy className="w-3.5 h-3.5" />
              <span>Programar Asistencia Técnica</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};