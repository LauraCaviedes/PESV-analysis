import React, { useState, useEffect, useMemo } from 'react';
import {
  MapPin,
  Building2,
  Search,
  Filter,
  Layers,
  TrendingDown,
  AlertTriangle,
  Car,
  Users,
  Compass,
  FileSpreadsheet,
  Loader2,
} from 'lucide-react';
import { EmpresaPESV } from '../types/pesv';
import {
  DEPARTAMENTOS_COLOMBIA,
  homologarNombreDepartamento,
  geojsonCoordsToSvgPath,
  proyectarCoordsSVG,
} from '../utils/colombiaGeo';

interface GeoDistributionViewProps {
  empresas: EmpresaPESV[];
  onSeleccionarEmpresa: (empresa: EmpresaPESV) => void;
}

interface DepartamentoGeoFeature {
  nombreDpt: string;
  codigoDpto: string;
  svgPaths: string[];
  centroidLat: number;
  centroidLon: number;
}

export const GeoDistributionView: React.FC<GeoDistributionViewProps> = ({
  empresas,
  onSeleccionarEmpresa,
}) => {
  const [geoData, setGeoData] = useState<any | null>(null);
  const [cargandoGeo, setCargandoGeo] = useState<boolean>(true);
  const [deptoSeleccionado, setDeptoSeleccionado] = useState<string>('SANTAFE DE BOGOTA D.C');
  const [deptoHovered, setDeptoHovered] = useState<string | null>(null);
  const [metricaCoropletica, setMetricaCoropletica] = useState<
    'EMPRESAS' | 'FLOTA' | 'TSV' | 'INFRACCIONES'
  >('EMPRESAS');
  const [busquedaDepto, setBusquedaDepto] = useState<string>('');

  // 1. Cargar el GeoJSON oficial de Colombia (colombia_map.geojson generado desde santiblanko mpio.json)
  useEffect(() => {
    let cancelado = false;
    setCargandoGeo(true);

    fetch('/colombia_map.geojson')
      .then(res => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then(json => {
        if (!cancelado) {
          setGeoData(json);
          setCargandoGeo(false);
        }
      })
      .catch(err => {
        console.warn('Carga de GeoJSON local:', err);
        if (!cancelado) {
          setCargandoGeo(false);
        }
      });

    return () => {
      cancelado = true;
    };
  }, []);

  // 2. Agrupar y Homologar empresas por Departamento según la propiedad NOMBRE_DPT
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

    // Inicializar con la lista maestra de departamentos
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

    // Agregar empresas homologadas
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

    // Calcular promedios
    for (const k of Object.keys(mapa)) {
      const item = mapa[k];
      if (item.empresas.length > 0) {
        const sumaTsv = item.empresas.reduce((acc, e) => acc + e.indicadores.tsvTotal, 0);
        item.tsvPromedio = Math.round((sumaTsv / item.empresas.length) * 100) / 100;
      }
    }

    return mapa;
  }, [empresas]);

  // 3. Procesar las Geometrías GeoJSON por NOMBRE_DPT
  const featuresDepartamentos = useMemo(() => {
    if (!geoData || !geoData.features) return [];

    const agrupados: Record<
      string,
      {
        nombreDpt: string;
        codigoDpto: string;
        svgPaths: string[];
        lats: number[];
        lons: number[];
      }
    > = {};

    for (const feat of geoData.features) {
      const props = feat.properties || {};
      const dptNombre = (props.NOMBRE_DPT || props.NOMBRE_DEPTO || props.dpto || '').toString().trim().toUpperCase();
      const canonico = homologarNombreDepartamento(dptNombre);
      const cod = (props.DPTO || props.COD_DPTO || '').toString().trim();

      if (!agrupados[canonico]) {
        agrupados[canonico] = {
          nombreDpt: canonico,
          codigoDpto: cod,
          svgPaths: [],
          lats: [],
          lons: [],
        };
      }

      const pathStr = geojsonCoordsToSvgPath(feat.geometry, 600, 720);
      if (pathStr) {
        agrupados[canonico].svgPaths.push(pathStr);
      }
    }

    const resultado: DepartamentoGeoFeature[] = Object.values(agrupados).map(d => {
      // Buscar centroide en DEPARTAMENTOS_COLOMBIA
      const base = DEPARTAMENTOS_COLOMBIA.find(
        dep => homologarNombreDepartamento(dep.nombre) === d.nombreDpt
      );

      return {
        nombreDpt: d.nombreDpt,
        codigoDpto: d.codigoDpto || base?.codigo || '00',
        svgPaths: d.svgPaths,
        centroidLat: base?.lat || 4.6,
        centroidLon: base?.lon || -74.1,
      };
    });

    return resultado;
  }, [geoData]);

  // 4. Rangos de la métrica activa para la escala de color Coroplética
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

  // Función de escala de color Coroplética (Escala Azul/Índigo/Púrpura de alta legibilidad)
  const obtenerColorCoropletico = (valor: number) => {
    if (valor === 0) return '#f1f5f9'; // Sin datos (slate-100)
    const ratio = Math.min(1, Math.max(0, (valor - minMetrica) / (maxMetrica - minMetrica || 1)));

    if (metricaCoropletica === 'TSV' || metricaCoropletica === 'INFRACCIONES') {
      // Escala cálida de riesgo para siniestralidad e infracciones (Ámbar a Rojo oscuro)
      if (ratio < 0.25) return '#fef3c7'; // ámbar muy claro
      if (ratio < 0.5) return '#fde047';  // amarillo
      if (ratio < 0.75) return '#f97316'; // naranja
      return '#dc2626'; // rojo oscuro
    }

    // Escala fría para volumen de empresas y flota (Celeste a Azul Marino)
    if (ratio < 0.2) return '#e0f2fe';
    if (ratio < 0.4) return '#93c5fd';
    if (ratio < 0.7) return '#3b82f6';
    if (ratio < 0.9) return '#1d4ed8';
    return '#1e3a8a';
  };

  // Departamento actualmente enfocado en el panel derecho
  const deptoActivo = useMemo(() => {
    return (
      datosPorDepto[deptoSeleccionado] ||
      Object.values(datosPorDepto).find(d => d.empresas.length > 0) ||
      Object.values(datosPorDepto)[0]
    );
  }, [datosPorDepto, deptoSeleccionado]);

  // Lista ordenada de departamentos para el selector y ranking
  const deptosRanking = useMemo(() => {
    return Object.values(datosPorDepto)
      .filter(d => d.nombreComun.toLowerCase().includes(busquedaDepto.toLowerCase()))
      .sort((a, b) => b.empresas.length - a.empresas.length);
  }, [datosPorDepto, busquedaDepto]);

  return (
    <div className="space-y-6">
      {/* Header del Mapa Territorial */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-800 border border-blue-200">
                GeoJSON Colombia · EPSG:4326 (WGS84)
              </span>
              <span className="text-xs text-slate-500 font-semibold">
                Homologación Territorial por NOMBRE_DPT
              </span>
            </div>
            <h2 className="text-base font-bold text-slate-900 mt-1 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-blue-600" />
              Mapa Coroplético Territorial de Seguridad Vial
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Consumo dinámico del archivo GeoJSON de Colombia con mapeo de polígonos departamentales y vinculación analítica de organizaciones.
            </p>
          </div>

          {/* Selector de Métrica Coroplética */}
          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-500 font-semibold">Capa Coroplética:</span>
            <div className="flex rounded-lg bg-slate-100 p-0.5 border border-slate-200">
              <button
                onClick={() => setMetricaCoropletica('EMPRESAS')}
                className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-colors cursor-pointer ${
                  metricaCoropletica === 'EMPRESAS'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                N° Empresas
              </button>
              <button
                onClick={() => setMetricaCoropletica('FLOTA')}
                className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-colors cursor-pointer ${
                  metricaCoropletica === 'FLOTA'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Flota
              </button>
              <button
                onClick={() => setMetricaCoropletica('TSV')}
                className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-colors cursor-pointer ${
                  metricaCoropletica === 'TSV'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                TSV Promedio
              </button>
              <button
                onClick={() => setMetricaCoropletica('INFRACCIONES')}
                className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-colors cursor-pointer ${
                  metricaCoropletica === 'INFRACCIONES'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Infracciones
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Grid: Mapa Coroplético (Izquierda) + Panel de Detalle Departamental (Derecha) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Mapa SVG Coroplético */}
        <div className="lg:col-span-7 bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col items-center">
          <div className="w-full flex items-center justify-between text-xs text-slate-500 mb-2">
            <span className="font-semibold text-slate-700 flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-indigo-600" />
              Sombreado Coroplético Departamental
            </span>
            <span className="font-mono text-[11px] text-slate-400">
              {featuresDepartamentos.length > 0 ? 'GeoJSON Activo' : 'Cargando geometrías...'}
            </span>
          </div>

          <div className="relative w-full max-w-[500px] aspect-[6/7] bg-slate-50 rounded-xl border border-slate-200 p-2 overflow-hidden flex items-center justify-center">
            {cargandoGeo && featuresDepartamentos.length === 0 ? (
              <div className="flex flex-col items-center gap-2 text-slate-400 text-xs">
                <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
                <span>Renderizando polígonos GeoJSON de Colombia...</span>
              </div>
            ) : (
              <svg
                viewBox="0 0 600 720"
                className="w-full h-full select-none"
                style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.04))' }}
              >
                {/* 1. Polígonos de Municipios/Departamentos del GeoJSON */}
                {featuresDepartamentos.map(feat => {
                  const info = datosPorDepto[feat.nombreDpt];
                  let valor = 0;
                  if (info) {
                    if (metricaCoropletica === 'EMPRESAS') valor = info.empresas.length;
                    else if (metricaCoropletica === 'FLOTA') valor = info.totalVehiculos;
                    else if (metricaCoropletica === 'TSV') valor = info.tsvPromedio;
                    else valor = info.totalInfracciones;
                  }

                  const fillColor = obtenerColorCoropletico(valor);
                  const isSelected = deptoSeleccionado === feat.nombreDpt;
                  const isHovered = deptoHovered === feat.nombreDpt;

                  return (
                    <g
                      key={feat.nombreDpt}
                      className="cursor-pointer transition-all duration-200"
                      onClick={() => setDeptoSeleccionado(feat.nombreDpt)}
                      onMouseEnter={() => setDeptoHovered(feat.nombreDpt)}
                      onMouseLeave={() => setDeptoHovered(null)}
                    >
                      {feat.svgPaths.map((d, pIdx) => (
                        <path
                          key={pIdx}
                          d={d}
                          fill={fillColor}
                          stroke={isSelected ? '#1e40af' : isHovered ? '#3b82f6' : '#cbd5e1'}
                          strokeWidth={isSelected ? '2' : isHovered ? '1.5' : '0.6'}
                          className="transition-colors"
                        />
                      ))}
                    </g>
                  );
                })}

                {/* 2. Marcadores y Etiquetas sobre los centroides de los departamentos con empresas */}
                {DEPARTAMENTOS_COLOMBIA.map(dep => {
                  const canonico = homologarNombreDepartamento(dep.nombre);
                  const info = datosPorDepto[canonico];
                  const count = info ? info.empresas.length : 0;
                  if (count === 0) return null;

                  const { x, y } = proyectarCoordsSVG(dep.lat, dep.lon, 600, 720);
                  const isSelected = deptoSeleccionado === canonico;

                  return (
                    <g
                      key={dep.codigo}
                      className="cursor-pointer pointer-events-none"
                    >
                      {isSelected && (
                        <circle
                          cx={x}
                          cy={y}
                          r={16}
                          fill="none"
                          stroke="#2563eb"
                          strokeWidth="2"
                          strokeDasharray="3 2"
                        />
                      )}
                      <circle
                        cx={x}
                        cy={y}
                        r={count > 5 ? 10 : 8}
                        fill="#1e293b"
                        stroke="#ffffff"
                        strokeWidth="1.5"
                      />
                      <text
                        x={x}
                        y={y + 3.5}
                        textAnchor="middle"
                        className="text-[9px] font-mono font-bold fill-white"
                      >
                        {count}
                      </text>
                    </g>
                  );
                })}
              </svg>
            )}

            {/* Tooltip flotante al pasar el mouse por un departamento */}
            {deptoHovered && datosPorDepto[deptoHovered] && (
              <div className="absolute top-3 left-3 bg-slate-900/90 text-white p-2.5 rounded-lg shadow-lg text-xs pointer-events-none border border-slate-700">
                <div className="font-bold text-sm text-blue-300">
                  {datosPorDepto[deptoHovered].nombreComun}
                </div>
                <div className="text-[10px] text-slate-400 font-mono">
                  DANE: {datosPorDepto[deptoHovered].codigoDpto} · NOMBRE_DPT: {deptoHovered}
                </div>
                <div className="mt-1 pt-1 border-t border-slate-700/80 space-y-0.5 font-mono text-[11px]">
                  <div>Empresas: <strong>{datosPorDepto[deptoHovered].empresas.length}</strong></div>
                  <div>Flota Vehicular: <strong>{datosPorDepto[deptoHovered].totalVehiculos}</strong></div>
                  <div>TSV Promedio: <strong>{datosPorDepto[deptoHovered].tsvPromedio.toFixed(2)}</strong></div>
                  <div>Infracciones: <strong>{datosPorDepto[deptoHovered].totalInfracciones}</strong></div>
                </div>
              </div>
            )}
          </div>

          {/* Barra de Escala de Color Coroplética */}
          <div className="w-full max-w-[500px] mt-4 flex items-center justify-between text-xs text-slate-500">
            <span className="font-mono text-[11px]">Baja Intensidad ({minMetrica})</span>
            <div className="flex-1 mx-3 h-2.5 rounded-full overflow-hidden flex border border-slate-200">
              {metricaCoropletica === 'TSV' || metricaCoropletica === 'INFRACCIONES' ? (
                <>
                  <div className="flex-1 bg-[#fef3c7]" />
                  <div className="flex-1 bg-[#fde047]" />
                  <div className="flex-1 bg-[#f97316]" />
                  <div className="flex-1 bg-[#dc2626]" />
                </>
              ) : (
                <>
                  <div className="flex-1 bg-[#e0f2fe]" />
                  <div className="flex-1 bg-[#93c5fd]" />
                  <div className="flex-1 bg-[#3b82f6]" />
                  <div className="flex-1 bg-[#1d4ed8]" />
                  <div className="flex-1 bg-[#1e3a8a]" />
                </>
              )}
            </div>
            <span className="font-mono text-[11px] font-bold text-slate-800">
              Alta ({maxMetrica})
            </span>
          </div>
        </div>

        {/* Panel Lateral: Detalle del Departamento Seleccionado */}
        <div className="lg:col-span-5 space-y-5">
          {/* Tarjeta de Resumen Departamental */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
            <div className="flex items-start justify-between pb-3 border-b border-slate-100">
              <div>
                <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
                  DANE: {deptoActivo.codigoDpto}
                </span>
                <h3 className="text-base font-bold text-slate-900 mt-1">
                  {deptoActivo.nombreComun}
                </h3>
                <span className="text-[11px] font-mono text-slate-400 block">
                  Propiedad GeoJSON: {deptoActivo.nombreDpt}
                </span>
              </div>

              <div className="text-right">
                <span className="text-2xl font-black font-mono text-blue-900 block">
                  {deptoActivo.empresas.length}
                </span>
                <span className="text-[11px] text-slate-500 font-medium">empresas en sede</span>
              </div>
            </div>

            {/* KPIs Clave del Departamento */}
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

            {/* Discrepancias en el departamento */}
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
