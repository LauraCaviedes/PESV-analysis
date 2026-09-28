import React, { useState } from 'react';
import {
  Calculator,
  BarChart2,
  Calendar,
  ListOrdered,
  Database,
  FileSpreadsheet
} from 'lucide-react';
import { EmpresaPESV } from '../types/pesv';
import { calcularMetricaConIncertidumbre } from '../utils/pesvCalculations';
import { IndicatorHistogram } from './IndicatorHistogram';
import { IndicatorTemporalAnalysis } from './IndicatorTemporalAnalysis';

interface IndicatorsViewProps {
  empresas: EmpresaPESV[];
  onSeleccionarEmpresa: (empresa: EmpresaPESV) => void;
}

interface DefinicionIndicador {
  id: string;
  numero: string;
  nombre: string;
  codigo: string;
  formula: string;
  estructuraVariables: { n: string; d: string; rep: string };
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
  const [subVista, setSubVista] = useState<'HISTOGRAMA' | 'TEMPORAL' | 'TABLA'>('HISTOGRAMA');

  const definiciones: DefinicionIndicador[] = [
    {
      id: 'ind1',
      numero: '1.0',
      nombre: 'Tasa Siniestros Viales (Acumulado Total)',
      codigo: 'TSV Total',
      formula: 'TSV = SV(t) * 1.000.000 / km(t)',
      estructuraVariables: { n: 'Σ I1_Nivel(1-4)_n_[periodo]', d: 'I1_km_[periodo]', rep: 'Dato Calculado Automáticamente' },
      descripcionVariables: 'SV(t): Siniestros totales en el periodo. km(t): Kilómetros recorridos.',
      frecuencia: 'Trimestral y acumulado año',
      aplicaA: ['BÁSICO', 'ESTÁNDAR', 'AVANZADO'],
      unidad: '/ 1M km',
      criterioAceptable: '< 2.0 por 1M km',
      extractorValor: e => Number(e.indicadores.tsvTotal) || 0,
      extractorDelta: e => Number(e.deltasIncertidumbre.tsvTotal) || 0,
    },
    {
      id: 'ind1_1',
      numero: '1.1',
      nombre: 'TSV Nivel 1 (Fatalidades)',
      codigo: 'TSV(1)',
      formula: 'TSV(1) = SV(t1) * 1.000.000 / km(t)',
      estructuraVariables: { n: 'I1_Nivel1_n_[periodo]', d: 'I1_km_[periodo]', rep: 'I1_TSV_Nivel1_[periodo]' },
      descripcionVariables: 'SV(t1): Siniestros con fatalidades.',
      frecuencia: 'Trimestral y acumulado año',
      aplicaA: ['BÁSICO', 'ESTÁNDAR', 'AVANZADO'],
      unidad: '/ 1M km',
      criterioAceptable: '0 (Cero tolerancias)',
      extractorValor: e => Number(e.indicadores.tsvNivel1) || 0,
      extractorDelta: e => (Number(e.deltasIncertidumbre.tsvTotal) || 0) * 0.1,
    },
    {
      id: 'ind1_2',
      numero: '1.2',
      nombre: 'TSV Nivel 2 (Heridos Graves >30d)',
      codigo: 'TSV(2)',
      formula: 'TSV(2) = SV(t2) * 1.000.000 / km(t)',
      estructuraVariables: { n: 'I1_Nivel2_n_[periodo]', d: 'I1_km_[periodo]', rep: 'I1_TSV_Nivel2_[periodo]' },
      descripcionVariables: 'SV(t2): Siniestros con heridos graves.',
      frecuencia: 'Trimestral y acumulado año',
      aplicaA: ['BÁSICO', 'ESTÁNDAR', 'AVANZADO'],
      unidad: '/ 1M km',
      criterioAceptable: 'Tendencia descendente',
      extractorValor: e => Number(e.indicadores.tsvNivel2) || 0,
      extractorDelta: e => (Number(e.deltasIncertidumbre.tsvTotal) || 0) * 0.2,
    },
    {
      id: 'ind1_3',
      numero: '1.3',
      nombre: 'TSV Nivel 3 (Heridos Leves ≤30d)',
      codigo: 'TSV(3)',
      formula: 'TSV(3) = SV(t3) * 1.000.000 / km(t)',
      estructuraVariables: { n: 'I1_Nivel3_n_[periodo]', d: 'I1_km_[periodo]', rep: 'I1_TSV_Nivel3_[periodo]' },
      descripcionVariables: 'SV(t3): Siniestros con heridos leves.',
      frecuencia: 'Trimestral y acumulado año',
      aplicaA: ['BÁSICO', 'ESTÁNDAR', 'AVANZADO'],
      unidad: '/ 1M km',
      criterioAceptable: 'Tendencia descendente',
      extractorValor: e => Number(e.indicadores.tsvNivel3) || 0,
      extractorDelta: e => (Number(e.deltasIncertidumbre.tsvTotal) || 0) * 0.3,
    },
    {
      id: 'ind1_4',
      numero: '1.4',
      nombre: 'TSV Nivel 4 (Choques Simples)',
      codigo: 'TSV(4)',
      formula: 'TSV(4) = SV(t4) * 1.000.000 / km(t)',
      estructuraVariables: { n: 'I1_Nivel4_n_[periodo]', d: 'I1_km_[periodo]', rep: 'I1_TSV_Nivel4_[periodo]' },
      descripcionVariables: 'SV(t4): Siniestros con daños materiales exclusivamente.',
      frecuencia: 'Trimestral y acumulado año',
      aplicaA: ['BÁSICO', 'ESTÁNDAR', 'AVANZADO'],
      unidad: '/ 1M km',
      criterioAceptable: 'Tendencia descendente',
      extractorValor: e => Number(e.indicadores.tsvNivel4) || 0,
      extractorDelta: e => (Number(e.deltasIncertidumbre.tsvTotal) || 0) * 0.4,
    },
    {
      id: 'ind2',
      numero: '2.0',
      nombre: 'Costos Totales de Siniestros Viales',
      codigo: '$SVT',
      formula: '$SVT = ΣCDSV(tn) + ΣCISV(tn)',
      estructuraVariables: { n: 'Σ I2_Nivel(1-4)_directos', d: 'Σ I2_Nivel(1-4)_indirectos', rep: 'Dato Calculado Automáticamente' },
      descripcionVariables: 'Suma de Costos directos e indirectos por todos los niveles de pérdida.',
      frecuencia: 'Trimestral y acumulado año',
      aplicaA: ['ESTÁNDAR', 'AVANZADO'],
      unidad: 'COP',
      criterioAceptable: 'Tendencia descendente anual',
      extractorValor: e => Number(e.indicadores.costosTotales) || 0,
      extractorDelta: e => (Number(e.indicadores.costosTotales) || 0) * 0.08,
    },
    {
      id: 'ind2_1',
      numero: '2.1',
      nombre: 'Costos Nivel 1 (Fatalidades)',
      codigo: '$SVT(1)',
      formula: '$SVT(1) = CDSV(1) + CISV(1)',
      estructuraVariables: { n: 'I2_Nivel1_directos_[periodo]', d: 'I2_Nivel1_indirectos_[periodo]', rep: 'I2_SV_Nivel1_[periodo]' },
      descripcionVariables: 'Costos directos e indirectos asociados a fatalidades.',
      frecuencia: 'Trimestral y acumulado año',
      aplicaA: ['ESTÁNDAR', 'AVANZADO'],
      unidad: 'COP',
      criterioAceptable: 'Tendencia descendente',
      extractorValor: e => Number(e.indicadores.costosNivel1Total) || 0,
      extractorDelta: e => (Number(e.indicadores.costosNivel1Total) || 0) * 0.05,
    },
    {
      id: 'ind2_2',
      numero: '2.2',
      nombre: 'Costos Nivel 2 (Graves >30d)',
      codigo: '$SVT(2)',
      formula: '$SVT(2) = CDSV(2) + CISV(2)',
      estructuraVariables: { n: 'I2_Nivel2_directos_[periodo]', d: 'I2_Nivel2_indirectos_[periodo]', rep: 'I2_SV_Nivel2_[periodo]' },
      descripcionVariables: 'Costos directos e indirectos asociados a heridos graves.',
      frecuencia: 'Trimestral y acumulado año',
      aplicaA: ['ESTÁNDAR', 'AVANZADO'],
      unidad: 'COP',
      criterioAceptable: 'Tendencia descendente',
      extractorValor: e => Number(e.indicadores.costosNivel2Total) || 0,
      extractorDelta: e => (Number(e.indicadores.costosNivel2Total) || 0) * 0.05,
    },
    {
      id: 'ind2_3',
      numero: '2.3',
      nombre: 'Costos Nivel 3 (Leves ≤30d)',
      codigo: '$SVT(3)',
      formula: '$SVT(3) = CDSV(3) + CISV(3)',
      estructuraVariables: { n: 'I2_Nivel3_directos_[periodo]', d: 'I2_Nivel3_indirectos_[periodo]', rep: 'I2_SV_Nivel3_[periodo]' },
      descripcionVariables: 'Costos directos e indirectos asociados a heridos leves.',
      frecuencia: 'Trimestral y acumulado año',
      aplicaA: ['ESTÁNDAR', 'AVANZADO'],
      unidad: 'COP',
      criterioAceptable: 'Tendencia descendente',
      extractorValor: e => Number(e.indicadores.costosNivel3Total) || 0,
      extractorDelta: e => (Number(e.indicadores.costosNivel3Total) || 0) * 0.05,
    },
    {
      id: 'ind2_4',
      numero: '2.4',
      nombre: 'Costos Nivel 4 (Choques Simples)',
      codigo: '$SVT(4)',
      formula: '$SVT(4) = CDSV(4) + CISV(4)',
      estructuraVariables: { n: 'I2_Nivel4_directos_[periodo]', d: 'I2_Nivel4_indirectos_[periodo]', rep: 'I2_SV_Nivel4_[periodo]' },
      descripcionVariables: 'Costos directos e indirectos asociados a daños materiales.',
      frecuencia: 'Trimestral y acumulado año',
      aplicaA: ['ESTÁNDAR', 'AVANZADO'],
      unidad: 'COP',
      criterioAceptable: 'Tendencia descendente',
      extractorValor: e => Number(e.indicadores.costosNivel4Total) || 0,
      extractorDelta: e => (Number(e.indicadores.costosNivel4Total) || 0) * 0.05,
    },
    {
      id: 'ind3_1',
      numero: '3.1',
      nombre: 'Riesgos Viales Identificados (RSVI)',
      codigo: 'RSVI',
      formula: 'RSVI = RI(fa) - RI(ia)',
      estructuraVariables: { n: 'I3_RSVI_fin_[periodo]', d: 'I3_RSVI_inicio_[periodo]', rep: 'I3_RSVI' },
      descripcionVariables: 'RI: Riesgos identificados al final vs inicio de año.',
      frecuencia: 'Anual',
      aplicaA: ['BÁSICO', 'ESTÁNDAR', 'AVANZADO'],
      unidad: 'riesgos',
      criterioAceptable: 'Tendencia a estabilización',
      extractorValor: e => Number(e.indicadores.rsvi) || 0,
      extractorDelta: e => Math.abs(Number(e.indicadores.rsvi) || 0) * 0.1,
    },
    {
      id: 'ind3_2',
      numero: '3.2',
      nombre: 'Gestión Riesgos Valoración Alta (GRV)',
      codigo: 'GRV',
      formula: 'GRV = RVA(fa) - RVA(ia)',
      estructuraVariables: { n: 'I3_GRV_fin_[periodo]', d: 'I3_GRV_inicio_[periodo]', rep: 'I3_GRV' },
      descripcionVariables: 'RVA: Riesgos con valoración alta tratados.',
      frecuencia: 'Anual',
      aplicaA: ['BÁSICO', 'ESTÁNDAR', 'AVANZADO'],
      unidad: 'riesgos',
      criterioAceptable: 'GRV < 0',
      extractorValor: e => Number(e.indicadores.grv) || 0,
      extractorDelta: e => Math.abs(Number(e.indicadores.grv) || 0) * 0.1,
    },
    {
      id: 'ind4',
      numero: '4.0',
      nombre: 'Cumplimiento Metas PESV',
      codigo: 'CM PESV',
      formula: 'CM PESV = (MA(t) / TM(t)) * 100',
      estructuraVariables: { n: 'I4_nMetasAlcanzadas_[periodo]', d: 'I4_nMetasDefinidas_[periodo]', rep: 'I4_CM_[periodo]' },
      descripcionVariables: 'MA(t): Metas logradas en el periodo. TM(t): Total de metas.',
      frecuencia: 'Trimestral y acumulado año',
      aplicaA: ['BÁSICO', 'ESTÁNDAR', 'AVANZADO'],
      unidad: '%',
      criterioAceptable: '≥ 85%',
      extractorValor: e => Number(e.indicadores.cmPesv) || 0,
      extractorDelta: e => e.deltasIncertidumbre.cmPesv || 0,
    },
    {
      id: 'ind5',
      numero: '5.0',
      nombre: 'Cumplimiento Plan Anual Trabajo',
      codigo: 'CPlan PESV',
      formula: 'CPlan = (AEPlan(t) / APPlan(t)) * 100',
      estructuraVariables: { n: 'I5_nActividadesEjecutadas_[periodo]', d: 'I5_nActividadesProgramadas_[periodo]', rep: 'I5_CPlan_[periodo]' },
      descripcionVariables: 'AEPlan(t): Actividades ejecutadas vs programadas.',
      frecuencia: 'Trimestral y acumulado año',
      aplicaA: ['BÁSICO', 'ESTÁNDAR', 'AVANZADO'],
      unidad: '%',
      criterioAceptable: '≥ 90%',
      extractorValor: e => Number(e.indicadores.cPlanPesv) || 0,
      extractorDelta: e => e.deltasIncertidumbre.cPlanPesv || 0,
    },
    {
      id: 'ind6',
      numero: '6.0',
      nombre: '% Exceso Jornadas Laborales Conductores',
      codigo: '%EJLC',
      formula: '%EJL = (#EJD / #SDT) * 100',
      estructuraVariables: { n: 'I6_nEJLdiarias_[periodo]', d: 'I6_sumaDiasTrabajados_[periodo]', rep: 'I6_%EJLC_[periodo]' },
      descripcionVariables: '#EJD: Número excesos jornada (>10h). #SDT: Días trabajados.',
      frecuencia: 'Mensual y acumulado año',
      aplicaA: ['BÁSICO', 'ESTÁNDAR', 'AVANZADO'],
      unidad: '%',
      criterioAceptable: '≤ 2%',
      extractorValor: e => Number(e.indicadores.porcExcesoJornada) || 0,
      extractorDelta: e => e.deltasIncertidumbre.porcExcesoJornada || 0,
    },
    {
      id: 'ind7',
      numero: '7.0',
      nombre: 'Cobertura Gestión Velocidad',
      codigo: 'GVE',
      formula: 'GVE = (#VIP / #VDL) * 100',
      estructuraVariables: { n: 'I7_nIncluidos_[periodo]', d: 'I7_nUtilizados_[periodo]', rep: 'I7_nDe_[periodo]' },
      descripcionVariables: '#VIP: Vehículos con telemetría incluidos.',
      frecuencia: 'Mensual y acumulado año',
      aplicaA: ['ESTÁNDAR', 'AVANZADO'],
      unidad: '%',
      criterioAceptable: '≥ 95%',
      extractorValor: e => Number(e.indicadores.gveCobertura) || 0,
      extractorDelta: e => e.deltasIncertidumbre.gveCobertura || 0,
    },
    {
      id: 'ind8',
      numero: '8.0',
      nombre: 'Excesos Límite Velocidad Laboral',
      codigo: 'ELVL',
      formula: 'ELVL = (#DLEV / #TDL) * 100',
      estructuraVariables: { n: 'I8_nExcesoVel_[periodo]', d: 'I8_nDesplazamientos_[periodo]', rep: 'I8_ELVL_[periodo]' },
      descripcionVariables: '#DLEV: Desplazamientos con exceso velocidad.',
      frecuencia: 'Acumulado mes y año',
      aplicaA: ['AVANZADO'],
      unidad: '%',
      criterioAceptable: '≤ 3%',
      extractorValor: e => Number(e.indicadores.elvl) || 0,
      extractorDelta: e => e.deltasIncertidumbre.elvl || 0,
    },
    {
      id: 'ind9',
      numero: '9.0',
      nombre: 'Inspecciones Diarias Preoperacionales',
      codigo: 'IDP',
      formula: 'IDP = (#VID / #TV) * 100',
      estructuraVariables: { n: 'I9_nInspeccionados_[periodo]', d: 'I9_nVehículos_[periodo]', rep: 'I9_IDP_[periodo]' },
      descripcionVariables: '#VID: Vehículos inspeccionados diariamente.',
      frecuencia: 'Acumulado mes y año',
      aplicaA: ['BÁSICO', 'ESTÁNDAR', 'AVANZADO'],
      unidad: '%',
      criterioAceptable: '100% obligatorio',
      extractorValor: e => Number(e.indicadores.idp) || 0,
      extractorDelta: e => e.deltasIncertidumbre.idp || 0,
    },
    {
      id: 'ind10',
      numero: '10.0',
      nombre: 'Mantenimiento Preventivo CPMVh',
      codigo: 'CPMVh',
      formula: 'CPMVh = (MEVh(t) / MPVh(t)) * 100',
      estructuraVariables: { n: 'I10_nActividades_[periodo]', d: 'I10_nProgramadas_[periodo]', rep: 'I10_CPMV_[periodo]' },
      descripcionVariables: 'MEVh(t): Mantenimientos ejecutados vs programados.',
      frecuencia: 'Trimestral y acumulado año',
      aplicaA: ['BÁSICO', 'ESTÁNDAR', 'AVANZADO'],
      unidad: '%',
      criterioAceptable: '≥ 95%',
      extractorValor: e => Number(e.indicadores.cpmvh) || 0,
      extractorDelta: e => e.deltasIncertidumbre.cpmvh || 0,
    },
    {
      id: 'ind11',
      numero: '11.0',
      nombre: 'Cumplimiento Formación CPFSV',
      codigo: 'CPFSV',
      formula: 'CPFSV = (CESV(t) / CPSV(t)) * 100',
      estructuraVariables: { n: 'I11_nEjecutadas_[periodo]', d: 'I11_nProgramadas_[periodo]', rep: 'I11_CPFSV_[periodo]' },
      descripcionVariables: 'CESV(t): Capacitaciones ejecutadas vs programadas.',
      frecuencia: 'Trimestral y acumulado año',
      aplicaA: ['BÁSICO', 'ESTÁNDAR', 'AVANZADO'],
      unidad: '%',
      criterioAceptable: '≥ 90%',
      extractorValor: e => Number(e.indicadores.cpfCumplimiento) || 0,
      extractorDelta: e => e.deltasIncertidumbre.cpfCumplimiento || 0,
    },
    {
      id: 'ind12',
      numero: '12.0',
      nombre: 'Cobertura Formación',
      codigo: 'CPF Cob.',
      formula: 'CPF_Cob = (CFSV(t) / CT(t)) * 100',
      estructuraVariables: { n: 'I12_nCapacitados_[periodo]', d: 'I12_nTotal_[periodo]', rep: 'I12_CPF_[periodo]' },
      descripcionVariables: 'CFSV(t): Colaboradores capacitados vs totales.',
      frecuencia: 'Acumulado trimestre y año',
      aplicaA: ['BÁSICO', 'ESTÁNDAR', 'AVANZADO'],
      unidad: '%',
      criterioAceptable: '≥ 90%',
      extractorValor: e => Number(e.indicadores.cpfCobertura) || 0,
      extractorDelta: e => e.deltasIncertidumbre.cpfCobertura || 0,
    },
    {
      id: 'ind13',
      numero: '13.0',
      nombre: 'Cierre de No Conformidades',
      codigo: 'NCAC',
      formula: 'NCAC = (#NCG / #NCI) * 100',
      estructuraVariables: { n: 'I13_NCcerradas_[periodo]', d: 'I13_NCidentificadas_[periodo]', rep: 'I13_NCAC_[periodo]' },
      descripcionVariables: '#NCG: No conformidades gestionadas y cerradas.',
      frecuencia: 'Anual',
      aplicaA: ['BÁSICO', 'ESTÁNDAR', 'AVANZADO'],
      unidad: '%',
      criterioAceptable: '100% de cierre eficaz',
      extractorValor: e => Number(e.indicadores.ncac) || 0,
      extractorDelta: e => e.deltasIncertidumbre.ncac || 0,
    },
  ];

