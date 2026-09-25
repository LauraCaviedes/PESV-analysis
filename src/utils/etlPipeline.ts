/**
 * Pipeline ETL de Consolidación e Incertidumbre PESV
 * Implementación exacta del algoritmo Python provisto por el usuario:
 * 1. Estabilización de Año
 * 2. Normalización y triangulación de nombres (Votación + Función de Puntaje S.A.S. / NIT)
 * 3. Estandarización de Tipo de Documento y Correos
 * 4. Detección Inteligente de Duplicados ('Conservar', 'Eliminar', 'Revisar')
 * 5. Colapso 1:1 y cálculo de Incertidumbre Global Fija (Delta_X = suma_max / T)
 * 6. Cruce Total (Outer Merge) y asignación de Categorías A, B y C
 */

export interface RegistroFormularioRaw {
  [key: string]: any;
  'Año del reporte de autogestión'?: any;
  'Razón Social Estándar'?: any;
  'Tipo de documento'?: any;
  'Número de documento'?: any;
  'Correo Electrónico Estándar'?: any;
}

export interface ResultadoRevisionDuplicado {
  registro: RegistroFormularioRaw;
  columnasClave: Record<string, any>;
  totalVacios: number;
  sugerenciaAccion: string;
}

export interface ResumenETL {
  totalFilasP1: number;
  totalFilasP2: number;
  totalFilasP3: number;
  empresasUnicas: number;
  duplicadosDetectados: number;
  categoriasConteo: { A: number; B: number; C: number };
  deltasGlobales: Record<string, number>;
  registrosCompletos: any[];
  registrosIncompletos: any[];
  resumenDuplicados: ResultadoRevisionDuplicado[];
}

/**
 * 1. Función de Puntaje para desempate de nombres
 * Penaliza NIT numérico (-500), premia S.A.S./S.A./LTDA (+100 / +50) y longitud
 */
export function evaluarNombrePuntaje(nombre: string): number {
  if (!nombre) return -999;
  let puntaje = 0;
  const nombreLimpio = nombre.toString().trim();
  const nombreUpper = nombreLimpio.toUpperCase();

  // Castigo severo si son puros números (puso el NIT en el nombre)
  const soloDigitos = nombreLimpio.replace(/[\s.-]/g, '');
  if (/^\d+$/.test(soloDigitos)) {
    puntaje -= 500;
  }

  // Premios por nomenclatura formal
  if (/\b(S\.A\.S\.|S\.A\.|S\.C\.A\.|LTDA\.|INC\.)\b/i.test(nombreUpper)) {
    puntaje += 100;
  } else if (/\b(SAS|SA|SCA|LTDA)\b/i.test(nombreUpper)) {
    puntaje += 50;
  }

  // Premio por longitud
  puntaje += nombreLimpio.length;
  return puntaje;
}

/**
 * 2. Lógica combinada: Votación + Desempate por puntaje
 */
export function elegirNombreMaestro(nombres: string[]): string {
  if (nombres.length === 0) return '';
  const frecuencias: Record<string, number> = {};

  for (const n of nombres) {
    const limpio = n.replace(/[\t\n\r]/g, ' ').replace(/\s+/g, ' ').trim();
    if (limpio) {
      frecuencias[limpio] = (frecuencias[limpio] || 0) + 1;
    }
  }

  const candidatos = Object.keys(frecuencias);
  if (candidatos.length === 0) return '';

  const maxFreq = Math.max(...Object.values(frecuencias));
  const empatados = candidatos.filter(c => frecuencias[c] === maxFreq);

  if (empatados.length === 1) {
    return empatados[0];
  }

  // Desempate por puntaje
  let mejorNombre = empatados[0];
  let mejorPuntaje = -9999;

  for (const c of empatados) {
    const p = evaluarNombrePuntaje(c);
    if (p > mejorPuntaje) {
      mejorPuntaje = p;
      mejorNombre = c;
    }
  }

  return mejorNombre;
}

/**
 * 3. Determinar Tipo de Documento (NIT vs C.C.)
 */
export function determinarTipoDocumento(razonSocial: string, tiposDoc: string[]): 'NIT' | 'C.C.' {
  if (razonSocial.toLowerCase().includes('persona natural')) {
    return 'C.C.';
  }

  let votosCC = 0;
  let votosNIT = 0;

  for (const t of tiposDoc) {
    if (!t) continue;
    const limpio = t.toString().toUpperCase().replace(/\./g, '').trim();
    if (['CC', 'CEDULA', 'CEDULA DE CIUDADANIA', 'CÉDULA'].includes(limpio)) {
      votosCC++;
    } else if (limpio.includes('NIT')) {
      votosNIT++;
    }
  }

  return votosCC > votosNIT ? 'C.C.' : 'NIT';
}

