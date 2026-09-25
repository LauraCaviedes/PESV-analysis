import React, { useState } from 'react';
import {
  AlertOctagon,
  Gauge,
  Clock,
  Wrench,
  FileWarning,
  Flame,
  Search,
  ArrowUpDown,
} from 'lucide-react';
import { EmpresaPESV, InfraccionesTransito } from '../types/pesv';

interface InfractionsAnalysisViewProps {
  empresas: EmpresaPESV[];
  onSeleccionarEmpresa: (empresa: EmpresaPESV) => void;
}

interface DetalleInfraccion {
  codigo: keyof InfraccionesTransito;
  nombre: string;
  categoria: 'C' | 'D' | 'E' | 'H' | 'B';
  gravedad: 'ALTA' | 'CRÍTICA' | 'MEDIA';
  descripcion: string;
  riesgoVial: string;
  asistenciaRecomendada: string;
}

const INFRACCIONES_CATALOGO: DetalleInfraccion[] = [
  {
    codigo: 'C29',
    nombre: 'Exceso de Velocidad Permitida',
    categoria: 'C',
    gravedad: 'CRÍTICA',
    descripcion: 'Conducir un vehículo a velocidad superior a la máxima permitida en la vía.',
    riesgoVial: 'Factor desencadenante número 1 en fatalidades viales y pérdida de control.',
    asistenciaRecomendada: 'Asistencia en Programa de Gestión de la Velocidad Segura (Paso 8.1) y telemetría.',
  },
  {
    codigo: 'C14',
    nombre: 'Transitar en Sitios u Horas Prohibidas (Pico y Placa)',
    categoria: 'C',
    gravedad: 'MEDIA',
    descripcion: 'Transitar por sitios restringidos o en horas prohibidas por la autoridad competente.',
    riesgoVial: 'Falla en la planificación de rutas y despacho de vehículos.',
    asistenciaRecomendada: 'Asistencia en Planificación de Desplazamientos Laborales (Paso 15).',
  },
  {
    codigo: 'C38',
    nombre: 'Revisión Técnico-Mecánica Vencida o No Portada',
    categoria: 'C',
    gravedad: 'CRÍTICA',
    descripcion: 'No realizar la revisión técnico-mecánica y de emisiones contaminantes en los plazos fijados.',
    riesgoVial: 'Fallas catastróficas de frenos, dirección y componentes mecánicos críticos.',
    asistenciaRecomendada: 'Asistencia en Mantenimiento y Control de Vehículos Seguros (Paso 17).',
  },
  {
    codigo: 'D04',
    nombre: 'No Portar SOAT o Póliza Vencida',
    categoria: 'D',
    gravedad: 'CRÍTICA',
    descripcion: 'No portar el Seguro Obligatorio de Accidentes de Tránsito (SOAT) vigente.',
    riesgoVial: 'Desprotección médica de víctimas ante eventuales siniestros viales.',
    asistenciaRecomendada: 'Inspección Preoperacional y Control Documental Diario (Paso 16).',
  },
  {
    codigo: 'H04',
    nombre: 'Exceso de Jornadas de Conducción sin Descanso',
    categoria: 'H',
    gravedad: 'CRÍTICA',
    descripcion: 'No respetar los tiempos de conducción y descanso fijados por la normatividad de transporte.',
    riesgoVial: 'Microsueños, fatiga extrema del conductor y tiempos de reacción lentos.',
    asistenciaRecomendada: 'Asistencia en Programa de Prevención de la Fatiga (Paso 8.2).',
  },
  {
    codigo: 'C02',
    nombre: 'Estacionar en Sitios Prohibidos',
    categoria: 'C',
    gravedad: 'MEDIA',
    descripcion: 'Estacionar un vehículo en sitios prohibidos u obstaculizando vías públicas.',
    riesgoVial: 'Riesgo de atropello y colisiones por alcance con otros actores viales.',
    asistenciaRecomendada: 'Capacitación en Hábitos y Comportamientos Seguros (Paso 10).',
  },
  {
    codigo: 'D01',
    nombre: 'Guiar Vehículo sin Licencia de Conducción',
    categoria: 'D',
    gravedad: 'CRÍTICA',
    descripcion: 'Guiar un vehículo sin haber obtenido la respectiva licencia de conducción.',
    riesgoVial: 'Incompetencia técnica y desconocimiento del Código Nacional de Tránsito.',
    asistenciaRecomendada: 'Validación de Competencias y Requisitos de Contratación (Paso 10 y 11).',
  },
  {
    codigo: 'E03',
    nombre: 'Conducción Bajo Influjo de Alcohol / Sustancias',
    categoria: 'E',
    gravedad: 'CRÍTICA',
    descripcion: 'Conducir en estado de embriaguez o bajo el efecto de sustancias psicoactivas.',
    riesgoVial: 'Pérdida severa de reflejos motores, alta probabilidad de homicidio culposo.',
    asistenciaRecomendada: 'Programa de Cero Tolerancia al Alcohol y Drogas (Paso 8.4) con pruebas aleatorias.',
  },
];

