import React, { useState } from 'react';
import {
  LifeBuoy,
  AlertTriangle,
  Gauge,
  Clock,
  Wrench,
  GraduationCap,
  GitCompare,
  FileCheck,
  CheckCircle,
  Download,
  Search,
} from 'lucide-react';
import { EmpresaPESV, AlertaANSV, TipoAlertaANSV, NivelSeveridad } from '../types/pesv';

interface TechnicalAssistanceViewProps {
  empresas: EmpresaPESV[];
  onSeleccionarEmpresa: (empresa: EmpresaPESV) => void;
}

interface TemaAsistencia {
  tipo: TipoAlertaANSV;
  titulo: string;
  pasosNorma: number[];
  icono: React.ElementType;
  descripcion: string;
  color: string;
}

const TEMAS_ASISTENCIA: TemaAsistencia[] = [
  {
    tipo: 'CLASIFICACION_DISCREPANTE',
    titulo: 'Clasificación Normativa PESV',
    pasosNorma: [1, 2, 5, 6, 7],
    icono: GitCompare,
    descripcion: 'Acompañamiento en el encuadre legal de nivel (Básico, Estándar o Avanzado) según flota y conductores reales.',
    color: 'text-amber-700 bg-amber-50 border-amber-200',
  },
  {
    tipo: 'VELOCIDAD_CRITICA',
    titulo: 'Gestión de la Velocidad Segura',
    pasosNorma: [8, 15],
    icono: Gauge,
    descripcion: 'Implementación de telemetría/GPS, política de incentivos seguros y auditoría de velocidades de operación.',
    color: 'text-red-700 bg-red-50 border-red-200',
  },
  {
    tipo: 'FATIGA_Y_JORNADAS',
    titulo: 'Prevención de la Fatiga y Jornadas',
    pasosNorma: [8, 15],
    icono: Clock,
    descripcion: 'Control de jornada máxima laboral de conducción, pausas activas obligatorias y logística de paradas seguras.',
    color: 'text-orange-700 bg-orange-50 border-orange-200',
  },
  {
    tipo: 'MANTENIMIENTO_E_INSPECCION',
    titulo: 'Mantenimiento e Inspección Preoperacional',
    pasosNorma: [16, 17],
    icono: Wrench,
    descripcion: 'Estandarización de lista de chequeo diaria de vehículos y trazabilidad de hojas de vida y mantenimientos preventivos.',
    color: 'text-blue-700 bg-blue-50 border-blue-200',
  },
  {
    tipo: 'FORMACION_DEFICITARIA',
    titulo: 'Competencia y Formación Vial',
    pasosNorma: [10],
    icono: GraduationCap,
    descripcion: 'Estructuración del Plan Anual de Formación diferenciado por rol vial (conductores, motociclistas, peatones).',
    color: 'text-purple-700 bg-purple-50 border-purple-200',
  },
  {
    tipo: 'ALTA_SINIESTRALIDAD',
    titulo: 'Investigación y Mitigación de Siniestros',
    pasosNorma: [12, 13, 21, 23],
    icono: AlertTriangle,
    descripcion: 'Metodología de árbol de causas, factores del Sistema Seguro y plan de respuesta y atención a víctimas (PPRAEV).',
    color: 'text-rose-700 bg-rose-50 border-rose-200',
  },
  {
    tipo: 'ENTREGA_INCOMPLETA_FORMULARIOS',
    titulo: 'Completitud y Reporte de Autogestión',
    pasosNorma: [5, 20],
    icono: FileCheck,
    descripcion: 'Subsanación de partes faltantes del formulario de autogestión (Categorías B y C) y consolidación de línea base.',
    color: 'text-slate-700 bg-slate-50 border-slate-200',
  },
];