/**
 * 4. Consolidar Correos Electrónicos
 */
export function consolidarCorreos(correos: string[]): string {
  const setCorreos = new Set<string>();
  for (const c of correos) {
    if (!c) continue;
    const items = c.toString().replace(/;/g, ',').split(',');
    for (const item of items) {
      const limpio = item.trim().toLowerCase();
      if (limpio && limpio.includes('@')) {
        setCorreos.add(limpio);
      }
    }
  }
  return Array.from(setCorreos).join(', ');
}

/**
 * Cuenta cuántos campos vacíos o nulos tiene un registro
 */
export function contarVacios(fila: Record<string, any>): number {
  let vacios = 0;
  for (const key of Object.keys(fila)) {
    const val = fila[key];
    if (val === null || val === undefined || (typeof val === 'string' && val.trim() === '')) {
      vacios++;
    }
  }
  return vacios;
}

/**
 * Ejecutor completo del Pipeline ETL según el script de Python provisto por el usuario
 */
export function ejecutarPipelineETL(
  p1: RegistroFormularioRaw[],
  p2: RegistroFormularioRaw[],
  p3: RegistroFormularioRaw[]
): ResumenETL {
  // Limpieza inicial de año y espacios
  const sanitizar = (df: RegistroFormularioRaw[]) => {
    return df.map(row => {
      const copy = { ...row };
      if (copy['Año del reporte de autogestión']) {
        const anoStr = copy['Año del reporte de autogestión']
          .toString()
          .replace(' (opcional)', '')
          .trim();
        const anoInt = parseInt(anoStr, 10);
        copy['Año del reporte de autogestión'] = isNaN(anoInt) ? 2024 : anoInt;
      } else {
        copy['Año del reporte de autogestión'] = 2024;
      }
      return copy;
    });
  };

  const parte1 = sanitizar(p1);
  const parte2 = sanitizar(p2);
  const parte3 = sanitizar(p3);

  // 1. Recolección de nombres por documento para triangulación
  const nombresPorDoc: Record<string, string[]> = {};
  const tiposPorDoc: Record<string, string[]> = {};
  const correosPorDoc: Record<string, string[]> = {};

  const registrar = (row: RegistroFormularioRaw) => {
    const doc = (row['Número de documento'] || '').toString().trim();
    if (!doc) return;

    if (!nombresPorDoc[doc]) nombresPorDoc[doc] = [];
    if (row['Razón Social Estándar']) nombresPorDoc[doc].push(row['Razón Social Estándar']);

    if (!tiposPorDoc[doc]) tiposPorDoc[doc] = [];
    if (row['Tipo de documento']) tiposPorDoc[doc].push(row['Tipo de documento']);

    if (!correosPorDoc[doc]) correosPorDoc[doc] = [];
    if (row['Correo Electrónico Estándar']) correosPorDoc[doc].push(row['Correo Electrónico Estándar']);
  };

  parte1.forEach(registrar);
  parte2.forEach(registrar);
  parte3.forEach(registrar);

  // Calcular diccionarios oficiales ganadores
  const dictNombresOficiales: Record<string, string> = {};
  const dictTiposDocOficiales: Record<string, string> = {};
  const dictCorreosOficiales: Record<string, string> = {};

  for (const doc of Object.keys(nombresPorDoc)) {
    const nombreGanador = elegirNombreMaestro(nombresPorDoc[doc]);
    dictNombresOficiales[doc] = nombreGanador;
    dictTiposDocOficiales[doc] = determinarTipoDocumento(nombreGanador, tiposPorDoc[doc] || []);
    dictCorreosOficiales[doc] = consolidarCorreos(correosPorDoc[doc] || []);
  }

  // Mapear de regreso a las 3 partes
  const estandarizarParte = (df: RegistroFormularioRaw[]) => {
    return df.map(row => {
      const doc = (row['Número de documento'] || '').toString().trim();
      return {
        ...row,
        'Razón Social Estándar': dictNombresOficiales[doc] || row['Razón Social Estándar'] || 'EMPRESA SIN NOMBRE',
        'Tipo de documento': dictTiposDocOficiales[doc] || row['Tipo de documento'] || 'NIT',
        'Correo Electrónico Estándar': dictCorreosOficiales[doc] || row['Correo Electrónico Estándar'] || '',
      };
    });
  };

  const p1Est = estandarizarParte(parte1);
  const p2Est = estandarizarParte(parte2);
  const p3Est = estandarizarParte(parte3);

  // Análisis inteligente de duplicados
  const resumenDuplicados: ResultadoRevisionDuplicado[] = [];
  const evaluarDuplicados = (df: RegistroFormularioRaw[], nombreParte: string) => {
    const grupos: Record<string, RegistroFormularioRaw[]> = {};
    for (const row of df) {
      const key = `${row['Año del reporte de autogestión']}_${row['Número de documento']}`;
      if (!grupos[key]) grupos[key] = [];
      grupos[key].push(row);
    }

    for (const key of Object.keys(grupos)) {
      const filas = grupos[key];
      if (filas.length > 1) {
        // Hay duplicados
        const filasConVacios = filas.map(f => ({ fila: f, vacios: contarVacios(f) }));
        const minVacios = Math.min(...filasConVacios.map(fv => fv.vacios));

        if (filas.length === 2) {
          const [f1, f2] = filasConVacios;
          if (f1.vacios < f2.vacios) {
            resumenDuplicados.push(
              { registro: f1.fila, columnasClave: { parte: nombreParte, doc: f1.fila['Número de documento'] }, totalVacios: f1.vacios, sugerenciaAccion: 'Conservar (Más Completo)' },
              { registro: f2.fila, columnasClave: { parte: nombreParte, doc: f2.fila['Número de documento'] }, totalVacios: f2.vacios, sugerenciaAccion: 'Eliminar (Incompleto)' }
            );
          } else if (f1.vacios > f2.vacios) {
            resumenDuplicados.push(
              { registro: f1.fila, columnasClave: { parte: nombreParte, doc: f1.fila['Número de documento'] }, totalVacios: f1.vacios, sugerenciaAccion: 'Eliminar (Incompleto)' },
              { registro: f2.fila, columnasClave: { parte: nombreParte, doc: f2.fila['Número de documento'] }, totalVacios: f2.vacios, sugerenciaAccion: 'Conservar (Más Completo)' }
            );
          } else {
            // Mismos vacíos
            resumenDuplicados.push(
              { registro: f1.fila, columnasClave: { parte: nombreParte, doc: f1.fila['Número de documento'] }, totalVacios: f1.vacios, sugerenciaAccion: 'Conservar (Original)' },
              { registro: f2.fila, columnasClave: { parte: nombreParte, doc: f2.fila['Número de documento'] }, totalVacios: f2.vacios, sugerenciaAccion: 'Eliminar (Mismos datos en ambos)' }
            );
          }
        } else {
          filasConVacios.forEach(fv => {
            resumenDuplicados.push({
              registro: fv.fila,
              columnasClave: { parte: nombreParte, doc: fv.fila['Número de documento'] },
              totalVacios: fv.vacios,
              sugerenciaAccion: fv.vacios === minVacios ? 'Conservar (El más completo)' : 'Eliminar / Revisar',
            });
          });
        }
      }
    }
  };

  evaluarDuplicados(p1Est, 'Parte 1');
  evaluarDuplicados(p2Est, 'Parte 2');
  evaluarDuplicados(p3Est, 'Parte 3');

  // Colapsar a 1:1 y calcular Incertidumbre Global Fija (Delta_X)
  const colapsarYCalcularIncertidumbre = (df: RegistroFormularioRaw[]) => {
    const grupos: Record<string, RegistroFormularioRaw[]> = {};
    for (const row of df) {
      const key = `${row['Año del reporte de autogestión']}_${row['Número de documento']}`;
      if (!grupos[key]) grupos[key] = [];
      grupos[key].push(row);
    }

    const T = Object.keys(grupos).length;
    const sumaGlobalMax: Record<string, number> = {};
    const filasUnicas: Record<string, any>[] = [];

    // Detectar columnas numéricas (excluyendo solo identificadores de texto, NIT y llaves)
    const esColumnaNumerica = (k: string, v: any) => {
      const kLower = k.toLowerCase().trim();
      if (
        kLower.includes('año') ||
        kLower.includes('documento') ||
        kLower.includes('nit') ||
        kLower.includes('razón social') ||
        kLower.includes('razon social') ||
        kLower.includes('correo') ||
        kLower.includes('municipio') ||
        kLower.includes('departamento') ||
        kLower.includes('sector') ||
        kLower.includes('ciiu') ||
        kLower.includes('clasificación') ||
        kLower.includes('clasificacion') ||
        kLower.includes('misionalidad') ||
        kLower.includes('tipo de organización') ||
        kLower.includes('clase de organización') ||
        kLower === 'id' ||
        kLower.endsWith('_id')
      ) {
        return false;
      }
      if (typeof v === 'number' && !isNaN(v)) return true;
      if (typeof v === 'string' && v.trim() !== '') {
        const parsed = parseFloat(v.replace(/[$,]/g, '').trim());
        return !isNaN(parsed);
      }
      return false;
    };

    const colNumericas = new Set<string>();
    for (const row of df) {
      for (const [k, v] of Object.entries(row)) {
        if (esColumnaNumerica(k, v)) {
          colNumericas.add(k);
        }
      }
    }

    for (const col of colNumericas) {
      sumaGlobalMax[col] = 0;
    }

    for (const key of Object.keys(grupos)) {
      const grupo = grupos[key];
      const filaConsolidada: Record<string, any> = { ...grupo[0] };

      for (const col of colNumericas) {
        const valores = grupo
          .map(g => {
            const raw = g[col];
            if (raw === null || raw === undefined || raw === '') return NaN;
            if (typeof raw === 'number') return isNaN(raw) ? NaN : raw;
            const parsed = parseFloat(String(raw).replace(/[$,]/g, '').trim());
            return isNaN(parsed) ? NaN : parsed;
          })
          .filter(v => !isNaN(v));

        if (valores.length > 0) {
          const mean = valores.reduce((a, b) => a + b, 0) / valores.length;
          const max = Math.max(...valores);
          filaConsolidada[col] = Number.isInteger(mean) ? mean : Math.round(mean * 100) / 100;
          sumaGlobalMax[col] += max;
        } else {
          filaConsolidada[col] = 0;
        }
      }

      filasUnicas.push(filaConsolidada);
    }

    // Agregar Delta_X = sumaGlobalMax / T
    const deltas: Record<string, number> = {};
    for (const col of colNumericas) {
      deltas[`Delta_${col}`] = T > 0 ? sumaGlobalMax[col] / T : 0;
    }

    const filasFinales = filasUnicas.map(f => ({
      ...f,
      ...deltas,
    }));

    return { filas: filasFinales, deltas };
  };

  const resP1 = colapsarYCalcularIncertidumbre(p1Est);
  const resP2 = colapsarYCalcularIncertidumbre(p2Est);
  const resP3 = colapsarYCalcularIncertidumbre(p3Est);

  // Outer Merge de las tres partes
  const mapaFinal: Record<string, any> = {};

  const agregarConBandera = (filas: any[], flagKey: string) => {
    for (const f of filas) {
      const key = `${f['Año del reporte de autogestión']}_${f['Número de documento']}`;
      if (!mapaFinal[key]) {
        mapaFinal[key] = {
          'Año del reporte de autogestión': f['Año del reporte de autogestión'],
          'Razón Social Estándar': f['Razón Social Estándar'],
          'Tipo de documento': f['Tipo de documento'],
          'Número de documento': f['Número de documento'],
          'Correo Electrónico Estándar': f['Correo Electrónico Estándar'],
          Flag_P1: 0,
          Flag_P2: 0,
          Flag_P3: 0,
        };
      }
      mapaFinal[key] = { ...mapaFinal[key], ...f, [flagKey]: 1 };
    }
  };

  agregarConBandera(resP1.filas, 'Flag_P1');
  agregarConBandera(resP2.filas, 'Flag_P2');
  agregarConBandera(resP3.filas, 'Flag_P3');

  const filasMaestras = Object.values(mapaFinal).map(row => {
    const cant = (row.Flag_P1 || 0) + (row.Flag_P2 || 0) + (row.Flag_P3 || 0);
    const cat = cant === 3 ? 'A' : cant === 2 ? 'B' : 'C';

    return {
      ...row,
      Cantidad_Formularios: cant,
      Categoria: cat,
      Estado_Parte1: row.Flag_P1 === 1 ? cat : '',
      Estado_Parte2: row.Flag_P2 === 1 ? cat : '',
      Estado_Parte3: row.Flag_P3 === 1 ? cat : '',
    };
  });

  // Ordenar visualmente: A primero, luego B, luego C
  filasMaestras.sort((a, b) => {
    if (b.Cantidad_Formularios !== a.Cantidad_Formularios) {
      return b.Cantidad_Formularios - a.Cantidad_Formularios;
    }
    return (a['Razón Social Estándar'] || '').localeCompare(b['Razón Social Estándar'] || '');
  });

  const registrosCompletos = filasMaestras.filter(f => f.Categoria === 'A');
  const registrosIncompletos = filasMaestras.filter(f => f.Categoria !== 'A');

  return {
    totalFilasP1: parte1.length,
    totalFilasP2: parte2.length,
    totalFilasP3: parte3.length,
    empresasUnicas: filasMaestras.length,
    duplicadosDetectados: resumenDuplicados.length,
    categoriasConteo: {
      A: registrosCompletos.length,
      B: filasMaestras.filter(f => f.Categoria === 'B').length,
      C: filasMaestras.filter(f => f.Categoria === 'C').length,
    },
    deltasGlobales: { ...resP1.deltas, ...resP2.deltas, ...resP3.deltas },
    registrosCompletos,
    registrosIncompletos,
    resumenDuplicados,
  };
}
