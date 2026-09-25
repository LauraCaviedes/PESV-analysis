/**
 * Generador y Procesador de Series Temporales según Paso 20 (Tabla 10) de la Resolución 40595 de 2022
 * 
 * Frecuencias normativas exactas:
 * 1. Trimestral y Acumulado Anual:
 *    - Indicador 1: Tasa de Siniestros Viales por Nivel de Pérdida (TSV)
 *    - Indicador 2: Costos de Siniestros Viales ($SV)
 *    - Indicador 4: Cumplimiento de Metas del PESV (CM PESV)
 *    - Indicador 5: Cumplimiento del Plan Anual de Trabajo (CPlan PESV)
 *    - Indicador 10: Cumplimiento Plan Mantenimiento Preventivo (CPMVh)
 *    - Indicador 11: Cumplimiento Plan Formación Seguridad Vial (CPFSV Cumpl.)
 *    - Indicador 12: Cobertura Plan Formación Seguridad Vial (CPFSV Cob.)
 * 
 * 2. Mensual y Acumulado Anual:
 *    - Indicador 6: % Exceso de Jornadas Laborales de Conductores (%EJLC)
 *    - Indicador 7: Cobertura Gestión de Velocidad (GVE)
 *    - Indicador 8: Excesos de Límite de Velocidad Laboral (ELVL)
 *    - Indicador 9: Inspecciones Diarias Preoperacionales (IDP)
 * 
 * 3. Acumulado Anual (Exclusivamente):
 *    - Indicador 3: Riesgos Viales Identificados y Gestión (RSVI / GRV)
 *    - Indicador 13: Cierre de No Conformidades de Auditoría (NCAC)
 */

import { EmpresaPESV, FrecuenciaPaso20, SerieTemporalIndicador, PuntoTemporal } from '../types/pesv';

export const MESES_ANO = [
  'Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun',
  'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'
];

export const TRIMESTRES_ANO = [
  { id: 'T1', label: 'T1 (Ene-Mar)' },
  { id: 'T2', label: 'T2 (Abr-Jun)' },
  { id: 'T3', label: 'T3 (Jul-Sep)' },
  { id: 'T4', label: 'T4 (Oct-Dic)' },
];

/**
 * Obtiene la configuración de frecuencia del Paso 20 según el ID o número del indicador
 */
export function obtenerFrecuenciaPaso20(indicadorId: string): {
  frecuencia: FrecuenciaPaso20;
  etiqueta: string;
  tipoPeriodo: 'TRIMESTRAL' | 'MENSUAL' | 'ANUAL';
} {
  const trimestrales = ['ind1', 'ind2', 'ind4', 'ind5', 'ind10', 'ind11', 'ind12'];
  const mensuales = ['ind6', 'ind7', 'ind8', 'ind9'];
  const anuales = ['ind3', 'ind13'];

  if (trimestrales.includes(indicadorId)) {
    return {
      frecuencia: 'TRIMESTRAL_Y_ACUMULADO_ANUAL',
      etiqueta: 'Trimestral y Acumulado Anual',
      tipoPeriodo: 'TRIMESTRAL',
    };
  }
  if (mensuales.includes(indicadorId)) {
    return {
      frecuencia: 'MENSUAL_Y_ACUMULADO_ANUAL',
      etiqueta: 'Mensual y Acumulado Anual',
      tipoPeriodo: 'MENSUAL',
    };
  }
  return {
    frecuencia: 'ACUMULADO_ANUAL',
    etiqueta: 'Acumulado Anual (Exclusivamente)',
    tipoPeriodo: 'ANUAL',
  };
}

/**
 * Genera la serie temporal de un indicador para una empresa dada,
 * coherente con su valor consolidado anual y la variación estacional de la operación.
 */
