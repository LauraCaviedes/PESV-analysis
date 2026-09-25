/**
 * Valoración de Riesgos Viales y Matriz de Calor (Heatmap)
 * Implementación exacta del Paso 6 (Evaluación y Control del Riesgo Vial) de la Resolución 40595 de 2022
 */

import {
  NivelExposicion,
  NivelProbabilidad,
  CriticidadRiesgo,
  ItemRiesgoPaso6,
  EmpresaPESV,
} from '../types/pesv';

export const NIVELES_EXPOSICION: NivelExposicion[] = ['Frecuente', 'Ocasional', 'Esporádica'];
export const NIVELES_PROBABILIDAD: NivelProbabilidad[] = ['Muy Probable', 'Poco Probable', 'No es Probable'];

/**
 * Matriz oficial de Valoración del Riesgo Vial según Res 40595:
 * Exposición vs Probabilidad -> Criticidad
 */
export function calcularCriticidadRiesgo(
  exposicion: NivelExposicion,
  probabilidad: NivelProbabilidad
): CriticidadRiesgo {
  if (exposicion === 'Frecuente') {
    if (probabilidad === 'Muy Probable') return 'Crítico';
    if (probabilidad === 'Poco Probable') return 'Alto';
    return 'Medio';
  }
  if (exposicion === 'Ocasional') {
    if (probabilidad === 'Muy Probable') return 'Alto';
    if (probabilidad === 'Poco Probable') return 'Medio';
    return 'Bajo';
  }
  // Esporádica
  if (probabilidad === 'Muy Probable') return 'Medio';
  if (probabilidad === 'Poco Probable') return 'Bajo';
  return 'Bajo';
}

export function obtenerColorCriticidad(criticidad: CriticidadRiesgo): {
  bg: string;
  text: string;
  border: string;
  badge: string;
  hex: string;
} {
  switch (criticidad) {
    case 'Crítico':
      return {
        bg: 'bg-red-500/15',
        text: 'text-red-700',
        border: 'border-red-500',
        badge: 'bg-red-600 text-white',
        hex: '#dc2626',
      };
    case 'Alto':
      return {
        bg: 'bg-orange-500/15',
        text: 'text-orange-700',
        border: 'border-orange-500',
        badge: 'bg-orange-600 text-white',
        hex: '#ea580c',
      };
    case 'Medio':
      return {
        bg: 'bg-amber-500/15',
        text: 'text-amber-700',
        border: 'border-amber-500',
        badge: 'bg-amber-600 text-white',
        hex: '#d97706',
      };
    case 'Bajo':
      return {
        bg: 'bg-emerald-500/15',
        text: 'text-emerald-700',
        border: 'border-emerald-500',
        badge: 'bg-emerald-600 text-white',
        hex: '#16a34a',
      };
  }
}

export interface CeldaMatrizCalor {
  exposicion: NivelExposicion;
  probabilidad: NivelProbabilidad;
  criticidad: CriticidadRiesgo;
  totalRiesgos: number;
  porcentaje: number;
  itemsRiesgo: {
    empresaId: string;
    empresaNombre: string;
    riesgo: ItemRiesgoPaso6;
  }[];
}

export interface MatrizCalorResumen {
  celdas: CeldaMatrizCalor[];
  totalRiesgos: number;
  conteoPorCriticidad: Record<CriticidadRiesgo, number>;
  riesgosMasCriticos: {
    factorRiesgo: string;
    criticidad: CriticidadRiesgo;
    conteo: number;
  }[];
}

/**
 * Genera la matriz cruzada de 3x3 (Exposición x Probabilidad)
 * para una empresa específica o para todo el conjunto de empresas
 */
