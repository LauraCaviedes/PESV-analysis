/**
 * Diccionario Oficial de Estandarización de Variables PESV
 * Resolución 40595 de 2022 - Ministerio de Transporte / ANSV
 * 
 * Contiene:
 * 1. Nombres estandarizados canónicos para indicadores 1 a 13.
 * 2. Cuatro (4) niveles de pérdida en Indicadores 1 (TSV) y 2 ($SV):
 *    - Nivel 1: Fatalidades
 *    - Nivel 2: Heridos graves con más de 30 días de incapacidad
 *    - Nivel 3: Heridos leves con hasta 30 días de incapacidad
 *    - Nivel 4: Choques simples (solo daños materiales)
 * 3. Catálogo oficial de infracciones de tránsito CNT (Grupos A, B, C, D, E, H).
 * 4. Mapeo bidireccional entre las preguntas descriptivas largas de la encuesta y las variables estandarizadas.
 * 5. Fórmulas de cálculo automático de indicadores trimestrales, mensuales y anuales.
 * 6. Gestión de Deltas de incertidumbre derivados de envíos de múltiples formularios.
 */

export const NIVELES_PERDIDA = [
  {
    nivel: 1,
    codigo: 'Nivel1',
    etiqueta: 'Nivel 1: Fatalidades',
    descripcion: 'Siniestros con personas fallecidas (muertos en el siniestro o dentro de los 30 días posteriores).',
    gravedad: 'CRÍTICA',
    color: '#b91c1c',
  },
  {
    nivel: 2,
    codigo: 'Nivel2',
    etiqueta: 'Nivel 2: Heridos graves (> 30 días incapacidad)',
    descripcion: 'Personas lesionadas que requieren hospitalización o incapacidad médico-legal superior a 30 días.',
    gravedad: 'ALTA',
    color: '#c2410c',
  },
  {
    nivel: 3,
    codigo: 'Nivel3',
    etiqueta: 'Nivel 3: Heridos leves (hasta 30 días incapacidad)',
    descripcion: 'Personas con lesiones no incapacitantes o con incapacidad de hasta 30 días sin secuelas permanentes.',
    gravedad: 'MEDIA',
    color: '#eab308',
  },
  {
    nivel: 4,
    codigo: 'Nivel4',
    etiqueta: 'Nivel 4: Choques simples (solo daños materiales)',
    descripcion: 'Colisiones o eventos viales donde únicamente se presentan pérdidas materiales sin personas lesionadas.',
    gravedad: 'BAJA',
    color: '#3b82f6',
  },
] as const;

export const PERIODOS_TRIMESTRALES = [
  'primer_trimestre',
  'segundo_trimestre',
  'tercer_trimestre',
  'cuarto_trimestre',
] as const;

export const PERIODOS_MENSUALES = [
  'enero',
  'febrero',
  'marzo',
  'abril',
  'mayo',
  'junio',
  'julio',
  'agosto',
  'septiembre',
  'octubre',
  'noviembre',
  'diciembre',
] as const;

/**
 * Catálogo completo de códigos de infracción estandarizados
 */