export function generarSerieTemporalEmpresa(
  empresa: EmpresaPESV,
  indicadorId: string,
  valorAnual: number,
  unidad: string
): SerieTemporalIndicador {
  const { frecuencia, tipoPeriodo } = obtenerFrecuenciaPaso20(indicadorId);
  const puntos: PuntoTemporal[] = [];

  // Semilla pseudoaleatoria basada en el ID y año para reproducibilidad
  let seed = 0;
  for (let i = 0; i < (empresa.id || '').length; i++) {
    seed = (seed + empresa.id.charCodeAt(i)) % 100;
  }

  if (tipoPeriodo === 'TRIMESTRAL') {
    // 4 trimestres
    const factoresEstacionales = [0.92, 0.98, 1.04, 1.06]; // Variación natural en transporte
    
    // Si el indicador es de cumplimiento (% CM, % CPlan, % Mantenimiento, % Formación), suele mejorar de T1 a T4
    const esCumplimiento = ['ind4', 'ind5', 'ind10', 'ind11', 'ind12'].includes(indicadorId);
    
    TRIMESTRES_ANO.forEach((t, idx) => {
      let mod = esCumplimiento 
        ? 0.88 + idx * 0.08 + ((seed % 7) - 3) * 0.01
        : factoresEstacionales[idx] + ((seed % 9) - 4) * 0.02;

      let valPeriodo = Math.round(valorAnual * mod * 10) / 10;
      if (unidad === '%' && valPeriodo > 100) valPeriodo = 100;
      if (valPeriodo < 0) valPeriodo = 0;

      puntos.push({
        periodo: t.id,
        periodoEtiqueta: t.label,
        valor: valPeriodo,
      });
    });
  } else if (tipoPeriodo === 'MENSUAL') {
    // 12 meses
    MESES_ANO.forEach((mes, idx) => {
      // Variación mensual con pico estacional en dic/vacaciones para exceso de velocidad/jornada
      const factorMes = 1.0 + Math.sin((idx / 12) * Math.PI * 2) * 0.12 + ((seed + idx) % 5 - 2) * 0.02;
      let valMes = Math.round(valorAnual * factorMes * 10) / 10;
      if (unidad === '%' && valMes > 100) valMes = 100;
      if (valMes < 0) valMes = 0;

      puntos.push({
        periodo: mes,
        periodoEtiqueta: `${mes} ${empresa.anoReporte}`,
        valor: valMes,
      });
    });
  } else {
    // Exclusivamente Anual
    puntos.push({
      periodo: `${empresa.anoReporte}`,
      periodoEtiqueta: `Vigencia Anual ${empresa.anoReporte}`,
      valor: valorAnual,
    });
  }

  // Determinar tendencia (primer periodo vs último periodo)
  let tendencia: 'MEJORANDO' | 'ESTABLE' | 'DETERIORANDO' = 'ESTABLE';
  if (puntos.length > 1) {
    const primero = puntos[0].valor;
    const ultimo = puntos[puntos.length - 1].valor;
    const esMejoriaAscendente = ['ind4', 'ind5', 'ind7', 'ind9', 'ind10', 'ind11', 'ind12', 'ind13'].includes(indicadorId);
    
    const diff = ultimo - primero;
    if (Math.abs(diff) < 0.5) {
      tendencia = 'ESTABLE';
    } else if (esMejoriaAscendente) {
      tendencia = diff > 0 ? 'MEJORANDO' : 'DETERIORANDO';
    } else {
      // Indicadores donde menor es mejor (TSV, Daños, Jornadas, Exceso velocidad)
      tendencia = diff < 0 ? 'MEJORANDO' : 'DETERIORANDO';
    }
  }

  return {
    indicadorId,
    frecuencia,
    puntos,
    acumuladoAnual: valorAnual,
    tendencia,
    unidad,
  };
}

/**
 * Agrega y consolida la serie temporal poblacional (nacional) para una lista de empresas
 */
export function consolidarSerieTemporalPoblacional(
  empresas: EmpresaPESV[],
  indicadorId: string,
  extractorValor: (e: EmpresaPESV) => number,
  unidad: string
): SerieTemporalIndicador {
  if (empresas.length === 0) {
    return {
      indicadorId,
      frecuencia: obtenerFrecuenciaPaso20(indicadorId).frecuencia,
      puntos: [],
      acumuladoAnual: 0,
      tendencia: 'ESTABLE',
      unidad,
    };
  }

  const seriesIndividuales = empresas.map(emp => {
    const valAnual = extractorValor(emp);
    return generarSerieTemporalEmpresa(emp, indicadorId, valAnual, unidad);
  });

  const numPeriodos = seriesIndividuales[0]?.puntos.length || 0;
  const puntosConsolidados: PuntoTemporal[] = [];

  for (let i = 0; i < numPeriodos; i++) {
    const valoresEnPeriodo = seriesIndividuales.map(s => s.puntos[i]?.valor || 0);
    const mediaPeriodo = valoresEnPeriodo.reduce((acc, v) => acc + v, 0) / valoresEnPeriodo.length;

    puntosConsolidados.push({
      periodo: seriesIndividuales[0].puntos[i].periodo,
      periodoEtiqueta: seriesIndividuales[0].puntos[i].periodoEtiqueta,
      valor: Math.round(mediaPeriodo * 10) / 10,
    });
  }

  const totalAnualMedio =
    seriesIndividuales.reduce((acc, s) => acc + s.acumuladoAnual, 0) / seriesIndividuales.length;

  let tendencia: 'MEJORANDO' | 'ESTABLE' | 'DETERIORANDO' = 'ESTABLE';
  if (puntosConsolidados.length > 1) {
    const p1 = puntosConsolidados[0].valor;
    const pFin = puntosConsolidados[puntosConsolidados.length - 1].valor;
    const esMayorMejor = ['ind4', 'ind5', 'ind7', 'ind9', 'ind10', 'ind11', 'ind12', 'ind13'].includes(indicadorId);
    const diff = pFin - p1;
    if (Math.abs(diff) < 0.5) tendencia = 'ESTABLE';
    else if (esMayorMejor) tendencia = diff > 0 ? 'MEJORANDO' : 'DETERIORANDO';
    else tendencia = diff < 0 ? 'MEJORANDO' : 'DETERIORANDO';
  }

  return {
    indicadorId,
    frecuencia: obtenerFrecuenciaPaso20(indicadorId).frecuencia,
    puntos: puntosConsolidados,
    acumuladoAnual: Math.round(totalAnualMedio * 10) / 10,
    tendencia,
    unidad,
  };
}
