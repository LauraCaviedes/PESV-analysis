import React from 'react';
import {
  TrendingUp,
  AlertTriangle,
  FileCheck2,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Building2,
  ArrowRight,
  Calendar,
} from 'lucide-react';
import { EmpresaPESV, NivelPESV } from '../types/pesv';
import { calcularMetricaConIncertidumbre } from '../utils/pesvCalculations';

interface DashboardOverviewProps {
  empresas: EmpresaPESV[];
  onSeleccionarEmpresa: (empresa: EmpresaPESV) => void;
  onIrATab: (tabId: any) => void;
}

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({
  empresas,
  onSeleccionarEmpresa,
  onIrATab,
}) => {
  // Años presentes en los datos actuales
  const anosPresentes = Array.from(new Set(empresas.map(e => e.anoReporte))).sort((a, b) => b - a);

  // Cálculos estadísticos con Incertidumbre
  const total = empresas.length || 1;

  const tsvValores = empresas.map(e => e.indicadores.tsvTotal);
  const tsvDeltas = empresas.map(e => e.deltasIncertidumbre.tsvTotal || 0);
  const tsvResumen = calcularMetricaConIncertidumbre(tsvValores, tsvDeltas, 'por 1M km');

  const metasValores = empresas.map(e => e.indicadores.cmPesv);
  const metasDeltas = empresas.map(e => e.deltasIncertidumbre.cmPesv || 0);
  const metasResumen = calcularMetricaConIncertidumbre(metasValores, metasDeltas, '%');

  const mantValores = empresas.map(e => e.indicadores.cpmvh);
  const mantDeltas = empresas.map(e => e.deltasIncertidumbre.cpmvh || 0);
  const mantResumen = calcularMetricaConIncertidumbre(mantValores, mantDeltas, '%');

  const idpValores = empresas.map(e => e.indicadores.idp);
  const idpDeltas = empresas.map(e => e.deltasIncertidumbre.idp || 0);
  const idpResumen = calcularMetricaConIncertidumbre(idpValores, idpDeltas, '%');

  const formValores = empresas.map(e => e.indicadores.cpfCobertura);
  const formDeltas = empresas.map(e => e.deltasIncertidumbre.cpfCobertura || 0);
  const formResumen = calcularMetricaConIncertidumbre(formValores, formDeltas, '%');

  // Conteo de Categorías de formulario
  const catA = empresas.filter(e => e.categoriaFormulario === 'A').length;
  const catB = empresas.filter(e => e.categoriaFormulario === 'B').length;
  const catC = empresas.filter(e => e.categoriaFormulario === 'C').length;

  // Discrepancias
  const discrepantes = empresas.filter(e => !e.esClasificacionCorrecta);
  const pctDiscrepancia = (discrepantes.length / total) * 100;

  // Alertas críticas
  const alertasCriticas = empresas.flatMap(e => e.alertas).filter(a => a.severidad === 'CRÍTICA');

  // Matriz de lo que reportaron vs lo calculado
  const niveles: NivelPESV[] = ['BÁSICO', 'ESTÁNDAR', 'AVANZADO'];
  const matrizComparativa: Record<string, { reportado: number; calculado: number }> = {
    BÁSICO: {
      reportado: empresas.filter(e => e.clasificacionReportada === 'BÁSICO').length,
      calculado: empresas.filter(e => e.clasificacionCalculada === 'BÁSICO').length,
    },
    ESTÁNDAR: {
      reportado: empresas.filter(e => e.clasificacionReportada === 'ESTÁNDAR').length,
      calculado: empresas.filter(e => e.clasificacionCalculada === 'ESTÁNDAR').length,
    },
    AVANZADO: {
      reportado: empresas.filter(e => e.clasificacionReportada === 'AVANZADO').length,
      calculado: empresas.filter(e => e.clasificacionCalculada === 'AVANZADO').length,
    },
  };

  // Sectores económicos
  const sectoresConteo = empresas.reduce((acc, curr) => {
    acc[curr.sectorEconomico] = (acc[curr.sectorEconomico] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const sectoresOrdenados = Object.entries(sectoresConteo).sort((a, b) => b[1] - a[1]);

  return (
    <div className="space-y-6">
      {/* Banner de alerta de Discrepancias si existen */}
      {discrepantes.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-amber-100 rounded-lg text-amber-800 shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-amber-900">
                Se detectaron {discrepantes.length} empresas con discrepancia en su clasificación PESV
              </h2>
              <p className="text-xs text-amber-700 mt-0.5 leading-relaxed">
                Empresas autodeclararon un nivel inferior o no acorde a la flota vehicular y censo de conductores regulado por la Resolución. Requieren asistencia técnica de la ANSV.
              </p>
            </div>
          </div>
          <button
            onClick={() => onIrATab('clasificacion')}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-amber-900 bg-amber-200 hover:bg-amber-300 rounded-lg transition-colors whitespace-nowrap cursor-pointer shrink-0"
          >
            <span>Ver Matriz de Auditoría</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Grid de Métricas Principales con Incertidumbre */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: TSV */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span className="font-semibold text-slate-700">Tasa Siniestros Viales</span>
            <span className="font-mono text-[11px] text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded">TSV</span>
          </div>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-2xl font-bold font-mono tabular-nums text-slate-900">
              {tsvResumen.media.toFixed(2)}
            </span>
            <span className="text-xs font-mono tabular-nums text-slate-500 font-medium">
              ± {tsvResumen.deltaX.toFixed(2)}
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            Siniestros por 1M km de flota recorrida
          </p>
          <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-600 font-mono">
            <span>Mín: {tsvResumen.min.toFixed(2)}</span>
            <span>Máx: {tsvResumen.max.toFixed(2)}</span>
          </div>
        </div>

        {/* KPI 2: Cumplimiento de Metas */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span className="font-semibold text-slate-700">Cumplimiento de Metas</span>
            <span className="font-mono text-[11px] text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">CM PESV</span>
          </div>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-2xl font-bold font-mono tabular-nums text-slate-900">
              {metasResumen.media.toFixed(1)}%
            </span>
            <span className="text-xs font-mono tabular-nums text-slate-500 font-medium">
              ± {metasResumen.deltaX.toFixed(1)}%
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            Metas alcanzadas vs programadas
          </p>
          <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-600 font-mono">
            <span>Mín: {metasResumen.min.toFixed(0)}%</span>
            <span>Máx: {metasResumen.max.toFixed(0)}%</span>
          </div>
        </div>

        {/* KPI 3: Inspección Preoperacional */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span className="font-semibold text-slate-700">Inspección Diaria IDP</span>
            <span className="font-mono text-[11px] text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded">IDP</span>
          </div>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-2xl font-bold font-mono tabular-nums text-slate-900">
              {idpResumen.media.toFixed(1)}%
            </span>
            <span className="text-xs font-mono tabular-nums text-slate-500 font-medium">
              ± {idpResumen.deltaX.toFixed(1)}%
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            Vehículos inspeccionados antes de operar
          </p>
          <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-600 font-mono">
            <span>Mín: {idpResumen.min.toFixed(0)}%</span>
            <span>Máx: {idpResumen.max.toFixed(0)}%</span>
          </div>
        </div>

        {/* KPI 4: Mantenimiento Preventivo */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span className="font-semibold text-slate-700">Mantenimiento Vehicular</span>
            <span className="font-mono text-[11px] text-teal-600 bg-teal-50 px-1.5 py-0.5 rounded">CPMVh</span>
          </div>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-2xl font-bold font-mono tabular-nums text-slate-900">
              {mantResumen.media.toFixed(1)}%
            </span>
            <span className="text-xs font-mono tabular-nums text-slate-500 font-medium">
              ± {mantResumen.deltaX.toFixed(1)}%
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            Ejecución del plan preventivo de flota
          </p>
          <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-600 font-mono">
            <span>Mín: {mantResumen.min.toFixed(0)}%</span>
            <span>Máx: {mantResumen.max.toFixed(0)}%</span>
          </div>
        </div>
      </div>

      {/* Bloque de dos columnas: Comparativa Reportado vs Calculado & Cobertura de Formulario */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Tarjeta 1: Comparativa Anual de Clasificación PESV (La matriz que solicitó el usuario) */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-bold text-slate-900">
                Comparativa de Clasificación PESV
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Lo que reportó la empresa vs Lo que exige la norma técnica
              </p>
            </div>
            <span className="text-xs font-mono text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md font-semibold">
              {pctDiscrepancia.toFixed(1)}% Discrepancia
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-slate-600">
                  <th className="py-2.5 px-3 font-semibold">Nivel PESV</th>
                  <th className="py-2.5 px-3 font-semibold text-right">Reportado Empresa</th>
                  <th className="py-2.5 px-3 font-semibold text-right">Calculado por Norma</th>
                  <th className="py-2.5 px-3 font-semibold text-right">Diferencia</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono">
                {niveles.map(nivel => {
                  const rep = matrizComparativa[nivel].reportado;
                  const calc = matrizComparativa[nivel].calculado;
                  const dif = calc - rep;

                  return (
                    <tr key={nivel} className="hover:bg-slate-50 transition-colors">
                      <td className="py-2.5 px-3 font-medium text-slate-800 font-sans">
                        {nivel}
                      </td>
                      <td className="py-2.5 px-3 text-right text-slate-700">
                        {rep}
                      </td>
                      <td className="py-2.5 px-3 text-right font-bold text-blue-700">
                        {calc}
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        {dif > 0 ? (
                          <span className="text-red-600 font-bold">+{dif} subdeclaradas</span>
                        ) : dif < 0 ? (
                          <span className="text-amber-600 font-medium">{dif} sobredeclaradas</span>
                        ) : (
                          <span className="text-emerald-600 font-medium">Coincide</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-red-500"></span>
              Alarma de capacitación a empresas
            </span>
            <button
              onClick={() => onIrATab('clasificacion')}
              className="text-blue-600 hover:text-blue-800 font-semibold cursor-pointer"
            >
              Auditar empresas →
            </button>
          </div>
        </div>

        {/* Tarjeta 2: Resumen de Cobertura de Formularios (Categorías A, B y C) */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-bold text-slate-900">
                Resumen de Cobertura de Formularios
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Censo de recepción de Partes 1, 2 y 3 del formulario de autogestión
              </p>
            </div>
            <span className="text-xs font-mono text-slate-500">
              Total: {total} empresas
            </span>
          </div>

          <div className="space-y-3.5">
            {/* Categoría A */}
            <div className="p-3 rounded-lg bg-emerald-50/70 border border-emerald-100">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-emerald-900 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  Categoría A · Formulario Completo (3 de 3 partes)
                </span>
                <span className="font-bold font-mono text-emerald-800">{catA} empresas ({((catA / total) * 100).toFixed(1)}%)</span>
              </div>
              <p className="text-[11px] text-emerald-700 mt-1">
                Llenaron Parte 1, Parte 2 y Parte 3. Aptas para cálculo riguroso de indicadores e investigación.
              </p>
            </div>

            {/* Categoría B */}
            <div className="p-3 rounded-lg bg-amber-50/70 border border-amber-100">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-amber-900 flex items-center gap-1.5">
                  <HelpCircle className="w-3.5 h-3.5 text-amber-600" />
                  Categoría B · Formulario Parcial (2 de 3 partes)
                </span>
                <span className="font-bold font-mono text-amber-800">{catB} empresas ({((catB / total) * 100).toFixed(1)}%)</span>
              </div>
              <p className="text-[11px] text-amber-700 mt-1">
                Completaron 2 partes. Requieren notificación para completar información faltante.
              </p>
            </div>

            {/* Categoría C */}
            <div className="p-3 rounded-lg bg-red-50/70 border border-red-100">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-red-900 flex items-center gap-1.5">
                  <XCircle className="w-3.5 h-3.5 text-red-600" />
                  Categoría C · Formulario Inicial (1 de 3 partes)
                </span>
                <span className="font-bold font-mono text-red-800">{catC} empresas ({((catC / total) * 100).toFixed(1)}%)</span>
              </div>
              <p className="text-[11px] text-red-700 mt-1">
                Solo completaron 1 parte. Alerta por omisión de diagnóstico o datos de flota.
              </p>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Solo Categoría A se usa en análisis estadístico base</span>
            <button
              onClick={() => onIrATab('etl')}
              className="text-blue-600 hover:text-blue-800 font-semibold cursor-pointer"
            >
              Ver Pipeline ETL →
            </button>
          </div>
        </div>
      </div>

      {/* Sectores Económicos (CIIU) */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-sm font-bold text-slate-900">
              Distribución de Empresas por Sector Económico (Código CIIU)
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Participación de organizaciones vigiladas por sector productivo
            </p>
          </div>
          <span className="text-xs font-mono text-slate-500">
            {sectoresOrdenados.length} sectores
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {sectoresOrdenados.map(([sector, count]) => {
            const pct = (count / total) * 100;
            return (
              <div
                key={sector}
                className="p-3 rounded-lg border border-slate-100 bg-slate-50/60 hover:bg-slate-100/60 transition-colors"
              >
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-semibold text-slate-800 truncate" title={sector}>
                    {sector}
                  </span>
                  <span className="font-mono font-bold text-slate-900">{count}</span>
                </div>
                <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                  <div
                    className="bg-blue-600 h-full rounded-full transition-all"
                    style={{ width: `${pct}%` }}
                  ></div>
                </div>
                <div className="text-[10px] text-slate-500 text-right mt-1 font-mono">
                  {pct.toFixed(1)}% del censo
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Tabla Rápida de Empresas Auditadas */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-sm font-bold text-slate-900">
              Muestra de Organizaciones Auditadas
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Haz clic en cualquier empresa para ver su expediente técnico completo
            </p>
          </div>
          <button
            onClick={() => onIrATab('asistencia')}
            className="text-xs text-blue-600 hover:text-blue-800 font-semibold cursor-pointer"
          >
            Ver Asistencia Técnica ANSV →
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-slate-600">
                <th className="py-2.5 px-3 font-semibold">Empresa / Razón Social</th>
                <th className="py-2.5 px-3 font-semibold">NIT</th>
                <th className="py-2.5 px-3 font-semibold">Misionalidad</th>
                <th className="py-2.5 px-3 font-semibold">Nivel Reportado</th>
                <th className="py-2.5 px-3 font-semibold">Nivel Calculado</th>
                <th className="py-2.5 px-3 font-semibold text-center">Formulario</th>
                <th className="py-2.5 px-3 font-semibold text-right">TSV Total</th>
                <th className="py-2.5 px-3 font-semibold text-right">Infracciones</th>
                <th className="py-2.5 px-3 font-semibold text-center">Alertas ANSV</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {empresas.slice(0, 10).map(empresa => (
                <tr
                  key={empresa.id}
                  onClick={() => onSeleccionarEmpresa(empresa)}
                  className="hover:bg-blue-50/40 cursor-pointer transition-colors"
                >
                  <td className="py-2.5 px-3">
                    <div className="font-semibold text-slate-900 truncate max-w-[220px]">
                      {empresa.razonSocial}
                    </div>
                    <div className="text-[11px] text-slate-500">
                      {empresa.municipio}, {empresa.departamento}
                    </div>
                  </td>
                  <td className="py-2.5 px-3 font-mono text-slate-700">
                    {empresa.numeroDocumento}
                  </td>
                  <td className="py-2.5 px-3 text-slate-600">
                    {empresa.misionalidad === 'Misionalidad 1' ? 'M1 (Transp.)' : 'M2 (Otro)'}
                  </td>
                  <td className="py-2.5 px-3 font-medium text-slate-700">
                    {empresa.clasificacionReportada}
                  </td>
                  <td className="py-2.5 px-3">
                    <span
                      className={`font-semibold ${
                        empresa.esClasificacionCorrecta
                          ? 'text-slate-800'
                          : 'text-red-700 bg-red-50 px-1.5 py-0.5 rounded font-mono'
                      }`}
                    >
                      {empresa.clasificacionCalculada}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-center font-mono font-bold">
                    <span
                      className={`px-2 py-0.5 rounded text-[11px] ${
                        empresa.categoriaFormulario === 'A'
                          ? 'bg-emerald-100 text-emerald-800'
                          : empresa.categoriaFormulario === 'B'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      Cat {empresa.categoriaFormulario}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono tabular-nums text-slate-800">
                    {empresa.indicadores.tsvTotal.toFixed(2)}
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono tabular-nums text-slate-800">
                    {empresa.infracciones.totalInfracciones}
                  </td>
                  <td className="py-2.5 px-3 text-center">
                    {empresa.alertas.length > 0 ? (
                      <span className="font-mono text-xs px-2 py-0.5 rounded bg-amber-100 text-amber-800 font-bold">
                        {empresa.alertas.length} alertas
                      </span>
                    ) : (
                      <span className="text-slate-400 text-xs">Sin alertas</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
