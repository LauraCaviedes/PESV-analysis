import React, { useState, useMemo } from 'react';
import {
  MapPin,
  Layers,
  AlertTriangle,
} from 'lucide-react';
import { EmpresaPESV } from '../types/pesv';
import {
  DEPARTAMENTOS_COLOMBIA,
  homologarNombreDepartamento,
  proyectarCoordsSVG,
} from '../utils/colombiaGeo';

interface GeoDistributionViewProps {
  empresas: EmpresaPESV[];
  onSeleccionarEmpresa: (empresa: EmpresaPESV) => void;
}

// Coordenadas exactas en píxeles dentro del viewBox="0 0 600 720" para ubicar los números
// Coordenadas recalibradas según la escala visual del mapa base
const POSICIONES_ETIQUETAS: Record<string, { x: number; y: number }> = {
  'AMAZONAS': { x: 410, y: 600 }, //
  'ANTIOQUIA': { x: 260, y: 260 },
  'ARAUCA': { x: 430, y: 260 },//
  'ATLÁNTICO': { x: 270, y: 100 }, //
  'BOGOTÁ, D.C.': { x: 300, y: 380 }, //
  'BOLÍVAR': { x: 310, y: 200 }, //
  'BOYACÁ': { x: 340, y: 320 }, //
  'CALDAS': { x: 270, y: 320 }, //
  'CAQUETÁ': { x: 290, y: 510 }, //
  'CASANARE': { x: 410, y: 330 }, //
  'CAUCA': { x: 200, y: 440 }, //
  'CESAR': { x: 330, y: 140 }, //
  'CHOCÓ': { x: 200, y: 310 }, //
  'CÓRDOBA': { x: 240, y: 200 }, //
  'CUNDINAMARCA': { x: 300, y: 340 }, //
  'GUAINÍA': { x: 500, y: 450 }, //
  'GUAVIARE': { x: 390, y: 480 }, //
  'HUILA': { x: 250, y: 440 }, //
  'LA GUAJIRA': { x: 380, y: 120 },
  'MAGDALENA': { x: 300, y: 120 },
  'META': { x: 360, y: 400 }, //
  'NARIÑO': { x: 150, y: 490 }, //
  'NORTE DE SANTANDER': { x: 370, y: 220 }, //
  
  'PUTUMAYO': { x: 230, y: 530 }, //

  'QUINDÍO': { x: 240, y: 360 }, //
  'RISARALDA': { x: 255, y: 360 }, //
  'SAN ANDRÉS Y PROVIDENCIA': { x: 100, y: 70 }, //
  'SANTANDER': { x: 340, y: 280 }, //
  'SUCRE': { x: 270, y: 180 }, //
  'TOLIMA': { x: 270, y: 380 }, //
  'VALLE DEL CAUCA': { x: 210, y: 400 }, //
  'VAUPÉS': { x: 450, y: 500 }, //
  'VICHADA': { x: 480, y: 340 }, //
};

