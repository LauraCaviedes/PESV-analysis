import React, { useState } from 'react';
import {
  GitCompare,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  HelpCircle,
  ChevronRight,
  ShieldAlert,
  ArrowRight,
} from 'lucide-react';
import { EmpresaPESV, NivelPESV } from '../types/pesv';
import { obtenerPasosObligatoriosPorNivel } from '../utils/pesvCalculations';

interface ClassificationAuditViewProps {
  empresas: EmpresaPESV[];
  onSeleccionarEmpresa: (empresa: EmpresaPESV) => void;
  onGenerarAsistencia: (empresa: EmpresaPESV) => void;
}

export const ClassificationAuditView: React.FC<ClassificationAuditViewProps> = ({
  empresas,
  onSeleccionarEmpresa,
  onGenerarAsistencia,
}) => {
  const [filtroTipo, setFiltroTipo] = useState<'TODAS' | 'DISCREPANCIAS' | 'INCOMPLETAS'>('DISCREPANCIAS');

  const empresasDiscrepantes = empresas.filter(e => !e.esClasificacionCorrecta);
  const empresasIncompletas = empresas.filter(e => !e.cumpleEntregaNivel);

  // Lista según filtro
  const empresasFiltradas = empresas.filter(e => {
    if (filtroTipo === 'DISCREPANCIAS') return !e.esClasificacionCorrecta;
    if (filtroTipo === 'INCOMPLETAS') return !e.cumpleEntregaNivel;
    return true;
  });

  // Generar tabla cruzada de contingencia: Reportado (filas) vs Calculado (columnas)
  const niveles: NivelPESV[] = ['BÁSICO', 'ESTÁNDAR', 'AVANZADO', 'NO OBLIGADO'];
  const matrizCruzada: Record<string, Record<string, number>> = {};

  niveles.forEach(rep => {
    matrizCruzada[rep] = {};
    niveles.forEach(calc => {
      matrizCruzada[rep][calc] = 0;
    });
  });

  empresas.forEach(e => {
    const rep = e.clasificacionReportada || 'NO OBLIGADO';
    const calc = e.clasificacionCalculada || 'NO OBLIGADO';
    if (matrizCruzada[rep] && matrizCruzada[rep][calc] !== undefined) {
      matrizCruzada[rep][calc]++;
    }
  });

  return (
    <div className="space-y-6">
      {/* Header explicativo */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <GitCompare className="w-5 h-5 text-blue-600" />
              Auditoría de Clasificación PESV & Verificación de Entrega
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Compara lo que la organización autodeclaró contra lo que determina la Resolución en función de su misionalidad, tamaño de flota y censo de conductores.
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <span className="px-3 py-1.5 rounded-lg bg-red-50 text-red-700 font-mono font-bold border border-red-200">
              {empresasDiscrepantes.length} con discrepancia ({((empresasDiscrepantes.length / (empresas.length || 1)) * 100).toFixed(1)}%)
            </span>
            <span className="px-3 py-1.5 rounded-lg bg-amber-50 text-amber-700 font-mono font-bold border border-amber-200">
              {empresasIncompletas.length} entrega deficiente
            </span>
          </div>
        </div>

        {/* Criterios normativos de clasificación en acordeón visual */}
        <div className="mt-4 pt-4 border-t border-slate-100 grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
            <h4 className="font-bold text-slate-800 flex items-center gap-1.5">
              <span>Misionalidad 1: Transporte Terrestre Automotor</span>
            </h4>
            <ul className="mt-2 space-y-1 text-slate-600 font-mono text-[11px]">
              <li>· Básico (18 pasos): 11 a 19 vehículos Ó 2 a 19 conductores</li>
              <li>· Estándar (22 pasos): 20 a 50 vehículos Ó 20 a 50 conductores</li>
              <li>· Avanzado (24 pasos): Más de 50 vehículos Ó más de 50 conductores</li>
            </ul>
          </div>

          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
            <h4 className="font-bold text-slate-800 flex items-center gap-1.5">
              <span>Misionalidad 2: Actividades Diferentes al Transporte</span>
            </h4>
            <ul className="mt-2 space-y-1 text-slate-600 font-mono text-[11px]">
              <li>· Básico (18 pasos): 11 a 49 vehículos Ó 2 a 49 conductores</li>
              <li>· Estándar (22 pasos): 50 a 100 vehículos Ó 50 a 100 conductores</li>
              <li>· Avanzado (24 pasos): Más de 100 vehículos Ó más de 100 conductores</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Matriz Cruzada de Discrepancia: Reportado vs Calculado */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
        <h3 className="text-sm font-bold text-slate-900 mb-1">
          Matriz de Contingencia: Reportado vs Calculado por Norma
        </h3>
        <p className="text-xs text-slate-500 mb-4">
          La diagonal verde indica concordancia perfecta. Las celdas rojas representan subdeclaración (la empresa reportó un nivel menor al que le correspondía).
        </p>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-center border-collapse">
            <thead>
              <tr className="bg-slate-100 text-slate-700">
                <th className="py-2.5 px-3 text-left border border-slate-200 font-bold">
                  Nivel Reportado ↓ / Calculado por Norma →
                </th>
                <th className="py-2.5 px-3 border border-slate-200 font-semibold text-blue-800">
                  BÁSICO
                </th>
                <th className="py-2.5 px-3 border border-slate-200 font-semibold text-blue-800">
                  ESTÁNDAR
                </th>
                <th className="py-2.5 px-3 border border-slate-200 font-semibold text-blue-800">
                  AVANZADO
                </th>
                <th className="py-2.5 px-3 border border-slate-200 font-semibold text-slate-500">
                  NO OBLIGADO
                </th>
              </tr>
            </thead>
            <tbody className="font-mono">
              {['BÁSICO', 'ESTÁNDAR', 'AVANZADO'].map(rep => (
                <tr key={rep}>
                  <td className="py-2.5 px-3 text-left font-bold text-slate-800 bg-slate-50 border border-slate-200 font-sans">
                    {rep}
                  </td>
                  {['BÁSICO', 'ESTÁNDAR', 'AVANZADO', 'NO OBLIGADO'].map(calc => {
                    const conteo = matrizCruzada[rep]?.[calc] || 0;
                    const esDiagonal = rep === calc;
                    const esSubdeclarada =
                      (rep === 'BÁSICO' && (calc === 'ESTÁNDAR' || calc === 'AVANZADO')) ||
                      (rep === 'ESTÁNDAR' && calc === 'AVANZADO');

                    let bgClass = 'bg-white text-slate-700';
                    if (conteo > 0) {
                      if (esDiagonal) bgClass = 'bg-emerald-50 text-emerald-800 font-bold';
                      else if (esSubdeclarada) bgClass = 'bg-red-50 text-red-800 font-bold';
                      else bgClass = 'bg-amber-50 text-amber-800';
                    }

                    return (
                      <td
                        key={calc}
                        className={`py-2.5 px-3 border border-slate-200 tabular-nums ${bgClass}`}
                      >
                        {conteo}
                        {conteo > 0 && esSubdeclarada && (
                          <div className="text-[10px] text-red-600 font-sans mt-0.5">
                            Subdeclarada
                          </div>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Controles de Filtro de Auditoría */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setFiltroTipo('DISCREPANCIAS')}
          className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
            filtroTipo === 'DISCREPANCIAS'
              ? 'bg-red-600 text-white shadow-xs'
              : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          Solo Discrepancias ({empresasDiscrepantes.length})
        </button>
        <button
          onClick={() => setFiltroTipo('INCOMPLETAS')}
          className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
            filtroTipo === 'INCOMPLETAS'
              ? 'bg-amber-600 text-white shadow-xs'
              : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          Indicadores Incompletos por Nivel ({empresasIncompletas.length})
        </button>
        <button
          onClick={() => setFiltroTipo('TODAS')}
          className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
            filtroTipo === 'TODAS'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          Ver Todas ({empresas.length})
        </button>
      </div>

      {/* Lista Detallada de Empresas con Auditoría */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
        <div className="space-y-4">
          {empresasFiltradas.length === 0 ? (
            <div className="text-center py-8 text-slate-400 text-xs">
              No se encontraron empresas con el criterio seleccionado.
            </div>
          ) : (
            empresasFiltradas.map(empresa => {
              const obligatorios = obtenerPasosObligatoriosPorNivel(empresa.clasificacionCalculada);

              return (
                <div
                  key={empresa.id}
                  className="p-4 rounded-xl border border-slate-200 hover:border-blue-300 transition-colors bg-slate-50/50"
                >
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pb-3 border-b border-slate-200">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 text-sm">
                          {empresa.razonSocial}
                        </span>
                        <span className="text-xs font-mono text-slate-500">
                          (NIT: {empresa.numeroDocumento})
                        </span>
                        <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200">
                          Año {empresa.anoReporte}
                        </span>
                      </div>
                      <div className="text-xs text-slate-500 mt-0.5">
                        {empresa.misionalidad} · {empresa.sectorEconomico} · {empresa.municipio}, {empresa.departamento}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => onGenerarAsistencia(empresa)}
                        className="px-3 py-1.5 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg transition-colors cursor-pointer"
                      >
                        Plan Asistencia Técnica ANSV
                      </button>
                      <button
                        onClick={() => onSeleccionarEmpresa(empresa)}
                        className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors cursor-pointer"
                      >
                        Ver Ficha
                      </button>
                    </div>
                  </div>

                  {/* Comparación de Nivel */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 py-3 text-xs">
                    <div className="p-2.5 rounded bg-white border border-slate-200">
                      <span className="text-slate-500 block text-[11px]">Nivel Reportado:</span>
                      <span className="font-bold text-slate-800">{empresa.clasificacionReportada}</span>
                    </div>

                    <div className="p-2.5 rounded bg-white border border-slate-200">
                      <span className="text-slate-500 block text-[11px]">Nivel Calculado (Norma):</span>
                      <span className="font-bold text-blue-700">{empresa.clasificacionCalculada}</span>
                    </div>

                    <div className="p-2.5 rounded bg-white border border-slate-200">
                      <span className="text-slate-500 block text-[11px]">Flota / Conductores:</span>
                      <span className="font-mono font-semibold text-slate-800">
                        {empresa.flota.totalVehiculos} veh / {empresa.conductores.totalConductoresNorma} cond
                      </span>
                    </div>

                    <div className="p-2.5 rounded bg-white border border-slate-200">
                      <span className="text-slate-500 block text-[11px]">Entrega de Indicadores:</span>
                      <span
                        className={`font-semibold ${
                          empresa.cumpleEntregaNivel ? 'text-emerald-700' : 'text-red-700 font-bold'
                        }`}
                      >
                        {empresa.cumpleEntregaNivel ? 'Completa según nivel' : 'Faltan requerimientos'}
                      </span>
                    </div>
                  </div>

                  {/* Alerta de Discrepancia específica */}
                  {!empresa.esClasificacionCorrecta && (
                    <div className="p-2.5 rounded-lg bg-red-50 text-red-900 border border-red-200 text-xs flex items-start gap-2 mb-2">
                      <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold">Discrepancia detectada: </span>
                        <span>{empresa.discrepanciaClasificacion}</span>
                      </div>
                    </div>
                  )}

                  {/* Lista de Indicadores Faltantes para su nivel si existen */}
                  {!empresa.cumpleEntregaNivel && (
                    <div className="p-2.5 rounded-lg bg-amber-50 text-amber-900 border border-amber-200 text-xs mb-2">
                      <span className="font-bold block mb-1">
                        Indicadores obligatorios omitidos para el nivel {empresa.clasificacionCalculada}:
                      </span>
                      <ul className="list-disc pl-4 space-y-0.5 text-amber-800 text-[11px]">
                        {empresa.indicadoresFaltantesPorNivel.map((f, i) => (
                          <li key={i}>{f}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Pasos obligatorios según Resolución */}
                  <div className="pt-2 text-[11px] text-slate-500">
                    <span className="font-semibold text-slate-700">Pasos exigibles ({obligatorios.length} de 24): </span>
                    <span className="font-mono">
                      Pasos {obligatorios.join(', ')}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
