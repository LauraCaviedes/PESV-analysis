/**
 * Motor de Cálculo Normativo PESV & Verificación de Indicadores con Incertidumbre
 * Basado en la Metodología Oficial del Ministerio de Transporte / ANSV
 */

import {
  Misionalidad,
  NivelPESV,
  EmpresaPESV,
  AlertaANSV,
  IndicadoresPESV,
  ResumenIncertidumbre,
} from '../types/pesv';
import { clasificarMetasTexto } from './textAnalytics';

/**
 * Calcula el nivel PESV oficial según Misionalidad y Flota/Conductores
 * Regla: Se evalúa por vehículos y por conductores, y se toma el nivel más alto.
 */
export function calcularNivelPESV(
  misionalidad: Misionalidad,
  totalVehiculos: number,
  totalConductores: number
): NivelPESV {
  let nivelV = 0; // 0: No obligado, 1: Básico, 2: Estándar, 3: Avanzado
  let nivelC = 0;

  if (misionalidad === 'Misionalidad 1') {
    // 1. Empresas dedicadas a la prestación del servicio de Transporte Terrestre Automotor
    if (totalVehiculos > 50) nivelV = 3;
    else if (totalVehiculos >= 20) nivelV = 2;
    else if (totalVehiculos >= 11) nivelV = 1;
    else nivelV = 0;

    if (totalConductores > 50) nivelC = 3;
    else if (totalConductores >= 20) nivelC = 2;
    else if (totalConductores >= 2) nivelC = 1;
    else nivelC = 0;
  } else {
    // 2. Organizaciones dedicadas a actividad diferente al Transporte
    if (totalVehiculos > 100) nivelV = 3;
    else if (totalVehiculos >= 50) nivelV = 2;
    else if (totalVehiculos >= 11) nivelV = 1;
    else nivelV = 0;

    if (totalConductores > 100) nivelC = 3;
    else if (totalConductores >= 50) nivelC = 2;
    else if (totalConductores >= 2) nivelC = 1;
    else nivelC = 0;
  }

  const nivelFinal = Math.max(nivelV, nivelC);

  switch (nivelFinal) {
    case 3:
      return 'AVANZADO';
    case 2:
      return 'ESTÁNDAR';
    case 1:
      return 'BÁSICO';
    default:
      return 'NO OBLIGADO';
  }
}

/**
 * Determina los pasos obligatorios según el nivel oficial
 */
export function obtenerPasosObligatoriosPorNivel(nivel: NivelPESV): number[] {
  switch (nivel) {
    case 'BÁSICO':
      // 18 pasos: No aplican pasos 2, 11, 13, 18, 19, 21
      return [1, 3, 4, 5, 6, 7, 8, 9, 10, 12, 14, 15, 16, 17, 20, 22, 23, 24];
    case 'ESTÁNDAR':
      // 22 pasos: No aplican pasos 11, 21
      return [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 12, 13, 14, 15, 16, 17, 18, 19, 20, 22, 23, 24];
    case 'AVANZADO':
      // Todos los 24 pasos
      return Array.from({ length: 24 }, (_, i) => i + 1);
    default:
      return [];
  }
}

/**
 * Verifica qué indicadores son obligatorios según el nivel y detecta faltantes
 */