export const CODIGOS_INFRACCIONES_CNT: { codigo: string; grupo: string; nombre: string }[] = [
  // Grupo A
  { codigo: 'A1', grupo: 'A', nombre: 'No transitar por la derecha de la vía' },
  { codigo: 'A2', grupo: 'A', nombre: 'Agarrarse de otro vehículo en circulación' },
  { codigo: 'A3', grupo: 'A', nombre: 'Transportar personas o cosas que disminuyan visibilidad' },
  { codigo: 'A4', grupo: 'A', nombre: 'Transitar por andenes y lugares destinados a peatones' },
  { codigo: 'A5', grupo: 'A', nombre: 'No respetar señales de tránsito peatones/conductores' },
  { codigo: 'A6', grupo: 'A', nombre: 'Transitar sin dispositivos luminosos requeridos' },
  { codigo: 'A7', grupo: 'A', nombre: 'Transitar sin respetar límites de velocidad' },
  { codigo: 'A8', grupo: 'A', nombre: 'Transitar por zonas prohibidas' },
  { codigo: 'A9', grupo: 'A', nombre: 'Adelantar en curvas, puentes o túneles' },
  { codigo: 'A10', grupo: 'A', nombre: 'Conducir por la vía férrea' },
  { codigo: 'A11', grupo: 'A', nombre: 'Transitar por zonas de protección ecológica' },
  { codigo: 'A12', grupo: 'A', nombre: 'Prestar servicio público con vehículo no autorizado' },

  // Grupo B
  { codigo: 'B1', grupo: 'B', nombre: 'Conducir sin portar licencia' },
  { codigo: 'B2', grupo: 'B', nombre: 'Conducir con licencia vencida' },
  { codigo: 'B3', grupo: 'B', nombre: 'Conducir sin placas o placas ilegibles/adulteradas' },
  { codigo: 'B4', grupo: 'B', nombre: 'Conducir vehículo con placas adulteradas' },
  { codigo: 'B5', grupo: 'B', nombre: 'No informar cambio de motor o características' },
  { codigo: 'B6', grupo: 'B', nombre: 'Conducir vehículo con placas falsas' },
  { codigo: 'B7', grupo: 'B', nombre: 'No informar a la autoridad el cambio de domicilio' },
  { codigo: 'B8', grupo: 'B', nombre: 'No pagar peaje en sitios establecidos' },
  { codigo: 'B9', grupo: 'B', nombre: 'Utilizar equipos de sonido a volúmenes que incomoden' },
  { codigo: 'B10', grupo: 'B', nombre: 'Conducir con vidrios polarizados sin permiso' },
  { codigo: 'B11', grupo: 'B', nombre: 'Conducir vehículo sin luces reglamentarias' },
  { codigo: 'B12', grupo: 'B', nombre: 'No respetar normas establecidas por autoridad de tránsito' },
  { codigo: 'B13', grupo: 'B', nombre: 'Conducir con extintor descargado o sin equipo prevención' },
  { codigo: 'B14', grupo: 'B', nombre: 'Remolcar otro vehículo sin cumplir condiciones técnicas' },
  { codigo: 'B15', grupo: 'B', nombre: 'Conducir vehículo de servicio público sin tarifas oficiales' },
  { codigo: 'B16', grupo: 'B', nombre: 'Permitir que el vehículo sea conducido por menor de edad' },
  { codigo: 'B17', grupo: 'B', nombre: 'Abandonar un vehículo de servicio público con pasajeros' },
  { codigo: 'B18', grupo: 'B', nombre: 'Conducir vehículo automotor sin espejos retrovisores' },
  { codigo: 'B19', grupo: 'B', nombre: 'Realizar cargue o descargue en sitios u horas no permitidas' },
  { codigo: 'B20', grupo: 'B', nombre: 'Transportar carne, pescado o alimentos sin refrigeración' },
  { codigo: 'B21', grupo: 'B', nombre: 'Lavar vehículos en vía pública o fuentes de agua' },
  { codigo: 'B22', grupo: 'B', nombre: 'Llevar niños menores de 10 años en asiento delantero' },
  { codigo: 'B23', grupo: 'B', nombre: 'Utilizar sistemas de sonido que superen decibeles' },

  // Grupo C
  { codigo: 'C1', grupo: 'C', nombre: 'Presentar licencia adulterada o ajena' },
  { codigo: 'C2', grupo: 'C', nombre: 'Estacionar en sitios prohibidos' },
  { codigo: 'C3', grupo: 'C', nombre: 'Bloquear calzada o intersección' },
  { codigo: 'C4', grupo: 'C', nombre: 'Estacionar vehículo sin tomar medidas de seguridad' },
  { codigo: 'C5', grupo: 'C', nombre: 'No colocar señales de peligro al vararse' },
  { codigo: 'C6', grupo: 'C', nombre: 'No utilizar cinturón de seguridad' },
  { codigo: 'C7', grupo: 'C', nombre: 'Dejar o recoger pasajeros en sitios peligrosos' },
  { codigo: 'C8', grupo: 'C', nombre: 'Transitar sin dispositivos luminosos requeridos' },
  { codigo: 'C9', grupo: 'C', nombre: 'No respetar pasos peatonales o ciclovías' },
  { codigo: 'C10', grupo: 'C', nombre: 'Conducir con puertas abiertas' },
  { codigo: 'C11', grupo: 'C', nombre: 'Conducir vehículo con lubricante o combustible derramado' },
  { codigo: 'C12', grupo: 'C', nombre: 'Proveer combustible con motor encendido o pasajeros' },
  { codigo: 'C13', grupo: 'C', nombre: 'Conducir vehículo de tracción animal sin reflectivos' },
  { codigo: 'C14', grupo: 'C', nombre: 'Transitar en sitios restringidos u horas prohibidas (Pico y Placa)' },
  { codigo: 'C15', grupo: 'C', nombre: 'Conducir sin portar pólizas de responsabilidad exigidas' },
  { codigo: 'C16', grupo: 'C', nombre: 'Conducir vehículo escolar sin permisos requeridos' },
  { codigo: 'C17', grupo: 'C', nombre: 'Circular con carga descubierta que pueda caer' },
  { codigo: 'C18', grupo: 'C', nombre: 'Conducir vehículo autorizado para servicio público con sellos rotos' },
  { codigo: 'C19', grupo: 'C', nombre: 'Dejar o recoger pasajeros en sitios no autorizados' },
  { codigo: 'C20', grupo: 'C', nombre: 'Conducir vehículo de carga en horarios restringidos' },
  { codigo: 'C21', grupo: 'C', nombre: 'No asegurar la carga en vehículos descubiertos' },
  { codigo: 'C22', grupo: 'C', nombre: 'Transportar carga de dimensiones superiores a las autorizadas' },
  { codigo: 'C23', grupo: 'C', nombre: 'Impartir enseñanza automovilística en vehículos no autorizados' },
  { codigo: 'C24', grupo: 'C', nombre: 'Conducir motocicleta sin observar normas indicadas' },
  { codigo: 'C25', grupo: 'C', nombre: 'Transitar sin luces medias o altas en carretera nocturna' },
  { codigo: 'C26', grupo: 'C', nombre: 'Transitar en vehículo de carga >3.5t por carril izquierdo' },
  { codigo: 'C27', grupo: 'C', nombre: 'Conducir vehículo sin dispositivos de absorción de ruidos' },
  { codigo: 'C28', grupo: 'C', nombre: 'Hacer uso de sirenas o luces intermitentes no autorizadas' },
  { codigo: 'C29', grupo: 'C', nombre: 'Conducir a velocidad superior a la máxima permitida' },
  { codigo: 'C30', grupo: 'C', nombre: 'No reducir la velocidad en aproximación a intersecciones/zonas escolares' },
  { codigo: 'C31', grupo: 'C', nombre: 'No acatar señales de tránsito o requerimientos de agentes' },
  { codigo: 'C32', grupo: 'C', nombre: 'No respetar el paso de peatones que cruzan por zonas autorizadas' },
  { codigo: 'C33', grupo: 'C', nombre: 'Poner un vehículo en marcha sin las precauciones para evitar choques' },
  { codigo: 'C34', grupo: 'C', nombre: 'Reparar vehículo en vía pública o parque' },
  { codigo: 'C35', grupo: 'C', nombre: 'No realizar revisión técnico-mecánica y de emisiones (RTM)' },
  { codigo: 'C36', grupo: 'C', nombre: 'Transportar carga que exceda el peso bruto vehicular' },
  { codigo: 'C37', grupo: 'C', nombre: 'Transportar sustancias peligrosas sin los requisitos y rótulos' },
  { codigo: 'C38', grupo: 'C', nombre: 'No realizar la revisión técnico-mecánica en los plazos fijados' },
  { codigo: 'C39', grupo: 'C', nombre: 'Vulnerar las siguientes reglas de estacionamiento del CNT' },
  { codigo: 'C40', grupo: 'C', nombre: 'Impedir el paso a vehículos de emergencia con sirena activa' },

  // Grupo D
  { codigo: 'D1', grupo: 'D', nombre: 'Guiar vehículo sin haber obtenido licencia de conducción' },
  { codigo: 'D2', grupo: 'D', nombre: 'Conducir con licencia suspendida o cancelada' },
  { codigo: 'D3', grupo: 'D', nombre: 'Transitar en sentido contrario al estipulado para la vía' },
  { codigo: 'D4', grupo: 'D', nombre: 'No portar el SOAT o seguro obligatorio vigente' },
  { codigo: 'D5', grupo: 'D', nombre: 'Conducir sobre aceras, plazas o separadores' },
  { codigo: 'D6', grupo: 'D', nombre: 'Adelantar a otro vehículo en berma, túnel o puente' },
  { codigo: 'D7', grupo: 'D', nombre: 'Conducir realizando maniobras altamente peligrosas' },
  { codigo: 'D8', grupo: 'D', nombre: 'Conducir vehículo sin luces traseras o reflectivos' },
  { codigo: 'D9', grupo: 'D', nombre: 'No permitir el paso a vehículos de emergencia' },
  { codigo: 'D10', grupo: 'D', nombre: 'Conducir vehículo para servicio público con tanqueo no autorizado' },
  { codigo: 'D11', grupo: 'D', nombre: 'Permitir servicio público de pasajeros sin seguro contractual' },
  { codigo: 'D12', grupo: 'D', nombre: 'Prestar servicio en vehículo no homologado' },
  { codigo: 'D13', grupo: 'D', nombre: 'En caso de transportar carga con peso superior al autorizado' },
  { codigo: 'D14', grupo: 'D', nombre: 'Hacer uso de dispositivos móviles o celulares al conducir' },
  { codigo: 'D15', grupo: 'D', nombre: 'Cambio del recorrido o trazado de la ruta de servicio público' },
  { codigo: 'D16', grupo: 'D', nombre: 'Conducir vehículo que expela humo o ruidos nocivos' },
  { codigo: 'D17', grupo: 'D', nombre: 'Cuando se detecte una infracción a las normas de emisión de gases' },

  // Grupo E
  { codigo: 'E1', grupo: 'E', nombre: 'Negarse a prestar el servicio público sin causa justificada' },
  { codigo: 'E2', grupo: 'E', nombre: 'Negarse a transportar escolares' },
  { codigo: 'E3', grupo: 'E', nombre: 'Conducir bajo el influjo de alcohol o sustancias psicoactivas' },
  { codigo: 'E4', grupo: 'E', nombre: 'Transportar en el mismo vehículo personas y sustancias peligrosas' },
  { codigo: 'E5', grupo: 'E', nombre: 'Conducir sobre aceras y zonas peatonales con vehículos de carga' },

  // Grupo H
  { codigo: 'H1', grupo: 'H', nombre: 'Circular por vías o carriles exclusivos de transporte masivo' },
  { codigo: 'H2', grupo: 'H', nombre: 'El conductor que no porte la licencia de tránsito del vehículo' },
  { codigo: 'H3', grupo: 'H', nombre: 'El conductor, pasajero o peatón que no respete las normas y señales' },
  { codigo: 'H4', grupo: 'H', nombre: 'Exceder tiempos de jornada laboral de conducción / descanso' },
  { codigo: 'H5', grupo: 'H', nombre: 'Conducir vehículo sin seguro de responsabilidad para hidrocarburos' },
  { codigo: 'H6', grupo: 'H', nombre: 'El conductor que no tome las medidas necesarias para evitar derrames' },
  { codigo: 'H7', grupo: 'H', nombre: 'El conductor que lleve pasajeros en la parte exterior del vehículo' },
  { codigo: 'H10', grupo: 'H', nombre: 'No retirar el vehículo accidentado cuando solo hay daños materiales' },
  { codigo: 'H11', grupo: 'H', nombre: 'Viajar menores de dos años sin silla de retención infantil' },
  { codigo: 'H12', grupo: 'H', nombre: 'Transitar con vehículos pesados o de carga por zonas históricas' },
];

/**
 * Tabla de mapeo entre preguntas descriptivas oficiales y nombres de columna estandarizados
 */
