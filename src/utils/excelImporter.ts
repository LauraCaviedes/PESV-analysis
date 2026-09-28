/**
 * Utilidad de Importación y Parseo de Archivos Excel (.xlsx / .xls / .csv)
 * Capaz de leer:
 * 1. El Excel Consolidado Completo (Base_Datos_PESV_Consolidada_Final.xlsx o similar)
 * 2. Mapear nombres de columnas originales del formulario del Ministerio
 * 3. Convertir registros a la estructura fuertemente tipada EmpresaPESV[]
 */

import * as XLSX from 'xlsx';
import {
  EmpresaPESV,
  Misionalidad,
  NivelPESV,
  CategoriaFormulario,
  FlotaVehicular,
  CensoConductores,
} from '../types/pesv';
import { calcularNivelPESV, verificarIndicadoresEntregados, generarAlertasANSV } from './pesvCalculations';
import { MUNICIPIOS_CLAVE } from './colombiaGeo';
import { clasificarMetasTexto } from './textAnalytics';
import { generarRiesgosDinamicosEmpresa } from './riskHeatmapCalculations';
import {
  normalizarFilaConDiccionario,
  recalcularIndicadoresEstandarizados,
  calcularDeltasMultiFormulario,
  CODIGOS_INFRACCIONES_CNT,
} from './pesvStandardDictionary';

/**
 * Lee cualquier archivo Excel o CSV y retorna array de objetos JS
 */
export async function leerArchivoExcel(archivo: File): Promise<Record<string, any>[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = e => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const primeraHoja = workbook.Sheets[workbook.SheetNames[0]];
        const json = XLSX.utils.sheet_to_json<Record<string, any>>(primeraHoja, { defval: '' });
        resolve(json);
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = reject;
    reader.readAsArrayBuffer(archivo);
  });
}

/**
 * Helper para extraer valor numérico seguro de cualquier celda
 */
function num(val: any, defecto = 0): number {
  if (val === null || val === undefined || val === '') return defecto;
  if (typeof val === 'number') return isNaN(val) ? defecto : val;
  const str = val.toString().replace(/[$,]/g, '').trim();
  const n = parseFloat(str);
  return isNaN(n) ? defecto : n;
}

/**
 * Helper de extracción ultra-robusto que busca en una fila por:
 * 1. Claves exactas directas
 * 2. Claves sin espacios en los extremos
 * 3. Coincidencia normalizada (sin tildes, mayúsculas o signos como puntos finales)
 * 4. Patrones Regex flexibles
 */
function extraerValor(
  row: Record<string, any>,
  claves: string[],
  patronesRegex?: RegExp[]
): number {
  const rowKeys = Object.keys(row);

  // 1. Coincidencia exacta directa
  for (const c of claves) {
    if (row[c] !== undefined && row[c] !== null && row[c] !== '') {
      const v = num(row[c]);
      if (!isNaN(v)) return v;
    }
  }

  // 2. Coincidencia exacta ignorando espacios en extremos
  for (const c of claves) {
    const cTrim = c.trim();
    for (const rk of rowKeys) {
      if (rk.trim() === cTrim && row[rk] !== undefined && row[rk] !== null && row[rk] !== '') {
        const v = num(row[rk]);
        if (!isNaN(v)) return v;
      }
    }
  }

  // 3. Coincidencia normalizada (sin tildes, sin signos de puntuación, minúsculas)
  const norm = (s: string) =>
    s
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]/g, '');

  for (const c of claves) {
    const cNorm = norm(c);
    for (const rk of rowKeys) {
      if (norm(rk) === cNorm && row[rk] !== undefined && row[rk] !== null && row[rk] !== '') {
        const v = num(row[rk]);
        if (!isNaN(v)) return v;
      }
    }
  }

  // 4. Patrones Regex
  if (patronesRegex && patronesRegex.length > 0) {
    for (const rx of patronesRegex) {
      for (const rk of rowKeys) {
        if (rx.test(rk) && row[rk] !== undefined && row[rk] !== null && row[rk] !== '') {
          const v = num(row[rk]);
          if (!isNaN(v)) return v;
        }
      }
    }
  }

  return 0;
}

/**
 * Normaliza y convierte filas de un Excel consolidado completo a EmpresaPESV[]
 */