export function generarMatrizCalorRiesgos(empresas: EmpresaPESV[]): MatrizCalorResumen {
  const celdasMap: Record<string, CeldaMatrizCalor> = {};

  for (const exp of NIVELES_EXPOSICION) {
    for (const prob of NIVELES_PROBABILIDAD) {
      const key = `${exp}__${prob}`;
      celdasMap[key] = {
        exposicion: exp,
        probabilidad: prob,
        criticidad: calcularCriticidadRiesgo(exp, prob),
        totalRiesgos: 0,
        porcentaje: 0,
        itemsRiesgo: [],
      };
    }
  }

  let totalRiesgos = 0;
  const conteoPorCriticidad: Record<CriticidadRiesgo, number> = {
    Crítico: 0,
    Alto: 0,
    Medio: 0,
    Bajo: 0,
  };

  const frecuenciaFactores: Record<string, { criticidad: CriticidadRiesgo; conteo: number }> = {};

  for (const emp of empresas) {
    const riesgos = emp.riesgosPaso6 && emp.riesgosPaso6.length > 0
      ? emp.riesgosPaso6
      : generarRiesgosDinamicosEmpresa(emp);

    for (const r of riesgos) {
      const key = `${r.exposicion}__${r.probabilidad}`;
      if (celdasMap[key]) {
        celdasMap[key].totalRiesgos++;
        celdasMap[key].itemsRiesgo.push({
          empresaId: emp.id,
          empresaNombre: emp.razonSocial,
          riesgo: r,
        });
      }

      totalRiesgos++;
      conteoPorCriticidad[r.criticidad] = (conteoPorCriticidad[r.criticidad] || 0) + 1;

      if (!frecuenciaFactores[r.factorRiesgo]) {
        frecuenciaFactores[r.factorRiesgo] = { criticidad: r.criticidad, conteo: 0 };
      }
      frecuenciaFactores[r.factorRiesgo].conteo++;
    }
  }

  const celdas = Object.values(celdasMap).map(c => ({
    ...c,
    porcentaje: totalRiesgos > 0 ? Math.round((c.totalRiesgos / totalRiesgos) * 100) : 0,
  }));

  const riesgosMasCriticos = Object.entries(frecuenciaFactores)
    .map(([factorRiesgo, d]) => ({ factorRiesgo, criticidad: d.criticidad, conteo: d.conteo }))
    .sort((a, b) => b.conteo - a.conteo)
    .slice(0, 5);

  return {
    celdas,
    totalRiesgos,
    conteoPorCriticidad,
    riesgosMasCriticos,
  };
}

/**
 * Genera factores de riesgo dinámicos y realistas basados en los datos fácticos de la empresa
 * (infracciones, velocidad, fatiga, tipo de flota, siniestros)
 */
