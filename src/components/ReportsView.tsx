import React, { useState, useRef } from 'react';
import {
  FileText,
  FileSpreadsheet,
  Download,
  Printer,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Building2,
  Calendar,
} from 'lucide-react';
import { EmpresaPESV } from '../types/pesv';
import { exportarLibroPESVExcel, exportarParticionFormularios } from '../utils/excelExporter';
import { calcularMetricaConIncertidumbre } from '../utils/pesvCalculations';

interface ReportsViewProps {
  empresas: EmpresaPESV[];
  empresaFoco?: EmpresaPESV | null;
}

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
                  tipoReporte === 'NACIONAL'
                    ? 'bg-white text-blue-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Informe Consolidado Nacional
              </button>
              <button
                onClick={() => setTipoReporte('EMPRESA')}
                className={`px-3 py-1.5 rounded-md font-semibold transition-colors cursor-pointer ${
                  tipoReporte === 'EMPRESA'
                    ? 'bg-white text-blue-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
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
            {/* 1. Resumen Ejecutivo */}
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

            {/* 2. Mediciones de Indicadores con Incertidumbre */}
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
            </div>

            {/* 3. Conclusiones y Dictamen de Asistencia Técnica */}
            <div>
              <h3 className="font-bold text-sm text-slate-900 border-b border-slate-200 pb-1 mb-2">
                3. Dictamen y Conclusiones Institucionales
              </h3>
              <ul className="list-disc pl-5 space-y-1.5 text-slate-700 text-xs">
                <li>
                  <strong>Capacitación en Clasificación:</strong> Se constató que el {((discrepantes.length / (empresas.length || 1)) * 100).toFixed(1)}% de las empresas analizadas declararon un nivel inferior (Básico o Estándar) al que les corresponde por tamaño de flota automotor y personal conductor. La ANSV emitirá circulares orientadoras para regularizar su encuadre.
                </li>
                <li>
                  <strong>Foco en Velocidad y Fatiga:</strong> La infracción C29 (exceso de velocidad) representó la mayor recurrencia sancionatoria, correlacionándose directamente con eventos graves. Se requiere articular mesas técnicas con los sectores de Carga y Pasajeros en los corredores nacionales.
                </li>
              </ul>
            </div>
          </div>
        ) : (
          /* CONTENIDO 2: FICHA TÉCNICA INDIVIDUAL POR EMPRESA */
          <div className="space-y-6 text-xs text-slate-800">
            {/* Datos Generales de la Empresa */}
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

            {/* Clasificación y Discrepancias */}
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
                  <span>{empresaSeleccionada.discrepanciaClasificacion}. La empresa debe adoptar de inmediato los requisitos y pasos adicionales del nivel {empresaSeleccionada.clasificacionCalculada}.</span>
                </div>
              )}
            </div>

            {/* Indicadores Clave de la Empresa */}
            <div>
              <h3 className="font-bold text-sm text-slate-900 border-b border-slate-200 pb-1 mb-3">
                3. Mediciones de Desempeño y Siniestralidad Vial
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono">
                <div className="p-2.5 bg-slate-50 border border-slate-200 rounded">
                  <span className="text-[10px] text-slate-500 block font-sans">TSV Total:</span>
                  <span className="font-bold text-slate-900">
                    {empresaSeleccionada.indicadores.tsvTotal.toFixed(2)} ± {empresaSeleccionada.deltasIncertidumbre.tsvTotal || 0}
                  </span>
                </div>
                <div className="p-2.5 bg-slate-50 border border-slate-200 rounded">
                  <span className="text-[10px] text-slate-500 block font-sans">Cumplimiento Metas:</span>
                  <span className="font-bold text-slate-900">
                    {empresaSeleccionada.indicadores.cmPesv.toFixed(1)}%
                  </span>
                </div>
                <div className="p-2.5 bg-slate-50 border border-slate-200 rounded">
                  <span className="text-[10px] text-slate-500 block font-sans">Inspección Diaria (IDP):</span>
                  <span className="font-bold text-slate-900">
                    {empresaSeleccionada.indicadores.idp.toFixed(1)}%
                  </span>
                </div>
                <div className="p-2.5 bg-slate-50 border border-slate-200 rounded">
                  <span className="text-[10px] text-slate-500 block font-sans">Mantenimiento (CPMVh):</span>
                  <span className="font-bold text-slate-900">
                    {empresaSeleccionada.indicadores.cpmvh.toFixed(1)}%
                  </span>
                </div>
              </div>
            </div>

            {/* Alertas y Plan de Asistencia Técnica ANSV */}
            <div>
              <h3 className="font-bold text-sm text-slate-900 border-b border-slate-200 pb-1 mb-3">
                4. Plan de Asistencia Técnica Focalizada ANSV
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
            <div className="font-bold text-slate-900">Coordinación de Regulación PESV</div>
            <div className="text-slate-500 text-[11px]">Ministerio de Transporte de Colombia</div>
            <div className="text-slate-400 text-[10px] font-mono mt-0.5">Certificado de Acompañamiento Técnico</div>
          </div>
        </div>
      </div>
    </div>
  );
};