  const indActual = definiciones.find(d => d.id === indicadorSeleccionadoId) || definiciones[0];

  const valores = empresas.map(indActual.extractorValor);
  const deltas = empresas.map(indActual.extractorDelta);
  const resumen = calcularMetricaConIncertidumbre(valores, deltas, indActual.unidad);

  const empresasOrdenadas = [...empresas].sort((a, b) => {
    const valA = indActual.extractorValor(a);
    const valB = indActual.extractorValor(b);
    return orden === 'desc' ? valB - valA : valA - valB;
  });

  return (
    <div className="space-y-6">
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Calculator className="w-5 h-5 text-blue-600" />
              Catálogo de Indicadores PESV (Desglose Fáctico Resolución 40595)
            </h2>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-slate-100 flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {definiciones.map(def => {
            const isSelected = def.id === indActual.id;
            return (
              <button
                key={def.id}
                onClick={() => setIndicadorSeleccionadoId(def.id)}
                className={`px-3 py-2 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap cursor-pointer shrink-0 text-left ${
                  isSelected ? 'bg-blue-600 text-white shadow-xs' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                <div className="text-[10px] opacity-80">Ind. {def.numero}</div>
                <div className="font-bold">{def.codigo}</div>
              </button>
            );
          })}
        </div>
      </div>

      <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-4 flex items-start gap-3 shadow-xs">
        <Database className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
        <div>
          <h3 className="text-sm font-bold text-indigo-900">Periodo de Análisis Actual: Prioridad Acumulado Anual</h3>
          <p className="text-xs text-indigo-800 mt-1">
            Por regla de negocio, los gráficos y tablas estadísticos leen por defecto el cierre de vigencia (sufijos <strong className="font-mono">_año</strong>). El desglose temporal auditará periodo a periodo.
          </p>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-xs font-bold text-blue-600 font-mono">INDICADOR N° {indActual.numero}</span>
                <h3 className="text-lg font-bold text-slate-900 mt-0.5">{indActual.nombre}</h3>
              </div>
            </div>

            <div className="p-4 bg-slate-900 text-white rounded-lg shadow-inner">
              <div className="font-mono text-xs">
                <div className="text-slate-400 text-[10px] mb-1">FÓRMULA OFICIAL DE LA RESOLUCIÓN</div>
                <div className="text-emerald-400 font-bold text-sm">{indActual.formula}</div>
                <p className="text-slate-300 text-[11px] mt-2 font-sans leading-relaxed">{indActual.descripcionVariables}</p>
              </div>

              <div className="mt-4 p-3 bg-indigo-950/50 rounded border border-indigo-500/30">
                <div className="text-indigo-300 text-[10px] mb-2 font-bold font-sans flex items-center gap-1.5">
                  <FileSpreadsheet className="w-3.5 h-3.5" />
                  COLUMNAS DE EXCEL ASOCIADAS (REPORTADO VS CALCULADO)
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <div className="px-2 py-1.5 bg-indigo-900 text-indigo-100 border border-indigo-700 rounded shadow-xs">
                    <span className="text-[9px] text-indigo-300 block mb-0.5 font-sans">Numerador (Variable X):</span>
                    <span className="text-[10px] font-mono break-words">{indActual.estructuraVariables.n}</span>
                  </div>
                  <div className="px-2 py-1.5 bg-indigo-900 text-indigo-100 border border-indigo-700 rounded shadow-xs">
                    <span className="text-[9px] text-indigo-300 block mb-0.5 font-sans">Denominador (Variable Y):</span>
                    <span className="text-[10px] font-mono break-words">{indActual.estructuraVariables.d}</span>
                  </div>
                  <div className="px-2 py-1.5 bg-indigo-900 text-indigo-100 border border-indigo-700 rounded shadow-xs">
                    <span className="text-[9px] text-indigo-300 block mb-0.5 font-sans">Valor Autoreportado:</span>
                    <span className="text-[10px] font-mono break-words">{indActual.estructuraVariables.rep}</span>
                  </div>
                </div>
              </div>
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

          <div className="bg-slate-50 rounded-xl p-5 border border-slate-200 flex flex-col justify-between">
            <div>
              <div className="text-xs text-slate-500 font-semibold">VALOR POBLACIONAL PROMEDIO</div>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-3xl font-bold font-mono text-slate-900">
                  {resumen.media.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                </span>
                <span className="text-sm font-bold font-mono text-blue-600">
                  ± {resumen.deltaX.toLocaleString(undefined, { maximumFractionDigits: 2 })} {indActual.unidad !== 'COP' ? resumen.unidad : ''}
                </span>
              </div>
            </div>

            <div className="space-y-2 mt-4 pt-4 border-t border-slate-200 text-xs">
              <div className="flex items-center justify-between text-slate-600">
                <span>Total Muestra:</span>
                <span className="font-mono font-bold">{empresas.length} empresas</span>
              </div>
              <div className="flex items-center justify-between text-slate-600">
                <span>Valor Mínimo:</span>
                <span className="font-mono">{resumen.min.toLocaleString(undefined, { maximumFractionDigits: 2 })} {indActual.unidad !== 'COP' ? resumen.unidad : ''}</span>
              </div>
              <div className="flex items-center justify-between text-slate-600">
                <span>Valor Máximo:</span>
                <span className="font-mono">{resumen.max.toLocaleString(undefined, { maximumFractionDigits: 2 })} {indActual.unidad !== 'COP' ? resumen.unidad : ''}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 bg-white border border-slate-200 rounded-xl p-3 shadow-xs">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-700">Modo de Visualización:</span>
          <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg border border-slate-200">
            <button
              onClick={() => setSubVista('HISTOGRAMA')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer flex items-center gap-1.5 ${subVista === 'HISTOGRAMA' ? 'bg-blue-600 text-white shadow-xs font-bold' : 'text-slate-600 hover:text-slate-900'}`}
            >
              <BarChart2 className="w-3.5 h-3.5" />
              <span>Histograma & Curva KDE</span>
            </button>
            <button
              onClick={() => setSubVista('TEMPORAL')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer flex items-center gap-1.5 ${subVista === 'TEMPORAL' ? 'bg-blue-600 text-white shadow-xs font-bold' : 'text-slate-600 hover:text-slate-900'}`}
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Análisis Temporal (Paso 20)</span>
            </button>
            <button
              onClick={() => setSubVista('TABLA')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer flex items-center gap-1.5 ${subVista === 'TABLA' ? 'bg-blue-600 text-white shadow-xs font-bold' : 'text-slate-600 hover:text-slate-900'}`}
            >
              <ListOrdered className="w-3.5 h-3.5" />
              <span>Ranking de Organizaciones</span>
            </button>
          </div>
        </div>
      </div>

      {subVista === 'HISTOGRAMA' && (
        <IndicatorHistogram
          empresas={empresas}
          nombreIndicador={indActual.nombre}
          codigoIndicador={indActual.codigo}
          unidad={indActual.unidad}
          extractorValor={indActual.extractorValor}
        />
      )}

      {subVista === 'TEMPORAL' && (
        <IndicatorTemporalAnalysis
          empresas={empresas}
          indicadorId={indActual.id}
          nombreIndicador={indActual.nombre}
          codigoIndicador={indActual.codigo}
          unidad={indActual.unidad}
          extractorValor={indActual.extractorValor}
          onSeleccionarEmpresa={onSeleccionarEmpresa}
        />
      )}

      {subVista === 'TABLA' && (
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-slate-900">Desglose de Mediciones Fácticas Individuales</h3>
          <button
            onClick={() => setOrden(orden === 'desc' ? 'asc' : 'desc')}
            className="px-2.5 py-1 text-xs font-mono font-semibold bg-slate-100 hover:bg-slate-200 rounded text-slate-700 cursor-pointer"
          >
            {orden === 'desc' ? 'Mayor a Menor ↓' : 'Menor a Mayor ↑'}
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-slate-600 font-semibold">
                <th className="py-2.5 px-3">Empresa</th>
                <th className="py-2.5 px-3">NIT</th>
                <th className="py-2.5 px-3">Nivel PESV</th>
                <th className="py-2.5 px-3 text-right">Valor Extraído</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono">
              {empresasOrdenadas.map(empresa => {
                const val = indActual.extractorValor(empresa);
                return (
                  <tr key={empresa.id} onClick={() => onSeleccionarEmpresa(empresa)} className="hover:bg-blue-50/40 cursor-pointer transition-colors">
                    <td className="py-2.5 px-3 font-sans">
                      <div className="font-semibold text-slate-900 truncate max-w-[240px]">{empresa.razonSocial}</div>
                    </td>
                    <td className="py-2.5 px-3 text-slate-700">{empresa.numeroDocumento}</td>
                    <td className="py-2.5 px-3 font-sans"><span className="text-[11px] px-2 py-0.5 rounded bg-slate-100 text-slate-800">{empresa.clasificacionCalculada}</span></td>
                    <td className="py-2.5 px-3 text-right font-bold text-slate-900">
                      {indActual.unidad === 'COP' ? `$${val.toLocaleString(undefined, { maximumFractionDigits: 0 })}` : `${val.toLocaleString(undefined, { maximumFractionDigits: 2 })} ${indActual.unidad}`}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
      )}
    </div>
  );
};