export function verificarIndicadoresEntregados(
  nivelCalculado: NivelPESV,
  indicadores: IndicadoresPESV
): { cumple: boolean; faltantes: string[] } {
  const faltantes: string[] = [];

  // Indicador 1: TSV (Obligatorio para todos los niveles obligados)
  if (indicadores.kmRecorridosTrimestre === 0) {
    faltantes.push('Ind 1: Kilómetros recorridos para TSV (km=0)');
  }

  // Indicador 2: Costos Siniestros $SV (Aplica Estándar y Avanzado)
  if (nivelCalculado === 'ESTÁNDAR' || nivelCalculado === 'AVANZADO') {
    if (indicadores.costosTotales === undefined || indicadores.costosTotales === null) {
      faltantes.push('Ind 2: Costos directos/indirectos de siniestralidad');
    }
  }

  // Indicador 3: Riesgos identificados (Aplica todos)
  if (indicadores.riesgosIdentificadosFin === 0 && indicadores.riesgosIdentificadosInicio === 0) {
    faltantes.push('Ind 3: Matriz de identificación y valoración de riesgos viales');
  }

  // Indicador 4 & 5: Cumplimiento de Metas y Plan de Trabajo (Aplica todos)
  if (indicadores.metasTotales === 0) {
    faltantes.push('Ind 4: Metas definidas del PESV');
  }
  if (indicadores.actividadesProgramadas === 0) {
    faltantes.push('Ind 5: Cronograma de actividades del Plan Anual de Trabajo');
  }

  // Indicador 6: Exceso de Jornadas Laborales (Aplica todos)
  if (indicadores.sumatoriaDiasTrabajados === 0) {
    faltantes.push('Ind 6: Registro de días y jornadas laborales de conductores');
  }

  // Indicador 7: Cobertura Gestión de Velocidad (Aplica Estándar y Avanzado)
  if (nivelCalculado === 'ESTÁNDAR' || nivelCalculado === 'AVANZADO') {
    if (indicadores.vehiculosDesplazamientosLaborales === 0) {
      faltantes.push('Ind 7: Registro de flota en programa de gestión de velocidad');
    }
  }

  // Indicador 8: Exceso Límite Velocidad Laboral ELVL (Aplica Avanzado exclusivamente)
  if (nivelCalculado === 'AVANZADO') {
    if (indicadores.totalDesplazamientos === 0) {
      faltantes.push('Ind 8: Monitoreo y registro de desplazamientos con excesos de velocidad (OBC/GPS)');
    }
  }

  // Indicador 9: Inspecciones preoperacionales (Aplica todos)
  if (indicadores.totalVehiculosOperando === 0) {
    faltantes.push('Ind 9: Censo diario de vehículos en operación para inspección preoperacional');
  }

  // Indicador 10: Mantenimiento preventivo (Aplica todos)
  if (indicadores.mantenimientosProgramados === 0) {
    faltantes.push('Ind 10: Plan de mantenimiento preventivo vehicular programado');
  }

  // Indicador 11 & 12: Plan de formación (Aplica todos)
  if (indicadores.capacitacionesProgramadas === 0) {
    faltantes.push('Ind 11: Plan anual de formación en seguridad vial programado');
  }
  if (indicadores.totalColaboradores === 0) {
    faltantes.push('Ind 12: Censo de colaboradores para cobertura de formación');
  }

  // Indicador 13: Auditoría anual (Aplica todos)
  if (indicadores.ncIdentificadas === undefined) {
    faltantes.push('Ind 13: Auditoría interna anual del PESV');
  }

  return {
    cumple: faltantes.length === 0,
    faltantes,
  };
}

/**
 * Genera el paquete de Alertas Tempranas y Recomendaciones de Asistencia Técnica ANSV
 */