export const MAPEO_COLUMNAS_OFICIALES: Record<string, string> = {
  // --- INDICADOR 1 (TSV) - 4 NIVELES DE PÉRDIDA ---
  // Primer Trimestre
  'INDICADOR 1: TASAS DE SINIESTROS VIALES POR NIVEL DE PÉRDIDA: TSV(n) Número de fatalidades viales presentadas en el primer trimestre': 'I1_Nivel1_n_primer_trimestre',
  'Número de fatalidades viales presentadas en el primer trimestre': 'I1_Nivel1_n_primer_trimestre',
  'Número de kilómetros recorridos por toda la flota de vehículos de la organización en el primer trimestre': 'I1_km_primer_trimestre',
  'Indicador 1: Tasas de siniestros viales por nivel de pérdida: Nivel 1 - Fatalidades primer trimestre: Constante equivalente a 1\'000.000 de kilómetros.Km(t): Número de kilómetros recorridos por toda la flota de vehículos de la organización en el primer trimestre': 'I1_TSV_Nivel1_primer_trimestre',
  'Número de heridos graves con más de 30 días de incapacidad durante el primer trimestre': 'I1_Nivel2_n_primer_trimestre',
  'Indicador 1: Tasas de siniestros viales por nivel de pérdida: Nivel 2 - Heridos graves con más de 30 días de incapacidad primer trimestre: Constante equivalente a 1\'000.000 de kilómetros.Km(t): Número de kilómetros recorridos por...': 'I1_TSV_Nivel2_primer_trimestre',
  'Número de heridos leves con hasta 30 días de incapacidad durante el primer trimestre': 'I1_Nivel3_n_primer_trimestre',
  'Indicador 1: Tasas de siniestros viales por nivel de pérdida: Nivel 3 - Heridos leves con hasta 30 días de incapacidad primer trimestre: Constante equivalente a 1\'000.000 de kilómetros.Km(t): Número de kilómetros recorrid...': 'I1_TSV_Nivel3_primer_trimestre',
  'Número de choques simples presentados durante el primer trimestre': 'I1_Nivel4_n_primer_trimestre',
  'Indicador 1: Tasas de siniestros viales por nivel de pérdida: Nivel 4 - Choques simples primer trimestre: Constante equivalente a 1\'000.000 de kilómetros.Km(t): Número de kilómetros recorrid...': 'I1_TSV_Nivel4_primer_trimestre',

  // Segundo Trimestre
  'Número de fatalidades viales presentadas en el segundo trimestre': 'I1_Nivel1_n_segundo_trimestre',
  'Número de kilómetros recorridos por toda la flota de vehículos de la organización en el segundo trimestre': 'I1_km_segundo_trimestre',
  'Indicador 1: Tasas de siniestros viales por nivel de pérdida: Nivel 1 - Fatalidades segundo trimestre': 'I1_TSV_Nivel1_segundo_trimestre',
  'Número de heridos graves con más de 30 días de incapacidad durante el segundo trimestre': 'I1_Nivel2_n_segundo_trimestre',
  'Indicador 1: Tasas de siniestros viales por nivel de pérdida: Nivel 2 - Heridos graves con más de 30 días de incapacidad segundo trimestre': 'I1_TSV_Nivel2_segundo_trimestre',
  'Número de heridos leves con hasta 30 días de incapacidad durante el segundo trimestre': 'I1_Nivel3_n_segundo_trimestre',
  'Indicador 1: Tasas de siniestros viales por nivel de pérdida: Nivel 3 - Heridos leves con hasta 30 días de incapacidad segundo trimestre': 'I1_TSV_Nivel3_segundo_trimestre',
  'Número de choques simples presentados durante el segundo trimestre': 'I1_Nivel4_n_segundo_trimestre',
  'Indicador 1: Tasas de siniestros viales por nivel de pérdida: Nivel 4 - Choques simples segundo trimestre': 'I1_TSV_Nivel4_segundo_trimestre',

  // Tercer Trimestre
  'Número de fatalidades viales presentadas en el tercer trimestre': 'I1_Nivel1_n_tercer_trimestre',
  'Número de kilómetros recorridos por toda la flota de vehículos de la organización en el tercer trimestre': 'I1_km_tercer_trimestre',
  'Indicador 1: Tasas de siniestros viales por nivel de pérdida: Nivel 1 - Fatalidades tercer trimestre': 'I1_TSV_Nivel1_tercer_trimestre',
  'Número de heridos graves con más de 30 días de incapacidad durante el tercer trimestre': 'I1_Nivel2_n_tercer_trimestre',
  'Indicador 1: Tasas de siniestros viales por nivel de pérdida: Nivel 2 - Heridos graves con más de 30 días de incapacidad tercer trimestre': 'I1_TSV_Nivel2_tercer_trimestre',
  'Número de heridos leves con hasta 30 días de incapacidad durante el tercer trimestre': 'I1_Nivel3_n_tercer_trimestre',
  'Indicador 1: Tasas de siniestros viales por nivel de pérdida: Nivel 3 - Heridos leves con hasta 30 días de incapacidad tercer trimestre': 'I1_TSV_Nivel3_tercer_trimestre',
  'Número de choques simples presentados durante el tercer trimestre': 'I1_Nivel4_n_tercer_trimestre',
  'Indicador 1: Tasas de siniestros viales por nivel de pérdida: Nivel 4 - Choques simples tercer trimestre': 'I1_TSV_Nivel4_tercer_trimestre',

  // Cuarto Trimestre
  'Número de fatalidades viales presentadas en el cuarto trimestre': 'I1_Nivel1_n_cuarto_trimestre',
  'Número de kilómetros recorridos por toda la flota de vehículos de la organización en el cuarto trimestre': 'I1_km_cuarto_trimestre',
  'Indicador 1: Tasas de siniestros viales por nivel de pérdida: Nivel 1 - Fatalidades cuarto trimestre': 'I1_TSV_Nivel1_cuarto_trimestre',
  'Número de heridos graves con más de 30 días de incapacidad durante el cuarto trimestre': 'I1_Nivel2_n_cuarto_trimestre',
  'Indicador 1: Tasas de siniestros viales por nivel de pérdida: Nivel 2 - Heridos graves con más de 30 días de incapacidad cuarto trimestre': 'I1_TSV_Nivel2_cuarto_trimestre',
  'Número de heridos leves con hasta 30 días de incapacidad durante el cuarto trimestre': 'I1_Nivel3_n_cuarto_trimestre',
  'Indicador 1: Tasas de siniestros viales por nivel de pérdida: Nivel 3 - Heridos leves con hasta 30 días de incapacidad cuarto trimestre': 'I1_TSV_Nivel3_cuarto_trimestre',
  'Número de choques simples presentados durante el cuarto trimestre': 'I1_Nivel4_n_cuarto_trimestre',
  'Indicador 1: Tasas de siniestros viales por nivel de pérdida: Nivel 4 - Choques simples cuarto trimestre': 'I1_TSV_Nivel4_cuarto_trimestre',

  // Año Completo
  'Número de fatalidades viales presentadas en el año': 'I1_Nivel1_n_año',
  'Número de fatalidades viales presentadas en la vigencia': 'I1_Nivel1_n_año',
  'Número de kilómetros recorridos por toda la flota de vehículos de la organización en el año': 'I1_km_año',
  'Indicador 1: Tasas de siniestros viales por nivel de pérdida: Nivel 1 - Fatalidades año': 'I1_TSV_Nivel1_año',
  'Número de heridos graves con más de 30 días de incapacidad durante el año': 'I1_Nivel2_n_año',
  'Indicador 1: Tasas de siniestros viales por nivel de pérdida: Nivel 2 - Heridos graves con más de 30 días de incapacidad año': 'I1_TSV_Nivel2_año',
  'Número de heridos leves con hasta 30 días de incapacidad durante el año': 'I1_Nivel3_n_año',
  'Indicador 1: Tasas de siniestros viales por nivel de pérdida: Nivel 3 - Heridos leves con hasta 30 días de incapacidad año': 'I1_TSV_Nivel3_año',
  'Número de choques simples presentados durante el año': 'I1_Nivel4_n_año',
  'Indicador 1: Tasas de siniestros viales por nivel de pérdida: Nivel 4 - Choques simples año': 'I1_TSV_Nivel4_año',

  // --- INDICADOR 2 (COSTOS $SV) - 4 NIVELES DE PÉRDIDA ---
  // Nivel 1: Fatalidades
  'Costos directos ocasionados por las fatalidades presentadas en el primer trimestre': 'I2_Nivel1_directos_primer_trimestre',
  'Costos indirectos ocasionados por las fatalidades presentadas en el primer trimestre': 'I2_Nivel1_indirectos_primer_trimestre',
  'Indicador 2: Costos siniestros viales por fatalidades presentadas en el primer trimestre': 'I2_SV_Nivel1_primer_trimestre',
  'Costos directos ocasionados por las fatalidades presentadas en el segundo trimestre': 'I2_Nivel1_directos_segundo_trimestre',
  'Costos indirectos ocasionados por las fatalidades presentadas en el segundo trimestre': 'I2_Nivel1_indirectos_segundo_trimestre',
  'Indicador 2: Costos siniestros viales por fatalidades presentadas en el segundo trimestre': 'I2_SV_Nivel1_segundo_trimestre',
  'Costos directos ocasionados por las fatalidades presentadas en el tercer trimestre': 'I2_Nivel1_directos_tercer_trimestre',
  'Costos indirectos ocasionados por las fatalidades presentadas en el tercer trimestre': 'I2_Nivel1_indirectos_tercer_trimestre',
  'Indicador 2: Costos siniestros viales por fatalidades presentadas en el tercer trimestre': 'I2_SV_Nivel1_tercer_trimestre',
  'Costos directos ocasionados por las fatalidades presentadas en el cuarto trimestre': 'I2_Nivel1_directos_cuarto_trimestre',
  'Costos indirectos ocasionados por las fatalidades presentadas en el cuarto trimestre': 'I2_Nivel1_indirectos_cuarto_trimestre',
  'Indicador 2: Costos siniestros viales por fatalidades presentadas en el cuarto trimestre': 'I2_SV_Nivel1_cuarto_trimestre',
  'Costos directos ocasionados por las fatalidades presentadas en el año': 'I2_Nivel1_directos_año',
  'Costos indirectos ocasionados por las fatalidades presentadas en el año': 'I2_Nivel1_indirectos_año',
  'Indicador 2: Costos siniestros viales por fatalidades año': 'I2_SV_Nivel1_año',

  // Nivel 2: Heridos graves >30 días
  'Costos directos ocasionados por heridos graves con más de 30 días de incapacidad del primer trimestre': 'I2_Nivel2_directos_primer_trimestre',
  'Costos indirectos ocasionados por heridos graves con más de 30 días de incapacidad del primer trimestre': 'I2_Nivel2_indirectos_primer_trimestre',
  'Indicador 2: Costos siniestros viales por heridos graves con más de 30 días de incapacidad del primer trimestre': 'I2_SV_Nivel2_primer_trimestre',
  'Costos directos ocasionados por heridos graves con más de 30 días de incapacidad del segundo trimestre': 'I2_Nivel2_directos_segundo_trimestre',
  'Costos indirectos ocasionados por heridos graves con más de 30 días de incapacidad del segundo trimestre': 'I2_Nivel2_indirectos_segundo_trimestre',
  'Indicador 2: Costos siniestros viales por heridos graves con más de 30 días de incapacidad del segundo trimestre': 'I2_SV_Nivel2_segundo_trimestre',
  'Costos directos ocasionados por heridos graves con más de 30 días de incapacidad del tercer trimestre': 'I2_Nivel2_directos_tercer_trimestre',
  'Costos indirectos ocasionados por heridos graves con más de 30 días de incapacidad del tercer trimestre': 'I2_Nivel2_indirectos_tercer_trimestre',
  'Indicador 2: Costos siniestros viales por heridos graves con más de 30 días de incapacidad del tercer trimestre': 'I2_SV_Nivel2_tercer_trimestre',
  'Costos directos ocasionados por heridos graves con más de 30 días de incapacidad del cuarto trimestre': 'I2_Nivel2_directos_cuarto_trimestre',
  'Costos indirectos ocasionados por heridos graves con más de 30 días de incapacidad del cuarto trimestre': 'I2_Nivel2_indirectos_cuarto_trimestre',
  'Indicador 2: Costos siniestros viales por heridos graves con más de 30 días de incapacidad del cuarto trimestre': 'I2_SV_Nivel2_cuarto_trimestre',
  'Costos directos ocasionados por heridos graves con más de 30 días de incapacidad del año': 'I2_Nivel2_directos_año',
  'Costos indirectos ocasionados por heridos graves con más de 30 días de incapacidad del año': 'I2_Nivel2_indirectos_año',
  'Indicador 2: Costos siniestros viales por heridos graves año': 'I2_SV_Nivel2_año',

  // Nivel 3: Heridos leves <=30 días
  'Costos directos ocasionados por heridos leves con hasta 30 días de incapacidad del primer trimestre': 'I2_Nivel3_directos_primer_trimestre',
  'Costos indirectos ocasionados por heridos leves con hasta 30 días de incapacidad del primer trimestre': 'I2_Nivel3_indirectos_primer_trimestre',
  'Indicador 2: Costos siniestros viales por heridos leves con hasta 30 días de incapacidad del primer trimestre': 'I2_SV_Nivel3_primer_trimestre',
  'Costos directos ocasionados por heridos leves con hasta 30 días de incapacidad del segundo trimestre': 'I2_Nivel3_directos_segundo_trimestre',
  'Costos indirectos ocasionados por heridos leves con hasta 30 días de incapacidad del segundo trimestre': 'I2_Nivel3_indirectos_segundo_trimestre',
  'Indicador 2: Costos siniestros viales por heridos leves con hasta 30 días de incapacidad del segundo trimestre': 'I2_SV_Nivel3_segundo_trimestre',
  'Costos directos ocasionados por heridos leves con hasta 30 días de incapacidad del tercer trimestre': 'I2_Nivel3_directos_tercer_trimestre',
  'Costos indirectos ocasionados por heridos leves con hasta 30 días de incapacidad del tercer trimestre': 'I2_Nivel3_indirectos_tercer_trimestre',
  'Indicador 2: Costos siniestros viales por heridos leves con hasta 30 días de incapacidad del tercer trimestre': 'I2_SV_Nivel3_tercer_trimestre',
  'Costos directos ocasionados por heridos leves con hasta 30 días de incapacidad del cuarto trimestre': 'I2_Nivel3_directos_cuarto_trimestre',
  'Costos indirectos ocasionados por heridos leves con hasta 30 días de incapacidad del cuarto trimestre': 'I2_Nivel3_indirectos_cuarto_trimestre',
  'Indicador 2: Costos siniestros viales por heridos leves con hasta 30 días de incapacidad del cuarto trimestre': 'I2_SV_Nivel3_cuarto_trimestre',
  'Costos directos ocasionados por heridos leves con hasta 30 días de incapacidad del año': 'I2_Nivel3_directos_año',
  'Costos indirectos ocasionados por heridos leves con hasta 30 días de incapacidad del año': 'I2_Nivel3_indirectos_año',
  'Indicador 2: Costos siniestros viales por heridos leves año': 'I2_SV_Nivel3_año',

  // Nivel 4: Choques simples
  'Costos directos ocasionados por choques simples del primer trimestre': 'I2_Nivel4_directos_primer_trimestre',
  'Costos indirectos ocasionados por choques simples del primer trimestre': 'I2_Nivel4_indirectos_primer_trimestre',
  'Indicador 2: Costos siniestros viales por choques simples del primer trimestre': 'I2_SV_Nivel4_primer_trimestre',
  'Costos directos ocasionados por choques simples del segundo trimestre': 'I2_Nivel4_directos_segundo_trimestre',
  'Costos indirectos ocasionados por choques simples del segundo trimestre': 'I2_Nivel4_indirectos_segundo_trimestre',
  'Indicador 2: Costos siniestros viales por choques simples del segundo trimestre': 'I2_SV_Nivel4_segundo_trimestre',
  'Costos directos ocasionados por choques simples del tercer trimestre': 'I2_Nivel4_directos_tercer_trimestre',
  'Costos indirectos ocasionados por choques simples del tercer trimestre': 'I2_Nivel4_indirectos_tercer_trimestre',
  'Indicador 2: Costos siniestros viales por choques simples del tercer trimestre': 'I2_SV_Nivel4_tercer_trimestre',
  'Costos directos ocasionados por choques simples del cuarto trimestre': 'I2_Nivel4_directos_cuarto_trimestre',
  'Costos indirectos ocasionados por choques simples del cuarto trimestre': 'I2_Nivel4_indirectos_cuarto_trimestre',
  'Indicador 2: Costos siniestros viales por choques simples del cuarto trimestre': 'I2_SV_Nivel4_cuarto_trimestre',
  'Costos directos ocasionados por choques simples del año': 'I2_Nivel4_directos_año',
  'Costos indirectos ocasionados por choques simples del año': 'I2_Nivel4_indirectos_año',
  'Indicador 2: Costos siniestros viales por choques simples año': 'I2_SV_Nivel4_año',

  // --- INDICADOR 3: RIESGOS VIALES ---
  'INDICADOR 3: RIESGOS DE SEGURIDAD VIAL IDENTIFICADOS RSVI (Relacionados con el paso 6) Cantidad de riesgos de seguridad vial identificados al inicio del año': 'I3_RSVI_inicio_año',
  'Cantidad de riesgos de seguridad vial identificados al final del año': 'I3_RSVI_fin_año',
  'Indicador 3.1: Riesgos de Seguridad Vial Identificados: RSVI': 'I3_RSVI',
  'INDICADOR 3.2 GESTIÓN DE RIESGOS VIALES: GRV (Cantidad de riesgos de seguridad vial con valoración alta al inicio del año)': 'I3_GRV_inicio_año',
  'Cantidad de riesgos de seguridad vial con valoración alta al final del año': 'I3_GRV_fin_año',
  'Indicador 3.2: Gestión de Riesgos Viales: GRV': 'I3_GRV',

  // --- INDICADOR 4: METAS ---
  'INDICADOR 4: CUMPLIMIENTO METAS PESV: CM PESV Número de metas alcanzadas o logradas en el PESV durante el primer trimestre': 'I4_nMetasAlcanzadas_primer_trimestre',
  'Número total de metas definidas PESV para el primer trimestre': 'I4_nMetasDefinidas_primer_trimestre',
  'Indicador 4: Cumplimiento Metas PESV: CM PESV en el primer trimestre': 'I4_CM_primer_trimestre',
  'Número de metas alcanzadas o logradas en el PESV durante el segundo trimestre': 'I4_nMetasAlcanzadas_segundo_trimestre',
  'Número total de metas definidas PESV para el segundo trimestre': 'I4_nMetasDefinidas_segundo_trimestre',
  'Indicador 4: Cumplimiento Metas PESV: CM PESV en el segundo trimestre': 'I4_CM_segundo_trimestre',
  'Número de metas alcanzadas o logradas en el PESV durante el tercer trimestre': 'I4_nMetasAlcanzadas_tercer_trimestre',
  'Número total de metas definidas PESV para el tercer trimestre': 'I4_nMetasDefinidas_tercer_trimestre',
  'Indicador 4: Cumplimiento Metas PESV: CM PESV en el tercer trimestre': 'I4_CM_tercer_trimestre',
  'Número de metas alcanzadas o logradas en el PESV durante el cuarto trimestre': 'I4_nMetasAlcanzadas_cuarto_trimestre',
  'Número total de metas definidas PESV para el cuarto trimestre': 'I4_nMetasDefinidas_cuarto_trimestre',
  'Indicador 4: Cumplimiento Metas PESV: CM PESV en el cuarto trimestre': 'I4_CM_cuarto_trimestre',
  'Número de metas alcanzadas o logradas en el PESV durante el año': 'I4_nMetasAlcanzadas_año',
  'Número total de metas definidas PESV para el año': 'I4_nMetasDefinidas_año',
  'Indicador 4: Cumplimiento Metas PESV: CM PESV en el año': 'I4_CM_año',

  // --- INDICADOR 5: PLAN ANUAL DE TRABAJO ---
  'INDICADOR 5: CUMPLIMIENTO DE ACTIVIDADES PLAN ANUAL PESV: CPlan PESV Número de actividades ejecutadas del plan anual de trabajo PESV del primer trimestre': 'I5_nActividadesEjecutadas_primer_trimestre',
  'Número total de actividades programadas del plan anual de trabajo PESV del primer trimestre': 'I5_nActividadesProgramadas_primer_trimestre',
  'Indicador 5: Cumplimiento de actividades plan anual PESV: CPlan PESV primer trimestre': 'I5_CPlan_primer_trimestre',
  'Número de actividades ejecutadas del plan anual de trabajo PESV del segundo trimestre': 'I5_nActividadesEjecutadas_segundo_trimestre',
  'Número total de actividades programadas del plan anual de trabajo PESV del segundo trimestre': 'I5_nActividadesProgramadas_segundo_trimestre',
  'Indicador 5: Cumplimiento de actividades plan anual PESV: CPlan PESV segundo trimestre': 'I5_CPlan_segundo_trimestre',
  'Número de actividades ejecutadas del plan anual de trabajo PESV del tercer trimestre': 'I5_nActividadesEjecutadas_tercer_trimestre',
  'Número total de actividades programadas del plan anual de trabajo PESV del tercer trimestre': 'I5_nActividadesProgramadas_tercer_trimestre',
  'Indicador 5: Cumplimiento de actividades plan anual PESV: CPlan PESV tercer trimestre': 'I5_CPlan_tercer_trimestre',
  'Número de actividades ejecutadas del plan anual de trabajo PESV del cuarto trimestre': 'I5_nActividadesEjecutadas_cuarto_trimestre',
  'Número total de actividades programadas del plan anual de trabajo PESV del cuarto trimestre': 'I5_nActividadesProgramadas_cuarto_trimestre',
  'Indicador 5: Cumplimiento de actividades plan anual PESV: CPlan PESV cuarto trimestre': 'I5_CPlan_cuarto_trimestre',
  'Número de actividades ejecutadas del plan anual de trabajo PESV del año': 'I5_nActividadesEjecutadas_año',
  'Número total de actividades programadas del plan anual de trabajo PESV del año': 'I5_nActividadesProgramadas_año',
  'Indicador 5: Cumplimiento de actividades plan anual PESV: CPlan PESV en el año': 'I5_CPlan_año',

  // --- INDICADOR 10: MANTENIMIENTO PREVENTIVO ---
  'INDICADOR 10: CUMPLIMIENTO PLAN MANTENIMIENTO PREVENTIVO DE VEHÍCULOS: CPMVh Número de actividades de mantenimiento preventivo ejecutadas en el primer trimestre': 'I10_nActividades_primer_trimestre',
  'Número total de actividades de mantenimiento preventivo programadas en el primer trimestre': 'I10_nProgramadas_primer_trimestre',
  'Indicador 10: Cumplimiento Plan Mantenimiento Preventivo de Vehículos en el primer trimestre': 'I10_CPMV_primer_trimestre',
  'Número de actividades de mantenimiento preventivo ejecutadas en el segundo trimestre': 'I10_nActividades_segundo_trimestre',
  'Número total de actividades de mantenimiento preventivo programadas en el segundo trimestre': 'I10_nProgramadas_segundo_trimestre',
  'Indicador 10: Cumplimiento Plan Mantenimiento Preventivo de Vehículos en el segundo trimestre': 'I10_CPMV_segundo_trimestre',
  'Número de actividades de mantenimiento preventivo ejecutadas en el tercer trimestre': 'I10_nActividades_tercer_trimestre',
  'Número total de actividades de mantenimiento preventivo programadas en el tercer trimestre': 'I10_nProgramadas_tercer_trimestre',
  'Indicador 10: Cumplimiento Plan Mantenimiento Preventivo de Vehículos en el tercer trimestre': 'I10_CPMV_tercer_trimestre',
  'Número de actividades de mantenimiento preventivo ejecutadas en el cuarto trimestre': 'I10_nActividades_cuarto_trimestre',
  'Número total de actividades de mantenimiento preventivo programadas en el cuarto trimestre': 'I10_nProgramadas_cuarto_trimestre',
  'Indicador 10: Cumplimiento Plan Mantenimiento Preventivo de Vehículos en el cuarto trimestre': 'I10_CPMV_cuarto_trimestre',
  'Número de actividades de mantenimiento preventivo ejecutadas en el año': 'I10_nActividades_año',
  'Número total de actividades de mantenimiento preventivo programadas en el año': 'I10_nProgramadas_año',
  'Indicador 10: Cumplimiento Plan Mantenimiento Preventivo de Vehículos en el año': 'I10_CPMV_año',

  // --- INDICADOR 11: CAPACITACIONES EN SEGURIDAD VIAL ---
  'INDICADOR 11: CUMPLIMIENTO DEL PLAN DE FORMACIÓN EN SEGURIDAD VIAL: CPFSV Número de capacitaciones en seguridad vial ejecutadas en el primer trimestre': 'I11_nEjecutadas_primer_trimestre',
  'Número total de capacitaciones en seguridad vial programadas en el primer trimestre': 'I11_nProgramadas_primer_trimestre',
  'Indicador 11: Cumplimiento Plan de Formación en Seguridad Vial: CPFSV en el primer trimestre': 'I11_CPFSV_primer_trimestre',
  'Número de capacitaciones en seguridad vial ejecutadas en el segundo trimestre': 'I11_nEjecutadas_segundo_trimestre',
  'Número total de capacitaciones en seguridad vial programadas en el segundo trimestre': 'I11_nProgramadas_segundo_trimestre',
  'Indicador 11: Cumplimiento Plan de Formación en Seguridad Vial: CPFSV en el segundo trimestre': 'I11_CPFSV_segundo_trimestre',
  'Número de capacitaciones en seguridad vial ejecutadas en el tercer trimestre': 'I11_nEjecutadas_tercer_trimestre',
  'Número total de capacitaciones en seguridad vial programadas en el tercer trimestre': 'I11_nProgramadas_tercer_trimestre',
  'Indicador 11: Cumplimiento Plan de Formación en Seguridad Vial: CPFSV en el tercer trimestre': 'I11_CPFSV_tercer_trimestre',
  'Número de capacitaciones en seguridad vial ejecutadas en el cuarto trimestre': 'I11_nEjecutadas_cuarto_trimestre',
  'Número total de capacitaciones en seguridad vial programadas en el cuarto trimestre': 'I11_nProgramadas_cuarto_trimestre',
  'Indicador 11: Cumplimiento Plan de Formación en Seguridad Vial: CPFSV en el cuarto trimestre': 'I11_CPFSV_cuarto_trimestre',
  'Número de capacitaciones en seguridad vial ejecutadas en el año': 'I11_nEjecutadas_año',
  'Número total de capacitaciones en seguridad vial programadas en el año': 'I11_nProgramadas_año',
  'Indicador 11: Cumplimiento Plan de Formación en Seguridad Vial: CPFSV en el año': 'I11_CPFSV_año',

  // --- INDICADOR 12: COBERTURA DE FORMACIÓN ---
  'INDICADOR 12: COBERTURA PLAN DE FORMACIÓN EN SEGURIDAD VIAL: CPF PESV Número de colaboradores de la organización capacitados en seguridad vial en el primer trimestre': 'I12_nCapacitados_primer_trimestre',
  'Número total colaboradores de la organización en el primer trimestre': 'I12_nTotal_primer_trimestre',
  'Indicador 12: Cobertura Plan de Formación en Seguridad Vial: CPF PESV en el primer trimestre': 'I12_CPF_primer_trimestre',
  'Número de colaboradores de la organización capacitados en seguridad vial en el segundo trimestre': 'I12_nCapacitados_segundo_trimestre',
  'Número total colaboradores de la organización en el segundo trimestre': 'I12_nTotal_segundo_trimestre',
  'Indicador 12: Cobertura Plan de Formación en Seguridad Vial: CPF PESV en el segundo trimestre': 'I12_CPF_segundo_trimestre',
  'Número de colaboradores de la organización capacitados en seguridad vial en el tercer trimestre': 'I12_nCapacitados_tercer_trimestre',
  'Número total colaboradores de la organización en el tercer trimestre': 'I12_nTotal_tercer_trimestre',
  'Indicador 12: Cobertura Plan de Formación en Seguridad Vial: CPF PESV en el tercer trimestre': 'I12_CPF_tercer_trimestre',
  'Número de colaboradores de la organización capacitados en seguridad vial en el cuarto trimestre': 'I12_nCapacitados_cuarto_trimestre',
  'Número total colaboradores de la organización en el cuarto trimestre': 'I12_nTotal_cuarto_trimestre',
  'Indicador 12: Cobertura Plan de Formación en Seguridad Vial: CPF PESV en el cuarto trimestre': 'I12_CPF_cuarto_trimestre',
  'Número de colaboradores de la organización capacitados en seguridad vial en el año': 'I12_nCapacitados_año',
  'Número total colaboradores de la organización en el año': 'I12_nTotal_año',
  'Indicador 12: Cobertura Plan de Formación en Seguridad Vial: CPF PESV en el año': 'I12_CPF_año',

  // --- INDICADOR 13: NO CONFORMIDADES DE AUDITORÍA ---
  'INDICADOR 13: NO CONFORMIDADES AUDITORÍA CERRADAS: NCAC Número de no conformidades identificadas y analizadas durante el año.': 'I13_NCidentificadas_año',
  'Número de no conformidades identificadas y analizadas durante el año': 'I13_NCidentificadas_año',
  'Número de no conformidades cerradas durante el año.': 'I13_NCcerradas_año',
  'Número de no conformidades cerradas durante el año': 'I13_NCcerradas_año',
  'Indicador 13: No Conformidades Auditoría Cerradas: NCAC durante el año': 'I13_NCAC_año',

  // --- DATOS DE CONTROL MULTIFORMULARIO ---
  'Categoria': 'Categoria',
  'Categoría': 'Categoria',
  'Estado_Parte1': 'Estado_Parte1',
  'Estado_Parte2': 'Estado_Parte2',
  'Estado_Parte3': 'Estado_Parte3',
};

