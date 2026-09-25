/**
 * Módulo de Text Analytics y Clasificación Inteligente de Metas PESV
 * Cumplimiento Paso 7 y Resolución 40595 de 2022 (Ministerio de Transporte de Colombia)
 */

import { CategoriaMetaPESV, MetaCategorizada, EmpresaPESV } from '../types/pesv';

export interface ReglaCategoriaMeta {
  categoria: CategoriaMetaPESV;
  nombre: string;
  color: string;
  palabrasClave: string[];
  patronesRegex: RegExp[];
  pasosNorma: number[];
}

export const REGLAS_METAS_NORMATIVAS: ReglaCategoriaMeta[] = [
  {
    categoria: 'REDUCCION_SINIESTROS',
    nombre: 'Reducción de Siniestralidad Vial',
    color: '#ef4444',
    palabrasClave: [
      'reducir', 'reduccion', 'reducción', 'siniestralidad', 'siniestros',
      'fatalidad', 'fatalidades', 'muertes', 'fallecidos', 'lesionados',
      'heridos', 'choques', 'accidentalidad', 'accidentes', 'cero muertes',
      'cero victimas', 'cero víctimas', 'tasa de siniestros'
    ],
    patronesRegex: [
      /reduc(ir|ci[oó]n).*(siniestr|accidente|fatalidad|mortalidad|lesi[oó]n)/i,
      /cero.*(v[ií]ctimas|fatalidad|muertes|accidentes)/i,
      /disminu(ir|ci[oó]n).*(siniestralidad|choques)/i,
    ],
    pasosNorma: [7, 12, 13, 20],
  },
  {
    categoria: 'GESTION_VELOCIDAD',
    nombre: 'Gestión de la Velocidad Segura',
    color: '#f97316',
    palabrasClave: [
      'velocidad', 'limite de velocidad', 'límite de velocidad', 'gps',
      'telemetria', 'telemetría', 'exceso de velocidad', 'control de velocidad',
      'c29', 'monitoreo de velocidad', 'geocercas', 'desaceleracion', 'frenadas'
    ],
    patronesRegex: [
      /control.*velocidad/i,
      /l[ií]mites?.*velocidad/i,
      /excesos?.*velocidad/i,
      /telemetr[ií]a|gps/i,
    ],
    pasosNorma: [8, 15, 20],
  },
  {
    categoria: 'CAPACITACION_Y_FORMACION',
    nombre: 'Capacitación y Formación Vial',
    color: '#3b82f6',
    palabrasClave: [
      'capacitar', 'capacitacion', 'capacitación', 'formacion', 'formación',
      'entrenamiento', 'competencias', 'talleres', 'sensibilizacion',
      'sensibilización', 'escuela vial', 'conductores', 'charlas', 'induccion'
    ],
    patronesRegex: [
      /capacit(ar|aci[oó]n|aciones)/i,
      /formaci[oó]n.*(vial|conductores|seguridad)/i,
      /plan.*formaci[oó]n/i,
      /sensibiliz(ar|aci[oó]n)/i,
    ],
    pasosNorma: [10, 20],
  },
  {
    categoria: 'MANTENIMIENTO_E_INSPECCION',
    nombre: 'Mantenimiento Preventivo e Inspección Diaria (IDP)',
    color: '#10b981',
    palabrasClave: [
      'mantenimiento', 'preventivo', 'inspeccion', 'inspección', 'preoperacional',
      'idp', 'lista de chequeo', 'inspecciones diarias', 'rtm', 'tecnico mecanica',
      'técnico-mecánica', 'soat', 'flota', 'vehiculos', 'hoja de vida'
    ],
    patronesRegex: [
      /mantenimiento.*preventivo/i,
      /inspecci[oó]n.*(preoperacional|diaria)/i,
      /chequeo.*preoperacional/i,
      /t[eé]cnico.*mec[aá]nica/i,
    ],
    pasosNorma: [16, 17, 20],
  },
  {
    categoria: 'FATIGA_Y_JORNADAS',
    nombre: 'Prevención de Fatiga y Control de Jornadas',
    color: '#8b5cf6',
    palabrasClave: [
      'fatiga', 'jornadas', 'jornada laboral', 'descanso', 'pausas activas',
      'horas de conduccion', 'horas de conducción', 'microsueno', 'microsueño',
      'turnos', 'h04', 'sobrejornada', 'sueno', 'sueño'
    ],
    patronesRegex: [
      /prevenci[oó]n.*fatiga/i,
      /pausas?.*activas?/i,
      /control.*(jornada|turnos|descanso)/i,
      /horas?.*conducci[oó]n/i,
    ],
    pasosNorma: [8, 15, 20],
  },
  {
    categoria: 'CERO_TOLERANCIA_SUSTANCIAS',
    nombre: 'Cero Tolerancia a Alcohol y Sustancias',
    color: '#dc2626',
    palabrasClave: [
      'cero tolerancia', 'alcohol', 'alcoholemia', 'alcoholimetria',
      'alcoholimetría', 'drogas', 'sustancias psicoactivas', 'spa',
      'embriaguez', 'pruebas de alcohol', 'e03', 'sobriedad'
    ],
    patronesRegex: [
      /cero.*tolerancia/i,
      /alcohol(imetr[ií]a|emia)?/i,
      /sustancias?.*psicoactivas?/i,
      /pruebas?.*alcohol/i,
    ],
    pasosNorma: [8, 15],
  },
  {
    categoria: 'CINTURON_Y_EPP',
    nombre: 'Uso de Cinturón de Seguridad y EPP',
    color: '#06b6d4',
    palabrasClave: [
      'cinturon', 'cinturón', 'cinturon de seguridad', 'cinturón de seguridad',
      'epp', 'casco', 'chaleco', 'elementos de proteccion', 'protección personal',
      'arnes', 'arnés', 'visibilidad'
    ],
    patronesRegex: [
      /cintur[oó]n.*seguridad/i,
      /uso.*(casco|epp|chaleco)/i,
      /elementos?.*protecci[oó]n/i,
    ],
    pasosNorma: [8, 15],
  },
  {
    categoria: 'AUDITORIA_Y_MEJORA',
    nombre: 'Auditoría Anual y Mejora Continua',
    color: '#64748b',
    palabrasClave: [
      'auditoria', 'auditoría', 'no conformidades', 'acciones correctivas',
      'ncac', 'mejora continua', 'plan de trabajo', 'cplan', 'evaluacion anual',
      'evaluación anual', 'revision por la direccion', 'revisión por la dirección'
    ],
    patronesRegex: [
      /auditor[ií]a.*(anual|interna)/i,
      /acciones?.*(correctivas?|preventivas?)/i,
      /no.*conformidades?/i,
      /mejora.*continua/i,
    ],
    pasosNorma: [22, 23, 24],
  },
];

