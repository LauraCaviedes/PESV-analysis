import React from 'react';
import { Download, FileSpreadsheet, AlertTriangle, ShieldCheck, Upload, Calendar } from 'lucide-react';
import { EmpresaPESV } from '../types/pesv';
import { exportarLibroPESVExcel } from '../utils/excelExporter';

interface HeaderProps {
  empresas: EmpresaPESV[];
  onGenerarReporte: () => void;
  onAbrirCargaDatos: () => void;
  onAbrirGuia: () => void;
  alertaCriticaCount: number;
  anosDisponibles?: number[];
  anoSeleccionado?: string;
  onSeleccionarAno?: (ano: string) => void;
  conteosPorAno?: Record<number, number>;
  totalBaseCount?: number;
}

export const Header: React.FC<HeaderProps> = ({
  empresas,
  onGenerarReporte,
  onAbrirCargaDatos,
  onAbrirGuia,
  alertaCriticaCount,
  anosDisponibles = [],
  anoSeleccionado = 'TODOS',
  onSeleccionarAno,
  conteosPorAno = {},
  totalBaseCount = 0,
}) => {
  return (
    <header className="w-full bg-slate-900 border-b border-slate-800 text-white sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Zone 1: Single text element wordmark */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold text-lg shadow-sm">
            <ShieldCheck className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-base font-bold tracking-tight text-white flex items-center gap-2">
              PESV Analítica & Asistencia Técnica ANSV
            </h1>
            <p className="text-xs text-slate-400">
              Metodología Resolución Mintransporte · Ley 2050 · Control de Incertidumbre
            </p>
          </div>
        </div>

        {/* Zone 2: Selector Rápido de Año de Autogestión & Status */}
        <div className="hidden lg:flex items-center gap-3 text-xs text-slate-400">
          {anosDisponibles.length > 0 && onSeleccionarAno && (
            <div className="flex items-center gap-1.5 bg-slate-800/90 py-1 px-2.5 rounded-lg border border-slate-700/80 shadow-2xs">
              <Calendar className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
              <span className="text-[11px] font-semibold text-slate-300">Año de Autogestión:</span>
              <select
                value={anoSeleccionado}
                onChange={e => onSeleccionarAno(e.target.value)}
                className="bg-slate-900 text-indigo-300 font-mono font-bold text-xs rounded border border-slate-700 px-2 py-0.5 focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
                title="Filtrar por año del reporte de autogestión"
              >
                <option value="TODOS">
                  Todos los Años ({totalBaseCount || empresas.length})
                </option>
                {anosDisponibles.map(a => (
                  <option key={a} value={a.toString()}>
                    Año {a} ({conteosPorAno[a] || 0} reportes)
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="flex items-center gap-1.5 pl-1 border-l border-slate-800">
            <span className="text-slate-300 font-mono tabular-nums font-bold">{empresas.length}</span>
            <span>reportes</span>
            <span aria-hidden="true" className="text-slate-600">·</span>
            <span className="text-amber-400 font-mono tabular-nums font-bold">{alertaCriticaCount}</span>
            <span className="text-amber-300">alertas</span>
          </div>
        </div>

        {/* Zone 3: 1-2 primary actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={onAbrirGuia}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg transition-colors whitespace-nowrap cursor-pointer"
            title="Ver Guía Metodológica y Manual de Análisis"
          >
            <span>Guía & Manual</span>
          </button>
          <button
            onClick={onAbrirCargaDatos}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg transition-colors whitespace-nowrap cursor-pointer shadow-xs"
            title="Cargar 1 Excel consolidado o las 3 partes para limpieza ETL"
          >
            <Upload className="w-3.5 h-3.5 text-white" />
            <span>Cargar Datos (Excel)</span>
          </button>
          <button
            onClick={() => exportarLibroPESVExcel(empresas)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-200 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg transition-colors whitespace-nowrap cursor-pointer"
            title="Exportar base consolidada en Excel (.xlsx)"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden sm:inline">Exportar</span> Excel
          </button>
          <button
            onClick={onGenerarReporte}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium text-white bg-blue-600 hover:bg-blue-500 rounded-lg transition-colors whitespace-nowrap shadow-sm cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Informe ANSV</span>
          </button>
        </div>
      </div>
    </header>
  );
};