// Generar dinámicamente mapeos mensuales para I6, I7, I8, I9
PERIODOS_MENSUALES.forEach(mes => {
  const mesCap = mes.charAt(0).toUpperCase() + mes.slice(1);

  // I6
  MAPEO_COLUMNAS_OFICIALES[`Número de excesos en la jornada diaria de trabajo de los conductores durante ${mes}`] = `I6_nEJLdiarias_${mes}`;
  MAPEO_COLUMNAS_OFICIALES[`Sumatoria total de días trabajados por todos los conductores durante ${mes}`] = `I6_sumaDiasTrabajados_${mes}`;
  MAPEO_COLUMNAS_OFICIALES[`Indicador 6: % Exceso Jornadas Laborales Conductores: %EJLC durante ${mes}`] = `I6_%EJLC_${mes}`;

  // I7
  MAPEO_COLUMNAS_OFICIALES[`Número de vehículos incluidos en el programa de gestión de la velocidad durante ${mes}`] = `I7_nIncluidos_${mes}`;
  MAPEO_COLUMNAS_OFICIALES[`Número de vehículos utilizados para desplazamientos laborales durante ${mes}`] = `I7_nUtilizados_${mes}`;
  MAPEO_COLUMNAS_OFICIALES[`Indicador 7: Cobertura Programa de Gestión Velocidad Empresarial durante ${mes}`] = `I7_nDe_${mes}`;

  // I8
  MAPEO_COLUMNAS_OFICIALES[`Número diario de desplazamientos laborales con exceso de velocidad durante ${mes}`] = `I8_nExcesoVel_${mes}`;
  MAPEO_COLUMNAS_OFICIALES[`Número total de desplazamientos laborales durante ${mes}`] = `I8_nDesplazamientos_${mes}`;
  MAPEO_COLUMNAS_OFICIALES[`Indicador 8: Excesos límite de velocidad laboral durante ${mes}`] = `I8_ELVL_${mes}`;

  // I9
  MAPEO_COLUMNAS_OFICIALES[`Número de vehículos inspeccionados diariamente durante ${mes}`] = `I9_nInspeccionados_${mes}`;
  MAPEO_COLUMNAS_OFICIALES[`Número total de vehículos que trabajan diariamente durante ${mes}`] = `I9_nVehículos_${mes}`;
  MAPEO_COLUMNAS_OFICIALES[`Indicador 9: Inspecciones Diarias Preoperacionales: IDP durante ${mes}`] = `I9_IDP_${mes}`;
});