/**
 * Extrae metas cuantificadas tipo porcentajes o reducciones numéricas
 */
export function extraerMetaCuantificada(texto: string): string | undefined {
  const match = texto.match(/(\d+[\.,]?\d*)\s*(%|por\s*ciento|d[ií]as|horas|siniestros?)/i);
  if (match) return match[0];
  const matchNum = texto.match(/(reducir|disminuir|alcanzar|lograr|mantener)\s+(un|el|en)?\s*(\d+[\.,]?\d*)/i);
  if (matchNum) return `${matchNum[1]} ${matchNum[3]}`;
  return undefined;
}

/**
 * Analiza un texto de descripción de metas y clasifica sus objetivos
 */
export function clasificarMetasTexto(descripcion?: string): MetaCategorizada[] {
  if (!descripcion || descripcion.trim().length === 0) {
    return [];
  }

  const textoLimpio = descripcion.toLowerCase();
  const resultados: MetaCategorizada[] = [];

  for (const regla of REGLAS_METAS_NORMATIVAS) {
    const palabrasEncontradas: string[] = [];
    
    // Búsqueda por palabras clave directas
    for (const kw of regla.palabrasClave) {
      if (textoLimpio.includes(kw.toLowerCase())) {
        if (!palabrasEncontradas.includes(kw)) {
          palabrasEncontradas.push(kw);
        }
      }
    }

    // Búsqueda por regex de patrones normativos
    for (const rx of regla.patronesRegex) {
      if (rx.test(textoLimpio)) {
        const match = textoLimpio.match(rx);
        if (match && !palabrasEncontradas.includes(match[0])) {
          palabrasEncontradas.push(match[0]);
        }
      }
    }

    if (palabrasEncontradas.length > 0) {
      // Extraer fragmento relevante
      const primeraPalabra = palabrasEncontradas[0];
      const idx = textoLimpio.indexOf(primeraPalabra);
      const start = Math.max(0, idx - 40);
      const end = Math.min(descripcion.length, idx + primeraPalabra.length + 80);
      const extracto = (start > 0 ? '...' : '') + descripcion.substring(start, end).trim() + (end < descripcion.length ? '...' : '');

      resultados.push({
        categoria: regla.categoria,
        nombreCategoria: regla.nombre,
        palabrasClaveEncontradas: palabrasEncontradas,
        extractoTexto: extracto,
        metaCuantificada: extraerMetaCuantificada(extracto),
        relevancia: Math.min(5, palabrasEncontradas.length),
      });
    }
  }

  // Ordenar por relevancia descendente
  return resultados.sort((a, b) => b.relevancia - a.relevancia);
}

