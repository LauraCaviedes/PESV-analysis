/**
 * PESV (Plan Estratégico de Seguridad Vial) Types
 * Basado en la Metodología de la Resolución Mintransporte / ANSV (Ley 1503 de 2011, Ley 2050 de 2020)
 */

export type Misionalidad = 'Misionalidad 1' | 'Misionalidad 2'; 
// Misionalidad 1: Prestación del servicio de transporte terrestre automotor
// Misionalidad 2: Actividad diferente al transporte

export type NivelPESV = 'BÁSICO' | 'ESTÁNDAR' | 'AVANZADO' | 'NO OBLIGADO';

export type CategoriaFormulario = 'A' | 'B' | 'C'; 
// A: Completó los 3 formularios (Parte 1, 2, 3)
// B: Completó 2 formularios
// C: Completó solo 1 formulario

export type TipoDocumento = 'NIT' | 'C.C.' | 'C.E.';

export interface FlotaVehicular {
  carrosCamionetasPropios: number;
  motosPropias: number;
  bicicletasMicromovilidadPropias: number;
  cargaPropios: number;
  pasajerosPropios: number;
  maquinariaAmarillaPropia: number;
  carrosTerceros: number;
  motosTerceros: number;
  bicicletasTerceros: number;
  cargaTerceros: number;
  pasajerosTerceros: number;
  maquinariaAmarillaTerceros: number;
  totalVehiculos: number;
}

export interface CensoConductores {
  conductoresCarro: number;
  conductoresCarga: number;
  conductoresPasajeros: number;
  conductoresMaquinaria: number;
  conductoresMotos: number;
  conductoresCiclomotores: number;
  conductoresBicicletas: number;
  conductoresPatinetas: number;
  peatonesExclusivos: number;
  totalConductoresNorma: number; // Excluye peatones según norma
}

export interface IndicadoresPESV {
  // 1. Tasa de Siniestros Viales por nivel de pérdida: TSV(n) = SV(tn) * 1,000,000 / km(t)
  tsvFatalidades: number;
  tsvHeridosGraves: number;
  tsvHeridosLeves: number;
  tsvChoquesSimples: number;
  tsvTotal: number;
  kmRecorridosTrimestre: number;
  
  // 2. Costos Siniestros Viales: $SV(n) = CDSV + CISV (en millones COP)
  costosDirectos: number;
  costosIndirectos: number;
  costosTotales: number;

  // 3. Riesgos de Seguridad Vial Identificados y Gestión
  riesgosIdentificadosInicio: number;
  riesgosIdentificadosFin: number;
  rsvi: number; // RI(fa) - RI(ia)
  riesgosAltosInicio: number;
  riesgosAltosFin: number;
  grv: number; // RVA(fa) - RVA(ia)

  // 4. Cumplimiento Metas PESV: CM = MA / TM * 100
  metasAlcanzadas: number;
  metasTotales: number;
  cmPesv: number; // %

  // 5. Cumplimiento Actividades Plan Anual: CPlan = AEPlan / APPlan * 100
  actividadesEjecutadas: number;
  actividadesProgramadas: number;
  cPlanPesv: number; // %

  // 6. % Exceso Jornadas Laborales Conductores: %EJL = #EJD / #SDT * 100
  excesosJornadaDias: number;
  sumatoriaDiasTrabajados: number;
  porcExcesoJornada: number; // %

  // 7. Cobertura Gestión de Velocidad Empresarial: GVE = #VIP / #VDL * 100
  vehiculosGestionVelocidad: number;
  vehiculosDesplazamientosLaborales: number;
  gveCobertura: number; // %

  // 8. Excesos Límite Velocidad Laboral: ELVL = #DLEV / #TDL * 100
  desplazamientosExcesoVelocidad: number;
  totalDesplazamientos: number;
  elvl: number; // %

  // 9. Inspecciones Diarias Preoperacionales: IDP = #VID / #TV * 100
  vehiculosInspeccionadosDia: number;
  totalVehiculosOperando: number;
  idp: number; // %