export function generarRiesgosDinamicosEmpresa(empresa: Partial<EmpresaPESV>): ItemRiesgoPaso6[] {
  const riesgos: ItemRiesgoPaso6[] = [];
  const ind = empresa.indicadores;
  const inf = empresa.infracciones;
  const flota = empresa.flota;

  // 1. Riesgo de Exceso de Velocidad
  const velCritica = (inf?.C29 || 0) > 3 || (ind?.elvl || 0) > 8;
  const velMedia = (inf?.C29 || 0) > 0 || (ind?.elvl || 0) > 3;
  riesgos.push({
    id: `RSK-VEL-${empresa.id || '1'}`,
    factorRiesgo: 'Exceso de velocidad en corredores viales y zonas urbanas',
    categoria: 'Velocidad',
    exposicion: velCritica ? 'Frecuente' : velMedia ? 'Ocasional' : 'Esporádica',
    probabilidad: velCritica ? 'Muy Probable' : velMedia ? 'Poco Probable' : 'No es Probable',
    criticidad: calcularCriticidadRiesgo(
      velCritica ? 'Frecuente' : velMedia ? 'Ocasional' : 'Esporádica',
      velCritica ? 'Muy Probable' : velMedia ? 'Poco Probable' : 'No es Probable'
    ),
    controlesRecomendados: 'Instalación y calibración de telemetría GPS con alertas sonoras en cabina, geocercas y programa de reconocimiento a conductores seguros.',
    responsableSugerido: 'Líder del PESV y Coordinador de Tráfico',
  });

  // 2. Riesgo de Fatiga y Somnolencia
  const fatigaCritica = (ind?.porcExcesoJornada || 0) > 8 || (inf?.H04 || 0) > 2;
  const fatigaMedia = (ind?.porcExcesoJornada || 0) > 3 || (inf?.H04 || 0) > 0;
  riesgos.push({
    id: `RSK-FAT-${empresa.id || '2'}`,
    factorRiesgo: 'Fatiga, sobrejornada laboral y microsueños al volante',
    categoria: 'Fatiga',
    exposicion: fatigaCritica ? 'Frecuente' : fatigaMedia ? 'Ocasional' : 'Esporádica',
    probabilidad: fatigaCritica ? 'Muy Probable' : fatigaMedia ? 'Poco Probable' : 'No es Probable',
    criticidad: calcularCriticidadRiesgo(
      fatigaCritica ? 'Frecuente' : fatigaMedia ? 'Ocasional' : 'Esporádica',
      fatigaCritica ? 'Muy Probable' : fatigaMedia ? 'Poco Probable' : 'No es Probable'
    ),
    controlesRecomendados: 'Protocolo de descansos obligatorios cada 4 horas continuas de conducción, pausas activas certificadas y control biométrico de inicio de ruta.',
    responsableSugerido: 'Gestión Humana y Supervisor de Rutas',
  });

  // 3. Riesgo de Fallas Mecánicas / Mantenimiento
  const mantCritico = (ind?.cpmvh || 100) < 80 || (inf?.C38 || 0) > 0 || (inf?.D04 || 0) > 0;
  const mantMedio = (ind?.cpmvh || 100) < 92;
  riesgos.push({
    id: `RSK-MEC-${empresa.id || '3'}`,
    factorRiesgo: 'Falla repentina en sistema de frenos, dirección o neumáticos',
    categoria: 'Vehicular',
    exposicion: mantCritico ? 'Frecuente' : mantMedio ? 'Ocasional' : 'Esporádica',
    probabilidad: mantCritico ? 'Muy Probable' : mantMedio ? 'Poco Probable' : 'No es Probable',
    criticidad: calcularCriticidadRiesgo(
      mantCritico ? 'Frecuente' : mantMedio ? 'Ocasional' : 'Esporádica',
      mantCritico ? 'Muy Probable' : mantMedio ? 'Poco Probable' : 'No es Probable'
    ),
    controlesRecomendados: 'Inspección diaria preoperacional digitalizada no negociable antes de encendido, mantenimiento preventivo según odómetro y auditoría de talleres.',
    responsableSugerido: 'Jefe de Taller / Mantenimiento de Flota',
  });

  // 4. Riesgo de Vulnerabilidad en Motociclistas y Peatones
  const tieneMotos = (flota?.motosPropias || 0) + (flota?.motosTerceros || 0) > 10;
  riesgos.push({
    id: `RSK-VULN-${empresa.id || '4'}`,
    factorRiesgo: 'Interacción con actores viales vulnerables (motociclistas y peatones)',
    categoria: 'Vulnerables',
    exposicion: tieneMotos ? 'Frecuente' : 'Ocasional',
    probabilidad: tieneMotos ? 'Muy Probable' : 'Poco Probable',
    criticidad: calcularCriticidadRiesgo(tieneMotos ? 'Frecuente' : 'Ocasional', tieneMotos ? 'Muy Probable' : 'Poco Probable'),
    controlesRecomendados: 'Capacitación en conducción defensiva, entrega de cascos certificados ECE 22.06 y prendas retrorreflectivas de alta visibilidad.',
    responsableSugerido: 'Comité de Seguridad Vial',
  });

  // 5. Riesgo de Condiciones Climáticas e Infraestructura
  riesgos.push({
    id: `RSK-CLIMA-${empresa.id || '5'}`,
    factorRiesgo: 'Pérdida de adherencia por calzadas mojadas, neblina y derrumbes',
    categoria: 'Infraestructura/Entorno',
    exposicion: 'Ocasional',
    probabilidad: 'Poco Probable',
    criticidad: calcularCriticidadRiesgo('Ocasional', 'Poco Probable'),
    controlesRecomendados: 'Rutas seguras programadas con monitoreo meteorológico de IDEAM/Invías y derecho de negativa del conductor ante condiciones meteorológicas extremas.',
    responsableSugerido: 'Centro de Control Operacional',
  });

  // 6. Riesgo de Distracciones (Uso de Dispositivos Móviles)
  riesgos.push({
    id: `RSK-DIST-${empresa.id || '6'}`,
    factorRiesgo: 'Distracción visual y cognitiva por uso de celular o radio en movimiento',
    categoria: 'Comportamiento',
    exposicion: 'Frecuente',
    probabilidad: 'Poco Probable',
    criticidad: calcularCriticidadRiesgo('Frecuente', 'Poco Probable'),
    controlesRecomendados: 'Política explícita de Cero Teléfono al Volante (prohibición de manos libres en marcha) y sanciones disciplinarias en el reglamento interno.',
    responsableSugerido: 'Dirección de Operaciones',
  });

  return riesgos;
}