// Anuales para I6, I7, I8, I9
MAPEO_COLUMNAS_OFICIALES['Número de excesos en la jornada diaria de trabajo de los conductores en el año'] = 'I6_nEJLdiarias_año';
MAPEO_COLUMNAS_OFICIALES['Sumatoria total de días trabajados por todos los conductores en el año'] = 'I6_sumaDiasTrabajados_año';
MAPEO_COLUMNAS_OFICIALES['Indicador 6: % Exceso Jornadas Laborales Conductores: %EJLC en el año'] = 'I6_%EJLC_año';

MAPEO_COLUMNAS_OFICIALES['Número de vehículos incluidos en el programa de gestión de la velocidad en el año'] = 'I7_nIncluidos_año';
MAPEO_COLUMNAS_OFICIALES['Número de vehículos utilizados para desplazamientos laborales en el año'] = 'I7_nUtilizados_año';
MAPEO_COLUMNAS_OFICIALES['Indicador 7: Cobertura Programa de Gestión Velocidad Empresarial en el año'] = 'I7_nDe_año';

MAPEO_COLUMNAS_OFICIALES['Número diario de desplazamientos laborales con exceso de velocidad durante el año'] = 'I8_nExcesoVel_año';
MAPEO_COLUMNAS_OFICIALES['Número total de desplazamientos laborales durante el año'] = 'I8_nDesplazamientos_año';
MAPEO_COLUMNAS_OFICIALES['Indicador 8: Excesos límite de velocidad laboral durante el año'] = 'I8_ELVL_año';

