import React, { useState } from 'react';
import {
  Calculator,
  Info,
  Sliders,
  TrendingDown,
  TrendingUp,
  AlertCircle,
  FileSpreadsheet,
} from 'lucide-react';
import { EmpresaPESV } from '../types/pesv';
import { calcularMetricaConIncertidumbre } from '../utils/pesvCalculations';

interface IndicatorsViewProps {
  empresas: EmpresaPESV[];
  onSeleccionarEmpresa: (empresa: EmpresaPESV) => void;
}

interface DefinicionIndicador {
  id: string;
  numero: number;
  nombre: string;
  codigo: string;
  formula: string;
  descripcionVariables: string;
  frecuencia: string;
  aplicaA: ('BÁSICO' | 'ESTÁNDAR' | 'AVANZADO')[];
  unidad: string;
  criterioAceptable: string;
  extractorValor: (e: EmpresaPESV) => number;
  extractorDelta: (e: EmpresaPESV) => number;
}

export const IndicatorsView: React.FC<IndicatorsViewProps> = ({
  empresas,
  onSeleccionarEmpresa,
}) => {
  const [indicadorSeleccionadoId, setIndicadorSeleccionadoId] = useState<string>('ind1');
  const [orden, setOrden] = useState<'desc' | 'asc'>('desc');

  const definiciones: DefinicionIndicador[] = [
    {
      id: 'ind1',
      numero: 1,
      nombre: 'Tasa de Siniestros Viales por Nivel de Pérdida',
      codigo: 'TSV(n)',
      formula: 'TSV(n) = SV(tn) * 1.000.000 / km(t)',
      descripcionVariables: 'SV(tn): Siniestros viales por trimestre por nivel de pérdida (fatalidades, graves >30d, leves ≤30d, choques simples). K: 1.000.000 km. km(t): Kilómetros recorridos por la flota.',
      frecuencia: 'Trimestral y acumulado año',
      aplicaA: ['BÁSICO', 'ESTÁNDAR', 'AVANZADO'],
      unidad: 'siniestros / 1M km',
      criterioAceptable: '< 2.0 por 1M km',
      extractorValor: e => e.indicadores.tsvTotal,
      extractorDelta: e => e.deltasIncertidumbre.tsvTotal || 0,
    },
    {
      id: 'ind2',
      numero: 2,
      nombre: 'Costos de Siniestros Viales por Nivel de Pérdida',
      codigo: '$SV(n)',
      formula: '$SV(n) = CDSV(tn) + CISV(tn)',
      descripcionVariables: 'CDSV(tn): Costos directos (daños, indemnizaciones, deducibles). CISV(tn): Costos indirectos (tiempos muertos, reemplazos, lucro cesante).',
      frecuencia: 'Trimestral y acumulado año',
      aplicaA: ['ESTÁNDAR', 'AVANZADO'],
      unidad: 'Millones COP',
      criterioAceptable: 'Tendencia descendente anual',
      extractorValor: e => e.indicadores.costosTotales,
      extractorDelta: () => 5.0,
    },
    {
      id: 'ind3',
      numero: 3,
      nombre: 'Riesgos de Seguridad Vial Identificados y Gestión',
      codigo: 'RSVI / GRV',
      formula: 'RSVI = RI(fa) - RI(ia) | GRV = RVA(fa) - RVA(ia)',
      descripcionVariables: 'RI: Riesgos identificados al final vs inicio de año en matriz. RVA: Riesgos con valoración alta/crítica tratados.',
      frecuencia: 'Anual',
      aplicaA: ['BÁSICO', 'ESTÁNDAR', 'AVANZADO'],
      unidad: 'riesgos',
      criterioAceptable: 'GRV < 0 (reducción de riesgos altos)',
      extractorValor: e => e.indicadores.grv,
      extractorDelta: () => 1.0,
    },
    {
      id: 'ind4',
      numero: 4,
      nombre: 'Cumplimiento de Metas del PESV',
      codigo: 'CM PESV',
      formula: 'CM PESV = (MA(t) / TM(t)) * 100',
      descripcionVariables: 'MA(t): Metas alcanzadas o logradas en el PESV en el trimestre. TM(t): Total de metas definidas para el periodo.',
      frecuencia: 'Trimestral y acumulado año',
      aplicaA: ['BÁSICO', 'ESTÁNDAR', 'AVANZADO'],
      unidad: '%',
      criterioAceptable: '≥ 85%',
      extractorValor: e => e.indicadores.cmPesv,
      extractorDelta: e => e.deltasIncertidumbre.cmPesv || 0,
    },
    {
      id: 'ind5',
      numero: 5,
      nombre: 'Cumplimiento del Plan Anual de Trabajo',
      codigo: 'CPlan PESV',
      formula: 'CPlan PESV = (AEPlan(t) / APPlan(t)) * 100',
      descripcionVariables: 'AEPlan(t): Actividades ejecutadas del plan de trabajo anual. APPlan(t): Actividades programadas en el cronograma.',
      frecuencia: 'Trimestral y acumulado año',
      aplicaA: ['BÁSICO', 'ESTÁNDAR', 'AVANZADO'],
      unidad: '%',
      criterioAceptable: '≥ 90%',
      extractorValor: e => e.indicadores.cPlanPesv,
      extractorDelta: e => e.deltasIncertidumbre.cPlanPesv || 0,
    },
    {
      id: 'ind6',
      numero: 6,
      nombre: '% Exceso de Jornadas Laborales de Conductores',
      codigo: '%EJLC',
      formula: '%EJL = (#EJD / #SDT) * 100',
      descripcionVariables: '#EJD: Número de excesos de jornada diaria de trabajo (>10 horas continuas). #SDT: Sumatoria total de días trabajados por conductores.',
      frecuencia: 'Mensual y acumulado año',
      aplicaA: ['BÁSICO', 'ESTÁNDAR', 'AVANZADO'],
      unidad: '%',
      criterioAceptable: '≤ 2%',
      extractorValor: e => e.indicadores.porcExcesoJornada,
      extractorDelta: e => e.deltasIncertidumbre.porcExcesoJornada || 0,
    },
    {
      id: 'ind7',
      numero: 7,
      nombre: 'Cobertura del Programa de Gestión de Velocidad',
      codigo: 'GVE',
      formula: 'GVE = (#VIP / #VDL) * 100',
      descripcionVariables: '#VIP: Vehículos con telemetría/GPS incluidos en el programa. #VDL: Flota total utilizada para desplazamientos laborales.',
      frecuencia: 'Mensual y acumulado año',
      aplicaA: ['ESTÁNDAR', 'AVANZADO'],
      unidad: '%',
      criterioAceptable: '≥ 95%',
      extractorValor: e => e.indicadores.gveCobertura,
      extractorDelta: e => e.deltasIncertidumbre.gveCobertura || 0,
    },
    {
      id: 'ind8',
      numero: 8,
      nombre: 'Excesos de Límite de Velocidad Laboral',
      codigo: 'ELVL',
      formula: 'ELVL = (#DLEV / #TDL) * 100',
      descripcionVariables: '#DLEV: Desplazamientos diarios con velocidad superior al límite fijado por la empresa. #TDL: Total de desplazamientos laborales monitoreados.',
      frecuencia: 'Acumulado mes y año',
      aplicaA: ['AVANZADO'],
      unidad: '%',
      criterioAceptable: '≤ 3%',
      extractorValor: e => e.indicadores.elvl,
      extractorDelta: e => e.deltasIncertidumbre.elvl || 0,
    },
    {
      id: 'ind9',
      numero: 9,
      nombre: 'Inspecciones Diarias Preoperacionales',
      codigo: 'IDP',
      formula: 'IDP = (#VID / #TV) * 100',
      descripcionVariables: '#VID: Número de vehículos inspeccionados diariamente en lista de chequeo. #TV: Total de vehículos operativos en la jornada.',
      frecuencia: 'Acumulado mes y año',
      aplicaA: ['BÁSICO', 'ESTÁNDAR', 'AVANZADO'],
      unidad: '%',
      criterioAceptable: '100% obligatorio',
      extractorValor: e => e.indicadores.idp,
      extractorDelta: e => e.deltasIncertidumbre.idp || 0,
    },
    {
      id: 'ind10',
      numero: 10,
      nombre: 'Cumplimiento del Plan de Mantenimiento Preventivo',
      codigo: 'CPMVh',
      formula: 'CPMVh = (MEVh(t) / MPVh(t)) * 100',
      descripcionVariables: 'MEVh(t): Mantenimientos preventivos ejecutados en el trimestre. MPVh(t): Mantenimientos programados según ficha técnica y fabricante.',
      frecuencia: 'Trimestral y acumulado año',
      aplicaA: ['BÁSICO', 'ESTÁNDAR', 'AVANZADO'],
      unidad: '%',
      criterioAceptable: '≥ 95%',
      extractorValor: e => e.indicadores.cpmvh,
      extractorDelta: e => e.deltasIncertidumbre.cpmvh || 0,
    },
    {
      id: 'ind11',
      numero: 11,
      nombre: 'Cumplimiento del Plan de Formación en Seguridad Vial',
      codigo: 'CPF PESV (Cumpl.)',
      formula: 'CPFSV = (CESV(t) / CPSV(t)) * 100',
      descripcionVariables: 'CESV(t): Capacitaciones en seguridad vial ejecutadas en el trimestre. CPSV(t): Capacitaciones programadas en el plan de formación.',
      frecuencia: 'Trimestral y acumulado año',
      aplicaA: ['BÁSICO', 'ESTÁNDAR', 'AVANZADO'],
      unidad: '%',
      criterioAceptable: '≥ 90%',
      extractorValor: e => e.indicadores.cpfCumplimiento,
      extractorDelta: e => e.deltasIncertidumbre.cpfCumplimiento || 0,
    },
    {
      id: 'ind12',
      numero: 12,
      nombre: 'Cobertura del Plan de Formación en Seguridad Vial',
      codigo: 'CPF PESV (Cob.)',
      formula: 'CPFSV_Cob = (CFSV(t) / CT(t)) * 100',
      descripcionVariables: 'CFSV(t): Colaboradores capacitados en el periodo. CT(t): Total de colaboradores vinculados a la organización.',
      frecuencia: 'Acumulado trimestre y año',
      aplicaA: ['BÁSICO', 'ESTÁNDAR', 'AVANZADO'],
      unidad: '%',
      criterioAceptable: '≥ 90%',
      extractorValor: e => e.indicadores.cpfCobertura,
      extractorDelta: e => e.deltasIncertidumbre.cpfCobertura || 0,
    },
    {
      id: 'ind13',
      numero: 13,
      nombre: 'No Conformidades de Auditoría Gestionadas y Cerradas',
      codigo: 'NCAC',
      formula: 'NCAC = (#NCG / #NCI) * 100',
      descripcionVariables: '#NCG: No conformidades gestionadas y cerradas con plan de acción. #NCI: No conformidades identificadas en la auditoría anual.',
      frecuencia: 'Anual',
      aplicaA: ['BÁSICO', 'ESTÁNDAR', 'AVANZADO'],
      unidad: '%',
      criterioAceptable: '100% de cierre eficaz',
      extractorValor: e => e.indicadores.ncac,
      extractorDelta: e => e.deltasIncertidumbre.ncac || 0,
    },
  ];

  const indActual =
    definiciones.find(d => d.id === indicadorSeleccionadoId) || definiciones[0];

  // Cálculo poblacional con incertidumbre para el indicador seleccionado
  const valores = empresas.map(indActual.extractorValor);
  const deltas = empresas.map(indActual.extractorDelta);
  const resumen = calcularMetricaConIncertidumbre(valores, deltas, indActual.unidad);

  // Empresas ordenadas según el indicador
  const empresasOrdenadas = [...empresas].sort((a, b) => {
    const valA = indActual.extractorValor(a);
    const valB = indActual.extractorValor(b);
    return orden === 'desc' ? valB - valA : valA - valB;
  });

  return (
    <div className="space-y-6">
      {/* Header descriptivo */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Calculator className="w-5 h-5 text-blue-600" />
              13 Indicadores de Gestión PESV con Incertidumbre Asociada
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Fórmulas normativas de la Resolución Mintransporte (Paso 20). Cada cálculo incorpora la propagación de incertidumbre poblacional y por duplicados (± δx).
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs font-mono text-slate-600 bg-slate-50 border border-slate-200 rounded-lg p-2 shrink-0">
            <span>Fórmula de Incertidumbre:</span>
            <span className="font-bold text-blue-700">X = (ΣUi + ΣFj) / T ± δx</span>
          </div>
        </div>

        {/* Carrusel de selección de indicador */}
        <div className="mt-4 pt-4 border-t border-slate-100 flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {definiciones.map(def => {
            const isSelected = def.id === indActual.id;
            return (
              <button
                key={def.id}
                onClick={() => setIndicadorSeleccionadoId(def.id)}
                className={`px-3 py-2 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap cursor-pointer shrink-0 text-left ${
                  isSelected
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                <div className="text-[10px] opacity-80">Ind. {def.numero}</div>
                <div className="font-bold">{def.codigo}</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Ficha Técnica del Indicador Seleccionado */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Col 1: Datos Generales y Fórmula */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-xs font-bold text-blue-600 font-mono">
                  INDICADOR N° {indActual.numero}
                </span>
                <h3 className="text-lg font-bold text-slate-900 mt-0.5">
                  {indActual.nombre}
                </h3>
              </div>
              <div className="flex items-center gap-1.5">
                {indActual.aplicaA.map(lvl => (
                  <span
                    key={lvl}
                    className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-semibold"
                  >
                    {lvl}
                  </span>
                ))}
              </div>
            </div>

            {/* Recuadro de Fórmula */}
            <div className="p-3.5 bg-slate-900 text-white rounded-lg font-mono text-xs shadow-inner">
              <div className="text-slate-400 text-[10px] mb-1">FÓRMULA OFICIAL DE LA RESOLUCIÓN</div>
              <div className="text-emerald-400 font-bold text-sm">{indActual.formula}</div>
              <p className="text-slate-300 text-[11px] mt-2 font-sans leading-relaxed">
                {indActual.descripcionVariables}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-100">
                <span className="text-slate-500 block text-[11px]">Frecuencia de Análisis:</span>
                <span className="font-semibold text-slate-800">{indActual.frecuencia}</span>
              </div>
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-100">
                <span className="text-slate-500 block text-[11px]">Criterio Aceptable / Meta:</span>
                <span className="font-semibold text-blue-700">{indActual.criterioAceptable}</span>
              </div>
            </div>
          </div>

          {/* Col 2: Resultado Poblacional con Incertidumbre */}
          <div className="bg-slate-50 rounded-xl p-5 border border-slate-200 flex flex-col justify-between">
            <div>
              <div className="text-xs text-slate-500 font-semibold">
                VALOR POBLACIONAL PROMEDIO
              </div>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-3xl font-bold font-mono text-slate-900">
                  {resumen.media.toFixed(2)}
                </span>
                <span className="text-sm font-bold font-mono text-blue-600">
                  ± {resumen.deltaX.toFixed(2)} {resumen.unidad}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                Intervalo de Incertidumbre: [{(resumen.media - resumen.deltaX).toFixed(2)} a {(resumen.media + resumen.deltaX).toFixed(2)}]
              </p>
            </div>

            <div className="space-y-2 mt-4 pt-4 border-t border-slate-200 text-xs">
              <div className="flex items-center justify-between text-slate-600">
                <span>Total Muestra:</span>
                <span className="font-mono font-bold">{empresas.length} empresas</span>
              </div>
              <div className="flex items-center justify-between text-slate-600">
                <span>Valor Mínimo:</span>
                <span className="font-mono">{resumen.min.toFixed(2)} {resumen.unidad}</span>
              </div>
              <div className="flex items-center justify-between text-slate-600">
                <span>Valor Máximo:</span>
                <span className="font-mono">{resumen.max.toFixed(2)} {resumen.unidad}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabla de Desglose por Empresa para el Indicador Seleccionado */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              Desglose de Mediciones e Incertidumbre Individual por Empresa
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Valores reportados y margen de incertidumbre específico según triangulación
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500">Ordenar por valor:</span>
            <button
              onClick={() => setOrden(orden === 'desc' ? 'asc' : 'desc')}
              className="px-2.5 py-1 text-xs font-mono font-semibold bg-slate-100 hover:bg-slate-200 rounded text-slate-700 transition-colors cursor-pointer"
            >
              {orden === 'desc' ? 'Mayor a Menor ↓' : 'Menor a Mayor ↑'}
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-slate-600 font-semibold">
                <th className="py-2.5 px-3">Empresa</th>
                <th className="py-2.5 px-3">NIT</th>
                <th className="py-2.5 px-3">Año</th>
                <th className="py-2.5 px-3">Nivel PESV</th>
                <th className="py-2.5 px-3">Flota / Conductores</th>
                <th className="py-2.5 px-3 text-right">Valor Calculado</th>
                <th className="py-2.5 px-3 text-right">Incertidumbre (± δx)</th>
                <th className="py-2.5 px-3 text-center">Estado vs Criterio</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono">
              {empresasOrdenadas.map(empresa => {
                const val = indActual.extractorValor(empresa);
                const delta = indActual.extractorDelta(empresa);

                // Evaluar si es favorable o crítico
                let esAlerta = false;
                if (indActual.id === 'ind1' && val > 3.0) esAlerta = true;
                if (indActual.id === 'ind6' && val > 5.0) esAlerta = true;
                if (indActual.id === 'ind8' && val > 8.0) esAlerta = true;
                if (indActual.id === 'ind9' && val < 90.0) esAlerta = true;
                if (indActual.id === 'ind10' && val < 85.0) esAlerta = true;
                if (indActual.id === 'ind11' && val < 80.0) esAlerta = true;

                return (
                  <tr
                    key={empresa.id}
                    onClick={() => onSeleccionarEmpresa(empresa)}
                    className="hover:bg-blue-50/40 cursor-pointer transition-colors"
                  >
                    <td className="py-2.5 px-3 font-sans">
                      <div className="font-semibold text-slate-900 truncate max-w-[240px]">
                        {empresa.razonSocial}
                      </div>
                      <div className="text-[11px] text-slate-500 font-mono">
                        {empresa.municipio} · {empresa.sectorEconomico}
                      </div>
                    </td>
                    <td className="py-2.5 px-3 text-slate-700">{empresa.numeroDocumento}</td>
                    <td className="py-2.5 px-3 font-mono">
                      <span className="text-[11px] px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 font-bold border border-indigo-200">
                        {empresa.anoReporte}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 font-sans">
                      <span className="text-[11px] px-2 py-0.5 rounded bg-slate-100 text-slate-800 font-medium">
                        {empresa.clasificacionCalculada}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-slate-600">
                      {empresa.flota.totalVehiculos} veh / {empresa.conductores.totalConductoresNorma} cond
                    </td>
                    <td className="py-2.5 px-3 text-right font-bold text-slate-900">
                      {val.toFixed(2)} {indActual.unidad}
                    </td>
                    <td className="py-2.5 px-3 text-right text-slate-500">
                      ± {delta.toFixed(2)}
                    </td>
                    <td className="py-2.5 px-3 text-center font-sans">
                      {esAlerta ? (
                        <span className="text-red-700 bg-red-50 border border-red-200 px-2 py-0.5 rounded-full text-[10px] font-bold">
                          Riesgo / Desviación
                        </span>
                      ) : (
                        <span className="text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full text-[10px] font-bold">
                          Conforme
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
