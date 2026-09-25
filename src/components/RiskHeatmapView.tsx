import React, { useState, useMemo } from 'react';
import {
  Flame,
  ShieldAlert,
  Filter,
  Building2,
  AlertTriangle,
  CheckCircle2,
  Info,
  ChevronRight,
  TrendingUp,
  FileCheck2,
} from 'lucide-react';
import { EmpresaPESV, NivelExposicion, NivelProbabilidad, CriticidadRiesgo, ItemRiesgoPaso6 } from '../types/pesv';
import {
  NIVELES_EXPOSICION,
  NIVELES_PROBABILIDAD,
  generarMatrizCalorRiesgos,
  obtenerColorCriticidad,
} from '../utils/riskHeatmapCalculations';

interface RiskHeatmapViewProps {
  empresas: EmpresaPESV[];
  onSeleccionarEmpresa: (empresa: EmpresaPESV) => void;
}

export const RiskHeatmapView: React.FC<RiskHeatmapViewProps> = ({
  empresas,
  onSeleccionarEmpresa,
}) => {
  const [empresaFiltroId, setEmpresaFiltroId] = useState<string>('TODAS');
  const [categoriaFiltro, setCategoriaFiltro] = useState<string>('TODAS');
  const [celdaSeleccionada, setCeldaSeleccionada] = useState<{
    exposicion: NivelExposicion;
    probabilidad: NivelProbabilidad;
  } | null>(null);

  // Filtrar empresas
  const empresasEvaluadas = useMemo(() => {
    if (empresaFiltroId === 'TODAS') return empresas;
    return empresas.filter(e => e.id === empresaFiltroId);
  }, [empresas, empresaFiltroId]);

  // Generar datos de matriz de calor 3x3
  const matrizCalor = useMemo(() => {
    return generarMatrizCalorRiesgos(empresasEvaluadas);
  }, [empresasEvaluadas]);

  // Filtrar riesgos según la celda seleccionada y categoría
  const riesgosDetallados = useMemo(() => {
    let items = matrizCalor.celdas.flatMap(c => {
      if (
        celdaSeleccionada &&
        (c.exposicion !== celdaSeleccionada.exposicion ||
          c.probabilidad !== celdaSeleccionada.probabilidad)
      ) {
        return [];
      }
      return c.itemsRiesgo;
    });

    if (categoriaFiltro !== 'TODAS') {
      items = items.filter(i => i.riesgo.categoria === categoriaFiltro);
    }

    return items;
  }, [matrizCalor, celdaSeleccionada, categoriaFiltro]);

  return (
    <div className="space-y-6">
      {/* Encabezado Normativo */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-red-100 text-red-800 border border-red-200">
                Paso 6 · Res. 40595/2022
              </span>
              <span className="text-xs text-slate-500 font-semibold">
                Metodología Oficial de Evaluación y Control del Riesgo Vial
              </span>
            </div>
            <h2 className="text-base font-bold text-slate-900 mt-1 flex items-center gap-2">
              <Flame className="w-5 h-5 text-red-600" />
              Mapa de Calor (Heatmap) de Criticidad del Riesgo Vial
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Cruce dinámico del Nivel de Exposición (Frecuente, Ocasional, Esporádica) y Nivel de Probabilidad (Muy Probable, Poco Probable, No es Probable) para jerarquizar medidas preventivas y correctivas.
            </p>
          </div>

          {/* Filtros de Empresa y Categoría */}
          <div className="flex flex-wrap items-center gap-2.5">
            <div>
              <label className="text-[11px] text-slate-500 font-semibold block mb-0.5">
                Ámbito de Análisis:
              </label>
              <select
                value={empresaFiltroId}
                onChange={e => {
                  setEmpresaFiltroId(e.target.value);
                  setCeldaSeleccionada(null);
                }}
                className="text-xs font-medium bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-red-500 text-slate-800 cursor-pointer max-w-[220px] truncate"
              >
                <option value="TODAS">Consolidado Nacional ({empresas.length} empresas)</option>
                {empresas.map(emp => (
                  <option key={emp.id} value={emp.id}>
                    {emp.razonSocial} (Año {emp.anoReporte})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[11px] text-slate-500 font-semibold block mb-0.5">
                Factor de Riesgo:
              </label>
              <select
                value={categoriaFiltro}
                onChange={e => setCategoriaFiltro(e.target.value)}
                className="text-xs font-medium bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-red-500 text-slate-800 cursor-pointer"
              >
                <option value="TODAS">Todos los Factores</option>
                <option value="Velocidad">Velocidad</option>
                <option value="Fatiga">Fatiga y Jornadas</option>
                <option value="Vehicular">Vehicular / Mantenimiento</option>
                <option value="Vulnerables">Actores Vulnerables</option>
                <option value="Infraestructura/Entorno">Clima / Entorno</option>
                <option value="Comportamiento">Distracciones / Celular</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Resumen de Métricas de Criticidad */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        {(['Crítico', 'Alto', 'Medio', 'Bajo'] as CriticidadRiesgo[]).map(crit => {
          const count = matrizCalor.conteoPorCriticidad[crit] || 0;
          const pct = matrizCalor.totalRiesgos > 0 ? Math.round((count / matrizCalor.totalRiesgos) * 100) : 0;
          const color = obtenerColorCriticidad(crit);

          return (
            <div
              key={crit}
              className={`p-3.5 rounded-xl border ${color.border} ${color.bg} shadow-2xs flex flex-col justify-between`}
            >
              <div className="flex items-center justify-between">
                <span className={`text-xs font-bold ${color.text} uppercase tracking-wider`}>
                  Nivel {crit}
                </span>
                <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded font-bold ${color.badge}`}>
                  {pct}%
                </span>
              </div>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-2xl font-black font-mono text-slate-900">{count}</span>
                <span className="text-xs text-slate-500">evaluaciones</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Matriz 3x3 del Mapa de Calor */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 mb-4 border-b border-slate-100">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-red-600" />
              Matriz 3x3: Nivel de Exposición vs. Nivel de Probabilidad
            </h3>
            <p className="text-xs text-slate-500">
              Haz clic en cualquier cuadrante para filtrar los factores de riesgo y controles recomendados.
            </p>
          </div>
          {celdaSeleccionada && (
            <button
              onClick={() => setCeldaSeleccionada(null)}
              className="text-xs font-semibold text-blue-600 hover:text-blue-800 underline cursor-pointer"
            >
              Limpiar selección de celda
            </button>
          )}
        </div>

        <div className="overflow-x-auto">
          <div className="min-w-[620px]">
            {/* Header de Probabilidad (Eje X) */}
            <div className="grid grid-cols-12 gap-2 text-center text-xs font-bold text-slate-700 mb-2">
              <div className="col-span-3 flex items-center justify-center text-slate-400 font-mono text-[11px]">
                Exposición ↓ / Probabilidad →
              </div>
              {NIVELES_PROBABILIDAD.map(prob => (
                <div key={prob} className="col-span-3 py-1.5 bg-slate-100 rounded-lg text-slate-800 border border-slate-200">
                  {prob}
                </div>
              ))}
            </div>

            {/* Filas de Exposición (Eje Y) */}
            <div className="space-y-2">
              {NIVELES_EXPOSICION.map(exp => (
                <div key={exp} className="grid grid-cols-12 gap-2">
                  {/* Etiqueta de Fila */}
                  <div className="col-span-3 bg-slate-100 rounded-xl p-3 flex flex-col justify-center border border-slate-200">
                    <span className="text-xs font-bold text-slate-900">{exp}</span>
                    <span className="text-[10px] text-slate-500">
                      {exp === 'Frecuente'
                        ? 'Operación continua/diaria'
                        : exp === 'Ocasional'
                        ? 'Semanal o por turnos'
                        : 'Eventual o remota'}
                    </span>
                  </div>

                  {/* Celdas de la fila */}
                  {NIVELES_PROBABILIDAD.map(prob => {
                    const celda = matrizCalor.celdas.find(
                      c => c.exposicion === exp && c.probabilidad === prob
                    );
                    const isSelected =
                      celdaSeleccionada?.exposicion === exp &&
                      celdaSeleccionada?.probabilidad === prob;
                    const color = obtenerColorCriticidad(celda?.criticidad || 'Bajo');

                    return (
                      <div
                        key={`${exp}__${prob}`}
                        onClick={() =>
                          setCeldaSeleccionada(isSelected ? null : { exposicion: exp, probabilidad: prob })
                        }
                        className={`col-span-3 p-3.5 rounded-xl border-2 transition-all cursor-pointer flex flex-col justify-between min-h-[90px] ${
                          color.bg
                        } ${isSelected ? `${color.border} ring-3 ring-red-400/40 shadow-md` : 'border-transparent hover:border-slate-300'}`}
                      >
                        <div className="flex items-center justify-between">
                          <span className={`text-[11px] font-extrabold uppercase ${color.text}`}>
                            {celda?.criticidad}
                          </span>
                          <span className="text-[10px] text-slate-500 font-mono">
                            {celda?.porcentaje}%
                          </span>
                        </div>

                        <div className="mt-2 flex items-baseline justify-between">
                          <span className="text-2xl font-black font-mono text-slate-900">
                            {celda?.totalRiesgos}
                          </span>
                          <span className="text-[10px] text-slate-600 font-medium">
                            {celda?.totalRiesgos === 1 ? 'factor' : 'factores'}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Detalle de Riesgos y Controles Sugeridos */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <FileCheck2 className="w-4 h-4 text-blue-600" />
              Inventario de Riesgos Evaluados y Plan de Controles Operacionales (Paso 6 y 8)
            </h3>
            <span className="text-xs text-slate-500">
              {riesgosDetallados.length} evaluaciones correspondientes al filtro activo
              {celdaSeleccionada ? ` (${celdaSeleccionada.exposicion} · ${celdaSeleccionada.probabilidad})` : ''}
            </span>
          </div>
        </div>

        {riesgosDetallados.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-400">
            No se encontraron riesgos para el cuadrante o categoría seleccionada.
          </div>
        ) : (
          <div className="space-y-3">
            {riesgosDetallados.map((item, idx) => {
              const color = obtenerColorCriticidad(item.riesgo.criticidad);

              return (
                <div
                  key={`${item.empresaId}-${item.riesgo.id}-${idx}`}
                  className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-white hover:border-blue-300 transition-colors space-y-2"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded font-mono ${color.badge}`}>
                        {item.riesgo.criticidad}
                      </span>
                      <span className="text-xs font-bold text-slate-900">
                        {item.riesgo.factorRiesgo}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-xs">
                      <button
                        onClick={() => {
                          const emp = empresas.find(e => e.id === item.empresaId);
                          if (emp) onSeleccionarEmpresa(emp);
                        }}
                        className="font-mono text-[11px] text-blue-600 hover:text-blue-800 hover:underline cursor-pointer flex items-center gap-1"
                        title="Ver ficha de empresa"
                      >
                        <Building2 className="w-3 h-3" />
                        <span>{item.empresaNombre}</span>
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-12 gap-2 text-xs pt-1 border-t border-slate-100">
                    <div className="md:col-span-4 flex items-center gap-2 text-slate-600 font-mono text-[11px]">
                      <span>Exposición: <strong>{item.riesgo.exposicion}</strong></span>
                      <span>·</span>
                      <span>Probabilidad: <strong>{item.riesgo.probabilidad}</strong></span>
                    </div>

                    <div className="md:col-span-8 text-slate-700">
                      <span className="font-semibold text-slate-900">Control sugerido: </span>
                      <span>{item.riesgo.controlesRecomendados}</span>
                      <span className="text-slate-400 font-mono text-[11px] ml-1.5">
                        (Resp: {item.riesgo.responsableSugerido})
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