export function generarAlertasANSV(empresa: Partial<EmpresaPESV>): AlertaANSV[] {
  const alertas: AlertaANSV[] = [];
  const ind = empresa.indicadores;
  const inf = empresa.infracciones;
  const nivelCalc = empresa.clasificacionCalculada || 'NO OBLIGADO';
  const nivelRep = empresa.clasificacionReportada || 'NO OBLIGADO';

  // 1. Alerta: Discrepancia en Clasificación PESV
  if (nivelCalc !== nivelRep) {
    const severidad = (nivelRep === 'BÁSICO' && nivelCalc === 'AVANZADO') || (nivelRep === 'NO OBLIGADO' && nivelCalc !== 'NO OBLIGADO')
      ? 'CRÍTICA'
      : 'ALTA';

    alertas.push({
      id: `ALT-CLASIF-${empresa.id || '0'}`,
      tipo: 'CLASIFICACION_DISCREPANTE',
      titulo: 'Subclasificación o Inconsistencia de Nivel PESV',
      severidad,
      descripcion: `La empresa autoreportó nivel ${nivelRep}, pero según la cantidad real de flota (${empresa.flota?.totalVehiculos ?? 0}) y conductores (${empresa.conductores?.totalConductoresNorma ?? 0}) bajo ${empresa.misionalidad}, la norma exige nivel ${nivelCalc}.`,
      recomendacionANSV: 'Brindar Asistencia Técnica prioritaria sobre metodología de clasificación (Pasos 1 al 8 de la Resolución). Exigir actualización inmediata del reporte ante la autoridad verificadora para evitar sanciones de Ley 2050 de 2020.',
      pasosPESVAfectados: [1, 2, 5, 6, 7],
    });
  }

  // 2. Alerta: Entrega Incompleta de Formularios
  if (empresa.categoriaFormulario && empresa.categoriaFormulario !== 'A') {
    alertas.push({
      id: `ALT-FORM-${empresa.id || '0'}`,
      tipo: 'ENTREGA_INCOMPLETA_FORMULARIOS',
      titulo: `Formularios de Autogestión Incompletos (Categoría ${empresa.categoriaFormulario})`,
      severidad: empresa.categoriaFormulario === 'C' ? 'ALTA' : 'MEDIA',
      descripcion: `La empresa solo entregó ${empresa.cantidadFormularios} de las 3 partes obligatorias del formulario de autogestión ministerial.`,
      recomendacionANSV: 'Conminar al cargue y homologación de las partes restantes. Realizar acompañamiento institucional para consolidar el diagnóstico de línea base (Paso 5 y 20).',
      pasosPESVAfectados: [5, 20],
    });
  }

  if (ind) {
    // 3. Alerta: Alta Siniestralidad Vial o Fatalidades
    if (ind.tsvFatalidades > 0 || ind.tsvHeridosGraves > 0 || ind.tsvTotal > 5.0) {
      const severidad = ind.tsvFatalidades > 0 ? 'CRÍTICA' : 'ALTA';
      alertas.push({
        id: `ALT-SINIESTRO-${empresa.id || '0'}`,
        tipo: 'ALTA_SINIESTRALIDAD',
        titulo: ind.tsvFatalidades > 0 ? 'Siniestros con Fatalidades Registradas' : 'Tasa Crítica de Siniestralidad Vial',
        severidad,
        descripcion: `Registra TSV total de ${ind.tsvTotal.toFixed(2)} por millón de km, incluyendo ${ind.tsvFatalidades} fatalidad(es) y ${ind.tsvHeridosGraves} heridos graves.`,
        recomendacionANSV: 'Asistencia técnica urgente en Investigación Interna de Siniestros Viales (Paso 13), análisis de árbol de causas, factores de sistema seguro y plan de respuesta ante emergencias (Paso 12).',
        pasosPESVAfectados: [12, 13, 21, 23],
      });
    }

    // 4. Alerta: Exceso de Velocidad Crítico
    const tieneInfraccionVelocidad = (inf?.C29 ?? 0) > 2;
    if (ind.elvl > 8 || ind.gveCobertura < 80 || tieneInfraccionVelocidad) {
      alertas.push({
        id: `ALT-VEL-${empresa.id || '0'}`,
        tipo: 'VELOCIDAD_CRITICA',
        titulo: 'Riesgo Crítico por Exceso de Velocidad Laboral',
        severidad: ind.elvl > 15 || (inf?.C29 ?? 0) > 5 ? 'CRÍTICA' : 'ALTA',
        descripcion: `Tasa de viajes con exceso de velocidad del ${ind.elvl.toFixed(1)}%, cobertura de gestión de velocidad de ${ind.gveCobertura.toFixed(1)}% y ${inf?.C29 ?? 0} comparendos C29 registrados.`,
        recomendacionANSV: 'Asistencia Técnica en Programa de Gestión de la Velocidad Segura (Paso 8, numeral 1): calibración de telemetría/GPS, política de incentivos que no presionen tiempo y auditoría de velocidades operacionales.',
        pasosPESVAfectados: [8, 15],
      });
    }

    // 5. Alerta: Fatiga y Jornadas Laborales
    const tieneInfraccionJornada = (inf?.H04 ?? 0) > 0;
    if (ind.porcExcesoJornada > 5 || tieneInfraccionJornada) {
      alertas.push({
        id: `ALT-FATIGA-${empresa.id || '0'}`,
        tipo: 'FATIGA_Y_JORNADAS',
        titulo: 'Excesos de Jornada y Riesgo Severo de Fatiga',
        severidad: ind.porcExcesoJornada > 10 ? 'CRÍTICA' : 'MEDIA',
        descripcion: `Porcentaje de exceso de jornadas de conducción del ${ind.porcExcesoJornada.toFixed(1)}% (${ind.excesosJornadaDias} días con sobrejornada laboral reportados).`,
        recomendacionANSV: 'Asistencia Técnica en Programa de Prevención de la Fatiga (Paso 8, numeral 2): turnos de conducción, pausas activas cada 4 horas y planificación logística de paradas seguras (Paso 15).',
        pasosPESVAfectados: [8, 15],
      });
    }

    // 6. Alerta: Inspección y Mantenimiento Deficiente
    const tieneInfraccionesMecanicas = (inf?.C38 ?? 0) > 0 || (inf?.D04 ?? 0) > 0;
    if (ind.idp < 85 || ind.cpmvh < 80 || tieneInfraccionesMecanicas) {
      alertas.push({
        id: `ALT-MANT-${empresa.id || '0'}`,
        tipo: 'MANTENIMIENTO_E_INSPECCION',
        titulo: 'Incumplimiento en Mantenimiento Preventivo e Inspección Preoperacional',
        severidad: ind.idp < 70 || ind.cpmvh < 70 ? 'ALTA' : 'MEDIA',
        descripcion: `Cumplimiento de inspección diaria preoperacional (IDP) de ${ind.idp.toFixed(1)}% y cumplimiento de mantenimiento de ${ind.cpmvh.toFixed(1)}%. Infracciones SOAT/RTM detectadas.`,
        recomendacionANSV: 'Asistencia Técnica en Procedimientos de Inspección Diaria Preoperacional (Paso 16) y Hojas de Vida / Trazabilidad de Mantenimiento Preventivo (Paso 17).',
        pasosPESVAfectados: [16, 17],
      });
    }

    // 7. Alerta: Formación Deficitaria
    if (ind.cpfCobertura < 70 || ind.cpfCumplimiento < 75) {
      alertas.push({
        id: `ALT-FORMAC-${empresa.id || '0'}`,
        tipo: 'FORMACION_DEFICITARIA',
        titulo: 'Baja Cobertura o Ejecución del Plan de Formación Vial',
        severidad: ind.cpfCobertura < 50 ? 'ALTA' : 'MEDIA',
        descripcion: `Solo el ${ind.cpfCobertura.toFixed(1)}% de los colaboradores ha sido capacitado y el cumplimiento del cronograma formativo es de ${ind.cpfCumplimiento.toFixed(1)}%.`,
        recomendacionANSV: 'Acompañamiento en el Plan Anual de Formación (Paso 10): módulos diferenciados por actor vial (motociclistas, peatones, conductores de carga y vehículos ligeros).',
        pasosPESVAfectados: [10],
      });
    }

    // 8. Alerta: Auditoría con No Conformidades sin Cerrar
    if (ind.ncac < 60 && ind.ncIdentificadas > 0) {
      alertas.push({
        id: `ALT-AUDIT-${empresa.id || '0'}`,
        tipo: 'AUDITORIA_NC_ABIERTAS',
        titulo: 'Baja Eficacia en Cierre de No Conformidades de Auditoría',
        severidad: 'MEDIA',
        descripcion: `Se identificaron ${ind.ncIdentificadas} no conformidades en auditoría interna y solo se han gestionado/cerrado el ${ind.ncac.toFixed(1)}% (${ind.ncCerradas}).`,
        recomendacionANSV: 'Asistencia Técnica en Mejora Continua y Acciones Correctivas (Paso 23) y directrices de auditoría interna anual según ISO 19011 (Paso 22).',
        pasosPESVAfectados: [22, 23],
      });
    }

    // 9. Alerta: Clasificación Dinámica de Metas Declaradas (Text Analytics - Requerimiento 2)
    if (empresa.descripcionMetas) {
      const metasAnalizadas = clasificarMetasTexto(empresa.descripcionMetas);
      const categoriasPresentes = metasAnalizadas.map(m => m.categoria);

      // Desalineación A: Fatalidades viales sin meta declarada de reducción de siniestros
      if (ind.tsvFatalidades > 0 && !categoriasPresentes.includes('REDUCCION_SINIESTROS')) {
        alertas.push({
          id: `ALT-META-SIN-${empresa.id || '0'}`,
          tipo: 'METAS_DESALINEADAS',
          titulo: 'Metas Desalineadas: Registra Fatalidades sin Meta Explícita de Reducción',
          severidad: 'CRÍTICA',
          descripcion: `La organización reportó ${ind.tsvFatalidades} fatalidad(es) vial(es), pero en la descripción de metas declarada no se identificaron compromisos de reducción de siniestralidad mortal o cero visión.`,
          recomendacionANSV: 'Reformular la política y metas del PESV (Paso 7 de Res 40595) articulando metas cuantificadas de cero fatalidades y planes de acción específicos.',
          pasosPESVAfectados: [7, 8, 12, 13],
        });
      }

      // Desalineación B: Exceso de velocidad recurrente sin meta de control de velocidad
      const tieneVelocidadCritica = (inf?.C29 || 0) > 3 || ind.elvl > 8;
      if (tieneVelocidadCritica && !categoriasPresentes.includes('GESTION_VELOCIDAD')) {
        alertas.push({
          id: `ALT-META-VEL-${empresa.id || '0'}`,
          tipo: 'METAS_DESALINEADAS',
          titulo: 'Metas Desalineadas: Crítico en Velocidad sin Meta de Control Tecnológico',
          severidad: 'ALTA',
          descripcion: `Registra ${inf?.C29 || 0} comparendos C29 y tasa de exceso de velocidad de ${ind.elvl.toFixed(1)}%, pero no definió metas sobre control de velocidad o telemetría.`,
          recomendacionANSV: 'Integrar meta específica de velocidad segura en el PESV (Paso 7 y Paso 8 num. 1) con umbrales máximos tolerados y control GPS.',
          pasosPESVAfectados: [7, 8, 15],
        });
      }

      // Desalineación C: Cumplimiento deficiente de metas (<75% CM PESV)
      if (ind.cmPesv < 75) {
        alertas.push({
          id: `ALT-META-BAJA-${empresa.id || '0'}`,
          tipo: 'METAS_DESALINEADAS',
          titulo: 'Bajo Cumplimiento de Metas Declaradas (CM PESV)',
          severidad: 'ALTA',
          descripcion: `La empresa alcanzó únicamente el ${ind.cmPesv.toFixed(1)}% de las metas programadas para la vigencia. Categorías identificadas: ${metasAnalizadas.map(m => m.nombreCategoria).join(', ') || 'Sin metas reconocidas'}.`,
          recomendacionANSV: 'Revisión y ajuste del cronograma de metas (Paso 7 y 20) y asignación presupuestal y de recursos (Paso 3 y 4).',
          pasosPESVAfectados: [3, 4, 7, 20],
        });
      }
    }
  }

  return alertas;
}

/**
 * Calcula el promedio poblacional y la Incertidumbre Global Delta_X según la fórmula provista por el usuario:
 * Sea T el total de empresas únicas.
 * Sea F el número de registros repetidos y U = T - F.
 * Incertidumbre: deltaX = (sum(F_j * max(f_i))) / T  (o suma_global_max / T)
 * Promedio: X_bar = (sum(U_i) + sum(F_j_bar)) / T +- deltaX
 */
export function calcularMetricaConIncertidumbre(
  valores: number[],
  deltasIndividuales: number[],
  unidad: string = '%'
): ResumenIncertidumbre {
  if (valores.length === 0) {
    return { media: 0, deltaX: 0, min: 0, max: 0, unidad };
  }

  const suma = valores.reduce((acc, val) => acc + val, 0);
  const media = suma / valores.length;
  
  // Delta global ponderado:
  const sumaDeltas = deltasIndividuales.reduce((acc, d) => acc + (d || 0), 0);
  const deltaX = deltasIndividuales.length > 0 ? sumaDeltas / deltasIndividuales.length : 0;

  const min = Math.min(...valores);
  const max = Math.max(...valores);

  return {
    media,
    deltaX,
    min,
    max,
    unidad,
  };
}
