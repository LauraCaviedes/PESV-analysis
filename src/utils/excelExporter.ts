/**
 * Utilidad de Exportación a Excel (.xlsx) con SheetJS (xlsx)
 * Genera libros multi-pestaña para la ANSV, empresas consolidadas, alertas e incertidumbre
 */

import * as XLSX from 'xlsx';
import { EmpresaPESV } from '../types/pesv';

/**
 * Exporta el libro maestro consolidado de empresas PESV con múltiples hojas
 */
export function exportarLibroPESVExcel(
  empresas: EmpresaPESV[],
  nombreArchivo: string = 'Base_Datos_PESV_Consolidada_ANSV.xlsx'
) {
  const wb = XLSX.utils.book_new();

  // 1. Hoja 1: Resumen General e Indicadores Clave
  const datosGenerales = empresas.map(e => ({
    'ID Empresa': e.id,
    'Razón Social Oficial': e.razonSocial,
    'Tipo Doc': e.tipoDocumento,
    'NIT / Documento': e.numeroDocumento,
    'Correo Notificación': e.correo,
    'Año Reporte': e.anoReporte,
    'Departamento': e.departamento,
    'Municipio': e.municipio,
    'Sector Económico': e.sectorEconomico,
    'CIIU': e.codigoCIIU,
    'Misionalidad': e.misionalidad,
    'Nivel Reportado': e.clasificacionReportada,
    'Nivel Normativo Calculado': e.clasificacionCalculada,
    '¿Clasificación Correcta?': e.esClasificacionCorrecta ? 'SÍ' : 'NO - DISCREPANCIA',
    'Categoría Formulario': e.categoriaFormulario,
    'Partes Entregadas': `${e.cantidadFormularios} de 3`,
    'Cumple Indicadores Obligatorios': e.cumpleEntregaNivel ? 'CUMPLE' : 'INCOMPLETO',
    'Total Flota Vehicular': e.flota.totalVehiculos,
    'Total Conductores Norma': e.conductores.totalConductoresNorma,
    'Peatones Exclusivos': e.conductores.peatonesExclusivos,
  }));

  const wsGenerales = XLSX.utils.json_to_sheet(datosGenerales);
  XLSX.utils.book_append_sheet(wb, wsGenerales, 'Empresas y Clasificación');

  // 2. Hoja 2: Indicadores y Mediciones con Incertidumbre
  const datosIndicadores = empresas.map(e => ({
    'NIT': e.numeroDocumento,
    'Razón Social': e.razonSocial,
    'Nivel PESV': e.clasificacionCalculada,
    'Km Recorridos Trimestre': e.indicadores.kmRecorridosTrimestre,
    'TSV Fatalidades': Number(e.indicadores.tsvFatalidades.toFixed(3)),
    'TSV Heridos Graves': Number(e.indicadores.tsvHeridosGraves.toFixed(3)),
    'TSV Total (por 1M km)': Number(e.indicadores.tsvTotal.toFixed(2)),
    'Incertidumbre TSV (± delta)': e.deltasIncertidumbre.tsvTotal ?? 0,
    'Costos Directos (M COP)': e.indicadores.costosDirectos,
    'Costos Indirectos (M COP)': e.indicadores.costosIndirectos,
    'Costos Totales (M COP)': e.indicadores.costosTotales,
    'Cumplimiento Metas (%)': Number(e.indicadores.cmPesv.toFixed(1)),
    'Cumplimiento Actividades (%)': Number(e.indicadores.cPlanPesv.toFixed(1)),
    '% Exceso Jornadas Conductores': Number(e.indicadores.porcExcesoJornada.toFixed(2)),
    'Cobertura Gestión Velocidad GVE (%)': Number(e.indicadores.gveCobertura.toFixed(1)),
    'Excesos Límite Velocidad ELVL (%)': Number(e.indicadores.elvl.toFixed(1)),
    'Incertidumbre ELVL (±)': e.deltasIncertidumbre.elvl ?? 0,
    'Inspecciones Preoperacionales IDP (%)': Number(e.indicadores.idp.toFixed(1)),
    'Incertidumbre IDP (±)': e.deltasIncertidumbre.idp ?? 0,
    'Mantenimiento Preventivo CPMVh (%)': Number(e.indicadores.cpmvh.toFixed(1)),
    'Incertidumbre Mantenimiento (±)': e.deltasIncertidumbre.cpmvh ?? 0,
    'Cumplimiento Formación CPFSV (%)': Number(e.indicadores.cpfCumplimiento.toFixed(1)),
    'Cobertura Formación (%)': Number(e.indicadores.cpfCobertura.toFixed(1)),
    'No Conformidades Auditoría Cerradas (%)': Number(e.indicadores.ncac.toFixed(1)),
  }));

  const wsIndicadores = XLSX.utils.json_to_sheet(datosIndicadores);
  XLSX.utils.book_append_sheet(wb, wsIndicadores, 'Indicadores e Incertidumbre');

  // 3. Hoja 3: Infracciones de Tránsito (Códigos Ley 769 / CNT)
  const datosInfracciones = empresas.map(e => ({
    'NIT': e.numeroDocumento,
    'Razón Social': e.razonSocial,
    'C29 (Exceso Velocidad)': e.infracciones.C29,
    'C14 (Pico y Placa)': e.infracciones.C14,
    'C02 (Mal Parqueo)': e.infracciones.C02,
    'C38 (Técnico-Mecánica Vencida)': e.infracciones.C38,
    'D01 (Sin Licencia)': e.infracciones.D01,
    'D04 (Sin SOAT)': e.infracciones.D04,
    'E03 (Alcoholimetría)': e.infracciones.E03,
    'H04 (Exceso Horas Conducción)': e.infracciones.H04,
    'Otras Infracciones': e.infracciones.otrasInfracciones,
    'Total Infracciones': e.infracciones.totalInfracciones,
    'Incertidumbre Infracciones (±)': e.deltaInfracciones,
  }));

  const wsInfracciones = XLSX.utils.json_to_sheet(datosInfracciones);
  XLSX.utils.book_append_sheet(wb, wsInfracciones, 'Infracciones de Tránsito');

  // 4. Hoja 4: Matriz de Alertas de Asistencia Técnica ANSV
  const filasAlertas: any[] = [];
  empresas.forEach(e => {
    e.alertas.forEach(a => {
      filasAlertas.push({
        'NIT': e.numeroDocumento,
        'Razón Social': e.razonSocial,
        'Departamento': e.departamento,
        'Sector': e.sectorEconomico,
        'Nivel Calculado': e.clasificacionCalculada,
        'Tipo de Alerta': a.tipo,
        'Título Alerta': a.titulo,
        'Nivel Severidad': a.severidad,
        'Descripción del Hallazgo': a.descripcion,
        'Recomendación Técnica ANSV': a.recomendacionANSV,
        'Pasos PESV a Intervenir': a.pasosPESVAfectados.join(', '),
      });
    });
  });

  const wsAlertas = XLSX.utils.json_to_sheet(filasAlertas);
  XLSX.utils.book_append_sheet(wb, wsAlertas, 'Alertas Asistencia Técnica ANSV');

  // Descargar archivo
  XLSX.writeFile(wb, nombreArchivo);
}

/**
 * Exporta directamente la partición de Categoría A (Formulario Completo) o Incompleto
 */
export function exportarParticionFormularios(
  empresas: EmpresaPESV[],
  soloCompletos: boolean
) {
  const filtradas = empresas.filter(e => (soloCompletos ? e.categoriaFormulario === 'A' : e.categoriaFormulario !== 'A'));
  const nombre = soloCompletos
    ? 'Base_Datos_PESV_Consolidada_Final_Formulario_Completo.xlsx'
    : 'Base_Datos_PESV_Consolidada_Final_Formulario_Incompleto.xlsx';

  exportarLibroPESVExcel(filtradas, nombre);
}