/**
 * Resumen global del procesamiento de texto de metas sobre una lista de empresas
 */
export interface ResumenGlobalMetas {
  totalEmpresasConMetas: number;
  totalEmpresasSinMetas: number;
  distribucionCategorias: {
    categoria: CategoriaMetaPESV;
    nombre: string;
    color: string;
    conteo: number;
    porcentaje: number;
    palabrasMasFrecuentes: { palabra: string; conteo: number }[];
  }[];
  metasMasFrecuentes: {
    categoria: string;
    ejemplo: string;
    empresas: number;
  }[];
}

export function obtenerResumenMetasPoblacional(empresas: EmpresaPESV[]): ResumenGlobalMetas {
  const conteoPorCategoria: Record<CategoriaMetaPESV, number> = {
    REDUCCION_SINIESTROS: 0,
    GESTION_VELOCIDAD: 0,
    CAPACITACION_Y_FORMACION: 0,
    MANTENIMIENTO_E_INSPECCION: 0,
    FATIGA_Y_JORNADAS: 0,
    CERO_TOLERANCIA_SUSTANCIAS: 0,
    CINTURON_Y_EPP: 0,
    AUDITORIA_Y_MEJORA: 0,
  };

  const palabrasPorCat: Record<CategoriaMetaPESV, Record<string, number>> = {
    REDUCCION_SINIESTROS: {},
    GESTION_VELOCIDAD: {},
    CAPACITACION_Y_FORMACION: {},
    MANTENIMIENTO_E_INSPECCION: {},
    FATIGA_Y_JORNADAS: {},
    CERO_TOLERANCIA_SUSTANCIAS: {},
    CINTURON_Y_EPP: {},
    AUDITORIA_Y_MEJORA: {},
  };

  let empresasConMetas = 0;
  let empresasSinMetas = 0;

  for (const emp of empresas) {
    const metas = emp.metasCategorizadas && emp.metasCategorizadas.length > 0
      ? emp.metasCategorizadas
      : clasificarMetasTexto(emp.descripcionMetas);

    if (metas.length > 0) {
      empresasConMetas++;
      for (const m of metas) {
        conteoPorCategoria[m.categoria] = (conteoPorCategoria[m.categoria] || 0) + 1;
        for (const kw of m.palabrasClaveEncontradas) {
          palabrasPorCat[m.categoria][kw] = (palabrasPorCat[m.categoria][kw] || 0) + 1;
        }
      }
    } else {
      empresasSinMetas++;
    }
  }

  const totalEvaluadas = empresasConMetas || 1;

  const distribucionCategorias = REGLAS_METAS_NORMATIVAS.map(regla => {
    const count = conteoPorCategoria[regla.categoria] || 0;
    const kwDict = palabrasPorCat[regla.categoria];
    const topKeywords = Object.entries(kwDict)
      .map(([palabra, c]) => ({ palabra, conteo: c }))
      .sort((a, b) => b.conteo - a.conteo)
      .slice(0, 5);

    return {
      categoria: regla.categoria,
      nombre: regla.nombre,
      color: regla.color,
      conteo: count,
      porcentaje: Math.round((count / totalEvaluadas) * 100),
      palabrasMasFrecuentes: topKeywords,
    };
  }).sort((a, b) => b.conteo - a.conteo);

  return {
    totalEmpresasConMetas: empresasConMetas,
    totalEmpresasSinMetas: empresasSinMetas,
    distribucionCategorias,
    metasMasFrecuentes: distribucionCategorias.slice(0, 4).map(d => ({
      categoria: d.nombre,
      ejemplo: d.palabrasMasFrecuentes.map(p => `"${p.palabra}"`).join(', '),
      empresas: d.conteo,
    })),
  };
}
