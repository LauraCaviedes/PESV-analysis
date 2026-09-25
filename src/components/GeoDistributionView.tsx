import React, { useState } from 'react';
import { MapPin, Navigation, Building2, Search, Filter } from 'lucide-react';
import { EmpresaPESV } from '../types/pesv';
import { DEPARTAMENTOS_COLOMBIA, proyectarCoordsSVG } from '../utils/colombiaGeo';

interface GeoDistributionViewProps {
  empresas: EmpresaPESV[];
  onSeleccionarEmpresa: (empresa: EmpresaPESV) => void;
}

export const GeoDistributionView: React.FC<GeoDistributionViewProps> = ({
  empresas,
  onSeleccionarEmpresa,
}) => {
  const [deptoSeleccionado, setDeptoSeleccionado] = useState<string | null>(null);
  const [metricaBurbuja, setMetricaBurbuja] = useState<'EMPRESAS' | 'FLOTA' | 'SINIESTROS'>('EMPRESAS');
  const [busquedaDepto, setBusquedaDepto] = useState<string>('');

  // Agrupar empresas por Departamento
  const conteosPorDepto = empresas.reduce((acc, e) => {
    const dep = (e.departamento || 'BOGOTÁ, D.C.').toUpperCase().trim();
    if (!acc[dep]) {
      acc[dep] = {
        nombre: dep,
        empresas: [],
        totalVehiculos: 0,
        totalConductores: 0,
        totalSiniestros: 0,
      };
    }
    acc[dep].empresas.push(e);
    acc[dep].totalVehiculos += e.flota.totalVehiculos;
    acc[dep].totalConductores += e.conductores.totalConductoresNorma;
    acc[dep].totalSiniestros += Math.round((e.indicadores.tsvTotal * e.indicadores.kmRecorridosTrimestre) / 1000000);
    return acc;
  }, {} as Record<string, { nombre: string; empresas: EmpresaPESV[]; totalVehiculos: number; totalConductores: number; totalSiniestros: number }>);

  // Lista de departamentos ordenada por cantidad de empresas
  const deptosOrdenados = Object.values(conteosPorDepto).sort(
    (a, b) => b.empresas.length - a.empresas.length
  );

  const deptosFiltrados = deptosOrdenados.filter(d =>
    d.nombre.toLowerCase().includes(busquedaDepto.toLowerCase())
  );

  const maxEmpresas = Math.max(...deptosOrdenados.map(d => d.empresas.length), 1);
  const maxFlota = Math.max(...deptosOrdenados.map(d => d.totalVehiculos), 1);

  // Departamento actualmente enfocado
  const deptoActivo = deptoSeleccionado
    ? conteosPorDepto[deptoSeleccionado] || null
    : deptosOrdenados[0] || null;

  return (
    <div className="space-y-6">
      {/* Header explicativo */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-blue-600" />
              Distribución Territorial de Empresas y Siniestralidad Vial
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Visualización geoespacial de centros operativos en Colombia (reproducción del análisis Seaborn y centroides EPSG:4326 del código fuente).
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-500">Métrica del Mapa:</span>
            <div className="flex rounded-lg bg-slate-100 p-0.5 border border-slate-200">
              <button
                onClick={() => setMetricaBurbuja('EMPRESAS')}
                className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-colors cursor-pointer ${
                  metricaBurbuja === 'EMPRESAS'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                N° Empresas
              </button>
              <button
                onClick={() => setMetricaBurbuja('FLOTA')}
                className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-colors cursor-pointer ${
                  metricaBurbuja === 'FLOTA'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Flota Vehicular
              </button>
              <button
                onClick={() => setMetricaBurbuja('SINIESTROS')}
                className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-colors cursor-pointer ${
                  metricaBurbuja === 'SINIESTROS'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Siniestros
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Grid: Mapa Interactivo a la izquierda + Panel de Detalle a la derecha */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Mapa SVG interactivo */}
        <div className="lg:col-span-7 bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col items-center">
          <div className="w-full flex items-center justify-between text-xs text-slate-500 mb-2">
            <span className="font-semibold text-slate-700">Territorio Nacional de Colombia</span>
            <span className="font-mono text-[11px]">EPSG:4326 · WGS84</span>
          </div>

          <div className="relative w-full max-w-[480px] aspect-[6/7] bg-slate-50 rounded-xl border border-slate-200 p-3 overflow-hidden flex items-center justify-center">
            <svg
              viewBox="0 0 600 700"
              className="w-full h-full select-none"
              style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.04))' }}
            >
              {/* Contorno simplificado y elegante de Colombia */}
              <path
                d="M 180,60 
                   Q 220,40 280,30 
                   Q 350,20 400,50 
                   Q 440,70 420,110 
                   Q 410,140 430,170 
                   Q 470,200 450,250 
                   Q 430,300 480,330 
                   Q 510,380 470,440 
                   Q 430,490 400,550 
                   Q 380,620 340,680 
                   Q 310,640 280,590 
                   Q 240,540 210,480 
                   Q 170,430 150,380 
                   Q 120,330 140,280 
                   Q 160,230 150,180 
                   Q 140,130 180,60 Z"
                fill="#f1f5f9"
                stroke="#cbd5e1"
                strokeWidth="2"
                strokeDasharray="4 2"
              />

              {/* Burbujas geolocalizadas por departamento */}
              {DEPARTAMENTOS_COLOMBIA.map(dep => {
                const info = conteosPorDepto[dep.nombre.toUpperCase()];
                const count = info ? info.empresas.length : 0;
                const { x, y } = proyectarCoordsSVG(dep.lat, dep.lon, 600, 700);

                // Si no hay empresas en este depto, mostrar punto tenue
                if (count === 0) {
                  return (
                    <circle
                      key={dep.codigo}
                      cx={x}
                      cy={y}
                      r={3}
                      fill="#cbd5e1"
                      opacity="0.5"
                    />
                  );
                }

                // Cálculo de radio y color según métrica (simulando paleta 'viridis' de Seaborn solicitada)
                let r = 8;
                let valorMetrica = count;
                if (metricaBurbuja === 'EMPRESAS') {
                  r = 8 + (count / maxEmpresas) * 26;
                  valorMetrica = count;
                } else if (metricaBurbuja === 'FLOTA') {
                  const flota = info.totalVehiculos;
                  r = 8 + (flota / maxFlota) * 26;
                  valorMetrica = flota;
                } else {
                  r = 8 + Math.min(info.totalSiniestros * 3, 28);
                  valorMetrica = info.totalSiniestros;
                }

                const isSelected = deptoActivo?.nombre === dep.nombre.toUpperCase();

                return (
                  <g
                    key={dep.codigo}
                    className="cursor-pointer transition-transform"
                    onClick={() => setDeptoSeleccionado(dep.nombre.toUpperCase())}
                  >
                    {/* Anillo de pulso si está seleccionado */}
                    {isSelected && (
                      <circle
                        cx={x}
                        cy={y}
                        r={r + 6}
                        fill="none"
                        stroke="#2563eb"
                        strokeWidth="2"
                        opacity="0.6"
                      />
                    )}

                    <circle
                      cx={x}
                      cy={y}
                      r={r}
                      fill={isSelected ? '#2563eb' : '#0e3d8b'}
                      opacity="0.75"
                      stroke="#ffffff"
                      strokeWidth="1.5"
                    />

                    {/* Etiqueta de texto si tiene varias empresas */}
                    {count >= 1 && (
                      <text
                        x={x}
                        y={y + 3}
                        textAnchor="middle"
                        fill="#ffffff"
                        fontSize="9"
                        fontWeight="bold"
                        fontFamily="monospace"
                      >
                        {count}
                      </text>
                    )}

                    {/* Nombre del departamento flotante */}
                    <text
                      x={x}
                      y={y - r - 4}
                      textAnchor="middle"
                      fill="#334155"
                      fontSize="9"
                      fontWeight={isSelected ? 'bold' : 'normal'}
                    >
                      {dep.capital}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>

          <div className="w-full mt-3 flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
            <span>Haz clic en un círculo para ver las empresas de esa región</span>
            <div className="flex items-center gap-2 font-mono text-[10px]">
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-[#0e3d8b]"></span> Concentración PESV
              </span>
            </div>
          </div>
        </div>

        {/* Panel lateral: Detalle de Departamento y Lista de Empresas */}
        <div className="lg:col-span-5 space-y-4">
          {/* Tarjeta de Resumen del Departamento Seleccionado */}
          {deptoActivo ? (
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <span className="text-[10px] font-mono text-blue-600 font-bold uppercase">
                    Departamento Seleccionado
                  </span>
                  <h3 className="text-base font-bold text-slate-900 mt-0.5">
                    {deptoActivo.nombre}
                  </h3>
                </div>
                <span className="text-xs font-mono font-bold px-2 py-1 bg-blue-50 text-blue-800 rounded-lg">
                  {deptoActivo.empresas.length} empresas
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2 py-3 text-xs">
                <div className="p-2.5 bg-slate-50 rounded-lg text-center">
                  <span className="text-[10px] text-slate-500 block">Flota Total</span>
                  <span className="text-sm font-mono font-bold text-slate-800 tabular-nums">
                    {deptoActivo.totalVehiculos}
                  </span>
                </div>
                <div className="p-2.5 bg-slate-50 rounded-lg text-center">
                  <span className="text-[10px] text-slate-500 block">Conductores</span>
                  <span className="text-sm font-mono font-bold text-slate-800 tabular-nums">
                    {deptoActivo.totalConductores}
                  </span>
                </div>
                <div className="p-2.5 bg-slate-50 rounded-lg text-center">
                  <span className="text-[10px] text-slate-500 block">Siniestros</span>
                  <span className="text-sm font-mono font-bold text-red-700 tabular-nums">
                    {deptoActivo.totalSiniestros}
                  </span>
                </div>
              </div>

              {/* Lista de Empresas en este Departamento */}
              <div className="mt-2 space-y-2">
                <span className="text-xs font-bold text-slate-700 block">
                  Empresas en {deptoActivo.nombre}:
                </span>
                <div className="max-h-[300px] overflow-y-auto space-y-2 pr-1">
                  {deptoActivo.empresas.map(emp => (
                    <div
                      key={emp.id}
                      onClick={() => onSeleccionarEmpresa(emp)}
                      className="p-2.5 rounded-lg border border-slate-100 hover:border-blue-300 hover:bg-blue-50/30 transition-colors cursor-pointer text-xs"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-slate-900 truncate max-w-[200px]">
                          {emp.razonSocial}
                        </span>
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-100 text-slate-700">
                          {emp.clasificacionCalculada}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-500 mt-1 flex justify-between">
                        <span>{emp.municipio}</span>
                        <span className="font-mono">TSV: {emp.indicadores.tsvTotal.toFixed(2)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs text-center text-slate-400 text-xs">
              Selecciona un departamento en el mapa
            </div>
          )}

          {/* Ranking General de Departamentos */}
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-xs font-bold text-slate-800">
                Ranking Territorial por Cantidad de Sedes
              </h4>
              <span className="text-[10px] font-mono text-slate-400">
                {deptosOrdenados.length} territorios
              </span>
            </div>

            <div className="space-y-1.5 max-h-[160px] overflow-y-auto pr-1 text-xs">
              {deptosOrdenados.slice(0, 8).map(d => (
                <button
                  key={d.nombre}
                  onClick={() => setDeptoSeleccionado(d.nombre)}
                  className={`w-full flex items-center justify-between p-1.5 rounded transition-colors text-left cursor-pointer ${
                    deptoActivo?.nombre === d.nombre ? 'bg-blue-50 font-bold text-blue-900' : 'hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <span className="truncate">{d.nombre}</span>
                  <span className="font-mono tabular-nums font-semibold">{d.empresas.length} emp.</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
