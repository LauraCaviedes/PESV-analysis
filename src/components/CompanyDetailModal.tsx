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

  // Buscar todos los reportes de esta misma empresa (mismo NIT o Documento) en diferentes años
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
          {/* Selector de Años / Historial de Autogestión si la empresa tiene más de 1 año registrado */}
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <History className="w-4 h-4 text-indigo-600" />
                <span className="font-bold text-slate-900 text-xs">
                  Año de Autogestión Seleccionado:
                </span>
                <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-indigo-100 text-indigo-800 border border-indigo-200">
                  Año {empresa.anoReporte}
                </span>
              </div>

              {/* Botones de navegación entre años de la misma empresa */}
              {reportesHistoricos.length > 1 && (
                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] text-slate-500 font-medium mr-1">
                    Cambiar a otro año:
                  </span>
                  {reportesHistoricos.map(rep => {
                    const esActual = rep.anoReporte === empresa.anoReporte;
                    return (
                      <button
                        key={rep.id}
                        onClick={() => onSeleccionarEmpresa && onSeleccionarEmpresa(rep)}
                        className={`px-2.5 py-1 text-xs font-mono font-bold rounded-lg transition-all cursor-pointer ${
                          esActual
                            ? 'bg-indigo-600 text-white shadow-xs'
                            : 'bg-white text-slate-700 hover:bg-indigo-50 hover:text-indigo-700 border border-slate-200'
                        }`}
                        title={`Ver reporte del año ${rep.anoReporte}`}
                      >
                        {rep.anoReporte}
                        {esActual ? ' (Viendo)' : ''}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Tabla resumen comparativa entre años si existen múltiples reportes */}
            {reportesHistoricos.length > 1 ? (
              <div className="mt-3 pt-3 border-t border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-800 flex items-center gap-1.5">
                    <TrendingUp className="w-3.5 h-3.5 text-indigo-600" />
                    Comparativa Multianual del PESV ({reportesHistoricos.length} vigencias registradas):
                  </span>
                  <span className="text-[10px] text-slate-500 font-medium">
                    Haz clic en cualquier año para alternar toda la ficha
                  </span>
                </div>

                {/* Grid comparativo interactivo */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px]">
                  {reportesHistoricos.map(rep => {
                    const esActual = rep.anoReporte === empresa.anoReporte;
                    return (
                      <div
                        key={rep.id}
                        onClick={() => onSeleccionarEmpresa && onSeleccionarEmpresa(rep)}
                        className={`p-2.5 rounded-xl border transition-all cursor-pointer ${
                          esActual
                            ? 'bg-indigo-50/90 border-indigo-400 ring-2 ring-indigo-400/30 shadow-xs'
                            : 'bg-white border-slate-200 hover:border-indigo-200 hover:bg-slate-50/80'
                        }`}
                      >
                        <div className="flex items-center justify-between font-bold pb-1 border-b border-slate-100">
                          <span className={`font-mono ${esActual ? 'text-indigo-900 font-extrabold' : 'text-slate-800'}`}>
                            Vigencia {rep.anoReporte} {esActual ? '★' : ''}
                          </span>
                          <span
                            className={`text-[10px] px-1.5 py-0.5 rounded font-sans font-semibold ${
                              rep.esClasificacionCorrecta
                                ? 'bg-slate-100 text-slate-800'
                                : 'bg-red-100 text-red-800'
                            }`}
                          >
                            {rep.clasificacionCalculada}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-600 font-mono mt-2 space-y-1">
                          <div className="flex justify-between">
                            <span className="text-slate-500">Flota:</span>
                            <span className="font-bold text-slate-800">
                              {rep.flota.totalVehiculos} veh ({rep.flota.carrosCamionetasPropios + rep.flota.motosPropias + rep.flota.cargaPropios + rep.flota.pasajerosPropios + rep.flota.bicicletasMicromovilidadPropias + rep.flota.maquinariaAmarillaPropia}p / {rep.flota.carrosTerceros + rep.flota.motosTerceros + rep.flota.cargaTerceros + rep.flota.pasajerosTerceros + rep.flota.bicicletasTerceros + rep.flota.maquinariaAmarillaTerceros}t)
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-500">Conductores:</span>
                            <span className="font-bold text-slate-800">
                              {rep.conductores.totalConductoresNorma} cond
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-500">TSV Total:</span>
                            <span className="font-bold text-slate-800">
                              {rep.indicadores.tsvTotal.toFixed(2)}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-500">Infracciones:</span>
                            <span className="font-bold text-slate-800">
                              {rep.infracciones.totalInfracciones} (C29: {rep.infracciones.C29})
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-500">Metas PESV:</span>
                            <span className="font-bold text-slate-800">
                              {rep.indicadores.cmPesv.toFixed(1)}%
                            </span>
                          </div>
                        </div>
                        {!esActual && (
                          <div className="mt-2 pt-1 text-center">
                            <span className="text-[10px] text-indigo-600 hover:text-indigo-800 font-semibold underline">
                              Ver detalles del año {rep.anoReporte} →
                            </span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="mt-2 text-[11px] text-slate-500">
                <span>
                  Reporte correspondiente al año de autogestión <strong className="text-slate-700">{empresa.anoReporte}</strong>. Si importas archivos de otros años para el NIT {empresa.numeroDocumento}, aquí podrás alternar y comparar su evolución histórica de forma automática.
                </span>
              </div>
            )}
          </div>

          {/* Fila 1: Auditoría de Clasificación */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-[11px] text-slate-500 block">Nivel Reportado por Empresa:</span>
              <span className="text-sm font-bold text-slate-900 mt-0.5 block">
                {empresa.clasificacionReportada}
              </span>
              <span className="text-[10px] text-slate-500 font-mono">
                {empresa.misionalidad} · Vigencia {empresa.anoReporte}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-blue-50/60 border border-blue-200">
              <span className="text-[11px] text-blue-700 block font-semibold">Nivel Calculado por Norma:</span>
              <span className="text-sm font-bold text-blue-900 mt-0.5 block">
                {empresa.clasificacionCalculada}
              </span>
              <span className="text-[10px] text-blue-600 font-mono">
                {empresa.flota.totalVehiculos} veh / {empresa.conductores.totalConductoresNorma} cond
              </span>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-[11px] text-slate-500 block">Formulario de Autogestión:</span>
              <span
                className={`text-sm font-bold font-mono mt-0.5 block ${
                  empresa.categoriaFormulario === 'A' ? 'text-emerald-700' : 'text-amber-700'
                }`}
              >
                Categoría {empresa.categoriaFormulario} ({empresa.cantidadFormularios} de 3 partes)
              </span>
              <span className="text-[10px] text-slate-500">
                P1: {empresa.flagP1 ? 'Sí' : 'No'} · P2: {empresa.flagP2 ? 'Sí' : 'No'} · P3: {empresa.flagP3 ? 'Sí' : 'No'}
              </span>
            </div>
          </div>

          {/* Banner de Discrepancia si aplica */}
          {!empresa.esClasificacionCorrecta && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-900 flex items-start gap-2.5">
              <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold">Inconsistencia en Clasificación PESV ({empresa.anoReporte}): </span>
                <span>{empresa.discrepanciaClasificacion}</span>
                <p className="text-[11px] text-red-800 mt-1">
                  La organización debe cumplir de manera inmediata los requisitos del nivel {empresa.clasificacionCalculada} para evitar sanciones de Ley 2050 de 2020.
                </p>
              </div>
            </div>
          )}

          {/* Desglose de Flota y Conductores */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Censo Flota */}
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50">
              <div className="flex items-center justify-between pb-2 border-b border-slate-200 mb-2.5">
                <span className="font-bold text-slate-900 flex items-center gap-1.5">
                  <Truck className="w-4 h-4 text-blue-600" />
                  Censo de Flota Vehicular ({empresa.flota.totalVehiculos} total)
                </span>
                <span className="text-[11px] text-slate-500 font-medium">
                  {empresa.flota.carrosCamionetasPropios + empresa.flota.motosPropias + empresa.flota.cargaPropios + empresa.flota.pasajerosPropios + empresa.flota.bicicletasMicromovilidadPropias + empresa.flota.maquinariaAmarillaPropia} propios · {empresa.flota.carrosTerceros + empresa.flota.motosTerceros + empresa.flota.cargaTerceros + empresa.flota.pasajerosTerceros + empresa.flota.bicicletasTerceros + empresa.flota.maquinariaAmarillaTerceros} contratistas
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-[11px] font-mono">
                <div className="p-2 rounded-lg bg-white border border-slate-200 shadow-2xs">
                  <span className="text-slate-500 font-sans block text-[10px]">Carros y Camionetas:</span>
                  <span className="font-bold text-slate-800 text-sm">
                    {empresa.flota.carrosCamionetasPropios + empresa.flota.carrosTerceros}
                  </span>
                  {(empresa.flota.carrosCamionetasPropios > 0 || empresa.flota.carrosTerceros > 0) && (
                    <span className="text-[10px] text-slate-400 block font-sans mt-0.5">
                      {empresa.flota.carrosCamionetasPropios} propios · {empresa.flota.carrosTerceros} terceros
                    </span>
                  )}
                </div>
                <div className="p-2 rounded-lg bg-white border border-slate-200 shadow-2xs">
                  <span className="text-slate-500 font-sans block text-[10px]">Transporte Carga:</span>
                  <span className="font-bold text-slate-800 text-sm">
                    {empresa.flota.cargaPropios + empresa.flota.cargaTerceros}
                  </span>
                  {(empresa.flota.cargaPropios > 0 || empresa.flota.cargaTerceros > 0) && (
                    <span className="text-[10px] text-slate-400 block font-sans mt-0.5">
                      {empresa.flota.cargaPropios} propios · {empresa.flota.cargaTerceros} terceros
                    </span>
                  )}
                </div>
                <div className="p-2 rounded-lg bg-white border border-slate-200 shadow-2xs">
                  <span className="text-slate-500 font-sans block text-[10px]">Motos / Ciclomotores:</span>
                  <span className="font-bold text-slate-800 text-sm">
                    {empresa.flota.motosPropias + empresa.flota.motosTerceros}
                  </span>
                  {(empresa.flota.motosPropias > 0 || empresa.flota.motosTerceros > 0) && (
                    <span className="text-[10px] text-slate-400 block font-sans mt-0.5">
                      {empresa.flota.motosPropias} propios · {empresa.flota.motosTerceros} terceros
                    </span>
                  )}
                </div>
                <div className="p-2 rounded-lg bg-white border border-slate-200 shadow-2xs">
                  <span className="text-slate-500 font-sans block text-[10px]">Transporte Pasajeros:</span>
                  <span className="font-bold text-slate-800 text-sm">
                    {empresa.flota.pasajerosPropios + empresa.flota.pasajerosTerceros}
                  </span>
                  {(empresa.flota.pasajerosPropios > 0 || empresa.flota.pasajerosTerceros > 0) && (
                    <span className="text-[10px] text-slate-400 block font-sans mt-0.5">
                      {empresa.flota.pasajerosPropios} propios · {empresa.flota.pasajerosTerceros} terceros
                    </span>
                  )}
                </div>
                <div className="p-2 rounded-lg bg-white border border-slate-200 shadow-2xs">
                  <span className="text-slate-500 font-sans block text-[10px]">Bicicletas / Micro:</span>
                  <span className="font-bold text-slate-800 text-sm">
                    {empresa.flota.bicicletasMicromovilidadPropias + empresa.flota.bicicletasTerceros}
                  </span>
                  {(empresa.flota.bicicletasMicromovilidadPropias > 0 || empresa.flota.bicicletasTerceros > 0) && (
                    <span className="text-[10px] text-slate-400 block font-sans mt-0.5">
                      {empresa.flota.bicicletasMicromovilidadPropias} propios · {empresa.flota.bicicletasTerceros} terceros
                    </span>
                  )}
                </div>
                <div className="p-2 rounded-lg bg-white border border-slate-200 shadow-2xs">
                  <span className="text-slate-500 font-sans block text-[10px]">Maquinaria Amarilla:</span>
                  <span className="font-bold text-slate-800 text-sm">
                    {empresa.flota.maquinariaAmarillaPropia + empresa.flota.maquinariaAmarillaTerceros}
                  </span>
                  {(empresa.flota.maquinariaAmarillaPropia > 0 || empresa.flota.maquinariaAmarillaTerceros > 0) && (
                    <span className="text-[10px] text-slate-400 block font-sans mt-0.5">
                      {empresa.flota.maquinariaAmarillaPropia} propios · {empresa.flota.maquinariaAmarillaTerceros} terceros
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Censo Conductores */}
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50">
              <div className="flex items-center justify-between pb-2 border-b border-slate-200 mb-2.5">
                <span className="font-bold text-slate-900 flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-emerald-600" />
                  Censo de Conductores ({empresa.conductores.totalConductoresNorma} total norma)
                </span>
                <span className="text-[11px] text-slate-500 font-medium">
                  +{empresa.conductores.peatonesExclusivos} peatones
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-[11px] font-mono">
                <div className="p-2 rounded-lg bg-white border border-slate-200 shadow-2xs">
                  <span className="text-slate-500 font-sans block text-[10px]">Conductores Vehículos:</span>
                  <span className="font-bold text-slate-800 text-sm">{empresa.conductores.conductoresCarro}</span>
                </div>
                <div className="p-2 rounded-lg bg-white border border-slate-200 shadow-2xs">
                  <span className="text-slate-500 font-sans block text-[10px]">Conductores Carga:</span>
                  <span className="font-bold text-slate-800 text-sm">{empresa.conductores.conductoresCarga}</span>
                </div>
                <div className="p-2 rounded-lg bg-white border border-slate-200 shadow-2xs">
                  <span className="text-slate-500 font-sans block text-[10px]">Conductores Pasajeros:</span>
                  <span className="font-bold text-slate-800 text-sm">{empresa.conductores.conductoresPasajeros}</span>
                </div>
                <div className="p-2 rounded-lg bg-white border border-slate-200 shadow-2xs">
                  <span className="text-slate-500 font-sans block text-[10px]">Motociclistas:</span>
                  <span className="font-bold text-slate-800 text-sm">{empresa.conductores.conductoresMotos}</span>
                </div>
                <div className="p-2 rounded-lg bg-white border border-slate-200 shadow-2xs">
                  <span className="text-slate-500 font-sans block text-[10px]">Ciclistas / Micro:</span>
                  <span className="font-bold text-slate-800 text-sm">
                    {empresa.conductores.conductoresBicicletas + (empresa.conductores.conductoresPatinetas || 0)}
                  </span>
                </div>
                <div className="p-2 rounded-lg bg-white border border-slate-200 shadow-2xs">
                  <span className="text-slate-500 font-sans block text-[10px]">Peatones Exclusivos:</span>
                  <span className="font-bold text-slate-600 text-sm">{empresa.conductores.peatonesExclusivos}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Tabla de Indicadores con Incertidumbre */}
          <div className="border border-slate-200 rounded-xl overflow-hidden">
            <div className="bg-slate-100 px-4 py-2.5 font-bold text-slate-800 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Calculator className="w-4 h-4 text-blue-600" />
                Matriz de Indicadores PESV (Medición ± Incertidumbre δx)
              </span>
              <span className="text-[11px] font-normal text-slate-600">
                Km Trimestre: {empresa.indicadores.kmRecorridosTrimestre.toLocaleString()} km
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-y divide-slate-100 font-mono text-center">
              <div className="p-3">
                <span className="text-[10px] text-slate-500 font-sans block">TSV Total</span>
                <span className="font-bold text-slate-900 text-sm">
                  {empresa.indicadores.tsvTotal.toFixed(2)}
                </span>
                <span className="text-[10px] text-slate-400 block">
                  ± {empresa.deltasIncertidumbre.tsvTotal || 0}
                </span>
              </div>

              <div className="p-3">
                <span className="text-[10px] text-slate-500 font-sans block">Metas PESV</span>
                <span className="font-bold text-slate-900 text-sm">
                  {empresa.indicadores.cmPesv.toFixed(1)}%
                </span>
                <span className="text-[10px] text-slate-400 block">
                  ± {empresa.deltasIncertidumbre.cmPesv || 0}%
                </span>
              </div>

              <div className="p-3">
                <span className="text-[10px] text-slate-500 font-sans block">Preoperacional IDP</span>
                <span className="font-bold text-slate-900 text-sm">
                  {empresa.indicadores.idp.toFixed(1)}%
                </span>
                <span className="text-[10px] text-slate-400 block">
                  ± {empresa.deltasIncertidumbre.idp || 0}%
                </span>
              </div>

              <div className="p-3">
                <span className="text-[10px] text-slate-500 font-sans block">Mantenimiento CPMVh</span>
                <span className="font-bold text-slate-900 text-sm">
                  {empresa.indicadores.cpmvh.toFixed(1)}%
                </span>
                <span className="text-[10px] text-slate-400 block">
                  ± {empresa.deltasIncertidumbre.cpmvh || 0}%
                </span>
              </div>

              <div className="p-3">
                <span className="text-[10px] text-slate-500 font-sans block">Cobertura Velocidad GVE</span>
                <span className="font-bold text-slate-900 text-sm">
                  {empresa.indicadores.gveCobertura.toFixed(1)}%
                </span>
              </div>

              <div className="p-3">
                <span className="text-[10px] text-slate-500 font-sans block">Excesos Velocidad ELVL</span>
                <span className="font-bold text-slate-900 text-sm">
                  {empresa.indicadores.elvl.toFixed(1)}%
                </span>
              </div>

              <div className="p-3">
                <span className="text-[10px] text-slate-500 font-sans block">% Exceso Jornada %EJL</span>
                <span className="font-bold text-slate-900 text-sm">
                  {empresa.indicadores.porcExcesoJornada.toFixed(2)}%
                </span>
              </div>

              <div className="p-3">
                <span className="text-[10px] text-slate-500 font-sans block">Auditoría Cerradas NCAC</span>
                <span className="font-bold text-slate-900 text-sm">
                  {empresa.indicadores.ncac.toFixed(1)}%
                </span>
              </div>
            </div>
          </div>

          {/* Infracciones de Tránsito de la Empresa */}
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

          {/* Alertas ANSV identificadas para esta empresa */}
          {empresa.alertas.length > 0 && (
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

          {/* Botones de Acción */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-between">
            <button
              onClick={() => onIrAReportes(empresa)}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Ver Ficha Oficial de Dictamen PDF</span>
            </button>

            <button
              onClick={() => onIrAAsistencia(empresa)}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-lg transition-colors cursor-pointer shadow-xs"
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