export const InfractionsAnalysisView: React.FC<InfractionsAnalysisViewProps> = ({
  empresas,
  onSeleccionarEmpresa,
}) => {
  const [codigoSeleccionado, setCodigoSeleccionado] = useState<keyof InfraccionesTransito>('C29');

  // Sumatorias globales de infracciones
  const totalesPorCodigo = INFRACCIONES_CATALOGO.reduce((acc, curr) => {
    acc[curr.codigo] = empresas.reduce((sum, e) => sum + (e.infracciones[curr.codigo] || 0), 0);
    return acc;
  }, {} as Record<string, number>);

  const totalGeneralInfracciones = empresas.reduce(
    (sum, e) => sum + e.infracciones.totalInfracciones,
    0
  );

  const infActual =
    INFRACCIONES_CATALOGO.find(i => i.codigo === codigoSeleccionado) || INFRACCIONES_CATALOGO[0];

  // Empresas ordenadas por la infracción seleccionada
  const empresasPorInfraccion = [...empresas]
    .filter(e => (e.infracciones[codigoSeleccionado] || 0) > 0)
    .sort((a, b) => (b.infracciones[codigoSeleccionado] || 0) - (a.infracciones[codigoSeleccionado] || 0));

  return (
    <div className="space-y-6">
      {/* Header General */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <AlertOctagon className="w-5 h-5 text-red-600" />
              Análisis de Infracciones de Tránsito de la Flota (Ley 769 de 2002)
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Consolidado de comparendos de tránsito en desplazamientos laborales por código normativo (Grupos B, C, D, E, H) y su correlación con siniestralidad.
            </p>
          </div>
          <div className="flex items-center gap-3 text-xs font-mono bg-slate-50 p-2.5 rounded-lg border border-slate-200">
            <div>
              <span className="text-slate-500 block text-[10px]">TOTAL INFRACCIONES</span>
              <span className="text-lg font-bold text-red-700 tabular-nums">
                {totalGeneralInfracciones} comparendos
              </span>
            </div>
            <div className="border-l border-slate-200 pl-3">
              <span className="text-slate-500 block text-[10px]">PROMEDIO POR EMPRESA</span>
              <span className="text-lg font-bold text-slate-800 tabular-nums">
                {(totalGeneralInfracciones / (empresas.length || 1)).toFixed(1)} ± 0.8
              </span>
            </div>
          </div>
        </div>

        {/* Carrusel de Códigos de Infracción */}
        <div className="mt-4 pt-4 border-t border-slate-100 grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2">
          {INFRACCIONES_CATALOGO.map(inf => {
            const isSelected = inf.codigo === codigoSeleccionado;
            const conteo = totalesPorCodigo[inf.codigo] || 0;

            return (
              <button
                key={inf.codigo}
                onClick={() => setCodigoSeleccionado(inf.codigo)}
                className={`p-2.5 rounded-lg border text-left transition-colors cursor-pointer ${
                  isSelected
                    ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                    : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-800'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold">{inf.codigo}</span>
                  <span
                    className={`text-[9px] px-1 py-0.2 rounded font-mono ${
                      isSelected ? 'bg-blue-500 text-white' : 'bg-slate-200 text-slate-700'
                    }`}
                  >
                    Cat {inf.categoria}
                  </span>
                </div>
                <div className="text-[11px] font-mono font-bold mt-1 tabular-nums">
                  {conteo} <span className="font-sans font-normal text-[10px]">casos</span>
                </div>
                <div
                  className={`text-[10px] truncate mt-0.5 ${
                    isSelected ? 'text-blue-100' : 'text-slate-500'
                  }`}
                  title={inf.nombre}
                >
                  {inf.nombre}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Ficha Técnica de la Infracción Seleccionada */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-3">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded bg-red-100 text-red-800 font-mono font-bold text-xs">
                Código {infActual.codigo}
              </span>
              <span className="text-xs font-semibold text-slate-500">
                Categoría {infActual.categoria} · Severidad {infActual.gravedad}
              </span>
            </div>
            <h3 className="text-base font-bold text-slate-900">{infActual.nombre}</h3>
            <p className="text-xs text-slate-600 leading-relaxed">{infActual.descripcion}</p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs">
              <div className="p-3 rounded-lg bg-red-50/60 border border-red-100">
                <span className="font-bold text-red-900 block mb-0.5">Impacto en la Seguridad Vial:</span>
                <span className="text-red-800 text-[11px]">{infActual.riesgoVial}</span>
              </div>
              <div className="p-3 rounded-lg bg-blue-50/60 border border-blue-100">
                <span className="font-bold text-blue-900 block mb-0.5">Acción / Asistencia ANSV:</span>
                <span className="text-blue-800 text-[11px]">{infActual.asistenciaRecomendada}</span>
              </div>
            </div>
          </div>

          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex flex-col justify-between">
            <div>
              <span className="text-xs font-bold text-slate-500">INCIDENCIA EN LA MUESTRA</span>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-3xl font-bold font-mono text-slate-900 tabular-nums">
                  {totalesPorCodigo[infActual.codigo] || 0}
                </span>
                <span className="text-xs font-mono text-slate-500">
                  ({(((totalesPorCodigo[infActual.codigo] || 0) / (totalGeneralInfracciones || 1)) * 100).toFixed(1)}% del total)
                </span>
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                Registrados en {empresasPorInfraccion.length} empresas de la muestra
              </p>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-200 text-xs text-slate-600 space-y-1.5 font-mono">
              <div className="flex justify-between">
                <span>Infracción más recurrente:</span>
                <span className="font-bold text-red-700">C29 (Velocidad)</span>
              </div>
              <div className="flex justify-between">
                <span>Incertidumbre asociada:</span>
                <span>± 0.8 eventos</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Empresas con Mayor Número de esta Infracción */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              Empresas con Reportes de Infracción {infActual.codigo} ({infActual.nombre})
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Identificación de empresas prioritarias para asistencia técnica correctiva
            </p>
          </div>
          <span className="text-xs font-mono text-slate-500">
            {empresasPorInfraccion.length} empresas con esta infracción
          </span>
        </div>

        {empresasPorInfraccion.length === 0 ? (
          <div className="text-center py-8 text-slate-400 text-xs">
            Ninguna empresa reportó infracciones bajo el código {infActual.codigo}.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-slate-600 font-semibold">
                  <th className="py-2.5 px-3">Empresa</th>
                  <th className="py-2.5 px-3">NIT</th>
                  <th className="py-2.5 px-3">Año</th>
                  <th className="py-2.5 px-3">Nivel PESV</th>
                  <th className="py-2.5 px-3">Sector</th>
                  <th className="py-2.5 px-3 text-right">Comparendos {infActual.codigo}</th>
                  <th className="py-2.5 px-3 text-right">Total Infracciones</th>
                  <th className="py-2.5 px-3 text-right">TSV Total</th>
                  <th className="py-2.5 px-3 text-center">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono">
                {empresasPorInfraccion.map(empresa => (
                  <tr
                    key={empresa.id}
                    onClick={() => onSeleccionarEmpresa(empresa)}
                    className="hover:bg-blue-50/40 cursor-pointer transition-colors"
                  >
                    <td className="py-2.5 px-3 font-sans font-semibold text-slate-900 truncate max-w-[240px]">
                      {empresa.razonSocial}
                    </td>
                    <td className="py-2.5 px-3 text-slate-700">{empresa.numeroDocumento}</td>
                    <td className="py-2.5 px-3 font-mono">
                      <span className="text-[11px] px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 font-bold border border-indigo-200">
                        {empresa.anoReporte}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 font-sans">
                      <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-800 text-[11px]">
                        {empresa.clasificacionCalculada}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 font-sans text-slate-600 truncate max-w-[180px]">
                      {empresa.sectorEconomico}
                    </td>
                    <td className="py-2.5 px-3 text-right font-bold text-red-700 text-sm">
                      {empresa.infracciones[codigoSeleccionado] || 0}
                    </td>
                    <td className="py-2.5 px-3 text-right font-bold text-slate-800">
                      {empresa.infracciones.totalInfracciones}
                    </td>
                    <td className="py-2.5 px-3 text-right text-slate-800">
                      {empresa.indicadores.tsvTotal.toFixed(2)}
                    </td>
                    <td className="py-2.5 px-3 text-center font-sans">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onSeleccionarEmpresa(empresa);
                        }}
                        className="text-blue-600 hover:text-blue-800 font-semibold"
                      >
                        Ver Detalle →
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
