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
        'Cantidad de colaboradores que son conductores de vehículos de transporte de pasajeros (bus, microbus, bus articulado, etc.)',
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

    // 6. Indicadores
    const kmRecorridos = extraerValor(row, ['kmRecorridosTrimestre', 'Km Recorridos Trimestre', 'Km_Trimestre', 'Kilómetros recorridos por la flota en el trimestre'], [/km.*trimestre/i, /kil[oó]metros.*recorridos/i]) || 500000;
    const tsvFatalidades = extraerValor(row, ['TSV Fatalidades', 'tsvFatalidades', 'Siniestros Fatales'], [/tsv.*fatalidades/i, /siniestros.*fatales/i]);
    const tsvHeridosGraves = extraerValor(row, ['TSV Heridos Graves', 'tsvHeridosGraves', 'Siniestros Graves'], [/tsv.*graves/i, /heridos.*graves/i]);
    const tsvHeridosLeves = extraerValor(row, ['TSV Heridos Leves', 'tsvHeridosLeves', 'Siniestros Leves'], [/tsv.*leves/i, /heridos.*leves/i]);
    const tsvChoquesSimples = extraerValor(row, ['TSV Choques Simples', 'tsvChoquesSimples', 'Choques Simples'], [/tsv.*choques/i, /choques.*simples/i, /da[ñn]os.*materiales/i]);
    const tsvTotal = extraerValor(row, ['TSV Total (por 1M km)', 'tsvTotal', 'TSV_Total', 'Tasa de Siniestros Viales Total'], [/tsv.*total/i, /tasa.*siniestros/i]) || (tsvFatalidades + tsvHeridosGraves + tsvHeridosLeves + tsvChoquesSimples) || 1.8;

    const cmPesv = extraerValor(row, ['Cumplimiento Metas (%)', 'cmPesv', 'CM_PESV', 'Porcentaje de cumplimiento de metas'], [/cumplimiento.*metas/i, /cm_pesv/i]) || 85;
    const cPlanPesv = extraerValor(row, ['Cumplimiento Actividades (%)', 'cPlanPesv', 'CPlan_PESV', 'Porcentaje de cumplimiento plan de trabajo'], [/cumplimiento.*actividades/i, /cplan/i]) || 88;
    const porcExcesoJornada = extraerValor(row, ['% Exceso Jornadas Conductores', 'porcExcesoJornada', '%EJL', 'Porcentaje de exceso de jornadas laborales'], [/exceso.*jornada/i, /%ejl/i]) || 1.5;
    const gveCobertura = extraerValor(row, ['Cobertura Gestión Velocidad GVE (%)', 'gveCobertura', 'GVE', 'Porcentaje de cobertura de gestión de velocidad'], [/cobertura.*velocidad/i, /gve/i]) || 90;
    const elvl = extraerValor(row, ['Excesos Límite Velocidad ELVL (%)', 'elvl', 'ELVL', 'Porcentaje de excesos al límite de velocidad'], [/excesos.*l[ií]mite.*velocidad/i, /elvl/i]) || 2.4;
    const idp = extraerValor(row, ['Inspecciones Preoperacionales IDP (%)', 'idp', 'IDP', 'Porcentaje de inspecciones diarias preoperacionales'], [/inspecciones.*preoperacionales/i, /idp/i]) || 92;
    const cpmvh = extraerValor(row, ['Mantenimiento Preventivo CPMVh (%)', 'cpmvh', 'CPMVh', 'Porcentaje de mantenimiento preventivo'], [/mantenimiento.*preventivo/i, /cpmvh/i]) || 91;
    const cpfCumplimiento = extraerValor(row, ['Cumplimiento Formación CPFSV (%)', 'cpfCumplimiento', 'CPFSV', 'Porcentaje de cumplimiento del plan de formación'], [/cumplimiento.*formaci[oó]n/i, /cpfsv/i]) || 86;
    const cpfCobertura = extraerValor(row, ['Cobertura Formación (%)', 'cpfCobertura', 'Porcentaje de cobertura del plan de formación'], [/cobertura.*formaci[oó]n/i]) || 84;
    const ncac = extraerValor(row, ['No Conformidades Auditoría Cerradas (%)', 'ncac', 'NCAC', 'Porcentaje de cierre de no conformidades'], [/conformidades.*cerradas/i, /ncac/i]) || 80;

    const costosDirectos = num(row['Costos Directos (M COP)']) || num(row['costosDirectos']) || 40;
    const costosIndirectos = num(row['Costos Indirectos (M COP)']) || num(row['costosIndirectos']) || 15;
    const costosTotales = costosDirectos + costosIndirectos;

    const indicadores = {
      tsvFatalidades,
      tsvHeridosGraves,
      tsvHeridosLeves,
      tsvChoquesSimples,
      tsvTotal,
      kmRecorridosTrimestre: kmRecorridos,
      costosDirectos,
      costosIndirectos,
      costosTotales,
      riesgosIdentificadosInicio: 20,
      riesgosIdentificadosFin: 24,
      rsvi: 4,
      riesgosAltosInicio: 8,
      riesgosAltosFin: 4,
      grv: -4,
      metasAlcanzadas: Math.round((cmPesv / 100) * 12),
      metasTotales: 12,
      cmPesv,
      actividadesEjecutadas: Math.round((cPlanPesv / 100) * 30),
      actividadesProgramadas: 30,
      cPlanPesv,
      excesosJornadaDias: Math.round((porcExcesoJornada / 100) * (totalConductoresNorma * 30)),
      sumatoriaDiasTrabajados: totalConductoresNorma * 30,
      porcExcesoJornada,
      vehiculosGestionVelocidad: Math.round((gveCobertura / 100) * totalVehiculosNorma),
      vehiculosDesplazamientosLaborales: totalVehiculosNorma,
      gveCobertura,
      desplazamientosExcesoVelocidad: Math.round((elvl / 100) * 500),
      totalDesplazamientos: 500,
      elvl,
      vehiculosInspeccionadosDia: Math.round((idp / 100) * totalVehiculosNorma),
      totalVehiculosOperando: totalVehiculosNorma,
      idp,
      mantenimientosEjecutados: Math.round((cpmvh / 100) * 20),
      mantenimientosProgramados: 20,
      cpmvh,
      capacitacionesEjecutadas: Math.round((cpfCumplimiento / 100) * 10),
      capacitacionesProgramadas: 10,
      cpfCumplimiento,
      colaboradoresCapacitados: Math.round((cpfCobertura / 100) * (totalConductoresNorma + peatonesExclusivos)),
      totalColaboradores: totalConductoresNorma + peatonesExclusivos,
      cpfCobertura,
      ncIdentificadas: 4,
      ncCerradas: Math.round((ncac / 100) * 4),
      ncac,
    };

    // 7. Infracciones
    const c29 = num(row['C29']) || num(row['C29 (Exceso Velocidad)']) || 0;
    const c14 = num(row['C14']) || num(row['C14 (Pico y Placa)']) || 0;
    const c02 = num(row['C02']) || num(row['C02 (Mal Parqueo)']) || 0;
    const c38 = num(row['C38']) || num(row['C38 (Técnico-Mecánica Vencida)']) || 0;
    const d01 = num(row['D01']) || num(row['D01 (Sin Licencia)']) || 0;
    const d04 = num(row['D04']) || num(row['D04 (Sin SOAT)']) || 0;
    const e03 = num(row['E03']) || num(row['E03 (Alcoholimetría)']) || 0;
    const h04 = num(row['H04']) || num(row['H04 (Exceso Horas Conducción)']) || 0;
    const otras = num(row['Otras Infracciones']) || 0;
    const totalInfracciones = num(row['Total Infracciones']) || (c29 + c14 + c02 + c38 + d01 + d04 + e03 + h04 + otras);

    // 8. Coordenadas
    const muniMatch = MUNICIPIOS_CLAVE.find(m => m.nombre === municipio) || { lat: 4.6097, lon: -74.0817 };

    const { cumple, faltantes } = verificarIndicadoresEntregados(clasificacionCalculada, indicadores);

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
      deltasIncertidumbre: {
        tsvTotal: num(row['Delta_tsvTotal']) || num(row['Incertidumbre TSV (± delta)']) || 0.15,
        elvl: num(row['Delta_elvl']) || 0.35,
        idp: num(row['Delta_idp']) || 1.1,
        cpmvh: num(row['Delta_cpmvh']) || 1.5,
        cmPesv: 1.2,
        cPlanPesv: 1.0,
        porcExcesoJornada: 0.2,
        gveCobertura: 1.5,
        cpfCumplimiento: 1.8,
        cpfCobertura: 1.4,
        ncac: 2.0,
      },
      infracciones: {
        C29: c29,
        C14: c14,
        C02: c02,
        C38: c38,
        D01: d01,
        D02: 0,
        D04: d04,
        D05: 0,
        E03: e03,
        H04: h04,
        B01: 0,
        B02: 0,
        otrasInfracciones: otras,
        totalInfracciones,
      },
      deltaInfracciones: Math.round(totalInfracciones * 0.08 * 10) / 10,
    };

    empresaObj.alertas = generarAlertasANSV(empresaObj);
    return empresaObj as EmpresaPESV;
  });
}