  // 10. Cumplimiento Plan Mantenimiento Preventivo: CPMVh = MEVh / MPVh * 100
  mantenimientosEjecutados: number;
  mantenimientosProgramados: number;
  cpmvh: number; // %

  // 11. Cumplimiento Plan Formación: CPFSV = CESV / CPSV * 100
  capacitacionesEjecutadas: number;
  capacitacionesProgramadas: number;
  cpfCumplimiento: number; // %

  // 12. Cobertura Plan Formación: CPFSV_Cob = CFSV / CT * 100
  colaboradoresCapacitados: number;
  totalColaboradores: number;
  cpfCobertura: number; // %

  // 13. No Conformidades Auditoría Cerradas: NCAC = #NCG / #NCI * 100
  ncIdentificadas: number;
  ncCerradas: number;
  ncac: number; // %
}

// Infracciones de Tránsito según Código Nacional de Tránsito de Colombia (grupos A, B, C, D, E, H)
export interface InfraccionesTransito {
  // Principales detectadas en transporte laboral
  C29: number; // Exceso de velocidad
  C14: number; // Transitar en sitios u horarios prohibidos (Pico y placa)
  C02: number; // Estacionar en sitios prohibidos
  C38: number; // No realizar técnico-mecánica en plazos fijados
  D01: number; // Guiar sin haber obtenido licencia de conducción
  D02: number; // Conducir con licencia suspendida o cancelada
  D04: number; // No portar SOAT vigente
  D05: number; // Conducir en sentido contrario
  E03: number; // Conducir bajo influjo de alcohol / sustancias psicoactivas
  H04: number; // Exceder tiempos de jornada laboral de conducción / descanso
  B01: number; // Conducir sin portar licencia
  B02: number; // Conducir sin placas o ilegibles
  otrasInfracciones: number;
  totalInfracciones: number;
}

export type TipoAlertaANSV = 
  | 'CLASIFICACION_DISCREPANTE'
  | 'VELOCIDAD_CRITICA'
  | 'FATIGA_Y_JORNADAS'
  | 'MANTENIMIENTO_E_INSPECCION'
  | 'FORMACION_DEFICITARIA'
  | 'ALTA_SINIESTRALIDAD'
  | 'AUDITORIA_NC_ABIERTAS'
  | 'ENTREGA_INCOMPLETA_FORMULARIOS'
  | 'METAS_DESALINEADAS';

export type NivelSeveridad = 'BAJA' | 'MEDIA' | 'ALTA' | 'CRÍTICA';

export interface AlertaANSV {
  id: string;
  tipo: TipoAlertaANSV;
  titulo: string;
  severidad: NivelSeveridad;
  descripcion: string;
  recomendacionANSV: string;
  pasosPESVAfectados: number[];
}

// Paso 6: Evaluación y Valoración del Riesgo Vial (Resolución 40595 de 2022)
export type NivelExposicion = 'Frecuente' | 'Ocasional' | 'Esporádica';
export type NivelProbabilidad = 'Muy Probable' | 'Poco Probable' | 'No es Probable';
export type CriticidadRiesgo = 'Crítico' | 'Alto' | 'Medio' | 'Bajo';

export interface ItemRiesgoPaso6 {
  id: string;
  factorRiesgo: string; // Ej: Exceso de velocidad, Fatiga / microsueño, Falla en frenos/llantas, Clima/vía mojada, Distracción celular, Interacción peatones/motos, No uso cinturón
  categoria: 'Velocidad' | 'Fatiga' | 'Vehicular' | 'Infraestructura/Entorno' | 'Comportamiento' | 'Vulnerables';
  exposicion: NivelExposicion;
  probabilidad: NivelProbabilidad;
  criticidad: CriticidadRiesgo;
  controlesRecomendados: string;
  responsableSugerido: string;
}

// Paso 20 (Tabla 10): Series Temporales de Indicadores
export type FrecuenciaPaso20 = 
  | 'TRIMESTRAL_Y_ACUMULADO_ANUAL' // Indicadores 1, 2, 4, 5, 10, 11, 12
  | 'MENSUAL_Y_ACUMULADO_ANUAL'    // Indicadores 6, 7, 8, 9
  | 'ACUMULADO_ANUAL';             // Indicadores 3, 13