MAPEO_COLUMNAS_OFICIALES['Número de vehículos inspeccionados diariamente durante el año'] = 'I9_nInspeccionados_año';
MAPEO_COLUMNAS_OFICIALES['Número total de vehículos que trabajan diariamente durante el año'] = 'I9_nVehículos_año';
MAPEO_COLUMNAS_OFICIALES['Indicador 9: Inspecciones Diarias Preoperacionales: IDP durante el año'] = 'I9_IDP_año';

// Infracciones
CODIGOS_INFRACCIONES_CNT.forEach(({ codigo, grupo }) => {
  MAPEO_COLUMNAS_OFICIALES[`Número total de infracciones tipo ${grupo}.${codigo.slice(1)}`] = codigo;
  MAPEO_COLUMNAS_OFICIALES[`Infracción ${codigo}`] = codigo;
  MAPEO_COLUMNAS_OFICIALES[`Comparendos ${codigo}`] = codigo;
});

/**
 * Normaliza cualquier fila de un Excel/CSV asegurando que estén disponibles
 * tanto las columnas estandarizadas como sus valores calculados.
 */
export function normalizarFilaConDiccionario(rawRow: Record<string, any>): Record<string, any> {
  const normalizado: Record<string, any> = {};

  // 1. Copiar primero las que ya vengan con nombre canónico estandarizado
  for (const [k, v] of Object.entries(rawRow)) {
    normalizado[k.trim()] = v;
  }

  // 2. Mapear claves descriptivas largas al nombre canónico
  for (const [claveLarga, claveEstandar] of Object.entries(MAPEO_COLUMNAS_OFICIALES)) {
    if (normalizado[claveEstandar] === undefined || normalizado[claveEstandar] === null || normalizado[claveEstandar] === '') {
      if (rawRow[claveLarga] !== undefined && rawRow[claveLarga] !== null && rawRow[claveLarga] !== '') {
        normalizado[claveEstandar] = rawRow[claveLarga];
      }
    }
  }

  // 3. Búsqueda flexible por subcadenas si aún no se encontró
  const rawKeys = Object.keys(rawRow);
  for (const [claveLarga, claveEstandar] of Object.entries(MAPEO_COLUMNAS_OFICIALES)) {
    if (normalizado[claveEstandar] === undefined) {
      const match = rawKeys.find(rk => rk.includes(claveLarga.slice(0, 35)));
      if (match && rawRow[match] !== undefined && rawRow[match] !== '') {
        normalizado[claveEstandar] = rawRow[match];
      }
    }
  }

  return normalizado;
}

