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
  ShieldAlert,
  Calendar,
  History,
  TrendingUp,
  TrendingDown,
  Minus,
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

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200">
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
          {/* Oculto el Historial Interactivo por brevedad visual, asumiendo lo dejas igual */}
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
            <div className="flex items-center gap-2">
              <History className="w-4 h-4 text-indigo-600" />
              <span className="font-bold text-slate-900 text-xs">Año de Autogestión Seleccionado:</span>
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-indigo-100 text-indigo-800 border border-indigo-200">
                Año {empresa.anoReporte}
              </span>
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50">
              <div className="flex items-center justify-between pb-2 border-b border-slate-200 mb-2.5">
                <span className="font-bold text-slate-900 flex items-center gap-1.5">
                  <Truck className="w-4 h-4 text-blue-600" />
                  Censo de Flota Vehicular
                </span>
                <span className="text-[11px] font-mono text-slate-500 font-bold">{empresa.flota.totalVehiculos} total</span>
              </div>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50">
              <div className="flex items-center justify-between pb-2 border-b border-slate-200 mb-2.5">
                <span className="font-bold text-slate-900 flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-emerald-600" />
                  Censo de Conductores
                </span>
                <span className="text-[11px] font-mono text-slate-500 font-bold">{empresa.conductores.totalConductoresNorma} total</span>
              </div>
            </div>
          </div>

          {/* Tabla de Indicadores */}
          <div className="border border-slate-200 rounded-xl overflow-hidden">
            <div className="bg-slate-100 px-4 py-2.5 font-bold text-slate-800 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Calculator className="w-4 h-4 text-blue-600" />
                Matriz de Indicadores PESV (Medición ± Incertidumbre δx)
              </span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-y divide-slate-100 font-mono text-center">
              <div className="p-3">
                <span className="text-[10px] text-slate-500 font-sans block">TSV Total</span>
                <span className="font-bold text-slate-900 text-sm">{empresa.indicadores.tsvTotal.toFixed(2)}</span>
                <span className="text-[10px] text-slate-400 block">± {empresa.deltasIncertidumbre.tsvTotal || 0}</span>
              </div>
              <div className="p-3">
                <span className="text-[10px] text-slate-500 font-sans block">Metas PESV</span>
                <span className="font-bold text-slate-900 text-sm">{empresa.indicadores.cmPesv.toFixed(1)}%</span>
                <span className="text-[10px] text-slate-400 block">± {empresa.deltasIncertidumbre.cmPesv || 0}%</span>
              </div>
              <div className="p-3">
                <span className="text-[10px] text-slate-500 font-sans block">Preoperacional IDP</span>
                <span className="font-bold text-slate-900 text-sm">{empresa.indicadores.idp.toFixed(1)}%</span>
              </div>
              <div className="p-3">
                <span className="text-[10px] text-slate-500 font-sans block">Mantenimiento CPMVh</span>
                <span className="font-bold text-slate-900 text-sm">{empresa.indicadores.cpmvh.toFixed(1)}%</span>
              </div>
            </div>
          </div>

          {/* Desglose Fáctico de Niveles de Pérdida (NUEVO COMPONENTE) */}
          <div className="border border-slate-200 rounded-xl overflow-hidden mt-4 shadow-sm">
            <div className="bg-slate-100 px-4 py-2.5 font-bold text-slate-800 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <ShieldAlert className="w-4 h-4 text-red-600" />
                Desglose Siniestralidad y Costos por Nivel de Pérdida (Ind 1 y 2)
              </span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600">
                  <tr>
                    <th className="py-2.5 px-4 font-semibold">Nivel de Pérdida</th>
                    <th className="py-2.5 px-4 font-semibold text-right">Cant. Siniestros</th>
                    <th className="py-2.5 px-4 font-semibold text-right">Tasa TSV(n)</th>
                    <th className="py-2.5 px-4 font-semibold text-right">Costos Directos</th>
                    <th className="py-2.5 px-4 font-semibold text-right">Costos Indirectos</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono">
                  {[
                    { n: 1, label: 'Nivel 1 (Fatalidades)', tsv: empresa.indicadores.tsvNivel1, cant: empresa.indicadores.nNivel1, cd: empresa.indicadores.costosNivel1Directos, ci: empresa.indicadores.costosNivel1Indirectos },
                    { n: 2, label: 'Nivel 2 (Graves >30d)', tsv: empresa.indicadores.tsvNivel2, cant: empresa.indicadores.nNivel2, cd: empresa.indicadores.costosNivel2Directos, ci: empresa.indicadores.costosNivel2Indirectos },
                    { n: 3, label: 'Nivel 3 (Leves ≤30d)', tsv: empresa.indicadores.tsvNivel3, cant: empresa.indicadores.nNivel3, cd: empresa.indicadores.costosNivel3Directos, ci: empresa.indicadores.costosNivel3Indirectos },
                    { n: 4, label: 'Nivel 4 (Choques/Daños)', tsv: empresa.indicadores.tsvNivel4, cant: empresa.indicadores.nNivel4, cd: empresa.indicadores.costosNivel4Directos, ci: empresa.indicadores.costosNivel4Indirectos },
                  ].map(lvl => (
                    <tr key={lvl.n} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-2.5 px-4 font-sans font-medium text-slate-800">{lvl.label}</td>
                      <td className="py-2.5 px-4 text-right text-slate-700">{lvl.cant || 0}</td>
                      <td className="py-2.5 px-4 text-right font-bold text-blue-700">{Number(lvl.tsv || 0).toFixed(2)}</td>
                      <td className="py-2.5 px-4 text-right text-slate-600">${Number(lvl.cd || 0).toLocaleString()}</td>
                      <td className="py-2.5 px-4 text-right text-slate-600">${Number(lvl.ci || 0).toLocaleString()}</td>
                    </tr>
                  ))}
                  <tr className="bg-slate-100/50 font-bold">
                    <td className="py-2.5 px-4 font-sans text-slate-900">Total General Registrado</td>
                    <td className="py-2.5 px-4 text-right">
                      {Number(empresa.indicadores.nNivel1 || 0) + Number(empresa.indicadores.nNivel2 || 0) + Number(empresa.indicadores.nNivel3 || 0) + Number(empresa.indicadores.nNivel4 || 0)}
                    </td>
                    <td className="py-2.5 px-4 text-right text-blue-900">{Number(empresa.indicadores.tsvTotal || 0).toFixed(2)}</td>
                    <td className="py-2.5 px-4 text-right text-slate-900">${Number(empresa.indicadores.costosDirectos || 0).toLocaleString()}</td>
                    <td className="py-2.5 px-4 text-right text-slate-900">${Number(empresa.indicadores.costosIndirectos || 0).toLocaleString()}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Infracciones de Tránsito */}
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50">
            <span className="font-bold text-slate-900 block mb-2">Comparendos ({empresa.infracciones.totalInfracciones} totales)</span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 font-mono text-[11px]">
              <div className="p-2 rounded bg-white border border-slate-200">
                <span className="text-slate-500 font-sans block text-[10px]">C29 (Velocidad):</span>
                <span className="font-bold text-red-700">{empresa.infracciones.C29}</span>
              </div>
              <div className="p-2 rounded bg-white border border-slate-200">
                <span className="text-slate-500 font-sans block text-[10px]">C14 (Pico y Placa):</span>
                <span className="font-bold text-slate-800">{empresa.infracciones.C14}</span>
              </div>
            </div>
          </div>

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