export interface PuntoTemporal {
  periodo: string; // "T1", "T2", "T3", "T4" o "Ene", "Feb"...
  periodoEtiqueta: string;
  valor: number;
}

export interface SerieTemporalIndicador {
  indicadorId: string;
  frecuencia: FrecuenciaPaso20;
  puntos: PuntoTemporal[];
  acumuladoAnual: number;
  tendencia: 'MEJORANDO' | 'ESTABLE' | 'DETERIORANDO';
  unidad: string;
}

// Procesamiento de Texto de Metas (Text Analytics)
export type CategoriaMetaPESV =
  | 'REDUCCION_SINIESTROS'
  | 'GESTION_VELOCIDAD'
  | 'CAPACITACION_Y_FORMACION'
  | 'MANTENIMIENTO_E_INSPECCION'
  | 'FATIGA_Y_JORNADAS'
  | 'CERO_TOLERANCIA_SUSTANCIAS'
  | 'CINTURON_Y_EPP'
  | 'AUDITORIA_Y_MEJORA';

export interface MetaCategorizada {
  categoria: CategoriaMetaPESV;
  nombreCategoria: string;
  palabrasClaveEncontradas: string[];
  extractoTexto: string;
  metaCuantificada?: string; // Ej: "-15%", "100%", "95%"
  relevancia: number; // 1-5
}

export interface EmpresaPESV {
  id: string;
  razonSocial: string;
  tipoDocumento: TipoDocumento;
  numeroDocumento: string;
  correo: string;
  anoReporte: number;
  departamento: string;
  municipio: string;
  lat: number;
  lon: number;
  sectorEconomico: string;
  codigoCIIU: string;
  tipoOrganizacion: string;
  claseOrganizacion: string;
  
  // Clasificación
  misionalidad: Misionalidad;
  clasificacionReportada: NivelPESV;
  clasificacionCalculada: NivelPESV;
  esClasificacionCorrecta: boolean;
  discrepanciaClasificacion?: string;

  // Entrega de información según su nivel
  categoriaFormulario: CategoriaFormulario;
  flagP1: number;
  flagP2: number;
  flagP3: number;
  cantidadFormularios: number;
  estadoParte1: string;
  estadoParte2: string;
  estadoParte3: string;
  cumpleEntregaNivel: boolean;
  indicadoresFaltantesPorNivel: string[];

  // Flota y conductores
  flota: FlotaVehicular;
  conductores: CensoConductores;

  // Indicadores y sus incertidumbres individuales
  indicadores: IndicadoresPESV;
  deltasIncertidumbre: Partial<Record<keyof IndicadoresPESV, number>>;

  // Infracciones
  infracciones: InfraccionesTransito;
  deltaInfracciones: number;

  // Alertas ANSV identificadas
  alertas: AlertaANSV[];

  // Paso 6: Valoración de Riesgos Viales
  riesgosPaso6?: ItemRiesgoPaso6[];

  // Paso 7: Descripción y Text Analytics de Metas
  descripcionMetas?: string;
  metasCategorizadas?: MetaCategorizada[];

  // Paso 20: Series Temporales (Trimestral/Mensual/Anual según Tabla 10)
  seriesTemporales?: Record<string, SerieTemporalIndicador>;
}

export interface ResumenIncertidumbre {
  media: number;
  deltaX: number;
  min: number;
  max: number;
  unidad: string;
}

export interface ResumenPoblacionalPESV {
  totalEmpresasUnicas: number;
  empresasCategoriaA: number;
  empresasCategoriaB: number;
  empresasCategoriaC: number;
  discrepanciasClasificacion: number;
  empresasConAlertasCriticas: number;
  tasaSiniestrosMediaConIncertidumbre: ResumenIncertidumbre;
  cumplimientoMetasConIncertidumbre: ResumenIncertidumbre;
  cumplimientoMantenimientoConIncertidumbre: ResumenIncertidumbre;
  cumplimientoPreoperacionalConIncertidumbre: ResumenIncertidumbre;
  coberturaFormacionConIncertidumbre: ResumenIncertidumbre;
}
