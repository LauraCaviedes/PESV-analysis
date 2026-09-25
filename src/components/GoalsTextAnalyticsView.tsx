import React, { useState, useMemo } from 'react';
import {
  FileText,
  Search,
  Sparkles,
  Target,
  BarChart3,
  Building2,
  CheckCircle2,
  AlertCircle,
  Hash,
  Filter,
} from 'lucide-react';
import { EmpresaPESV, CategoriaMetaPESV } from '../types/pesv';
import {
  REGLAS_METAS_NORMATIVAS,
  clasificarMetasTexto,
  obtenerResumenMetasPoblacional,
} from '../utils/textAnalytics';

interface GoalsTextAnalyticsViewProps {
  empresas: EmpresaPESV[];
  onSeleccionarEmpresa: (empresa: EmpresaPESV) => void;
}

export const GoalsTextAnalyticsView: React.FC<GoalsTextAnalyticsViewProps> = ({
  empresas,
  onSeleccionarEmpresa,
}) => {
  const [busquedaTexto, setBusquedaTexto] = useState<string>('');
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState<string>('TODAS');

  // Resumen global con Text Analytics
  const resumenMetas = useMemo(() => {
    return obtenerResumenMetasPoblacional(empresas);
  }, [empresas]);

  // Lista de empresas procesadas con sus metas analizadas
  const empresasConAnalisis = useMemo(() => {
    return empresas.map(emp => {
      const metas = emp.metasCategorizadas && emp.metasCategorizadas.length > 0
        ? emp.metasCategorizadas
        : clasificarMetasTexto(emp.descripcionMetas);

      return {
        empresa: emp,
        texto: emp.descripcionMetas || 'Sin descripción registrada en el formulario',
        metas,
        tieneMetas: metas.length > 0,
      };
    });
  }, [empresas]);

  // Filtro de lista
  const listaFiltrada = useMemo(() => {
    return empresasConAnalisis.filter(item => {
      // 1. Filtro por categoría
      if (categoriaSeleccionada !== 'TODAS') {
        const tieneCat = item.metas.some(m => m.categoria === categoriaSeleccionada);
        if (!tieneCat) return false;
      }

      // 2. Filtro por texto / NIT
      if (busquedaTexto.trim()) {
        const q = busquedaTexto.toLowerCase().trim();
        const matchNom = item.empresa.razonSocial.toLowerCase().includes(q);
        const matchNit = item.empresa.numeroDocumento.includes(q);
        const matchTexto = item.texto.toLowerCase().includes(q);
        if (!matchNom && !matchNit && !matchTexto) return false;
      }

      return true;
    });
  }, [empresasConAnalisis, categoriaSeleccionada, busquedaTexto]);

  const maxFrecuencia = Math.max(...resumenMetas.distribucionCategorias.map(d => d.conteo), 1);

  return (
    <div className="space-y-6">
      {/* Header Informativo */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-indigo-100 text-indigo-800 border border-indigo-200 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-indigo-600" />
                Text Analytics · NLP Normativo
              </span>
              <span className="text-xs text-slate-500 font-semibold">
                Paso 7 (Objetivos y Metas del PESV) · Res. 40595 de 2022
              </span>
            </div>
            <h2 className="text-base font-bold text-slate-900 mt-1 flex items-center gap-2">
              <Target className="w-5 h-5 text-indigo-600" />
              Clasificación Inteligente de Metas del PESV
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Procesamiento de lenguaje natural sobre el campo <em>"Descripción de las metas del PESV del año finalizado"</em> mediante búsqueda de palabras clave y patrones normativos.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right">
              <span className="text-xs text-slate-500 block">Cobertura de Metas Declaradas:</span>
              <span className="text-sm font-bold font-mono text-indigo-900">
                {resumenMetas.totalEmpresasConMetas} de {empresas.length} empresas ({Math.round((resumenMetas.totalEmpresasConMetas / (empresas.length || 1)) * 100)}%)
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Gráfico Resumen de Frecuencia de Metas */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-indigo-600" />
              Distribución Poblacional por Tipo de Meta Declarada
            </h3>
            <p className="text-xs text-slate-500">
              Frecuencia de categorías normativas identificadas automáticamente en los textos oficiales.
            </p>
          </div>
          {categoriaSeleccionada !== 'TODAS' && (
            <button
              onClick={() => setCategoriaSeleccionada('TODAS')}
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 underline cursor-pointer"
            >
              Ver todas las categorías
            </button>
          )}
        </div>

        {/* Barras de distribución horizontal */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {resumenMetas.distribucionCategorias.map(item => {
            const isSelected = categoriaSeleccionada === item.categoria;
            const porcentajeBarra = Math.round((item.conteo / maxFrecuencia) * 100);

            return (
              <div
                key={item.categoria}
                onClick={() =>
                  setCategoriaSeleccionada(isSelected ? 'TODAS' : item.categoria)
                }
                className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                  isSelected
                    ? 'border-indigo-500 bg-indigo-50/60 ring-2 ring-indigo-400/30'
                    : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50/60'
                }`}
              >
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="font-bold text-slate-900 flex items-center gap-1.5">
                    <span
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: item.color }}
                    />
                    {item.nombre}
                  </span>
                  <div className="flex items-center gap-1.5 font-mono text-[11px]">
                    <span className="font-extrabold text-slate-900">{item.conteo}</span>
                    <span className="text-slate-400">({item.porcentaje}%)</span>
                  </div>
                </div>

                {/* Barra de progreso */}
                <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden mb-2">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${porcentajeBarra}%`,
                      backgroundColor: item.color,
                    }}
                  />
                </div>

                {/* Palabras clave más frecuentes */}
                <div className="flex flex-wrap items-center gap-1">
                  <span className="text-[10px] text-slate-400 font-medium">Keywords:</span>
                  {item.palabrasMasFrecuentes.map(kw => (
                    <span
                      key={kw.palabra}
                      className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 border border-slate-200"
                    >
                      {kw.palabra} ({kw.conteo})
                    </span>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Explorador de Textos y Metas por Empresa */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <FileText className="w-4 h-4 text-blue-600" />
              Explorador de Declaraciones Textuales y Extracción de Metas ({listaFiltrada.length})
            </h3>
            <span className="text-xs text-slate-500">
              Categorización de párrafos y oraciones declaradas por cada organización evaluada.
            </span>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
              <input
                type="text"
                placeholder="Buscar por palabra, NIT o nombre..."
                value={busquedaTexto}
                onChange={e => setBusquedaTexto(e.target.value)}
                className="pl-8 pr-2.5 py-1 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 text-slate-800 placeholder-slate-400 w-64"
              />
            </div>
          </div>
        </div>

        {listaFiltrada.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-400">
            No se encontraron textos que coincidan con la búsqueda o categoría seleccionada.
          </div>
        ) : (
          <div className="space-y-3">
            {listaFiltrada.map(item => (
              <div
                key={item.empresa.id}
                className="p-4 rounded-xl border border-slate-200 hover:border-indigo-300 transition-colors bg-slate-50/40 space-y-2.5"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 text-sm">
                      {item.empresa.razonSocial}
                    </span>
                    <span className="text-xs font-mono text-slate-500">
                      (NIT: {item.empresa.numeroDocumento})
                    </span>
                    <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 font-bold border border-indigo-200">
                      Año {item.empresa.anoReporte}
                    </span>
                  </div>

                  <button
                    onClick={() => onSeleccionarEmpresa(item.empresa)}
                    className="text-xs font-semibold text-blue-600 hover:text-blue-800 hover:underline cursor-pointer flex items-center gap-1 self-start sm:self-auto"
                  >
                    <span>Ver Ficha Completa</span>
                    <Building2 className="w-3 h-3" />
                  </button>
                </div>

                {/* Texto original declarado */}
                <div className="p-3 bg-white rounded-lg border border-slate-200 text-xs text-slate-700 italic leading-relaxed">
                  "{item.texto}"
                </div>

                {/* Categorías y palabras clave identificadas */}
                <div className="flex flex-wrap items-center gap-2 pt-1">
                  <span className="text-[11px] font-bold text-slate-600">
                    Metas Categorizadas:
                  </span>
                  {item.metas.length === 0 ? (
                    <span className="text-[11px] text-amber-600 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      Sin metas identificadas con las palabras clave normativas
                    </span>
                  ) : (
                    item.metas.map((m, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-lg bg-indigo-50 border border-indigo-200 text-indigo-900 font-medium"
                      >
                        <CheckCircle2 className="w-3 h-3 text-indigo-600 shrink-0" />
                        <span className="font-bold">{m.nombreCategoria}</span>
                        {m.metaCuantificada && (
                          <span className="font-mono text-[10px] bg-indigo-200/60 px-1 rounded text-indigo-950 font-bold ml-1">
                            {m.metaCuantificada}
                          </span>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