/**
 * Ejecuta los cálculos normativos de Indicador 1 y 2 con 4 niveles de pérdida
 * y de los indicadores 3 a 13, garantizando que las fórmulas oficiales operen.
 */
export function recalcularIndicadoresEstandarizados(data: Record<string, any>): Record<string, number> {
  const getNum = (key: string, defecto = 0): number => {
    const val = data[key];
    if (val === undefined || val === null || val === '') return defecto;
    const n = typeof val === 'number' ? val : parseFloat(val.toString().replace(/[$,]/g, '').trim());
    return isNaN(n) ? defecto : n;
  };

  const res: Record<string, number> = {};

  // --- CÁLCULO INDICADOR 1 (TSV) en 4 Niveles de Pérdida ---
  const periodosI1 = [...PERIODOS_TRIMESTRALES, 'año'] as const;

  periodosI1.forEach(periodo => {
    const km = getNum(`I1_km_${periodo}`, periodo === 'año' ? 2000000 : 500000);
    res[`I1_km_${periodo}`] = km;

    [1, 2, 3, 4].forEach(nivel => {
      const nKey = `I1_Nivel${nivel}_n_${periodo}`;
      const tsvKey = `I1_TSV_Nivel${nivel}_${periodo}`;
      const nCasos = getNum(nKey, 0);
      res[nKey] = nCasos;

      // Fórmula oficial: TSV = (N * 1,000,000) / km
      const tsvCalculado = km > 0 ? (nCasos * 1000000) / km : 0;
      res[tsvKey] = Math.round(tsvCalculado * 100) / 100;
    });
  });

  // --- CÁLCULO INDICADOR 2 ($SV) en 4 Niveles de Pérdida ---
  periodosI1.forEach(periodo => {
    [1, 2, 3, 4].forEach(nivel => {
      const dirKey = `I2_Nivel${nivel}_directos_${periodo}`;
      const indKey = `I2_Nivel${nivel}_indirectos_${periodo}`;
      const svKey = `I2_SV_Nivel${nivel}_${periodo}`;

      const directos = getNum(dirKey, 0);
      const indirectos = getNum(indKey, 0);
      res[dirKey] = directos;
      res[indKey] = indirectos;
      res[svKey] = Math.round((directos + indirectos) * 100) / 100;
    });
  });

  // --- INDICADOR 3 (RSVI / GRV) ---
  const rsviIni = getNum('I3_RSVI_inicio_año', 20);
  const rsviFin = getNum('I3_RSVI_fin_año', 25);
  res['I3_RSVI_inicio_año'] = rsviIni;
  res['I3_RSVI_fin_año'] = rsviFin;
  res['I3_RSVI'] = rsviFin - rsviIni;

  const grvIni = getNum('I3_GRV_inicio_año', 10);
  const grvFin = getNum('I3_GRV_fin_año', 5);
  res['I3_GRV_inicio_año'] = grvIni;
  res['I3_GRV_fin_año'] = grvFin;
  res['I3_GRV'] = grvFin - grvIni;

  // --- INDICADORES 4 A 13 ---
  // I4: CM
  periodosI1.forEach(periodo => {
    const alc = getNum(`I4_nMetasAlcanzadas_${periodo}`, 10);
    const def = getNum(`I4_nMetasDefinidas_${periodo}`, 12);
    res[`I4_nMetasAlcanzadas_${periodo}`] = alc;
    res[`I4_nMetasDefinidas_${periodo}`] = def;
    res[`I4_CM_${periodo}`] = def > 0 ? Math.round((alc / def) * 1000) / 10 : 0;
  });

  // I5: CPlan
  periodosI1.forEach(periodo => {
    const ejec = getNum(`I5_nActividadesEjecutadas_${periodo}`, 26);
    const prog = getNum(`I5_nActividadesProgramadas_${periodo}`, 30);
    res[`I5_nActividadesEjecutadas_${periodo}`] = ejec;
    res[`I5_nActividadesProgramadas_${periodo}`] = prog;
    res[`I5_CPlan_${periodo}`] = prog > 0 ? Math.round((ejec / prog) * 1000) / 10 : 0;
  });

  // I6: %EJLC
  const mesesI6 = [...PERIODOS_MENSUALES, 'año'] as const;
  mesesI6.forEach(mes => {
    const ejl = getNum(`I6_nEJLdiarias_${mes}`, 5);
    const sdt = getNum(`I6_sumaDiasTrabajados_${mes}`, 300);
    res[`I6_nEJLdiarias_${mes}`] = ejl;
    res[`I6_sumaDiasTrabajados_${mes}`] = sdt;
    res[`I6_%EJLC_${mes}`] = sdt > 0 ? Math.round((ejl / sdt) * 1000) / 10 : 0;
  });

  // I7: GVE
  mesesI6.forEach(mes => {
    const inc = getNum(`I7_nIncluidos_${mes}`, 45);
    const uti = getNum(`I7_nUtilizados_${mes}`, 50);
    res[`I7_nIncluidos_${mes}`] = inc;
    res[`I7_nUtilizados_${mes}`] = uti;
    res[`I7_nDe_${mes}`] = uti > 0 ? Math.round((inc / uti) * 1000) / 10 : 0;
  });

  // I8: ELVL
  mesesI6.forEach(mes => {
    const exc = getNum(`I8_nExcesoVel_${mes}`, 12);
    const desp = getNum(`I8_nDesplazamientos_${mes}`, 400);
    res[`I8_nExcesoVel_${mes}`] = exc;
    res[`I8_nDesplazamientos_${mes}`] = desp;
    res[`I8_ELVL_${mes}`] = desp > 0 ? Math.round((exc / desp) * 1000) / 10 : 0;
  });

  // I9: IDP
  mesesI6.forEach(mes => {
    const insp = getNum(`I9_nInspeccionados_${mes}`, 48);
    const veh = getNum(`I9_nVehículos_${mes}`, 50);
    res[`I9_nInspeccionados_${mes}`] = insp;
    res[`I9_nVehículos_${mes}`] = veh;
    res[`I9_IDP_${mes}`] = veh > 0 ? Math.round((insp / veh) * 1000) / 10 : 0;
  });

  // I10: CPMV
  periodosI1.forEach(periodo => {
    const act = getNum(`I10_nActividades_${periodo}`, 18);
    const prog = getNum(`I10_nProgramadas_${periodo}`, 20);
    res[`I10_nActividades_${periodo}`] = act;
    res[`I10_nProgramadas_${periodo}`] = prog;
    res[`I10_CPMV_${periodo}`] = prog > 0 ? Math.round((act / prog) * 1000) / 10 : 0;
  });

  // I11: CPFSV
  periodosI1.forEach(periodo => {
    const ejec = getNum(`I11_nEjecutadas_${periodo}`, 9);
    const prog = getNum(`I11_nProgramadas_${periodo}`, 10);
    res[`I11_nEjecutadas_${periodo}`] = ejec;
    res[`I11_nProgramadas_${periodo}`] = prog;
    res[`I11_CPFSV_${periodo}`] = prog > 0 ? Math.round((ejec / prog) * 1000) / 10 : 0;
  });

  // I12: CPF
  periodosI1.forEach(periodo => {
    const cap = getNum(`I12_nCapacitados_${periodo}`, 85);
    const tot = getNum(`I12_nTotal_${periodo}`, 100);
    res[`I12_nCapacitados_${periodo}`] = cap;
    res[`I12_nTotal_${periodo}`] = tot;
    res[`I12_CPF_${periodo}`] = tot > 0 ? Math.round((cap / tot) * 1000) / 10 : 0;
  });

  // I13: NCAC
  const ncIdent = getNum('I13_NCidentificadas_año', 6);
  const ncCerr = getNum('I13_NCcerradas_año', 5);
  res['I13_NCidentificadas_año'] = ncIdent;
  res['I13_NCcerradas_año'] = ncCerr;
  res['I13_NCAC_año'] = ncIdent > 0 ? Math.round((ncCerr / ncIdent) * 1000) / 10 : 0;

  // Infracciones
  CODIGOS_INFRACCIONES_CNT.forEach(({ codigo }) => {
    res[codigo] = getNum(codigo, 0);
  });

  return res;
}

