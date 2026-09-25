import React from 'react';
import { Search, Filter, RotateCcw, Calendar } from 'lucide-react';
import { NivelPESV, Misionalidad, CategoriaFormulario } from '../types/pesv';

export interface FiltrosState {
  busqueda: string;
  nivel: string; // 'TODOS' | NivelPESV
  misionalidad: string; // 'TODAS' | Misionalidad
  sector: string; // 'TODOS' | string
  categoria: string; // 'TODAS' | CategoriaFormulario
  ano: string; // 'TODOS' | number
  soloDiscrepancias: boolean;
}

interface FilterBarProps {
  filtros: FiltrosState;
  onFiltrosChange: (nuevosFiltros: FiltrosState) => void;
  sectoresDisponibles: string[];
  anosDisponibles: number[];
  totalResultados: number;
  conteosPorAno?: Record<number, number>;
  totalBase?: number;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  filtros,
  onFiltrosChange,
  sectoresDisponibles,
  anosDisponibles,
  totalResultados,
  conteosPorAno = {},
  totalBase = 0,
}) => {
  const resetearFiltros = () => {
    onFiltrosChange({
      busqueda: '',
      nivel: 'TODOS',
      misionalidad: 'TODAS',
      sector: 'TODOS',
      categoria: 'TODAS',
      ano: 'TODOS',
      soloDiscrepancias: false,
    });
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-3.5 mb-6 shadow-xs space-y-3">
      {/* Barra superior con resumen, selector rápido de AÑOS y opciones */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-800">
            <Filter className="w-3.5 h-3.5 text-blue-600" />
            <span>Filtros de Segmentación</span>
            <span className="text-slate-400 font-normal">
              ({totalResultados} registros visibles)
            </span>
          </div>

          {/* Selector de Años de Autogestión (Pestañas Rápidas con conteo) */}
          <div className="flex items-center gap-1.5 pl-2 border-l border-slate-200">
            <span className="text-xs font-bold text-slate-700 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-indigo-600" />
              Año de Autogestión:
            </span>
            <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg">
              <button
                type="button"
                onClick={() => onFiltrosChange({ ...filtros, ano: 'TODOS' })}
                className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
                  filtros.ano === 'TODOS'
                    ? 'bg-white text-indigo-700 shadow-2xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="Mostrar reportes de todos los años de autogestión"
              >
                Todos los años {totalBase > 0 ? `(${totalBase})` : ''}
              </button>
              {anosDisponibles.map(a => {
                const count = conteosPorAno[a];
                return (
                  <button
                    key={a}
                    type="button"
                    onClick={() => onFiltrosChange({ ...filtros, ano: a.toString() })}
                    className={`px-2.5 py-1 text-xs font-mono font-bold rounded-md transition-colors cursor-pointer flex items-center gap-1 ${
                      filtros.ano === a.toString()
                        ? 'bg-indigo-600 text-white shadow-2xs'
                        : 'text-slate-600 hover:text-indigo-700 hover:bg-slate-200/60'
                    }`}
                    title={`Filtrar únicamente reportes declarados en el año ${a}`}
                  >
                    <span>Año {a}</span>
                    {count !== undefined && (
                      <span
                        className={`text-[10px] px-1 py-0.2 rounded font-sans font-normal ${
                          filtros.ano === a.toString()
                            ? 'bg-indigo-700 text-indigo-100'
                            : 'bg-slate-200 text-slate-700'
                        }`}
                      >
                        {count}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <label className="flex items-center gap-1.5 text-xs text-slate-600 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={filtros.soloDiscrepancias}
              onChange={e =>
                onFiltrosChange({ ...filtros, soloDiscrepancias: e.target.checked })
              }
              className="rounded border-slate-300 text-red-600 focus:ring-red-500 cursor-pointer"
            />
            <span className="text-red-700 font-medium">Solo con discrepancia de nivel</span>
          </label>

          {(filtros.busqueda ||
            filtros.nivel !== 'TODOS' ||
            filtros.misionalidad !== 'TODAS' ||
            filtros.sector !== 'TODOS' ||
            filtros.categoria !== 'TODAS' ||
            filtros.ano !== 'TODOS' ||
            filtros.soloDiscrepancias) && (
            <button
              onClick={resetearFiltros}
              className="flex items-center gap-1 text-xs text-slate-500 hover:text-slate-800 transition-colors cursor-pointer ml-2"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Restablecer</span>
            </button>
          )}
        </div>
      </div>

      {/* Grid de Filtros */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2.5">
        {/* Search */}
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
          <input
            type="text"
            placeholder="Buscar NIT o Razón Social..."
            value={filtros.busqueda}
            onChange={e => onFiltrosChange({ ...filtros, busqueda: e.target.value })}
            className="w-full pl-8 pr-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 text-slate-800 placeholder-slate-400"
          />
        </div>

        {/* Nivel PESV */}
        <div>
          <select
            value={filtros.nivel}
            onChange={e => onFiltrosChange({ ...filtros, nivel: e.target.value })}
            className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 text-slate-800 cursor-pointer"
          >
            <option value="TODOS">Todos los Niveles</option>
            <option value="BÁSICO">Nivel Básico</option>
            <option value="ESTÁNDAR">Nivel Estándar</option>
            <option value="AVANZADO">Nivel Avanzado</option>
            <option value="NO OBLIGADO">No Obligado</option>
          </select>
        </div>

        {/* Misionalidad */}
        <div>
          <select
            value={filtros.misionalidad}
            onChange={e => onFiltrosChange({ ...filtros, misionalidad: e.target.value })}
            className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 text-slate-800 cursor-pointer"
          >
            <option value="TODAS">Todas las Misionalidades</option>
            <option value="Misionalidad 1">Misionalidad 1 (Transporte)</option>
            <option value="Misionalidad 2">Misionalidad 2 (No Transporte)</option>
          </select>
        </div>

        {/* Sector Económico */}
        <div>
          <select
            value={filtros.sector}
            onChange={e => onFiltrosChange({ ...filtros, sector: e.target.value })}
            className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 text-slate-800 cursor-pointer truncate"
          >
            <option value="TODOS">Todos los Sectores</option>
            {sectoresDisponibles.map(sec => (
              <option key={sec} value={sec}>
                {sec}
              </option>
            ))}
          </select>
        </div>

        {/* Categoría Formulario (A, B, C) */}
        <div>
          <select
            value={filtros.categoria}
            onChange={e => onFiltrosChange({ ...filtros, categoria: e.target.value })}
            className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 text-slate-800 cursor-pointer"
          >
            <option value="TODAS">Todas las Categorías</option>
            <option value="A">Cat A: Completo (3/3 partes)</option>
            <option value="B">Cat B: Incompleto (2/3 partes)</option>
            <option value="C">Cat C: Incompleto (1/3 parte)</option>
          </select>
        </div>

        {/* Año Reporte */}
        <div>
          <select
            value={filtros.ano}
            onChange={e => onFiltrosChange({ ...filtros, ano: e.target.value })}
            className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 text-slate-800 cursor-pointer font-bold text-indigo-900"
          >
            <option value="TODOS">Vigencia: Todos los Años</option>
            {anosDisponibles.map(a => (
              <option key={a} value={a.toString()}>
                Vigencia Año {a}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Indicador contextual de Año de Autogestión activo */}
      {filtros.ano !== 'TODOS' && (
        <div className="flex items-center justify-between bg-indigo-50/70 border border-indigo-200/80 rounded-lg px-3 py-1.5 text-xs text-indigo-900">
          <div className="flex items-center gap-2">
            <span className="font-bold font-mono px-1.5 py-0.5 rounded bg-indigo-200/70 text-indigo-950 text-[11px]">
              Vigencia Activa: {filtros.ano}
            </span>
            <span>
              Mostrando exclusivamente los datos declarados en el formulario de autogestión {filtros.ano}. Una misma empresa puede tener reportes en otros años con valores diferentes de flota, conductores e indicadores.
            </span>
          </div>
          <button
            onClick={() => onFiltrosChange({ ...filtros, ano: 'TODOS' })}
            className="text-[11px] font-semibold text-indigo-700 hover:text-indigo-950 underline cursor-pointer shrink-0 ml-2"
          >
            Ver todos los años
          </button>
        </div>
      )}
    </div>
  );
};