export const GeoDistributionView: React.FC<GeoDistributionViewProps> = ({
  empresas,
  onSeleccionarEmpresa,
}) => {
  const [deptoSeleccionado, setDeptoSeleccionado] = useState<string>('BOGOTÁ, D.C.');
  const [deptoHovered, setDeptoHovered] = useState<string | null>(null);
  const [metricaCoropletica, setMetricaCoropletica] = useState<
    'EMPRESAS' | 'FLOTA' | 'TSV' | 'INFRACCIONES'
  >('EMPRESAS');

  // 1. Agrupar y Homologar empresas por Departamento
  const datosPorDepto = useMemo(() => {
    const mapa: Record<
      string,
      {
        nombreDpt: string;
        nombreComun: string;
        codigoDpto: string;
        empresas: EmpresaPESV[];
        totalVehiculos: number;
        totalConductores: number;
        totalInfracciones: number;
        tsvPromedio: number;
        discrepancias: number;
      }
    > = {};

    for (const dep of DEPARTAMENTOS_COLOMBIA) {
      const canonico = homologarNombreDepartamento(dep.nombre);
      mapa[canonico] = {
        nombreDpt: canonico,
        nombreComun: dep.nombre,
        codigoDpto: dep.codigo,
        empresas: [],
        totalVehiculos: 0,
        totalConductores: 0,
        totalInfracciones: 0,
        tsvPromedio: 0,
        discrepancias: 0,
      };
    }

    for (const emp of empresas) {
      const canonico = homologarNombreDepartamento(emp.departamento);
      if (!mapa[canonico]) {
        mapa[canonico] = {
          nombreDpt: canonico,
          nombreComun: emp.departamento,
          codigoDpto: '00',
          empresas: [],
          totalVehiculos: 0,
          totalConductores: 0,
          totalInfracciones: 0,
          tsvPromedio: 0,
          discrepancias: 0,
        };
      }
      mapa[canonico].empresas.push(emp);
      mapa[canonico].totalVehiculos += emp.flota.totalVehiculos;
      mapa[canonico].totalConductores += emp.conductores.totalConductoresNorma;
      mapa[canonico].totalInfracciones += emp.infracciones.totalInfracciones;
      if (!emp.esClasificacionCorrecta) {
        mapa[canonico].discrepancias++;
      }
    }

    for (const k of Object.keys(mapa)) {
      const item = mapa[k];
      if (item.empresas.length > 0) {
        const sumaTsv = item.empresas.reduce((acc, e) => acc + e.indicadores.tsvTotal, 0);
        item.tsvPromedio = Math.round((sumaTsv / item.empresas.length) * 100) / 100;
      }
    }

    return mapa;
  }, [empresas]);

  // Lista única de departamentos para renderizar una sola etiqueta de texto por región
  const departamentosUnicosParaEtiquetas = useMemo(() => {
    const unicos = new Map<string, { nombre: string; codigo: string; lat: number; lon: number }>();
    for (const dep of DEPARTAMENTOS_COLOMBIA) {
      if (!unicos.has(dep.codigo)) {
        unicos.set(dep.codigo, {
          nombre: dep.nombre,
          codigo: dep.codigo,
          lat: dep.lat,
          lon: dep.lon,
        });
      }
    }
    return Array.from(unicos.values());
  }, []);

  // 2. Rangos de la métrica activa para la escala de color Coroplética
  const valoresMetrica = useMemo(() => {
    return Object.values(datosPorDepto).map(d => {
      if (metricaCoropletica === 'EMPRESAS') return d.empresas.length;
      if (metricaCoropletica === 'FLOTA') return d.totalVehiculos;
      if (metricaCoropletica === 'TSV') return d.tsvPromedio;
      return d.totalInfracciones;
    });
  }, [datosPorDepto, metricaCoropletica]);

  const maxMetrica = Math.max(...valoresMetrica, 1);
  const minMetrica = Math.min(...valoresMetrica, 0);

  const obtenerColorCoropletico = (valor: number) => {
    if (valor === 0) return '#f1f5f9';
    const ratio = Math.min(1, Math.max(0, (valor - minMetrica) / (maxMetrica - minMetrica || 1)));

    if (metricaCoropletica === 'TSV' || metricaCoropletica === 'INFRACCIONES') {
      if (ratio < 0.25) return '#fef3c7';
      if (ratio < 0.5) return '#fde047';
      if (ratio < 0.75) return '#f97316';
      return '#dc2626';
    }

    if (ratio < 0.2) return '#e0f2fe';
    if (ratio < 0.4) return '#93c5fd';
    if (ratio < 0.7) return '#3b82f6';
    if (ratio < 0.9) return '#1d4ed8';
    return '#1e3a8a';
  };

  const deptoActivo = useMemo(() => {
    const canonicoSeleccionado = homologarNombreDepartamento(deptoSeleccionado);
    return (
      datosPorDepto[canonicoSeleccionado] ||
      Object.values(datosPorDepto).find(d => d.empresas.length > 0) ||
      Object.values(datosPorDepto)[0]
    );
  }, [datosPorDepto, deptoSeleccionado]);

  return (
    <div className="space-y-6">
      {/* Header del Mapa Territorial */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-800 border border-blue-200">
                Sistema Geográfico Nacional · EPSG:4326 (WGS84)
              </span>
              <span className="text-xs text-slate-500 font-semibold">
                Homologación Territorial por Departamento
              </span>
            </div>
            <h2 className="text-base font-bold text-slate-900 mt-1 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-blue-600" />
              Mapa Coroplético Territorial de Seguridad Vial
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Distribución espacial y analítica de organizaciones, flotas y siniestralidad por departamentos de Colombia.
            </p>
          </div>

          {/* Selector de Métrica Coroplética */}
          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-500 font-semibold">Capa Coroplética:</span>
            <div className="flex rounded-lg bg-slate-100 p-0.5 border border-slate-200">
              <button
                onClick={() => setMetricaCoropletica('EMPRESAS')}
                className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-colors cursor-pointer ${
                  metricaCoropletica === 'EMPRESAS' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                N° Empresas
              </button>
              <button
                onClick={() => setMetricaCoropletica('FLOTA')}
                className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-colors cursor-pointer ${
                  metricaCoropletica === 'FLOTA' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Flota
              </button>
              <button
                onClick={() => setMetricaCoropletica('TSV')}
                className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-colors cursor-pointer ${
                  metricaCoropletica === 'TSV' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                TSV Promedio
              </button>
              <button
                onClick={() => setMetricaCoropletica('INFRACCIONES')}
                className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-colors cursor-pointer ${
                  metricaCoropletica === 'INFRACCIONES' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Infracciones
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Grid Principal */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Mapa SVG Vectorial */}
        <div className="lg:col-span-7 bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col items-center">
          <div className="w-full flex items-center justify-between text-xs text-slate-500 mb-2">
            <span className="font-semibold text-slate-700 flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-indigo-600" />
              Sombreado Coroplético por Departamentos
            </span>
            <span className="font-mono text-[11px] text-slate-400">
              Interactividad Directa
            </span>
          </div>

          <div className="relative w-full max-w-[500px] aspect-[6/7] bg-slate-50 rounded-xl border border-slate-200 p-2 overflow-hidden">
            <svg
              viewBox="0 0 600 720"
              className="w-full h-full select-none"
              style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.04))' }}
            >
              {/* CAPA 1: Formas geométricas (Paths) */}
              {DEPARTAMENTOS_COLOMBIA.map((dep, idx) => {
                const canonico = homologarNombreDepartamento(dep.nombre);
                const info = datosPorDepto[canonico];
                let valor = 0;
                if (info) {
                  if (metricaCoropletica === 'EMPRESAS') valor = info.empresas.length;
                  else if (metricaCoropletica === 'FLOTA') valor = info.totalVehiculos;
                  else if (metricaCoropletica === 'TSV') valor = info.tsvPromedio;
                  else valor = info.totalInfracciones;
                }

                const fillColor = obtenerColorCoropletico(valor);
                const isSelected = deptoSeleccionado === dep.nombre;
                const isHovered = deptoHovered === dep.nombre;

                return (
                  <path
                    key={`path-${dep.codigo}-${idx}`}
                    d={dep.pathSvg}
                    fill={fillColor}
                    stroke={isSelected ? '#1e40af' : isHovered ? '#3b82f6' : '#cbd5e1'}
                    strokeWidth={isSelected ? '2' : '0.8'}
                    className="cursor-pointer transition-colors duration-150"
                    onClick={() => setDeptoSeleccionado(dep.nombre)}
                    onMouseEnter={() => setDeptoHovered(dep.nombre)}
                    onMouseLeave={() => setDeptoHovered(null)}
                  />
                );
              })}

              {/* CAPA 2: Etiquetas numéricas únicas por departamento */}
              {departamentosUnicosParaEtiquetas.map(dep => {
                const canonico = homologarNombreDepartamento(dep.nombre);
                const info = datosPorDepto[canonico];
                if (!info || info.empresas.length === 0) return null;

                let valor = 0;
                if (metricaCoropletica === 'EMPRESAS') valor = info.empresas.length;
                else if (metricaCoropletica === 'FLOTA') valor = info.totalVehiculos;
                else if (metricaCoropletica === 'TSV') valor = info.tsvPromedio;
                else valor = info.totalInfracciones;

                // Buscamos la coordenada exacta en píxeles según el diccionario
                const nombreBusqueda = dep.nombre.toUpperCase();
                const pos = POSICIONES_ETIQUETAS[nombreBusqueda] || { x: 300, y: 360 };
                const isSelected = deptoSeleccionado === dep.nombre;

                return (
                  <g 
                    key={`label-${dep.codigo}`} 
                    className="pointer-events-none" 
                    transform={`translate(${pos.x}, ${pos.y})`}
                  >
                    {isSelected && (
                      <circle
                        cx={0}
                        cy={0}
                        r={15}
                        fill="none"
                        stroke="#1d4ed8"
                        strokeWidth="1.5"
                        strokeDasharray="2 2"
                      />
                    )}
                    <circle
                      cx={0}
                      cy={0}
                      r={10}
                      fill="white"
                      fillOpacity="0.95"
                      stroke="#94a3b8"
                      strokeWidth="0.8"
                    />
                    <text
                      x={0}
                      y={0}
                      textAnchor="middle"
                      dominantBaseline="central"
                      className="text-[9px] font-mono font-bold fill-slate-900"
                    >
                      {metricaCoropletica === 'TSV' ? valor.toFixed(1) : valor}
                    </text>
                  </g>
                );
              })}
            </svg>

            {/* Tooltip flotante */}
            {deptoHovered && datosPorDepto[homologarNombreDepartamento(deptoHovered)] && (
              <div className="absolute top-3 left-3 bg-slate-900/90 text-white p-2.5 rounded-lg shadow-lg text-xs pointer-events-none border border-slate-700">
                <div className="font-bold text-sm text-blue-300">
                  {deptoHovered}
                </div>
                <div className="mt-1 pt-1 border-t border-slate-700/80 space-y-0.5 font-mono text-[11px]">
                  <div>Empresas: <strong>{datosPorDepto[homologarNombreDepartamento(deptoHovered)].empresas.length}</strong></div>
                  <div>Flota Vehicular: <strong>{datosPorDepto[homologarNombreDepartamento(deptoHovered)].totalVehiculos}</strong></div>
                  <div>TSV Promedio: <strong>{datosPorDepto[homologarNombreDepartamento(deptoHovered)].tsvPromedio.toFixed(2)}</strong></div>
                  <div>Infracciones: <strong>{datosPorDepto[homologarNombreDepartamento(deptoHovered)].totalInfracciones}</strong></div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Panel Lateral de Detalle */}
        <div className="lg:col-span-5 space-y-5">
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
            <div className="flex items-start justify-between pb-3 border-b border-slate-100">
              <div>
                <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
                  DANE: {deptoActivo.codigoDpto}
                </span>
                <h3 className="text-base font-bold text-slate-900 mt-1">
                  {deptoActivo.nombreComun}
                </h3>
              </div>
              <div className="text-right">
                <span className="text-2xl font-black font-mono text-blue-900 block">
                  {deptoActivo.empresas.length}
                </span>
                <span className="text-[11px] text-slate-500 font-medium">empresas en sede</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-[11px] text-slate-500 block">Flota Total Reportada:</span>
                <span className="text-sm font-bold font-mono text-slate-900 block mt-0.5">
                  {deptoActivo.totalVehiculos} vehículos
                </span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-[11px] text-slate-500 block">Censo de Conductores:</span>
                <span className="text-sm font-bold font-mono text-slate-900 block mt-0.5">
                  {deptoActivo.totalConductores} colaboradores
                </span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-[11px] text-slate-500 block">TSV Promedio:</span>
                <span className="text-sm font-bold font-mono text-blue-900 block mt-0.5">
                  {deptoActivo.tsvPromedio.toFixed(2)} por 1M km
                </span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-[11px] text-slate-500 block">Comparendos Detectados:</span>
                <span className="text-sm font-bold font-mono text-amber-900 block mt-0.5">
                  {deptoActivo.totalInfracciones} infracciones
                </span>
              </div>
            </div>

            {deptoActivo.discrepancias > 0 && (
              <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-red-900 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
                <span>
                  Hay <strong>{deptoActivo.discrepancias} empresa(s)</strong> con discrepancia en su nivel PESV en este departamento.
                </span>
              </div>
            )}
          </div>

          {/* Lista de Empresas en este Departamento */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-3">
            <h4 className="text-xs font-bold text-slate-900 flex items-center justify-between pb-2 border-b border-slate-100">
              <span>Organizaciones en {deptoActivo.nombreComun}</span>
              <span className="font-mono text-slate-500 font-normal">
                {deptoActivo.empresas.length} organizaciones
              </span>
            </h4>

            {deptoActivo.empresas.length === 0 ? (
              <div className="py-6 text-center text-xs text-slate-400">
                No hay empresas registradas con sede en este departamento.
              </div>
            ) : (
              <div className="max-h-[260px] overflow-y-auto space-y-2 pr-1">
                {deptoActivo.empresas.map(emp => (
                  <div
                    key={emp.id}
                    onClick={() => onSeleccionarEmpresa(emp)}
                    className="p-2.5 rounded-lg border border-slate-200 hover:border-blue-300 hover:bg-blue-50/40 transition-colors cursor-pointer flex items-center justify-between text-xs"
                  >
                    <div>
                      <div className="font-semibold text-slate-900 truncate max-w-[220px]">
                        {emp.razonSocial}
                      </div>
                      <div className="text-[10px] text-slate-500 font-mono">
                        NIT: {emp.numeroDocumento} · {emp.municipio}
                      </div>
                    </div>
                    <div className="text-right font-mono shrink-0">
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-800 font-medium">
                        {emp.clasificacionCalculada}
                      </span>
                      <div className="text-[10px] text-slate-500 mt-0.5">
                        {emp.flota.totalVehiculos} veh
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};