export const TechnicalAssistanceView: React.FC<TechnicalAssistanceViewProps> = ({
  empresas,
  onSeleccionarEmpresa,
}) => {
  const [temaFiltro, setTemaFiltro] = useState<string>('TODOS');
  const [severidadFiltro, setSeveridadFiltro] = useState<string>('TODAS');
  const [busquedaEmpresa, setBusquedaEmpresa] = useState<string>('');
  const [alertaSeleccionada, setAlertaSeleccionada] = useState<{
    alerta: AlertaANSV;
    empresa: EmpresaPESV;
  } | null>(null);

  // Aplanar todas las alertas con su empresa asociada
  const todasLasAlertasConEmpresa = empresas.flatMap(empresa =>
    empresa.alertas.map(alerta => ({
      alerta,
      empresa,
    }))
  );

  // Conteo por tema
  const conteoPorTema = TEMAS_ASISTENCIA.reduce((acc, t) => {
    acc[t.tipo] = todasLasAlertasConEmpresa.filter(item => item.alerta.tipo === t.tipo).length;
    return acc;
  }, {} as Record<string, number>);

  // Filtrado dinámico
  const alertasFiltradas = todasLasAlertasConEmpresa.filter(item => {
    if (temaFiltro !== 'TODOS' && item.alerta.tipo !== temaFiltro) return false;
    if (severidadFiltro !== 'TODAS' && item.alerta.severidad !== severidadFiltro) return false;
    if (busquedaEmpresa.trim()) {
      const q = busquedaEmpresa.toLowerCase();
      const matchNom = item.empresa.razonSocial.toLowerCase().includes(q);
      const matchNit = item.empresa.numeroDocumento.includes(q);
      if (!matchNom && !matchNit) return false;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header General */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <LifeBuoy className="w-5 h-5 text-blue-600" />
              Módulo de Asistencia Técnica Especializada ANSV
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Detección de alertas tempranas para que la Agencia Nacional de Seguridad Vial (ANSV) oriente asistencias técnicas focalizadas en los 24 pasos normativos.
            </p>
          </div>

          <div className="flex items-center gap-3 text-xs font-mono">
            <span className="px-3 py-1.5 rounded-lg bg-red-100 text-red-800 font-bold">
              {todasLasAlertasConEmpresa.filter(a => a.alerta.severidad === 'CRÍTICA').length} Críticas
            </span>
            <span className="px-3 py-1.5 rounded-lg bg-amber-100 text-amber-800 font-bold">
              {todasLasAlertasConEmpresa.filter(a => a.alerta.severidad === 'ALTA').length} Altas
            </span>
            <span className="px-3 py-1.5 rounded-lg bg-blue-100 text-blue-800 font-bold">
              {todasLasAlertasConEmpresa.length} Totales
            </span>
          </div>
        </div>

        {/* Tarjetas Temáticas de Asistencia */}
        <div className="mt-4 pt-4 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {TEMAS_ASISTENCIA.slice(0, 4).map(tema => {
            const Icon = tema.icono;
            const conteo = conteoPorTema[tema.tipo] || 0;
            const isSelected = temaFiltro === tema.tipo;

            return (
              <button
                key={tema.tipo}
                onClick={() => setTemaFiltro(isSelected ? 'TODOS' : tema.tipo)}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                  isSelected ? 'ring-2 ring-blue-600 bg-blue-50/50' : 'bg-slate-50 hover:bg-slate-100/70 border-slate-200'
                }`}
              >
                <div className="flex items-center justify-between">
                  <Icon className="w-4 h-4 text-slate-700" />
                  <span className="text-xs font-mono font-bold px-1.5 py-0.5 rounded bg-white text-slate-900 border border-slate-200">
                    {conteo} empresas
                  </span>
                </div>
                <div className="font-bold text-xs text-slate-900 mt-2">{tema.titulo}</div>
                <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-2">
                  {tema.descripcion}
                </p>
                <div className="mt-2 text-[10px] text-blue-700 font-mono font-semibold">
                  Pasos: {tema.pasosNorma.join(', ')}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Barra de Filtros */}
      <div className="bg-white border border-slate-200 rounded-xl p-3.5 flex flex-wrap items-center justify-between gap-3 shadow-xs">
        <div className="flex items-center gap-2 flex-1 min-w-[240px]">
          <Search className="w-3.5 h-3.5 text-slate-400" />
          <input
            type="text"
            placeholder="Filtrar por Razón Social o NIT de la empresa..."
            value={busquedaEmpresa}
            onChange={e => setBusquedaEmpresa(e.target.value)}
            className="w-full text-xs bg-transparent focus:outline-none text-slate-800 placeholder-slate-400"
          />
        </div>

        <div className="flex items-center gap-2 text-xs">
          <select
            value={temaFiltro}
            onChange={e => setTemaFiltro(e.target.value)}
            className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 cursor-pointer"
          >
            <option value="TODOS">Todos los Temas de Asistencia</option>
            {TEMAS_ASISTENCIA.map(t => (
              <option key={t.tipo} value={t.tipo}>
                {t.titulo} ({conteoPorTema[t.tipo] || 0})
              </option>
            ))}
          </select>

          <select
            value={severidadFiltro}
            onChange={e => setSeveridadFiltro(e.target.value)}
            className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 cursor-pointer"
          >
            <option value="TODAS">Todas las Severidades</option>
            <option value="CRÍTICA">Crítica</option>
            <option value="ALTA">Alta</option>
            <option value="MEDIA">Media</option>
          </select>
        </div>
      </div>

      {/* Lista de Alertas / Cola de Asistencia Técnica */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              Cola de Intervención Prioritaria ({alertasFiltradas.length} alertas)
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Empresas y temas concretos donde la ANSV debe programar acompañamiento técnico
            </p>
          </div>
        </div>

        {alertasFiltradas.length === 0 ? (
          <div className="text-center py-10 text-slate-400 text-xs">
            No hay alertas que coincidan con los filtros seleccionados.
          </div>
        ) : (
          <div className="space-y-3">
            {alertasFiltradas.map(({ alerta, empresa }) => {
              const severidadClass =
                alerta.severidad === 'CRÍTICA'
                  ? 'bg-red-50 text-red-800 border-red-200'
                  : alerta.severidad === 'ALTA'
                  ? 'bg-amber-50 text-amber-800 border-amber-200'
                  : 'bg-blue-50 text-blue-800 border-blue-200';

              return (
                <div
                  key={`${empresa.id}_${alerta.id}`}
                  className="p-4 rounded-xl border border-slate-200 hover:border-blue-400 transition-colors bg-white shadow-2xs"
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border ${severidadClass}`}
                        >
                          {alerta.severidad}
                        </span>
                        <span className="font-bold text-slate-900 text-sm">
                          {alerta.titulo}
                        </span>
                        <span className="text-slate-400 text-xs">·</span>
                        <span className="text-xs font-semibold text-slate-700">
                          {empresa.razonSocial}
                        </span>
                        <span className="text-xs font-mono text-slate-500">
                          (NIT: {empresa.numeroDocumento})
                        </span>
                        <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200">
                          Año {empresa.anoReporte}
                        </span>
                      </div>

                      <p className="text-xs text-slate-700 leading-relaxed pt-1">
                        {alerta.descripcion}
                      </p>

                      <div className="mt-2 p-2.5 bg-blue-50/70 border border-blue-100 rounded-lg text-xs">
                        <span className="font-bold text-blue-900 block mb-0.5">
                          Recomendación de Asistencia Técnica ANSV:
                        </span>
                        <span className="text-blue-800">{alerta.recomendacionANSV}</span>
                      </div>
                    </div>

                    <div className="flex flex-row sm:flex-col items-end gap-2 shrink-0">
                      <button
                        onClick={() => setAlertaSeleccionada({ alerta, empresa })}
                        className="px-3 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-lg transition-colors cursor-pointer whitespace-nowrap"
                      >
                        Generar Misión Técnica
                      </button>
                      <button
                        onClick={() => onSeleccionarEmpresa(empresa)}
                        className="text-xs text-slate-600 hover:text-slate-900 font-semibold cursor-pointer"
                      >
                        Ver Diagnóstico →
                      </button>
                    </div>
                  </div>

                  <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500 font-mono">
                    <span>
                      Ubicación: {empresa.municipio}, {empresa.departamento} ({empresa.sectorEconomico})
                    </span>
                    <span>
                      Pasos PESV afectados: {alerta.pasosPESVAfectados.map(p => `Paso ${p}`).join(', ')}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal / Panel de Generación de Misión Técnica ANSV */}
      {alertaSeleccionada && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div>
                <span className="text-[10px] font-mono text-blue-600 font-bold uppercase">
                  Agencia Nacional de Seguridad Vial · Dirección de Comportamiento
                </span>
                <h3 className="text-base font-bold text-slate-900 mt-0.5">
                  Orden de Asistencia Técnica PESV
                </h3>
              </div>
              <button
                onClick={() => setAlertaSeleccionada(null)}
                className="text-slate-400 hover:text-slate-600 text-lg font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-700">
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 grid grid-cols-2 gap-2">
                <div>
                  <span className="text-slate-500 block text-[11px]">Empresa Destino:</span>
                  <span className="font-bold text-slate-900">{alertaSeleccionada.empresa.razonSocial}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[11px]">NIT / Documento:</span>
                  <span className="font-mono text-slate-900">{alertaSeleccionada.empresa.numeroDocumento}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[11px]">Nivel PESV Exigido:</span>
                  <span className="font-bold text-blue-700">{alertaSeleccionada.empresa.clasificacionCalculada}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[11px]">Ubicación:</span>
                  <span>{alertaSeleccionada.empresa.municipio} ({alertaSeleccionada.empresa.departamento})</span>
                </div>
              </div>

              <div>
                <span className="font-bold text-slate-900 block mb-1">Motivo de Asistencia Prioritaria:</span>
                <p className="p-3 rounded-lg bg-amber-50 border border-amber-200 text-amber-900">
                  {alertaSeleccionada.alerta.titulo}: {alertaSeleccionada.alerta.descripcion}
                </p>
              </div>

              <div>
                <span className="font-bold text-slate-900 block mb-1">Plan de Trabajo Sugerido ANSV:</span>
                <ul className="list-disc pl-4 space-y-1 text-slate-600 text-[11px]">
                  <li>Revisión documental con el Líder PESV y Comité de Seguridad Vial (Paso 1 y 2).</li>
                  <li>Inspección de las evidencias operativas de los pasos {alertaSeleccionada.alerta.pasosPESVAfectados.join(', ')}.</li>
                  <li>Definición de plan de choque a 30 días para subsanar los hallazgos críticos.</li>
                  <li>Capacitación del equipo directivo en corresponsabilidad de la Ley 2050 de 2020.</li>
                </ul>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-2">
              <button
                onClick={() => setAlertaSeleccionada(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
              >
                Cerrar
              </button>
              <button
                onClick={() => {
                  window.print();
                }}
                className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-lg transition-colors cursor-pointer shadow-sm"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Imprimir / Guardar Acta</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