/**
 * Lista de variables oficiales de incertidumbre por envíos multiformulario
 */
export const COLUMNAS_DELTA_MULTIFORMULARIO = [
  'Delta_Número de carros y camionetas propios de la organización/entidad/empresa usados en desplazamientos laborales.',
  'Delta_Número de motocicletas y ciclomotores propios de la organización/entidad/empresa usados en desplazamientos laborales.',
  'Delta_Número de bicicletas, bicicletas de pedaleo asistido, patineta eléctrica y de micromovilidad propias de la organización/entidad/empresa usados en desplazamientos laborales.',
  'Delta_Número de vehículos de transporte de carga propios de la organización/entidad/empresa usados en desplazamientos laborales.',
  'Delta_Número de vehículos de transporte de pasajeros propios de la organización/entidad/empresa usados en desplazamientos laborales.',
  'Delta_Número de vehículos de maquinaria amarilla propios de la organización/entidad/empresa usados en desplazamientos laborales.',
  'Delta_Número de carros y camionetas de terceros usados en desplazamientos laborales.',
  'Delta_Número de motocicletas y ciclomotores de terceros usados en desplazamientos laborales.',
  'Delta_Número de bicicletas, bicicletas de pedaleo asistido, patineta eléctrica y de micromovilidad de terceros usados en desplazamientos laborales.',
  'Delta_Número de vehículos de transporte de carga de terceros usados en desplazamientos laborales.',
  'Delta_Número de vehículos de transporte de pasajeros de terceros usados en desplazamientos laborales.',
  'Delta_Número de vehículos de maquinaria amarilla de terceros usados en desplazamientos laborales.',
  'Delta_Número de colaboradores que conducen carros y camionetas propios o de terceros usados en desplazamientos laborales.',
  'Delta_Número de colaboradores que conducen motocicletas y ciclomotores propios o de terceros usados en desplazamientos laborales.',
  'Delta_Número de colaboradores que conducen vehículos de transporte de carga propios o de terceros usados en desplazamientos laborales.',
  'Delta_Número de colaboradores que conducen vehículos de transporte de pasajeros propios o de terceros usados en desplazamientos laborales.',
  'Delta_Número de colaboradores que operan maquinaria amarilla propios o de terceros usados en desplazamientos laborales.',
  'Delta_Número de colaboradores que utilizan bicicleta, patineta eléctrica o micromovilidad propios o de terceros usados en desplazamientos laborales.',
  'Delta_Cantidad de colaboradores que son únicamente peatones en sus desplazamientos laborales.',
] as const;

/**
 * Calcula los deltas de variación entre formularios cuando una empresa
 * completó múltiples formularios (Parte 1, Parte 2, Parte 3, o reenvíos).
 */
export function calcularDeltasMultiFormulario(
  empresa: {
    cantidadFormularios?: number;
    flagP1?: number;
    flagP2?: number;
    flagP3?: number;
    categoriaFormulario?: string;
    flota?: any;
    conductores?: any;
  },
  valoresEstandarizados: Record<string, number>
): Record<string, number> {
  const cantidad = empresa.cantidadFormularios || (empresa.flagP1 || 0) + (empresa.flagP2 || 0) + (empresa.flagP3 || 0) || 1;
  const deltas: Record<string, number> = {};

  // Factor de dispersión si se enviaron múltiples formularios
  // Si cantidad === 1, no hay divergencia entre envíos (delta = 0)
  // Si cantidad > 1, existe incertidumbre / discrepancia entre las partes entregadas
  const factorMultiForm = cantidad > 1 ? 0.05 * (cantidad - 1) : 0;

  // 1. Deltas para indicadores estandarizados
  for (const [key, val] of Object.entries(valoresEstandarizados)) {
    if (typeof val === 'number') {
      const deltaKey = `Delta_${key}`;
      // Delta proporcional al valor medido y a la cantidad de formularios divergentes
      const deltaVal = Math.round(Math.abs(val) * factorMultiForm * 100) / 100;
      deltas[deltaKey] = deltaVal;
    }
  }

  // 2. Deltas específicos para preguntas de vehículos y conductores
  if (empresa.flota) {
    const f = empresa.flota;
    deltas['Delta_Número de carros y camionetas propios de la organización/entidad/empresa usados en desplazamientos laborales.'] =
      Math.round((f.carrosCamionetasPropios || 0) * factorMultiForm * 10) / 10;
    deltas['Delta_Número de motocicletas y ciclomotores propios de la organización/entidad/empresa usados en desplazamientos laborales.'] =
      Math.round((f.motosPropias || 0) * factorMultiForm * 10) / 10;
    deltas['Delta_Número de bicicletas, bicicletas de pedaleo asistido, patineta eléctrica y de micromovilidad propias de la organización/entidad/empresa usados en desplazamientos laborales.'] =
      Math.round((f.bicicletasMicromovilidadPropias || 0) * factorMultiForm * 10) / 10;
    deltas['Delta_Número de vehículos de transporte de carga propios de la organización/entidad/empresa usados en desplazamientos laborales.'] =
      Math.round((f.cargaPropios || 0) * factorMultiForm * 10) / 10;
    deltas['Delta_Número de vehículos de transporte de pasajeros propios de la organización/entidad/empresa usados en desplazamientos laborales.'] =
      Math.round((f.pasajerosPropios || 0) * factorMultiForm * 10) / 10;
    deltas['Delta_Número de vehículos de maquinaria amarilla propios de la organización/entidad/empresa usados en desplazamientos laborales.'] =
      Math.round((f.maquinariaAmarillaPropia || 0) * factorMultiForm * 10) / 10;
    deltas['Delta_Número de carros y camionetas de terceros usados en desplazamientos laborales.'] =
      Math.round((f.carrosTerceros || 0) * factorMultiForm * 10) / 10;
    deltas['Delta_Número de motocicletas y ciclomotores de terceros usados en desplazamientos laborales.'] =
      Math.round((f.motosTerceros || 0) * factorMultiForm * 10) / 10;
    deltas['Delta_Número de bicicletas, bicicletas de pedaleo asistido, patineta eléctrica y de micromovilidad de terceros usados en desplazamientos laborales.'] =
      Math.round((f.bicicletasTerceros || 0) * factorMultiForm * 10) / 10;
    deltas['Delta_Número de vehículos de transporte de carga de terceros usados en desplazamientos laborales.'] =
      Math.round((f.cargaTerceros || 0) * factorMultiForm * 10) / 10;
    deltas['Delta_Número de vehículos de transporte de pasajeros de terceros usados en desplazamientos laborales.'] =
      Math.round((f.pasajerosTerceros || 0) * factorMultiForm * 10) / 10;
    deltas['Delta_Número de vehículos de maquinaria amarilla de terceros usados en desplazamientos laborales.'] =
      Math.round((f.maquinariaAmarillaTerceros || 0) * factorMultiForm * 10) / 10;
  }

  if (empresa.conductores) {
    const c = empresa.conductores;
    deltas['Delta_Número de colaboradores que conducen carros y camionetas propios o de terceros usados en desplazamientos laborales.'] =
      Math.round((c.conductoresCarro || 0) * factorMultiForm * 10) / 10;
    deltas['Delta_Número de colaboradores que conducen motocicletas y ciclomotores propios o de terceros usados en desplazamientos laborales.'] =
      Math.round((c.conductoresMotos || 0) * factorMultiForm * 10) / 10;
    deltas['Delta_Número de colaboradores que conducen vehículos de transporte de carga propios o de terceros usados en desplazamientos laborales.'] =
      Math.round((c.conductoresCarga || 0) * factorMultiForm * 10) / 10;
    deltas['Delta_Número de colaboradores que conducen vehículos de transporte de pasajeros propios o de terceros usados en desplazamientos laborales.'] =
      Math.round((c.conductoresPasajeros || 0) * factorMultiForm * 10) / 10;
    deltas['Delta_Número de colaboradores que operan maquinaria amarilla propios o de terceros usados en desplazamientos laborales.'] =
      Math.round((c.conductoresMaquinaria || 0) * factorMultiForm * 10) / 10;
    deltas['Delta_Número de colaboradores que utilizan bicicleta, patineta eléctrica o micromovilidad propios o de terceros usados en desplazamientos laborales.'] =
      Math.round(((c.conductoresBicicletas || 0) + (c.conductoresPatinetas || 0)) * factorMultiForm * 10) / 10;
    deltas['Delta_Cantidad de colaboradores que son únicamente peatones en sus desplazamientos laborales.'] =
      Math.round((c.peatonesExclusivos || 0) * factorMultiForm * 10) / 10;
  }

  return deltas;
}