export function convertirExcelConsolidadoAEmpresas(filas: Record<string, any>[]): EmpresaPESV[] {
  return filas.map((row, idx) => {
    // 1. Campos Clave
    const razonSocial =
      row['Razón Social Estándar'] ||
      row['Razón Social'] ||
      row['Nombre'] ||
      row['Razón Social de la empresa'] ||
      `Empresa ${idx + 1}`;

    const numDoc = (
      row['Número de documento'] ||
      row['NIT'] ||
      row['Documento'] ||
      row['NIT / Documento'] ||
      `90000000${idx}`
    ).toString().trim();

    const tipoDoc =
      row['Tipo de documento'] ||
      (numDoc.includes('-') || numDoc.startsWith('8') || numDoc.startsWith('9') ? 'NIT' : 'C.C.');

    const correo =
      row['Correo Electrónico Estándar'] ||
      row['Correo Electrónico'] ||
      row['Correo'] ||
      'contacto@empresa.com';

    let ano = 2024;
    const anoRaw = row['Año del reporte de autogestión'] || row['Año'] || row['Año Reporte'];
    if (anoRaw) {
      const parsed = parseInt(anoRaw.toString().replace(' (opcional)', '').trim(), 10);
      if (!isNaN(parsed)) ano = parsed;
    }

    const departamento = (
      row['Departamento principal de la organización'] ||
      row['Departamento'] ||
      'BOGOTÁ, D.C.'
    ).toString().toUpperCase().trim();

    const municipio = (
      row['Municipio'] ||
      row['Ciudad'] ||
      'BOGOTÁ'
    ).toString().toUpperCase().trim();

    const sectorEconomico =
      row['Sector Económico. (Código CIIU Vs IV del RUT)'] ||
      row['Sector Económico'] ||
      row['Sector'] ||
      'Transporte y almacenamiento';

    const codigoCIIU = (
      row['Código CIIU'] ||
      row['CIIU'] ||
      row['Código CIIU Vs IV del RUT'] ||
      'H4923'
    ).toString().trim();

    const tipoOrganizacion = row['Tipo de organización'] || 'Privada';
    const claseOrganizacion = row['Clase de organización'] || 'Mediana Empresa';

    // 2. Misionalidad (Transporte vs No Transporte)
    let misionalidad: Misionalidad = 'Misionalidad 2';
    const misRaw = (
      row['Misionalidad'] ||
      row['Misionalidad de la organización'] ||
      row['Tipo de organización a verificar'] ||
      ''
    ).toString();

    if (
      misRaw.includes('1') ||
      misRaw.toLowerCase().includes('transporte') ||
      sectorEconomico.toLowerCase().includes('transporte')
    ) {
      misionalidad = 'Misionalidad 2';
    }

    // 3. FLOTA VEHICULAR - Desglose exacto (Propios y Terceros/Contratistas)
    // Coincidencia con encabezados oficiales de la encuesta del Ministerio / ANSV
    const carrosCamionetasPropios = extraerValor(
      row,
      [
        'Número de carros y camionetas propios de la organización/entidad/empresa usados en desplazamientos laborales.',
        'Número de carros y camionetas propios de la organización/entidad/empresa usados en desplazamientos laborales',
        'Número de carros y camionetas propios',
        'Carros y Camionetas Propios',
      ],
      [/carros.*camionetas.*propios/i, /carros.*propios/i]
    );

    const motosPropias = extraerValor(
      row,
      [
        'Número de motocicletas y ciclomotores propios de la organización/entidad/empresa usados en desplazamientos laborales.',
        'Número de motocicletas y ciclomotores propios de la organización/entidad/empresa usados en desplazamientos laborales',
        'Número de motocicletas y ciclomotores propios',
        'Número de motocicletas propios',
        'Motocicletas y ciclomotores propios',
        'Motos Propias',
      ],
      [/motocicletas.*ciclomotores.*propios/i, /motos.*propias/i, /motocicletas.*propias/i]
    );

    const bicicletasMicromovilidadPropias = extraerValor(
      row,
      [
        'Número de bicicletas, bicicletas de pedaleo asistido, patineta eléctrica y de micromovilidad propias de la organización/entidad/empresa usados en desplazamientos laborales.',
        'Número de bicicletas, bicicletas de pedaleo asistido, patineta eléctrica y de micromovilidad propias de la organización/entidad/empresa usados en desplazamientos laborales',
        'Número de bicicletas, bicicletas de pedaleo asistido, patineta eléctrica y de micromovilidad propias',
        'Bicicletas y micromovilidad propias',
      ],
      [/bicicletas.*micromovilidad.*propi/i, /patineta.*propi/i, /bicicletas.*propias/i]
    );

    const cargaPropios = extraerValor(
      row,
      [
        'Número de vehículos de transporte de carga propios de la organización/entidad/empresa usados en desplazamientos laborales.',
        'Número de vehículos de transporte de carga propios de la organización/entidad/empresa usados en desplazamientos laborales',
        'Número de vehículos de transporte de carga propios',
        'Transporte de carga propios',
        'Vehículos de carga propios',
      ],
      [/transporte.*carga.*propios/i, /vehiculos.*carga.*propios/i, /carga.*propios/i]
    );

    const pasajerosPropios = extraerValor(
      row,
      [
        'Número de vehículos de transporte de pasajeros propios de la organización/entidad/empresa usados en desplazamientos laborales.',
        'Número de vehículos de transporte de pasajeros propios de la organización/entidad/empresa usados en desplazamientos laborales',
        'Número de vehículos de transporte de pasajeros propios',
        'Transporte de pasajeros propios',
        'Vehículos de pasajeros propios',
      ],
      [/transporte.*pasajeros.*propios/i, /vehiculos.*pasajeros.*propios/i, /pasajeros.*propios/i]
    );

    const maquinariaAmarillaPropia = extraerValor(
      row,
      [
        'Número de vehículos de maquinaria amarilla propios de la organización/entidad/empresa usados en desplazamientos laborales.',
        'Número de vehículos de maquinaria amarilla propios de la organización/entidad/empresa usados en desplazamientos laborales',
        'Número de vehículos de maquinaria amarilla propios',
        'Maquinaria amarilla propia',
      ],
      [/maquinaria.*amarilla.*propi/i]
    );

    // Flota de Terceros / Contratistas / Colaboradores
    const carrosTerceros = extraerValor(
      row,
      [
        'Número de carros y camionetas de contratistas, terceros o de colaboradores usados en desplazamientos laborales.',
        'Número de carros y camionetas de contratistas, terceros o de colaboradores usados en desplazamientos laborales',
        'Número de carros y camionetas de contratistas',
        'Carros y Camionetas Contratistas',
      ],
      [/carros.*camionetas.*(contratistas|terceros|colaboradores)/i, /carros.*(contratistas|terceros)/i]
    );

    const motosTerceros = extraerValor(
      row,
      [
        'Número de motocicletas y ciclomotores de contratistas, terceros o de colaboradores usados en desplazamientos laborales.',
        'Número de motocicletas y ciclomotores de contratistas, terceros o de colaboradores usados en desplazamientos laborales',
        'Número de motocicletas y ciclomotores de contratistas',
        'Motocicletas y ciclomotores de contratistas',
      ],
      [/motocicletas.*ciclomotores.*(contratistas|terceros|colaboradores)/i, /motos.*(contratistas|terceros)/i]
    );

    const bicicletasTerceros = extraerValor(
      row,
      [
        'Número de bicicletas, bicicletas de pedaleo, patinetas eléctricas y de micromovilidad de contratistas, terceros o de colaboradores usados en desplazamientos laborales.',
        'Número de bicicletas, bicicletas de pedaleo, patinetas eléctricas y de micromovilidad de contratistas, terceros o de colaboradores usados en desplazamientos laborales',
        'Número de bicicletas, bicicletas de pedaleo, patinetas eléctricas y de micromovilidad de contratistas',
        'Bicicletas de contratistas',
      ],
      [/bicicletas.*(contratistas|terceros|colaboradores)/i, /patinetas?.*(contratistas|terceros)/i]
    );

    const cargaTerceros = extraerValor(
      row,
      [
        'Número de vehículos de transporte de carga de contratistas, terceros o de colaboradores usados en desplazamientos laborales.',
        'Número de vehículos de transporte de carga de contratistas, terceros o de colaboradores usados en desplazamientos laborales',
        'Número de vehículos de transporte de carga de contratistas',
        'Transporte de carga contratistas',
      ],
      [/transporte.*carga.*(contratistas|terceros|colaboradores)/i, /vehiculos.*carga.*(contratistas|terceros)/i, /carga.*(contratistas|terceros)/i]
    );

    const pasajerosTerceros = extraerValor(
      row,
      [
        'Número de vehículos de transporte de pasajeros (bus, microbus, bus articulado, etc.) de contratistas, terceros o de colaboradores usados en desplazamientos laborales.',
        'Número de vehículos de transporte de pasajeros (bus, microbus, bus articulado, etc.) de contratistas, terceros o de colaboradores usados en desplazamientos laborales',
        'Número de vehículos de transporte de pasajeros de contratistas',
        'Transporte de pasajeros contratistas',
      ],
      [/transporte.*pasajeros.*(contratistas|terceros|colaboradores)/i, /vehiculos.*pasajeros.*(contratistas|terceros)/i, /pasajeros.*(contratistas|terceros)/i]
    );

    const maquinariaAmarillaTerceros = extraerValor(
      row,
      [
        'Número de vehículos de maquinaria amarilla de contratistas, terceros o de colaboradores usados en desplazamientos laborales.',
        'Número de vehículos de maquinaria amarilla de contratistas, terceros o de colaboradores usados en desplazamientos laborales',
        'Número de vehículos de maquinaria amarilla de contratistas',
        'Maquinaria amarilla contratistas',
      ],
      [/maquinaria.*amarilla.*(contratistas|terceros|colaboradores)/i]
    );

    const vehiculosPropios =
      carrosCamionetasPropios +
      motosPropias +
      bicicletasMicromovilidadPropias +
      cargaPropios +
      pasajerosPropios +
      maquinariaAmarillaPropia;

    const vehiculosTerceros =
      carrosTerceros +
      motosTerceros +
      bicicletasTerceros +
      cargaTerceros +
      pasajerosTerceros +
      maquinariaAmarillaTerceros;

    const sumaFlotaDesglosada = vehiculosPropios + vehiculosTerceros;

    const totalVehiculosColumna = extraerValor(
      row,
      [
        'Total_Vehiculos_Norma',
        'Total Flota Vehicular',
        'Total Vehículos',
        'Total Vehiculos',
        'Total_Vehiculos',
        'Total de vehículos',
        'Flota Total',
        'Total flota de vehículos usados en desplazamientos laborales',
      ],
      [/total.*veh[ií]culos.*norma/i, /total.*flota/i, /total.*veh[ií]culos/i]
    );

    // El total oficial de vehículos según norma: si hay desglose, la suma de las columnas es la verdad fáctica
    const totalVehiculosNorma = sumaFlotaDesglosada > 0
      ? Math.max(sumaFlotaDesglosada, totalVehiculosColumna)
      : totalVehiculosColumna;

    // 4. CONDUCTORES Y ACTORES VIALES - Desglose exacto
    const conductoresCarro = extraerValor(
      row,
      [
        'Cantidad de colaboradores que conducen carros y camionetas propios o de terceros usados en desplazamientos laborales.',
        'Cantidad de colaboradores que son conductores de carro y camioneta',
        'Cantidad de colaboradores que conducen carros y camionetas usados en desplazamientos laborales.',
        'Cantidad de colaboradores que conducen carros y camionetas en desplazamientos laborales.',
        'Cantidad de colaboradores que conducen carros y camionetas',
        'Cantidad de conductores de carros y camionetas',
        'Conductores Carros y Camionetas',
        'Conductores Carro',
      ],
      [/colaboradores.*conducen.*(carros|camionetas)/i, /conductores.*(carros|camionetas)/i]
    );

    const conductoresMotos = extraerValor(
      row,
      [
        'Cantidad de colaboradores que conducen motocicletas y ciclomotores propios o de terceros usados en desplazamientos laborales.',
        'Cantidad de colaboradores que son conductores de motocicletas',
        'Cantidad de colaboradores que conducen motocicletas y ciclomotores usados en desplazamientos laborales.',
        'Cantidad de colaboradores que conducen motocicletas y ciclomotores en desplazamientos laborales.',
        'Cantidad de colaboradores que conducen motocicletas',
        'Cantidad de conductores de motocicletas',
        'Motociclistas',
        'Cantidad de colaboradores que son conductores de ciclomotores',
      ],
      [/colaboradores.*conducen.*(motos|motocicletas)/i, /conductores.*(motos|motocicletas)/i, /motociclistas/i]
    );

    const conductoresCarga = extraerValor(
      row,
      [
        'Cantidad de colaboradores que conducen vehículos de transporte de carga propios o de terceros usados en desplazamientos laborales.',
        'Cantidad de colaboradores que son conductores de vehículos de transporte de carga',
        'Cantidad de colaboradores que conducen vehículos de transporte de carga usados en desplazamientos laborales.',
        'Cantidad de colaboradores que conducen vehículos de transporte de carga en desplazamientos laborales.',
        'Cantidad de colaboradores que conducen transporte de carga',
        'Cantidad de conductores de transporte de carga',
        'Conductores Carga',
      ],
      [/colaboradores.*conducen.*(transporte de carga|carga)/i, /conductores.*(transporte de carga|carga)/i]
    );

    const conductoresPasajeros = extraerValor(
      row,
      [
        'Cantidad de colaboradores que conducen vehículos de transporte de pasajeros propios o de terceros usados en desplazamientos laborales.',
        'Cantidad de colaboradores que son conductores de vehículos de transporte de pasajeros (bus, microbus, bus articulado, etc.)',
        'Cantidad de colaboradores que conducen vehículos de transporte de pasajeros usados en desplazamientos laborales.',
        'Cantidad de colaboradores que conducen vehículos de transporte de pasajeros en desplazamientos laborales.',
        'Cantidad de colaboradores que conducen transporte de pasajeros',
        'Cantidad de conductores de transporte de pasajeros',
        'Conductores Pasajeros',
      ],
      [/colaboradores.*conducen.*(transporte de pasajeros|pasajeros)/i, /conductores.*(transporte de pasajeros|pasajeros)/i]
    );

    const conductoresMaquinaria = extraerValor(
      row,
      [
        'Cantidad de colaboradores que operan maquinaria amarilla propios o de terceros usados en desplazamientos laborales.',
        'Cantidad de colaboradores que son conductores de maquinaria amarilla',
        'Cantidad de colaboradores que operan maquinaria amarilla usados en desplazamientos laborales.',
        'Cantidad de colaboradores que conducen maquinaria amarilla',
        'Cantidad de operadores de maquinaria amarilla',
      ],
      [/operadores.*maquinaria.*amarilla/i, /conductores.*maquinaria.*amarilla/i, /conducen.*maquinaria/i]
    );

    const conductoresCiclomotores = extraerValor(
      row,
      [
        'Cantidad de colaboradores que conducen ciclomotores',
        'Conductores Ciclomotores',
      ],
      [/conducen.*ciclomotores/i, /conductores.*ciclomotores/i]
    );

    const conductoresBicicletas = extraerValor(
      row,
      [
        'Cantidad de colaboradores que utilizan bicicleta, patineta eléctrica o micromovilidad propios o de terceros usados en desplazamientos laborales.',
        'Cantidad de colaboradores que utilizan bicicleta en desplazamientos laborales.',
        'Cantidad de colaboradores que utilizan bicicleta',
        'Ciclistas',
        'Cantidad de colaboradores que son conductores de bicicleta y bicicleta de pedaleo asistido',
      ],
      [/colaboradores.*(usan|utilizan|conducen).*bicicleta/i, /conductores.*bicicleta/i, /ciclistas/i]
    );

    const conductoresPatinetas = extraerValor(
      row,
      [
        'Cantidad de colaboradores que utilizan patineta eléctrica o micromovilidad',
        'Conductores Patinetas',
        'Cantidad de colaboradores que son conductores de patineta eléctrica y otros vehiculos de micromovilidad',
      ],
      [/colaboradores.*(usan|utilizan).*patineta/i, /conductores.*patineta/i]
    );

    const peatonesExclusivos = extraerValor(
      row,
      [
        'Cantidad de colaboradores que son únicamente peatones en sus desplazamientos laborales.',
        'Cantidad de colaboradores que son únicamente peatones en sus desplazamientos laborales',
        'Cantidad de colaboradores que son únicamente peatones',
        'Colaboradores que son únicamente peatones',
        'Peatones Exclusivos',
        'Peatones',
        'Cantidad de colaboradores que son únicamente peatones',
      ],
      [/unicamente.*peatones/i, /colaboradores.*peatones/i, /peatones/i]
    );

    const sumaConductoresDesglosados =
      conductoresCarro +
      conductoresMotos +
      conductoresCarga +
      conductoresPasajeros +
      conductoresMaquinaria +
      conductoresCiclomotores +
      conductoresBicicletas +
      conductoresPatinetas;

    const totalConductoresColumna = extraerValor(
      row,
      [
        'Total_Conductores_Norma',
        'Total Conductores',
        'Total Conductores Norma',
        'Total_Conductores',
        'Total de colaboradores que conducen vehículos',
        'Total colaboradores que conducen',
        'Total conductores',
        'Personal de conductores',
      ],
      [/total.*conductores.*norma/i, /total.*conductores/i, /colaboradores.*conducen.*veh[ií]culos/i]
    );

    const totalConductoresNorma = sumaConductoresDesglosados > 0
      ? Math.max(sumaConductoresDesglosados, totalConductoresColumna)
      : totalConductoresColumna;

    // Objeto flota estructurado con valores reales
    const flotaObj: FlotaVehicular = {
      carrosCamionetasPropios,
      motosPropias,
      bicicletasMicromovilidadPropias,
      cargaPropios,
      pasajerosPropios,
      maquinariaAmarillaPropia,
      carrosTerceros,
      motosTerceros,
      bicicletasTerceros,
      cargaTerceros,
      pasajerosTerceros,
      maquinariaAmarillaTerceros,
      totalVehiculos: totalVehiculosNorma,
    };

    // Si no hubo desglose individual (todas en 0) pero sí un total global reportado:
    if (sumaFlotaDesglosada === 0 && totalVehiculosNorma > 0) {
      const c = Math.floor(totalVehiculosNorma * 0.4);
      const crg = Math.floor(totalVehiculosNorma * 0.25);
      const m = Math.floor(totalVehiculosNorma * 0.15);
      const pas = Math.max(0, totalVehiculosNorma - (c + crg + m));
      flotaObj.carrosCamionetasPropios = c;
      flotaObj.cargaPropios = crg;
      flotaObj.motosPropias = m;
      flotaObj.pasajerosPropios = pas;
    }

    // Objeto conductores estructurado con valores reales
    const conductoresObj: CensoConductores = {
      conductoresCarro,
      conductoresCarga,
      conductoresPasajeros,
      conductoresMaquinaria,
      conductoresMotos,
      conductoresCiclomotores,
      conductoresBicicletas,
      conductoresPatinetas,
      peatonesExclusivos,
      totalConductoresNorma,
    };

    // Si no hubo desglose individual pero sí un total global de conductores:
    if (sumaConductoresDesglosados === 0 && totalConductoresNorma > 0) {
      const c = Math.floor(totalConductoresNorma * 0.5);
      const crg = Math.floor(totalConductoresNorma * 0.3);
      const pas = Math.floor(totalConductoresNorma * 0.1);
      const mot = Math.max(0, totalConductoresNorma - (c + crg + pas));
      conductoresObj.conductoresCarro = c;
      conductoresObj.conductoresCarga = crg;
      conductoresObj.conductoresPasajeros = pas;
      conductoresObj.conductoresMotos = mot;
    }

    // 5. Clasificación Reportada vs Calculada
    let clasificacionReportada: NivelPESV = 'BÁSICO';
    const clasifRaw = (
      row['Clasificación de su empresa'] ||
      row['Nivel Reportado'] ||
      row['Clasificación'] ||
      'BÁSICO'
    ).toString().toUpperCase();

    if (clasifRaw.includes('AVANZ')) clasificacionReportada = 'AVANZADO';
    else if (clasifRaw.includes('ESTÁND') || clasifRaw.includes('ESTAND')) clasificacionReportada = 'ESTÁNDAR';
    else if (clasifRaw.includes('NO OBLIG')) clasificacionReportada = 'NO OBLIGADO';
    else clasificacionReportada = 'BÁSICO';

    const clasificacionCalculada =
      calcularNivelPESV(misionalidad, totalVehiculosNorma, totalConductoresNorma);

    const esClasificacionCorrecta = clasificacionReportada === clasificacionCalculada;
    let discrepanciaClasificacion: string | undefined = undefined;
    if (!esClasificacionCorrecta) {
      discrepanciaClasificacion = `Reportó ${clasificacionReportada}, pero por flota (${totalVehiculosNorma} veh) y censo de conductores (${totalConductoresNorma} cond) la norma legal exige ${clasificacionCalculada}`;
    }

    // 5. Categoría de Formulario
    let categoriaFormulario: CategoriaFormulario = 'A';
    const catRaw = (row['Categoria'] || row['Categoría Formulario'] || row['Categoria_Formulario'] || 'A').toString().toUpperCase();
    if (catRaw === 'B') categoriaFormulario = 'B';
    else if (catRaw === 'C') categoriaFormulario = 'C';
    else categoriaFormulario = 'A';

    const flagP1 = num(row['Flag_P1'], categoriaFormulario === 'A' ? 1 : 1);
    const flagP2 = num(row['Flag_P2'], categoriaFormulario === 'A' || categoriaFormulario === 'B' ? 1 : 0);
    const flagP3 = num(row['Flag_P3'], categoriaFormulario === 'A' ? 1 : 0);
    const cantidadFormularios = flagP1 + flagP2 + flagP3;

    // Normalizar fila con Diccionario Oficial de Variables PESV
    const rowNorm = normalizarFilaConDiccionario(row);
    const calcs = recalcularIndicadoresEstandarizados(rowNorm);

    // 6. Indicadores con 4 Niveles de Pérdida (Refactorizado)
    // 6. Indicadores con 4 Niveles de Pérdida (Limpiado de defaults y bugs de ceros)
    const kmRecorridos =
      calcs['I1_km_año'] ??
      calcs['I1_km_primer_trimestre'] ??
      extraerValor(row, ['kmRecorridosTrimestre', 'Km Recorridos Trimestre', 'Km_Trimestre', 'Kilómetros recorridos por la flota en el trimestre'], [/km.*trimestre/i, /kil[oó]metros.*recorridos/i]);

    // Matriz sin los defaults estáticos (defDir / defIndir) que sobreescribían los 0 reales
    const configuracionNiveles = [
      { nivel: 1, claves: ['TSV Fatalidades', 'Siniestros Fatales'], regex: [/tsv.*fatalidades/i, /siniestros.*fatales/i] },
      { nivel: 2, claves: ['TSV Heridos Graves', 'Siniestros Graves'], regex: [/tsv.*graves/i, /heridos.*graves/i] },
      { nivel: 3, claves: ['TSV Heridos Leves', 'Siniestros Leves'], regex: [/tsv.*leves/i, /heridos.*leves/i] },
      { nivel: 4, claves: ['TSV Choques Simples', 'Choques Simples'], regex: [/tsv.*choques/i, /da[ñn]os.*materiales/i] }
    ];

    const metricasPorNivel: Record<string, number> = {};
    let tsvSumaTotal = 0;
    let sumaCostosDirectos = 0;
    let sumaCostosIndirectos = 0;

    configuracionNiveles.forEach(({ nivel, claves, regex }) => {
      // Usar Nullish (??) respeta el 0 si el diccionario oficial lo calculó como 0
      const nSiniestros = calcs[`I1_Nivel${nivel}_n_año`] ?? calcs[`I1_Nivel${nivel}_n_primer_trimestre`] ?? extraerValor(row, claves, regex);
      const tsvCalculado = calcs[`I1_TSV_Nivel${nivel}_año`] ?? calcs[`I1_TSV_Nivel${nivel}_primer_trimestre`] ?? (kmRecorridos > 0 ? (nSiniestros * 1000000) / kmRecorridos : 0);

      metricasPorNivel[`nNivel${nivel}`] = nSiniestros;
      metricasPorNivel[`tsvNivel${nivel}`] = tsvCalculado;
      tsvSumaTotal += tsvCalculado;

      // Extraer costos respetando el 0 absoluto (eliminados defDir y defIndir)
      const costoDir = calcs[`I2_Nivel${nivel}_directos_año`] ?? calcs[`I2_Nivel${nivel}_directos_primer_trimestre`] ?? 0;
      const costoIndir = calcs[`I2_Nivel${nivel}_indirectos_año`] ?? calcs[`I2_Nivel${nivel}_indirectos_primer_trimestre`] ?? 0;
      
      metricasPorNivel[`costosNivel${nivel}Directos`] = costoDir;
      metricasPorNivel[`costosNivel${nivel}Indirectos`] = costoIndir;
      metricasPorNivel[`costosNivel${nivel}Total`] = calcs[`I2_SV_Nivel${nivel}_año`] ?? (costoDir + costoIndir);
      
      sumaCostosDirectos += costoDir;
      sumaCostosIndirectos += costoIndir;
    });

    const tsvExtraido = extraerValor(row, ['TSV Total (por 1M km)', 'tsvTotal', 'Tasa de Siniestros Viales Total'], [/tsv.*total/i, /tasa.*siniestros/i]);
    const tsvTotal = tsvExtraido > 0 ? tsvExtraido : tsvSumaTotal;
    const costosTotales = sumaCostosDirectos + sumaCostosIndirectos;

    // Eliminados TODOS los fallbacks quemados (|| 85, || 92). extraerValor retorna 0 por defecto.
    const cmPesv = calcs['I4_CM_año'] ?? calcs['I4_CM_primer_trimestre'] ?? extraerValor(row, ['Cumplimiento Metas (%)', 'cmPesv', 'CM_PESV', 'Porcentaje de cumplimiento de metas'], [/cumplimiento.*metas/i, /cm_pesv/i]);
    const cPlanPesv = calcs['I5_CPlan_año'] ?? calcs['I5_CPlan_primer_trimestre'] ?? extraerValor(row, ['Cumplimiento Actividades (%)', 'cPlanPesv', 'CPlan_PESV', 'Porcentaje de cumplimiento plan de trabajo'], [/cumplimiento.*actividades/i, /cplan/i]);
    const porcExcesoJornada = calcs['I6_%EJLC_año'] ?? calcs['I6_%EJLC_enero'] ?? extraerValor(row, ['% Exceso Jornadas Conductores', 'porcExcesoJornada', '%EJL', 'Porcentaje de exceso de jornadas laborales'], [/exceso.*jornada/i, /%ejl/i]);
    const gveCobertura = calcs['I7_nDe_año'] ?? calcs['I7_nDe_enero'] ?? extraerValor(row, ['Cobertura Gestión Velocidad GVE (%)', 'gveCobertura', 'GVE', 'Porcentaje de cobertura de gestión de velocidad'], [/cobertura.*velocidad/i, /gve/i]);
    const elvl = calcs['I8_ELVL_año'] ?? calcs['I8_ELVL_enero'] ?? extraerValor(row, ['Excesos Límite Velocidad ELVL (%)', 'elvl', 'ELVL', 'Porcentaje de excesos al límite de velocidad'], [/excesos.*l[ií]mite.*velocidad/i, /elvl/i]);
    const idp = calcs['I9_IDP_año'] ?? calcs['I9_IDP_enero'] ?? extraerValor(row, ['Inspecciones Preoperacionales IDP (%)', 'idp', 'IDP', 'Porcentaje de inspecciones diarias preoperacionales'], [/inspecciones.*preoperacionales/i, /idp/i]);
    const cpmvh = calcs['I10_CPMV_año'] ?? calcs['I10_CPMV_primer_trimestre'] ?? extraerValor(row, ['Mantenimiento Preventivo CPMVh (%)', 'cpmvh', 'CPMVh', 'Porcentaje de mantenimiento preventivo'], [/mantenimiento.*preventivo/i, /cpmvh/i]);
    const cpfCumplimiento = calcs['I11_CPFSV_año'] ?? calcs['I11_CPFSV_primer_trimestre'] ?? extraerValor(row, ['Cumplimiento Formación CPFSV (%)', 'cpfCumplimiento', 'CPFSV', 'Porcentaje de cumplimiento del plan de formación'], [/cumplimiento.*formaci[oó]n/i, /cpfsv/i]);
    const cpfCobertura = calcs['I12_CPF_año'] ?? calcs['I12_CPF_primer_trimestre'] ?? extraerValor(row, ['Cobertura Formación (%)', 'cpfCobertura', 'Porcentaje de cobertura del plan de formación'], [/cobertura.*formaci[oó]n/i]);
    const ncac = calcs['I13_NCAC_año'] ?? extraerValor(row, ['No Conformidades Auditoría Cerradas (%)', 'ncac', 'NCAC', 'Porcentaje de cierre de no conformidades'], [/conformidades.*cerradas/i, /ncac/i]);

    const indicadores = {
      ...metricasPorNivel,

      tsvFatalidades: metricasPorNivel['tsvNivel1'],
      tsvHeridosGraves: metricasPorNivel['tsvNivel2'],
      tsvHeridosLeves: metricasPorNivel['tsvNivel3'],
      tsvChoquesSimples: metricasPorNivel['tsvNivel4'],
      tsvTotal,
      kmRecorridosTrimestre: kmRecorridos,

      costosDirectos: sumaCostosDirectos,
      costosIndirectos: sumaCostosIndirectos,
      costosTotales,

      riesgosIdentificadosInicio: calcs['I3_RSVI_inicio_año'] ?? 0,
      riesgosIdentificadosFin: calcs['I3_RSVI_fin_año'] ?? 0,
      rsvi: calcs['I3_RSVI'] ?? 0,
      riesgosAltosInicio: calcs['I3_GRV_inicio_año'] ?? 0,
      riesgosAltosFin: calcs['I3_GRV_fin_año'] ?? 0,
      grv: calcs['I3_GRV'] ?? 0,

      metasAlcanzadas: calcs['I4_nMetasAlcanzadas_año'] ?? 0,
      metasTotales: calcs['I4_nMetasDefinidas_año'] ?? 0,
      cmPesv,

      actividadesEjecutadas: calcs['I5_nActividadesEjecutadas_año'] ?? 0,
      actividadesProgramadas: calcs['I5_nActividadesProgramadas_año'] ?? 0,
      cPlanPesv,

      excesosJornadaDias: calcs['I6_nEJLdiarias_año'] ?? 0,
      sumatoriaDiasTrabajados: calcs['I6_sumaDiasTrabajados_año'] ?? totalConductoresNorma * 30,
      porcExcesoJornada,

      vehiculosGestionVelocidad: calcs['I7_nIncluidos_año'] ?? 0,
      vehiculosDesplazamientosLaborales: calcs['I7_nUtilizados_año'] ?? totalVehiculosNorma,
      gveCobertura,

      desplazamientosExcesoVelocidad: calcs['I8_nExcesoVel_año'] ?? 0,
      totalDesplazamientos: calcs['I8_nDesplazamientos_año'] ?? 0,
      elvl,

      vehiculosInspeccionadosDia: calcs['I9_nInspeccionados_año'] ?? 0,
      totalVehiculosOperando: calcs['I9_nVehículos_año'] ?? totalVehiculosNorma,
      idp,

      mantenimientosEjecutados: calcs['I10_nActividades_año'] ?? 0,
      mantenimientosProgramados: calcs['I10_nProgramadas_año'] ?? 0,
      cpmvh,

      capacitacionesEjecutadas: calcs['I11_nEjecutadas_año'] ?? 0,
      capacitacionesProgramadas: calcs['I11_nProgramadas_año'] ?? 0,
      cpfCumplimiento,

      colaboradoresCapacitados: calcs['I12_nCapacitados_año'] ?? 0,
      totalColaboradores: calcs['I12_nTotal_año'] ?? totalConductoresNorma + peatonesExclusivos,
      cpfCobertura,

      ncIdentificadas: calcs['I13_NCidentificadas_año'] ?? 0,
      ncCerradas: calcs['I13_NCcerradas_año'] ?? 0,
      ncac,
    } as any;

    // 7. Infracciones según catálogo CNT estandarizado
    const infraccionesObj: Record<string, any> = {
      C29: num(rowNorm['C29']) || num(row['C29 (Exceso Velocidad)']) || 0,
      C14: num(rowNorm['C14']) || num(row['C14 (Pico y Placa)']) || 0,
      C02: num(rowNorm['C02']) || num(row['C02 (Mal Parqueo)']) || 0,
      C38: num(rowNorm['C38']) || num(row['C38 (Técnico-Mecánica Vencida)']) || 0,
      D01: num(rowNorm['D01']) || num(row['D01 (Sin Licencia)']) || 0,
      D02: num(rowNorm['D02']) || 0,
      D04: num(rowNorm['D04']) || num(row['D04 (Sin SOAT)']) || 0,
      D05: num(rowNorm['D05']) || 0,
      E03: num(rowNorm['E03']) || num(row['E03 (Alcoholimetría)']) || 0,
      H04: num(rowNorm['H04']) || num(row['H04 (Exceso Horas Conducción)']) || 0,
      B01: num(rowNorm['B01']) || 0,
      B02: num(rowNorm['B02']) || 0,
      otrasInfracciones: num(row['Otras Infracciones']) || 0,
      totalInfracciones: 0,
    };

    // Poblar todos los códigos CNT encontrados en la fila
    CODIGOS_INFRACCIONES_CNT.forEach(({ codigo }) => {
      if (rowNorm[codigo] !== undefined) {
        infraccionesObj[codigo] = num(rowNorm[codigo]);
      }
    });

    const sumTotalInfracciones = Object.entries(infraccionesObj)
      .filter(([k]) => k !== 'totalInfracciones' && k !== 'otrasInfracciones')
      .reduce((acc, [, v]) => acc + (typeof v === 'number' ? v : 0), 0);

    infraccionesObj.totalInfracciones = num(row['Total Infracciones']) || sumTotalInfracciones;

    // 8. Coordenadas
    const muniMatch = MUNICIPIOS_CLAVE.find(m => m.nombre === municipio) || { lat: 4.6097, lon: -74.0817 };

    const { cumple, faltantes } = verificarIndicadoresEntregados(clasificacionCalculada, indicadores);

    // 9. Cálculo de Deltas de Incertidumbre multiformulario (dependen de si envió varios formularios)
    const deltasCalculados = calcularDeltasMultiFormulario(
      { cantidadFormularios, flagP1, flagP2, flagP3, categoriaFormulario, flota: flotaObj, conductores: conductoresObj },
      calcs
    );

    // Si el archivo ya traía columnas Delta_ explícitas, preservarlas
    const deltasMultiForm: Record<string, number> = { ...deltasCalculados };
    for (const [k, v] of Object.entries(row)) {
      if (k.startsWith('Delta_') && typeof v !== 'undefined' && v !== null && v !== '') {
        deltasMultiForm[k] = num(v);
      }
    }

    const empresaObj: Partial<EmpresaPESV> = {
      id: `EMP-${(idx + 1).toString().padStart(3, '0')}`,
      razonSocial,
      tipoDocumento: tipoDoc as any,
      numeroDocumento: numDoc,
      correo,
      anoReporte: ano,
      departamento,
      municipio,
      lat: muniMatch.lat,
      lon: muniMatch.lon,
      sectorEconomico,
      codigoCIIU,
      tipoOrganizacion,
      claseOrganizacion,
      misionalidad,
      clasificacionReportada,
      clasificacionCalculada,
      esClasificacionCorrecta,
      discrepanciaClasificacion,
      categoriaFormulario,
      flagP1,
      flagP2,
      flagP3,
      cantidadFormularios,
      estadoParte1: flagP1 === 1 ? categoriaFormulario : '',
      estadoParte2: flagP2 === 1 ? categoriaFormulario : '',
      estadoParte3: flagP3 === 1 ? categoriaFormulario : '',
      cumpleEntregaNivel: cumple,
      indicadoresFaltantesPorNivel: faltantes,
      flota: flotaObj,
      conductores: conductoresObj,
      indicadores,
      datosEstandarizados: calcs,
      deltasMultiFormulario: deltasMultiForm,
      deltasIncertidumbre: {
        tsvTotal: deltasMultiForm['Delta_I1_TSV_Nivel1_año'] || num(row['Delta_tsvTotal']) || num(row['Incertidumbre TSV (± delta)']) || (cantidadFormularios > 1 ? 0.25 : 0),
        elvl: deltasMultiForm['Delta_I8_ELVL_año'] || num(row['Delta_elvl']) || (cantidadFormularios > 1 ? 0.35 : 0),
        idp: deltasMultiForm['Delta_I9_IDP_año'] || num(row['Delta_idp']) || (cantidadFormularios > 1 ? 1.1 : 0),
        cpmvh: deltasMultiForm['Delta_I10_CPMV_año'] || num(row['Delta_cpmvh']) || (cantidadFormularios > 1 ? 1.5 : 0),
        cmPesv: deltasMultiForm['Delta_I4_CM_año'] || (cantidadFormularios > 1 ? 1.2 : 0),
        cPlanPesv: deltasMultiForm['Delta_I5_CPlan_año'] || (cantidadFormularios > 1 ? 1.0 : 0),
        porcExcesoJornada: deltasMultiForm['Delta_I6_%EJLC_año'] || (cantidadFormularios > 1 ? 0.2 : 0),
        gveCobertura: deltasMultiForm['Delta_I7_nDe_año'] || (cantidadFormularios > 1 ? 1.5 : 0),
        cpfCumplimiento: deltasMultiForm['Delta_I11_CPFSV_año'] || (cantidadFormularios > 1 ? 1.8 : 0),
        cpfCobertura: deltasMultiForm['Delta_I12_CPF_año'] || (cantidadFormularios > 1 ? 1.4 : 0),
        ncac: deltasMultiForm['Delta_I13_NCAC_año'] || (cantidadFormularios > 1 ? 2.0 : 0),
      },
      infracciones: infraccionesObj as any,
      deltaInfracciones: Math.round(infraccionesObj.totalInfracciones * (cantidadFormularios > 1 ? 0.08 : 0.02) * 10) / 10,
    };

    const descMetas = (
      row['Descripción de las metas del PESV del año finalizado.'] ||
      row['Descripción de las metas del PESV del año finalizado'] ||
      row['Descripción de las metas del PESV'] ||
      row['Metas del PESV'] ||
      row['Descripción de metas'] ||
      ''
    ).toString().trim();

    empresaObj.descripcionMetas = descMetas;
    empresaObj.metasCategorizadas = clasificarMetasTexto(descMetas);
    empresaObj.riesgosPaso6 = generarRiesgosDinamicosEmpresa(empresaObj);
    empresaObj.alertas = generarAlertasANSV(empresaObj);
    return empresaObj as EmpresaPESV;
  });
}