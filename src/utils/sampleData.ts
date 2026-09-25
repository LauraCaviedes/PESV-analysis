/**
 * Base de Datos Muestra Consolidada de Empresas PESV Colombia
 * Generada siguiendo la estructura del cruce de formularios (Partes 1, 2 y 3)
 * Incluye cálculo de nivel normativo, cálculo de incertidumbre (Delta_X) e infracciones
 */

import { EmpresaPESV, NivelPESV, Misionalidad, CategoriaFormulario, IndicadoresPESV } from '../types/pesv';
import { calcularNivelPESV, verificarIndicadoresEntregados, generarAlertasANSV } from './pesvCalculations';
import { MUNICIPIOS_CLAVE } from './colombiaGeo';

interface EmpresaBaseRaw {
  razonSocial: string;
  nit: string;
  correo: string;
  anoReporte: number;
  municipio: string;
  departamento: string;
  sectorEconomico: string;
  codigoCIIU: string;
  tipoOrganizacion: string;
  claseOrganizacion: string;
  misionalidad: Misionalidad;
  clasificacionReportada: NivelPESV;
  categoriaFormulario: CategoriaFormulario;
  flagP1: number;
  flagP2: number;
  flagP3: number;
  
  // Vehículos
  flotaPropia: number;
  flotaTerceros: number;

  // Conductores
  conductoresNorma: number;
  peatones: number;

  // Indicadores brutos
  kmRecorridos: number;
  siniestrosFatales: number;
  siniestrosGraves: number;
  siniestrosLeves: number;
  choquesSimples: number;
  costoDirecto: number; // millones COP
  costoIndirecto: number;

  riesgosIni: number;
  riesgosFin: number;
  riesgosAltosIni: number;
  riesgosAltosFin: number;

  metasAlc: number;
  metasTot: number;
  actEjec: number;
  actProg: number;

  diasExcesoJornada: number;
  diasTrabajadosMes: number;

  vehicVelocidad: number;
  desplazamientosExcesoVel: number;
  totalDesplazamientos: number;

  vehicInspeccionadosDia: number;
  vehicOperandoDia: number;

  mantEjec: number;
  mantProg: number;

  capEjec: number;
  capProg: number;
  colabCap: number;
  colabTot: number;

  ncIdent: number;
  ncCerr: number;

  // Infracciones
  c29: number; // Velocidad
  c14: number; // Pico y placa
  c02: number; // Mal parqueo
  c38: number; // RTM vencida
  d01: number; // Sin licencia
  d04: number; // SOAT vencido
  e03: number; // Alcohol
  h04: number; // Exceso horas
  otrasInf: number;

  // Incertidumbres individuales por duplicados (Delta_X)
  deltaKm: number;
  deltaTSV: number;
  deltaELVL: number;
  deltaIDP: number;
  deltaCPMVh: number;
}

const EMPRESAS_RAW_SEEDS: EmpresaBaseRaw[] = [
  {
    razonSocial: 'EXPRESO BOLIVARIANO S.A.S.',
    nit: '860002145-1',
    correo: 'seguridadvial@bolivariano.com.co',
    anoReporte: 2024,
    municipio: 'BOGOTÁ',
    departamento: 'BOGOTÁ, D.C.',
    sectorEconomico: 'Transporte y almacenamiento',
    codigoCIIU: 'H4921',
    tipoOrganizacion: 'Privada',
    claseOrganizacion: 'Grande Empresa',
    misionalidad: 'Misionalidad 1',
    clasificacionReportada: 'AVANZADO',
    categoriaFormulario: 'A',
    flagP1: 1, flagP2: 1, flagP3: 1,
    flotaPropia: 240, flotaTerceros: 45,
    conductoresNorma: 320, peatones: 35,
    kmRecorridos: 3850000,
    siniestrosFatales: 1, siniestrosGraves: 3, siniestrosLeves: 8, choquesSimples: 14,
    costoDirecto: 380, costoIndirecto: 120,
    riesgosIni: 42, riesgosFin: 48, riesgosAltosIni: 15, riesgosAltosFin: 7,
    metasAlc: 14, metasTot: 16,
    actEjec: 46, actProg: 50,
    diasExcesoJornada: 28, diasTrabajadosMes: 9600,
    vehicVelocidad: 280, desplazamientosExcesoVel: 85, totalDesplazamientos: 2200,
    vehicInspeccionadosDia: 270, vehicOperandoDia: 285,
    mantEjec: 142, mantProg: 150,
    capEjec: 34, capProg: 36, colabCap: 330, colabTot: 355,
    ncIdent: 8, ncCerr: 7,
    c29: 12, c14: 4, c02: 6, c38: 0, d01: 0, d04: 0, e03: 0, h04: 3, otrasInf: 8,
    deltaKm: 42000, deltaTSV: 0.12, deltaELVL: 0.35, deltaIDP: 0.8, deltaCPMVh: 1.2
  },
  // Reporte 2023 de Expreso Bolivariano (histórico)
  {
    razonSocial: 'EXPRESO BOLIVARIANO S.A.S.',
    nit: '860002145-1',
    correo: 'seguridadvial@bolivariano.com.co',
    anoReporte: 2023,
    municipio: 'BOGOTÁ',
    departamento: 'BOGOTÁ, D.C.',
    sectorEconomico: 'Transporte y almacenamiento',
    codigoCIIU: 'H4921',
    tipoOrganizacion: 'Privada',
    claseOrganizacion: 'Grande Empresa',
    misionalidad: 'Misionalidad 1',
    clasificacionReportada: 'AVANZADO',
    categoriaFormulario: 'A',
    flagP1: 1, flagP2: 1, flagP3: 1,
    flotaPropia: 220, flotaTerceros: 40,
    conductoresNorma: 295, peatones: 30,
    kmRecorridos: 3450000,
    siniestrosFatales: 2, siniestrosGraves: 5, siniestrosLeves: 12, choquesSimples: 19,
    costoDirecto: 450, costoIndirecto: 160,
    riesgosIni: 48, riesgosFin: 45, riesgosAltosIni: 18, riesgosAltosFin: 12,
    metasAlc: 11, metasTot: 16,
    actEjec: 38, actProg: 48,
    diasExcesoJornada: 38, diasTrabajadosMes: 8850,
    vehicVelocidad: 220, desplazamientosExcesoVel: 115, totalDesplazamientos: 2000,
    vehicInspeccionadosDia: 235, vehicOperandoDia: 260,
    mantEjec: 120, mantProg: 140,
    capEjec: 28, capProg: 34, colabCap: 270, colabTot: 325,
    ncIdent: 11, ncCerr: 6,
    c29: 22, c14: 8, c02: 10, c38: 1, d01: 0, d04: 0, e03: 0, h04: 6, otrasInf: 14,
    deltaKm: 48000, deltaTSV: 0.18, deltaELVL: 0.45, deltaIDP: 1.2, deltaCPMVh: 1.8
  },
  // Reporte 2025 de Expreso Bolivariano (proyección / reporte vigente)
  {
    razonSocial: 'EXPRESO BOLIVARIANO S.A.S.',
    nit: '860002145-1',
    correo: 'seguridadvial@bolivariano.com.co',
    anoReporte: 2025,
    municipio: 'BOGOTÁ',
    departamento: 'BOGOTÁ, D.C.',
    sectorEconomico: 'Transporte y almacenamiento',
    codigoCIIU: 'H4921',
    tipoOrganizacion: 'Privada',
    claseOrganizacion: 'Grande Empresa',
    misionalidad: 'Misionalidad 1',
    clasificacionReportada: 'AVANZADO',
    categoriaFormulario: 'A',
    flagP1: 1, flagP2: 1, flagP3: 1,
    flotaPropia: 255, flotaTerceros: 50,
    conductoresNorma: 340, peatones: 40,
    kmRecorridos: 4100000,
    siniestrosFatales: 0, siniestrosGraves: 1, siniestrosLeves: 5, choquesSimples: 9,
    costoDirecto: 260, costoIndirecto: 80,
    riesgosIni: 42, riesgosFin: 40, riesgosAltosIni: 10, riesgosAltosFin: 4,
    metasAlc: 15, metasTot: 16,
    actEjec: 49, actProg: 50,
    diasExcesoJornada: 14, diasTrabajadosMes: 10200,
    vehicVelocidad: 300, desplazamientosExcesoVel: 40, totalDesplazamientos: 2400,
    vehicInspeccionadosDia: 298, vehicOperandoDia: 305,
    mantEjec: 155, mantProg: 158,
    capEjec: 36, capProg: 36, colabCap: 365, colabTot: 380,
    ncIdent: 4, ncCerr: 4,
    c29: 6, c14: 2, c02: 3, c38: 0, d01: 0, d04: 0, e03: 0, h04: 1, otrasInf: 4,
    deltaKm: 35000, deltaTSV: 0.07, deltaELVL: 0.20, deltaIDP: 0.6, deltaCPMVh: 0.8
  },
  {
    razonSocial: 'COORDINADORA MERCANTIL S.A.',
    nit: '890903422-8',
    correo: 'pesv@coordinadora.com',
    anoReporte: 2024,
    municipio: 'MEDELLÍN',
    departamento: 'ANTIOQUIA',
    sectorEconomico: 'Transporte y almacenamiento',
    codigoCIIU: 'H4923',
    tipoOrganizacion: 'Privada',
    claseOrganizacion: 'Grande Empresa',
    misionalidad: 'Misionalidad 1',
    clasificacionReportada: 'AVANZADO',
    categoriaFormulario: 'A',
    flagP1: 1, flagP2: 1, flagP3: 1,
    flotaPropia: 410, flotaTerceros: 85,
    conductoresNorma: 540, peatones: 50,
    kmRecorridos: 5200000,
    siniestrosFatales: 0, siniestrosGraves: 2, siniestrosLeves: 11, choquesSimples: 18,
    costoDirecto: 240, costoIndirecto: 85,
    riesgosIni: 55, riesgosFin: 62, riesgosAltosIni: 18, riesgosAltosFin: 6,
    metasAlc: 18, metasTot: 20,
    actEjec: 58, actProg: 60,
    diasExcesoJornada: 15, diasTrabajadosMes: 16200,
    vehicVelocidad: 490, desplazamientosExcesoVel: 42, totalDesplazamientos: 4800,
    vehicInspeccionadosDia: 488, vehicOperandoDia: 495,
    mantEjec: 210, mantProg: 215,
    capEjec: 45, capProg: 48, colabCap: 560, colabTot: 590,
    ncIdent: 5, ncCerr: 5,
    c29: 5, c14: 2, c02: 4, c38: 0, d01: 0, d04: 0, e03: 0, h04: 1, otrasInf: 5,
    deltaKm: 31000, deltaTSV: 0.08, deltaELVL: 0.15, deltaIDP: 0.5, deltaCPMVh: 0.9
  },
  // Reporte 2023 de Coordinadora Mercantil S.A.
  {
    razonSocial: 'COORDINADORA MERCANTIL S.A.',
    nit: '890903422-8',
    correo: 'pesv@coordinadora.com',
    anoReporte: 2023,
    municipio: 'MEDELLÍN',
    departamento: 'ANTIOQUIA',
    sectorEconomico: 'Transporte y almacenamiento',
    codigoCIIU: 'H4923',
    tipoOrganizacion: 'Privada',
    claseOrganizacion: 'Grande Empresa',
    misionalidad: 'Misionalidad 1',
    clasificacionReportada: 'AVANZADO',
    categoriaFormulario: 'A',
    flagP1: 1, flagP2: 1, flagP3: 1,
    flotaPropia: 380, flotaTerceros: 70,
    conductoresNorma: 490, peatones: 45,
    kmRecorridos: 4600000,
    siniestrosFatales: 1, siniestrosGraves: 4, siniestrosLeves: 15, choquesSimples: 22,
    costoDirecto: 310, costoIndirecto: 110,
    riesgosIni: 58, riesgosFin: 55, riesgosAltosIni: 22, riesgosAltosFin: 11,
    metasAlc: 14, metasTot: 20,
    actEjec: 48, actProg: 58,
    diasExcesoJornada: 24, diasTrabajadosMes: 14700,
    vehicVelocidad: 410, desplazamientosExcesoVel: 75, totalDesplazamientos: 4200,
    vehicInspeccionadosDia: 420, vehicOperandoDia: 450,
    mantEjec: 185, mantProg: 200,
    capEjec: 38, capProg: 44, colabCap: 480, colabTot: 535,
    ncIdent: 8, ncCerr: 6,
    c29: 14, c14: 6, c02: 8, c38: 0, d01: 0, d04: 0, e03: 0, h04: 3, otrasInf: 10,
    deltaKm: 36000, deltaTSV: 0.12, deltaELVL: 0.25, deltaIDP: 0.7, deltaCPMVh: 1.2
  },
  // Reporte 2025 de Coordinadora Mercantil S.A.
  {
    razonSocial: 'COORDINADORA MERCANTIL S.A.',
    nit: '890903422-8',
    correo: 'pesv@coordinadora.com',
    anoReporte: 2025,
    municipio: 'MEDELLÍN',
    departamento: 'ANTIOQUIA',
    sectorEconomico: 'Transporte y almacenamiento',
    codigoCIIU: 'H4923',
    tipoOrganizacion: 'Privada',
    claseOrganizacion: 'Grande Empresa',
    misionalidad: 'Misionalidad 1',
    clasificacionReportada: 'AVANZADO',
    categoriaFormulario: 'A',
    flagP1: 1, flagP2: 1, flagP3: 1,
    flotaPropia: 440, flotaTerceros: 90,
    conductoresNorma: 580, peatones: 55,
    kmRecorridos: 5800000,
    siniestrosFatales: 0, siniestrosGraves: 1, siniestrosLeves: 8, choquesSimples: 14,
    costoDirecto: 180, costoIndirecto: 60,
    riesgosIni: 52, riesgosFin: 48, riesgosAltosIni: 14, riesgosAltosFin: 3,
    metasAlc: 19, metasTot: 20,
    actEjec: 59, actProg: 60,
    diasExcesoJornada: 8, diasTrabajadosMes: 17400,
    vehicVelocidad: 520, desplazamientosExcesoVel: 22, totalDesplazamientos: 5100,
    vehicInspeccionadosDia: 525, vehicOperandoDia: 530,
    mantEjec: 225, mantProg: 228,
    capEjec: 48, capProg: 48, colabCap: 610, colabTot: 635,
    ncIdent: 3, ncCerr: 3,
    c29: 3, c14: 1, c02: 2, c38: 0, d01: 0, d04: 0, e03: 0, h04: 0, otrasInf: 3,
    deltaKm: 27000, deltaTSV: 0.05, deltaELVL: 0.10, deltaIDP: 0.4, deltaCPMVh: 0.7
  },
  {
    razonSocial: 'DISTRIBUCIONES Y LOGÍSTICA DEL VALLE S.A.S.',
    nit: '900456123-4',
    correo: 'hseq@logivalledelvalle.com',
    anoReporte: 2024,
    municipio: 'CALI',
    departamento: 'VALLE DEL CAUCA',
    sectorEconomico: 'Comercio al por mayor y al por menor',
    codigoCIIU: 'G4690',
    tipoOrganizacion: 'Privada',
    claseOrganizacion: 'Mediana Empresa',
    misionalidad: 'Misionalidad 2',
    clasificacionReportada: 'BÁSICO', // DISCREPANCIA: Tiene 62 vehículos y 65 conductores en Misionalidad 2 -> Es ESTÁNDAR!
    categoriaFormulario: 'A',
    flagP1: 1, flagP2: 1, flagP3: 1,
    flotaPropia: 42, flotaTerceros: 20,
    conductoresNorma: 65, peatones: 12,
    kmRecorridos: 620000,
    siniestrosFatales: 0, siniestrosGraves: 1, siniestrosLeves: 4, choquesSimples: 9,
    costoDirecto: 75, costoIndirecto: 30,
    riesgosIni: 22, riesgosFin: 25, riesgosAltosIni: 9, riesgosAltosFin: 5,
    metasAlc: 7, metasTot: 10,
    actEjec: 22, actProg: 30,
    diasExcesoJornada: 25, diasTrabajadosMes: 1950,
    vehicVelocidad: 45, desplazamientosExcesoVel: 68, totalDesplazamientos: 750,
    vehicInspeccionadosDia: 48, vehicOperandoDia: 62,
    mantEjec: 28, mantProg: 40,
    capEjec: 10, capProg: 16, colabCap: 45, colabTot: 77,
    ncIdent: 9, ncCerr: 3,
    c29: 14, c14: 8, c02: 11, c38: 2, d01: 1, d04: 0, e03: 0, h04: 4, otrasInf: 15,
    deltaKm: 15000, deltaTSV: 0.25, deltaELVL: 0.85, deltaIDP: 2.1, deltaCPMVh: 3.5
  },
  // Reporte 2023 de Distribuciones y Logística del Valle (cuando tenía menor flota: 45 vehículos -> BÁSICO legal)
  {
    razonSocial: 'DISTRIBUCIONES Y LOGÍSTICA DEL VALLE S.A.S.',
    nit: '900456123-4',
    correo: 'hseq@logivalledelvalle.com',
    anoReporte: 2023,
    municipio: 'CALI',
    departamento: 'VALLE DEL CAUCA',
    sectorEconomico: 'Comercio al por mayor y al por menor',
    codigoCIIU: 'G4690',
    tipoOrganizacion: 'Privada',
    claseOrganizacion: 'Mediana Empresa',
    misionalidad: 'Misionalidad 2',
    clasificacionReportada: 'BÁSICO', // En 2023 tenía 44 vehículos y 45 conductores -> BÁSICO legítimo
    categoriaFormulario: 'A',
    flagP1: 1, flagP2: 1, flagP3: 1,
    flotaPropia: 32, flotaTerceros: 12,
    conductoresNorma: 44, peatones: 10,
    kmRecorridos: 510000,
    siniestrosFatales: 0, siniestrosGraves: 2, siniestrosLeves: 6, choquesSimples: 11,
    costoDirecto: 95, costoIndirecto: 40,
    riesgosIni: 20, riesgosFin: 22, riesgosAltosIni: 10, riesgosAltosFin: 7,
    metasAlc: 6, metasTot: 10,
    actEjec: 18, actProg: 28,
    diasExcesoJornada: 32, diasTrabajadosMes: 1320,
    vehicVelocidad: 30, desplazamientosExcesoVel: 82, totalDesplazamientos: 620,
    vehicInspeccionadosDia: 38, vehicOperandoDia: 44,
    mantEjec: 22, mantProg: 35,
    capEjec: 8, capProg: 14, colabCap: 32, colabTot: 54,
    ncIdent: 10, ncCerr: 2,
    c29: 18, c14: 10, c02: 12, c38: 3, d01: 2, d04: 1, e03: 0, h04: 5, otrasInf: 18,
    deltaKm: 18000, deltaTSV: 0.32, deltaELVL: 0.95, deltaIDP: 2.5, deltaCPMVh: 4.2
  },
  {
    razonSocial: 'ALMACENES ÉXITO S.A.',
    nit: '890900608-9',
    correo: 'movilidadsegura@grupo-exito.com',
    anoReporte: 2024,
    municipio: 'ENVIGADO',
    departamento: 'ANTIOQUIA',
    sectorEconomico: 'Comercio al por mayor y al por menor',
    codigoCIIU: 'G4711',
    tipoOrganizacion: 'Privada',
    claseOrganizacion: 'Grande Empresa',
    misionalidad: 'Misionalidad 2',
    clasificacionReportada: 'AVANZADO',
    categoriaFormulario: 'A',
    flagP1: 1, flagP2: 1, flagP3: 1,
    flotaPropia: 125, flotaTerceros: 310,
    conductoresNorma: 430, peatones: 120,
    kmRecorridos: 3400000,
    siniestrosFatales: 0, siniestrosGraves: 1, siniestrosLeves: 7, choquesSimples: 15,
    costoDirecto: 130, costoIndirecto: 45,
    riesgosIni: 48, riesgosFin: 55, riesgosAltosIni: 14, riesgosAltosFin: 4,
    metasAlc: 16, metasTot: 18,
    actEjec: 52, actProg: 55,
    diasExcesoJornada: 12, diasTrabajadosMes: 12900,
    vehicVelocidad: 420, desplazamientosExcesoVel: 35, totalDesplazamientos: 3100,
    vehicInspeccionadosDia: 425, vehicOperandoDia: 435,
    mantEjec: 180, mantProg: 185,
    capEjec: 42, capProg: 44, colabCap: 510, colabTot: 550,
    ncIdent: 6, ncCerr: 5,
    c29: 8, c14: 6, c02: 5, c38: 0, d01: 0, d04: 0, e03: 0, h04: 1, otrasInf: 9,
    deltaKm: 28000, deltaTSV: 0.09, deltaELVL: 0.18, deltaIDP: 0.6, deltaCPMVh: 1.1
  },
  // Reporte 2023 de Almacenes Éxito S.A.
  {
    razonSocial: 'ALMACENES ÉXITO S.A.',
    nit: '890900608-9',
    correo: 'movilidadsegura@grupo-exito.com',
    anoReporte: 2023,
    municipio: 'ENVIGADO',
    departamento: 'ANTIOQUIA',
    sectorEconomico: 'Comercio al por mayor y al por menor',
    codigoCIIU: 'G4711',
    tipoOrganizacion: 'Privada',
    claseOrganizacion: 'Grande Empresa',
    misionalidad: 'Misionalidad 2',
    clasificacionReportada: 'AVANZADO',
    categoriaFormulario: 'A',
    flagP1: 1, flagP2: 1, flagP3: 1,
    flotaPropia: 110, flotaTerceros: 260,
    conductoresNorma: 380, peatones: 100,
    kmRecorridos: 3100000,
    siniestrosFatales: 1, siniestrosGraves: 3, siniestrosLeves: 10, choquesSimples: 18,
    costoDirecto: 190, costoIndirecto: 70,
    riesgosIni: 52, riesgosFin: 50, riesgosAltosIni: 18, riesgosAltosFin: 8,
    metasAlc: 14, metasTot: 18,
    actEjec: 45, actProg: 52,
    diasExcesoJornada: 18, diasTrabajadosMes: 11400,
    vehicVelocidad: 350, desplazamientosExcesoVel: 58, totalDesplazamientos: 2800,
    vehicInspeccionadosDia: 360, vehicOperandoDia: 370,
    mantEjec: 150, mantProg: 165,
    capEjec: 36, capProg: 40, colabCap: 440, colabTot: 480,
    ncIdent: 8, ncCerr: 6,
    c29: 14, c14: 8, c02: 8, c38: 1, d01: 0, d04: 0, e03: 0, h04: 2, otrasInf: 12,
    deltaKm: 32000, deltaTSV: 0.12, deltaELVL: 0.22, deltaIDP: 0.8, deltaCPMVh: 1.3
  },
  {
    razonSocial: 'CONSTRUCTORA COLPATRIA S.A.S.',
    nit: '860052341-2',
    correo: 'seguridad.vial@colpatria.com',
    anoReporte: 2024,
    municipio: 'BOGOTÁ',
    departamento: 'BOGOTÁ, D.C.',
    sectorEconomico: 'Construcción',
    codigoCIIU: 'F4111',
    tipoOrganizacion: 'Privada',
    claseOrganizacion: 'Grande Empresa',
    misionalidad: 'Misionalidad 2',
    clasificacionReportada: 'ESTÁNDAR', // DISCREPANCIA: Tiene 115 vehículos + 130 conductores en Misionalidad 2 -> Debe ser AVANZADO!
    categoriaFormulario: 'A',
    flagP1: 1, flagP2: 1, flagP3: 1,
    flotaPropia: 65, flotaTerceros: 50,
    conductoresNorma: 130, peatones: 45,
    kmRecorridos: 980000,
    siniestrosFatales: 1, siniestrosGraves: 2, siniestrosLeves: 6, choquesSimples: 10,
    costoDirecto: 185, costoIndirecto: 60,
    riesgosIni: 35, riesgosFin: 38, riesgosAltosIni: 16, riesgosAltosFin: 9,
    metasAlc: 10, metasTot: 14,
    actEjec: 32, actProg: 40,
    diasExcesoJornada: 38, diasTrabajadosMes: 3900,
    vehicVelocidad: 85, desplazamientosExcesoVel: 95, totalDesplazamientos: 920,
    vehicInspeccionadosDia: 92, vehicOperandoDia: 115,
    mantEjec: 45, mantProg: 60,
    capEjec: 18, capProg: 24, colabCap: 110, colabTot: 175,
    ncIdent: 11, ncCerr: 4,
    c29: 18, c14: 9, c02: 8, c38: 3, d01: 0, d04: 1, e03: 0, h04: 6, otrasInf: 14,
    deltaKm: 22000, deltaTSV: 0.31, deltaELVL: 0.95, deltaIDP: 1.8, deltaCPMVh: 2.8
  },
  // Reporte 2023 de Constructora Colpatria S.A.S. (En 2023 tenía 47 vehículos y 48 conductores en Misionalidad 2 -> Era nivel BÁSICO legalmente)
  {
    razonSocial: 'CONSTRUCTORA COLPATRIA S.A.S.',
    nit: '860052341-2',
    correo: 'seguridad.vial@colpatria.com',
    anoReporte: 2023,
    municipio: 'BOGOTÁ',
    departamento: 'BOGOTÁ, D.C.',
    sectorEconomico: 'Construcción',
    codigoCIIU: 'F4111',
    tipoOrganizacion: 'Privada',
    claseOrganizacion: 'Grande Empresa',
    misionalidad: 'Misionalidad 2',
    clasificacionReportada: 'BÁSICO', // En 2023 cumplía nivel Básico
    categoriaFormulario: 'A',
    flagP1: 1, flagP2: 1, flagP3: 1,
    flotaPropia: 32, flotaTerceros: 15,
    conductoresNorma: 48, peatones: 30,
    kmRecorridos: 540000,
    siniestrosFatales: 0, siniestrosGraves: 1, siniestrosLeves: 4, choquesSimples: 7,
    costoDirecto: 90, costoIndirecto: 35,
    riesgosIni: 28, riesgosFin: 30, riesgosAltosIni: 11, riesgosAltosFin: 6,
    metasAlc: 8, metasTot: 12,
    actEjec: 24, actProg: 30,
    diasExcesoJornada: 20, diasTrabajadosMes: 1440,
    vehicVelocidad: 40, desplazamientosExcesoVel: 52, totalDesplazamientos: 610,
    vehicInspeccionadosDia: 42, vehicOperandoDia: 47,
    mantEjec: 30, mantProg: 36,
    capEjec: 12, capProg: 18, colabCap: 60, colabTot: 78,
    ncIdent: 7, ncCerr: 3,
    c29: 10, c14: 5, c02: 4, c38: 1, d01: 0, d04: 0, e03: 0, h04: 3, otrasInf: 8,
    deltaKm: 16000, deltaTSV: 0.22, deltaELVL: 0.65, deltaIDP: 1.5, deltaCPMVh: 2.2
  },
  {
    razonSocial: 'TRANSPORTES VIGÍA LTDA.',
    nit: '800189456-3',
    correo: 'pesv@transportesvigia.com.co',
    anoReporte: 2024,
    municipio: 'BUCARAMANGA',
    departamento: 'SANTANDER',
    sectorEconomico: 'Transporte y almacenamiento',
    codigoCIIU: 'H4923',
    tipoOrganizacion: 'Privada',
    claseOrganizacion: 'Pequeña Empresa',
    misionalidad: 'Misionalidad 1',
    clasificacionReportada: 'BÁSICO',
    categoriaFormulario: 'A',
    flagP1: 1, flagP2: 1, flagP3: 1,
    flotaPropia: 15, flotaTerceros: 3,
    conductoresNorma: 17, peatones: 4,
    kmRecorridos: 240000,
    siniestrosFatales: 0, siniestrosGraves: 0, siniestrosLeves: 2, choquesSimples: 3,
    costoDirecto: 18, costoIndirecto: 6,
    riesgosIni: 14, riesgosFin: 16, riesgosAltosIni: 6, riesgosAltosFin: 3,
    metasAlc: 6, metasTot: 8,
    actEjec: 18, actProg: 20,
    diasExcesoJornada: 4, diasTrabajadosMes: 510,
    vehicVelocidad: 18, desplazamientosExcesoVel: 8, totalDesplazamientos: 190,
    vehicInspeccionadosDia: 17, vehicOperandoDia: 18,
    mantEjec: 15, mantProg: 16,
    capEjec: 8, capProg: 10, colabCap: 18, colabTot: 21,
    ncIdent: 3, ncCerr: 2,
    c29: 2, c14: 1, c02: 1, c38: 0, d01: 0, d04: 0, e03: 0, h04: 0, otrasInf: 2,
    deltaKm: 8000, deltaTSV: 0.15, deltaELVL: 0.4, deltaIDP: 1.1, deltaCPMVh: 1.8
  },
  {
    razonSocial: 'AGROINDUSTRIA DEL CASANARE S.A.S.',
    nit: '901234987-1',
    correo: 'seguridad@agrocasanare.com',
    anoReporte: 2024,
    municipio: 'YOPAL',
    departamento: 'CASANARE',
    sectorEconomico: 'Agricultura, ganadería, caza y silvicultura',
    codigoCIIU: 'A0111',
    tipoOrganizacion: 'Privada',
    claseOrganizacion: 'Mediana Empresa',
    misionalidad: 'Misionalidad 2',
    clasificacionReportada: 'BÁSICO',
    categoriaFormulario: 'B', // COMPLETÓ 2 PARTES
    flagP1: 1, flagP2: 1, flagP3: 0,
    flotaPropia: 28, flotaTerceros: 8,
    conductoresNorma: 32, peatones: 15,
    kmRecorridos: 310000,
    siniestrosFatales: 0, siniestrosGraves: 1, siniestrosLeves: 3, choquesSimples: 5,
    costoDirecto: 35, costoIndirecto: 12,
    riesgosIni: 16, riesgosFin: 18, riesgosAltosIni: 7, riesgosAltosFin: 4,
    metasAlc: 5, metasTot: 8,
    actEjec: 14, actProg: 20,
    diasExcesoJornada: 14, diasTrabajadosMes: 960,
    vehicVelocidad: 20, desplazamientosExcesoVel: 22, totalDesplazamientos: 280,
    vehicInspeccionadosDia: 28, vehicOperandoDia: 36,
    mantEjec: 19, mantProg: 25,
    capEjec: 6, capProg: 12, colabCap: 25, colabTot: 47,
    ncIdent: 4, ncCerr: 1,
    c29: 6, c14: 1, c02: 2, c38: 1, d01: 0, d04: 1, e03: 0, h04: 2, otrasInf: 5,
    deltaKm: 12000, deltaTSV: 0.22, deltaELVL: 0.7, deltaIDP: 1.9, deltaCPMVh: 2.9
  },
  {
    razonSocial: 'SERVICIOS INTEGRALES PETROLEROS DEL META S.A.S.',
    nit: '900876543-9',
    correo: 'hseq@petrometa.com',
    anoReporte: 2024,
    municipio: 'VILLAVICENCIO',
    departamento: 'META',
    sectorEconomico: 'Explotación de minas y canteras',
    codigoCIIU: 'B0610',
    tipoOrganizacion: 'Privada',
    claseOrganizacion: 'Grande Empresa',
    misionalidad: 'Misionalidad 2',
    clasificacionReportada: 'AVANZADO',
    categoriaFormulario: 'A',
    flagP1: 1, flagP2: 1, flagP3: 1,
    flotaPropia: 92, flotaTerceros: 45,
    conductoresNorma: 145, peatones: 30,
    kmRecorridos: 1850000,
    siniestrosFatales: 0, siniestrosGraves: 1, siniestrosLeves: 4, choquesSimples: 7,
    costoDirecto: 95, costoIndirecto: 32,
    riesgosIni: 38, riesgosFin: 42, riesgosAltosIni: 12, riesgosAltosFin: 3,
    metasAlc: 15, metasTot: 16,
    actEjec: 44, actProg: 46,
    diasExcesoJornada: 8, diasTrabajadosMes: 4350,
    vehicVelocidad: 135, desplazamientosExcesoVel: 26, totalDesplazamientos: 1650,
    vehicInspeccionadosDia: 132, vehicOperandoDia: 137,
    mantEjec: 82, mantProg: 85,
    capEjec: 26, capProg: 28, colabCap: 165, colabTot: 175,
    ncIdent: 4, ncCerr: 4,
    c29: 4, c14: 2, c02: 3, c38: 0, d01: 0, d04: 0, e03: 0, h04: 1, otrasInf: 4,
    deltaKm: 18000, deltaTSV: 0.1, deltaELVL: 0.22, deltaIDP: 0.7, deltaCPMVh: 1.0
  },
  {
    razonSocial: 'DISTRIBUIDORA DE BEBIDAS DE LA COSTA S.A.S.',
    nit: '802014562-4',
    correo: 'seguridadvial@bebidascosta.com',
    anoReporte: 2024,
    municipio: 'BARRANQUILLA',
    departamento: 'ATLÁNTICO',
    sectorEconomico: 'Industrias manufactureras',
    codigoCIIU: 'C1104',
    tipoOrganizacion: 'Privada',
    claseOrganizacion: 'Grande Empresa',
    misionalidad: 'Misionalidad 2',
    clasificacionReportada: 'ESTÁNDAR',
    categoriaFormulario: 'A',
    flagP1: 1, flagP2: 1, flagP3: 1,
    flotaPropia: 68, flotaTerceros: 15,
    conductoresNorma: 88, peatones: 22,
    kmRecorridos: 890000,
    siniestrosFatales: 0, siniestrosGraves: 2, siniestrosLeves: 5, choquesSimples: 12,
    costoDirecto: 82, costoIndirecto: 28,
    riesgosIni: 28, riesgosFin: 32, riesgosAltosIni: 10, riesgosAltosFin: 5,
    metasAlc: 10, metasTot: 12,
    actEjec: 30, actProg: 35,
    diasExcesoJornada: 22, diasTrabajadosMes: 2640,
    vehicVelocidad: 75, desplazamientosExcesoVel: 52, totalDesplazamientos: 720,
    vehicInspeccionadosDia: 74, vehicOperandoDia: 83,
    mantEjec: 42, mantProg: 48,
    capEjec: 14, capProg: 18, colabCap: 85, colabTot: 110,
    ncIdent: 6, ncCerr: 4,
    c29: 11, c14: 7, c02: 6, c38: 1, d01: 0, d04: 0, e03: 0, h04: 3, otrasInf: 8,
    deltaKm: 14000, deltaTSV: 0.19, deltaELVL: 0.6, deltaIDP: 1.4, deltaCPMVh: 2.1
  },
  {
    razonSocial: 'CLÍNICA DE TRAUMA Y ESPECIALISTAS DEL CARIBE S.A.',
    nit: '806012458-7',
    correo: 'ambulancias@clinicatraumacaribe.com',
    anoReporte: 2024,
    municipio: 'CARTAGENA',
    departamento: 'BOLÍVAR',
    sectorEconomico: 'Actividades de atención de la salud humana',
    codigoCIIU: 'Q8610',
    tipoOrganizacion: 'Privada',
    claseOrganizacion: 'Mediana Empresa',
    misionalidad: 'Misionalidad 2',
    clasificacionReportada: 'BÁSICO',
    categoriaFormulario: 'A',
    flagP1: 1, flagP2: 1, flagP3: 1,
    flotaPropia: 18, flotaTerceros: 4,
    conductoresNorma: 24, peatones: 60,
    kmRecorridos: 360000,
    siniestrosFatales: 0, siniestrosGraves: 1, siniestrosLeves: 2, choquesSimples: 4,
    costoDirecto: 42, costoIndirecto: 15,
    riesgosIni: 19, riesgosFin: 21, riesgosAltosIni: 8, riesgosAltosFin: 4,
    metasAlc: 7, metasTot: 9,
    actEjec: 21, actProg: 24,
    diasExcesoJornada: 18, diasTrabajadosMes: 720,
    vehicVelocidad: 18, desplazamientosExcesoVel: 34, totalDesplazamientos: 420,
    vehicInspeccionadosDia: 20, vehicOperandoDia: 22,
    mantEjec: 20, mantProg: 22,
    capEjec: 10, capProg: 12, colabCap: 65, colabTot: 84,
    ncIdent: 3, ncCerr: 2,
    c29: 7, c14: 3, c02: 4, c38: 0, d01: 0, d04: 0, e03: 0, h04: 4, otrasInf: 3,
    deltaKm: 9000, deltaTSV: 0.17, deltaELVL: 0.55, deltaIDP: 1.2, deltaCPMVh: 1.6
  },
  {
    razonSocial: 'TRANSPORTES COOTRANSORIENTE C.T.A.',
    nit: '890204789-5',
    correo: 'gerencia@cootransoriente.com',
    anoReporte: 2024,
    municipio: 'CÚCUTA',
    departamento: 'NORTE DE SANTANDER',
    sectorEconomico: 'Transporte y almacenamiento',
    codigoCIIU: 'H4921',
    tipoOrganizacion: 'Economía Solidaria',
    claseOrganizacion: 'Mediana Empresa',
    misionalidad: 'Misionalidad 1',
    clasificacionReportada: 'BÁSICO', // DISCREPANCIA: Tiene 34 vehículos y 38 conductores en Misionalidad 1 -> Es ESTÁNDAR!
    categoriaFormulario: 'A',
    flagP1: 1, flagP2: 1, flagP3: 1,
    flotaPropia: 12, flotaTerceros: 22,
    conductoresNorma: 38, peatones: 8,
    kmRecorridos: 640000,
    siniestrosFatales: 1, siniestrosGraves: 1, siniestrosLeves: 4, choquesSimples: 6,
    costoDirecto: 92, costoIndirecto: 38,
    riesgosIni: 20, riesgosFin: 22, riesgosAltosIni: 11, riesgosAltosFin: 6,
    metasAlc: 6, metasTot: 10,
    actEjec: 18, actProg: 26,
    diasExcesoJornada: 24, diasTrabajadosMes: 1140,
    vehicVelocidad: 22, desplazamientosExcesoVel: 45, totalDesplazamientos: 380,
    vehicInspeccionadosDia: 26, vehicOperandoDia: 34,
    mantEjec: 22, mantProg: 32,
    capEjec: 8, capProg: 14, colabCap: 28, colabTot: 46,
    ncIdent: 7, ncCerr: 2,
    c29: 10, c14: 4, c02: 5, c38: 2, d01: 0, d04: 1, e03: 0, h04: 5, otrasInf: 7,
    deltaKm: 13000, deltaTSV: 0.28, deltaELVL: 0.82, deltaIDP: 2.0, deltaCPMVh: 3.1
  },
  {
    razonSocial: 'COOPERATIVA DE CAFICULTORES DE MANIZALES',
    nit: '890801235-9',
    correo: 'logistica@coopcafemanizales.com.co',
    anoReporte: 2024,
    municipio: 'MANIZALES',
    departamento: 'CALDAS',
    sectorEconomico: 'Agricultura, ganadería, caza y silvicultura',
    codigoCIIU: 'A0127',
    tipoOrganizacion: 'Economía Solidaria',
    claseOrganizacion: 'Mediana Empresa',
    misionalidad: 'Misionalidad 2',
    clasificacionReportada: 'BÁSICO',
    categoriaFormulario: 'A',
    flagP1: 1, flagP2: 1, flagP3: 1,
    flotaPropia: 22, flotaTerceros: 14,
    conductoresNorma: 36, peatones: 18,
    kmRecorridos: 410000,
    siniestrosFatales: 0, siniestrosGraves: 0, siniestrosLeves: 3, choquesSimples: 5,
    costoDirecto: 24, costoIndirecto: 8,
    riesgosIni: 18, riesgosFin: 20, riesgosAltosIni: 7, riesgosAltosFin: 3,
    metasAlc: 7, metasTot: 9,
    actEjec: 22, actProg: 25,
    diasExcesoJornada: 6, diasTrabajadosMes: 1080,
    vehicVelocidad: 30, desplazamientosExcesoVel: 14, totalDesplazamientos: 340,
    vehicInspeccionadosDia: 34, vehicOperandoDia: 36,
    mantEjec: 26, mantProg: 28,
    capEjec: 10, capProg: 12, colabCap: 44, colabTot: 54,
    ncIdent: 2, ncCerr: 2,
    c29: 3, c14: 2, c02: 1, c38: 0, d01: 0, d04: 0, e03: 0, h04: 1, otrasInf: 2,
    deltaKm: 9500, deltaTSV: 0.11, deltaELVL: 0.32, deltaIDP: 0.9, deltaCPMVh: 1.3
  },
  {
    razonSocial: 'SERVIENTREGA S.A.',
    nit: '860512330-3',
    correo: 'seguridadvial@servientrega.com',
    anoReporte: 2024,
    municipio: 'BOGOTÁ',
    departamento: 'BOGOTÁ, D.C.',
    sectorEconomico: 'Transporte y almacenamiento',
    codigoCIIU: 'H5310',
    tipoOrganizacion: 'Privada',
    claseOrganizacion: 'Grande Empresa',
    misionalidad: 'Misionalidad 1',
    clasificacionReportada: 'AVANZADO',
    categoriaFormulario: 'A',
    flagP1: 1, flagP2: 1, flagP3: 1,
    flotaPropia: 850, flotaTerceros: 320,
    conductoresNorma: 1250, peatones: 180,
    kmRecorridos: 9400000,
    siniestrosFatales: 1, siniestrosGraves: 4, siniestrosLeves: 22, choquesSimples: 35,
    costoDirecto: 490, costoIndirecto: 180,
    riesgosIni: 65, riesgosFin: 74, riesgosAltosIni: 22, riesgosAltosFin: 7,
    metasAlc: 22, metasTot: 24,
    actEjec: 72, actProg: 75,
    diasExcesoJornada: 45, diasTrabajadosMes: 37500,
    vehicVelocidad: 1120, desplazamientosExcesoVel: 95, totalDesplazamientos: 9800,
    vehicInspeccionadosDia: 1145, vehicOperandoDia: 1170,
    mantEjec: 480, mantProg: 495,
    capEjec: 56, capProg: 60, colabCap: 1360, colabTot: 1430,
    ncIdent: 8, ncCerr: 7,
    c29: 22, c14: 14, c02: 18, c38: 0, d01: 0, d04: 0, e03: 0, h04: 4, otrasInf: 25,
    deltaKm: 58000, deltaTSV: 0.07, deltaELVL: 0.12, deltaIDP: 0.4, deltaCPMVh: 0.8
  },
  {
    razonSocial: 'ALCALDÍA MAYOR DE BOGOTÁ - SECRETARÍA DE GOBIERNO',
    nit: '899999061-9',
    correo: 'pesv@gobiernobogota.gov.co',
    anoReporte: 2024,
    municipio: 'BOGOTÁ',
    departamento: 'BOGOTÁ, D.C.',
    sectorEconomico: 'Administración pública y defensa',
    codigoCIIU: 'O8411',
    tipoOrganizacion: 'Pública',
    claseOrganizacion: 'Grande Empresa',
    misionalidad: 'Misionalidad 2',
    clasificacionReportada: 'AVANZADO',
    categoriaFormulario: 'A',
    flagP1: 1, flagP2: 1, flagP3: 1,
    flotaPropia: 140, flotaTerceros: 25,
    conductoresNorma: 175, peatones: 220,
    kmRecorridos: 1420000,
    siniestrosFatales: 0, siniestrosGraves: 0, siniestrosLeves: 4, choquesSimples: 11,
    costoDirecto: 54, costoIndirecto: 18,
    riesgosIni: 32, riesgosFin: 36, riesgosAltosIni: 10, riesgosAltosFin: 3,
    metasAlc: 12, metasTot: 14,
    actEjec: 38, actProg: 42,
    diasExcesoJornada: 8, diasTrabajadosMes: 5250,
    vehicVelocidad: 155, desplazamientosExcesoVel: 18, totalDesplazamientos: 1200,
    vehicInspeccionadosDia: 158, vehicOperandoDia: 165,
    mantEjec: 68, mantProg: 72,
    capEjec: 22, capProg: 24, colabCap: 350, colabTot: 395,
    ncIdent: 3, ncCerr: 3,
    c29: 5, c14: 8, c02: 6, c38: 0, d01: 0, d04: 0, e03: 0, h04: 0, otrasInf: 7,
    deltaKm: 16000, deltaTSV: 0.08, deltaELVL: 0.18, deltaIDP: 0.5, deltaCPMVh: 0.9
  },
  {
    razonSocial: 'INGENIO CENTRAL CASTILLA S.A.S.',
    nit: '890300412-1',
    correo: 'seguridadvial@riopaila-castilla.com',
    anoReporte: 2024,
    municipio: 'PALMIRA',
    departamento: 'VALLE DEL CAUCA',
    sectorEconomico: 'Industrias manufactureras',
    codigoCIIU: 'C1071',
    tipoOrganizacion: 'Privada',
    claseOrganizacion: 'Grande Empresa',
    misionalidad: 'Misionalidad 2',
    clasificacionReportada: 'AVANZADO',
    categoriaFormulario: 'A',
    flagP1: 1, flagP2: 1, flagP3: 1,
    flotaPropia: 115, flotaTerceros: 80,
    conductoresNorma: 210, peatones: 85,
    kmRecorridos: 2200000,
    siniestrosFatales: 0, siniestrosGraves: 2, siniestrosLeves: 6, choquesSimples: 12,
    costoDirecto: 110, costoIndirecto: 42,
    riesgosIni: 40, riesgosFin: 44, riesgosAltosIni: 14, riesgosAltosFin: 5,
    metasAlc: 14, metasTot: 16,
    actEjec: 40, actProg: 44,
    diasExcesoJornada: 16, diasTrabajadosMes: 6300,
    vehicVelocidad: 185, desplazamientosExcesoVel: 38, totalDesplazamientos: 1950,
    vehicInspeccionadosDia: 188, vehicOperandoDia: 195,
    mantEjec: 94, mantProg: 100,
    capEjec: 28, capProg: 30, colabCap: 260, colabTot: 295,
    ncIdent: 4, ncCerr: 4,
    c29: 7, c14: 3, c02: 4, c38: 0, d01: 0, d04: 0, e03: 0, h04: 2, otrasInf: 6,
    deltaKm: 21000, deltaTSV: 0.11, deltaELVL: 0.24, deltaIDP: 0.6, deltaCPMVh: 1.1
  },
  {
    razonSocial: 'CARGA Y LOGÍSTICA DEL HUILA LTDA.',
    nit: '891102984-6',
    correo: 'seguridad@cargahuila.com.co',
    anoReporte: 2024,
    municipio: 'NEIVA',
    departamento: 'HUILA',
    sectorEconomico: 'Transporte y almacenamiento',
    codigoCIIU: 'H4923',
    tipoOrganizacion: 'Privada',
    claseOrganizacion: 'Pequeña Empresa',
    misionalidad: 'Misionalidad 1',
    clasificacionReportada: 'BÁSICO',
    categoriaFormulario: 'C', // SOLO COMPLETÓ 1 PARTE!
    flagP1: 1, flagP2: 0, flagP3: 0,
    flotaPropia: 14, flotaTerceros: 4,
    conductoresNorma: 18, peatones: 3,
    kmRecorridos: 210000,
    siniestrosFatales: 0, siniestrosGraves: 1, siniestrosLeves: 2, choquesSimples: 3,
    costoDirecto: 28, costoIndirecto: 10,
    riesgosIni: 12, riesgosFin: 14, riesgosAltosIni: 5, riesgosAltosFin: 3,
    metasAlc: 4, metasTot: 8,
    actEjec: 10, actProg: 18,
    diasExcesoJornada: 12, diasTrabajadosMes: 540,
    vehicVelocidad: 12, desplazamientosExcesoVel: 24, totalDesplazamientos: 160,
    vehicInspeccionadosDia: 14, vehicOperandoDia: 18,
    mantEjec: 11, mantProg: 18,
    capEjec: 4, capProg: 10, colabCap: 12, colabTot: 21,
    ncIdent: 5, ncCerr: 1,
    c29: 6, c14: 2, c02: 3, c38: 1, d01: 0, d04: 1, e03: 0, h04: 3, otrasInf: 4,
    deltaKm: 11000, deltaTSV: 0.35, deltaELVL: 1.1, deltaIDP: 2.4, deltaCPMVh: 3.8
  },
  {
    razonSocial: 'OPERADORA DE TURISMO Y TRANSPORTE CARIBE TOURS S.A.S.',
    nit: '900654321-7',
    correo: 'operaciones@caribetours.com.co',
    anoReporte: 2024,
    municipio: 'SANTA MARTA',
    departamento: 'MAGDALENA',
    sectorEconomico: 'Transporte y almacenamiento',
    codigoCIIU: 'H4921',
    tipoOrganizacion: 'Privada',
    claseOrganizacion: 'Mediana Empresa',
    misionalidad: 'Misionalidad 1',
    clasificacionReportada: 'BÁSICO', // DISCREPANCIA: 24 vehículos, 28 conductores -> Es ESTÁNDAR!
    categoriaFormulario: 'A',
    flagP1: 1, flagP2: 1, flagP3: 1,
    flotaPropia: 18, flotaTerceros: 6,
    conductoresNorma: 28, peatones: 6,
    kmRecorridos: 460000,
    siniestrosFatales: 0, siniestrosGraves: 2, siniestrosLeves: 4, choquesSimples: 6,
    costoDirecto: 48, costoIndirecto: 19,
    riesgosIni: 19, riesgosFin: 22, riesgosAltosIni: 8, riesgosAltosFin: 4,
    metasAlc: 7, metasTot: 10,
    actEjec: 20, actProg: 26,
    diasExcesoJornada: 19, diasTrabajadosMes: 840,
    vehicVelocidad: 18, desplazamientosExcesoVel: 38, totalDesplazamientos: 310,
    vehicInspeccionadosDia: 20, vehicOperandoDia: 24,
    mantEjec: 18, mantProg: 24,
    capEjec: 9, capProg: 14, colabCap: 24, colabTot: 34,
    ncIdent: 5, ncCerr: 2,
    c29: 9, c14: 3, c02: 4, c38: 1, d01: 0, d04: 0, e03: 0, h04: 4, otrasInf: 5,
    deltaKm: 14000, deltaTSV: 0.26, deltaELVL: 0.78, deltaIDP: 1.8, deltaCPMVh: 2.5
  },
  {
    razonSocial: 'EMPRESA DE TELECOMUNICACIONES DE BOGOTÁ - ETB S.A. E.S.P.',
    nit: '899999115-8',
    correo: 'seguridad.movil@etb.com.co',
    anoReporte: 2024,
    municipio: 'BOGOTÁ',
    departamento: 'BOGOTÁ, D.C.',
    sectorEconomico: 'Información y comunicaciones',
    codigoCIIU: 'J6110',
    tipoOrganizacion: 'Mixta',
    claseOrganizacion: 'Grande Empresa',
    misionalidad: 'Misionalidad 2',
    clasificacionReportada: 'AVANZADO',
    categoriaFormulario: 'A',
    flagP1: 1, flagP2: 1, flagP3: 1,
    flotaPropia: 220, flotaTerceros: 180,
    conductoresNorma: 420, peatones: 150,
    kmRecorridos: 3100000,
    siniestrosFatales: 0, siniestrosGraves: 1, siniestrosLeves: 9, choquesSimples: 21,
    costoDirecto: 115, costoIndirecto: 38,
    riesgosIni: 44, riesgosFin: 49, riesgosAltosIni: 13, riesgosAltosFin: 4,
    metasAlc: 17, metasTot: 18,
    actEjec: 48, actProg: 50,
    diasExcesoJornada: 14, diasTrabajadosMes: 12600,
    vehicVelocidad: 385, desplazamientosExcesoVel: 44, totalDesplazamientos: 3900,
    vehicInspeccionadosDia: 390, vehicOperandoDia: 400,
    mantEjec: 165, mantProg: 170,
    capEjec: 38, capProg: 40, colabCap: 520, colabTot: 570,
    ncIdent: 4, ncCerr: 4,
    c29: 9, c14: 12, c02: 10, c38: 0, d01: 0, d04: 0, e03: 0, h04: 1, otrasInf: 11,
    deltaKm: 26000, deltaTSV: 0.08, deltaELVL: 0.16, deltaIDP: 0.5, deltaCPMVh: 0.9
  },
  {
    razonSocial: 'SERVICIOS LOGÍSTICOS DEL RISARALDA S.A.S.',
    nit: '901045892-3',
    correo: 'operaciones@logirisa.com',
    anoReporte: 2024,
    municipio: 'PEREIRA',
    departamento: 'RISARALDA',
    sectorEconomico: 'Transporte y almacenamiento',
    codigoCIIU: 'H5210',
    tipoOrganizacion: 'Privada',
    claseOrganizacion: 'Mediana Empresa',
    misionalidad: 'Misionalidad 2',
    clasificacionReportada: 'BÁSICO',
    categoriaFormulario: 'A',
    flagP1: 1, flagP2: 1, flagP3: 1,
    flotaPropia: 32, flotaTerceros: 12,
    conductoresNorma: 46, peatones: 10,
    kmRecorridos: 510000,
    siniestrosFatales: 0, siniestrosGraves: 0, siniestrosLeves: 3, choquesSimples: 6,
    costoDirecto: 32, costoIndirecto: 11,
    riesgosIni: 18, riesgosFin: 20, riesgosAltosIni: 7, riesgosAltosFin: 3,
    metasAlc: 8, metasTot: 10,
    actEjec: 24, actProg: 28,
    diasExcesoJornada: 8, diasTrabajadosMes: 1380,
    vehicVelocidad: 38, desplazamientosExcesoVel: 19, totalDesplazamientos: 410,
    vehicInspeccionadosDia: 41, vehicOperandoDia: 44,
    mantEjec: 28, mantProg: 30,
    capEjec: 11, capProg: 13, colabCap: 48, colabTot: 56,
    ncIdent: 3, ncCerr: 3,
    c29: 4, c14: 2, c02: 2, c38: 0, d01: 0, d04: 0, e03: 0, h04: 1, otrasInf: 3,
    deltaKm: 11000, deltaTSV: 0.12, deltaELVL: 0.35, deltaIDP: 0.9, deltaCPMVh: 1.4
  },
  {
    razonSocial: 'INDUSTRIAS METÁLICAS DE SANTANDER S.A.',
    nit: '890201457-3',
    correo: 'seguridad@imetsan.com.co',
    anoReporte: 2024,
    municipio: 'FLORIDABLANCA',
    departamento: 'SANTANDER',
    sectorEconomico: 'Industrias manufactureras',
    codigoCIIU: 'C2511',
    tipoOrganizacion: 'Privada',
    claseOrganizacion: 'Mediana Empresa',
    misionalidad: 'Misionalidad 2',
    clasificacionReportada: 'BÁSICO',
    categoriaFormulario: 'A',
    flagP1: 1, flagP2: 1, flagP3: 1,
    flotaPropia: 24, flotaTerceros: 8,
    conductoresNorma: 34, peatones: 45,
    kmRecorridos: 380000,
    siniestrosFatales: 0, siniestrosGraves: 1, siniestrosLeves: 2, choquesSimples: 4,
    costoDirecto: 26, costoIndirecto: 9,
    riesgosIni: 16, riesgosFin: 18, riesgosAltosIni: 6, riesgosAltosFin: 3,
    metasAlc: 7, metasTot: 9,
    actEjec: 20, actProg: 24,
    diasExcesoJornada: 7, diasTrabajadosMes: 1020,
    vehicVelocidad: 28, desplazamientosExcesoVel: 15, totalDesplazamientos: 310,
    vehicInspeccionadosDia: 30, vehicOperandoDia: 32,
    mantEjec: 22, mantProg: 25,
    capEjec: 9, capProg: 12, colabCap: 65, colabTot: 79,
    ncIdent: 2, ncCerr: 2,
    c29: 3, c14: 2, c02: 3, c38: 0, d01: 0, d04: 0, e03: 0, h04: 1, otrasInf: 2,
    deltaKm: 10000, deltaTSV: 0.14, deltaELVL: 0.38, deltaIDP: 1.0, deltaCPMVh: 1.5
  },
  {
    razonSocial: 'TRANSPORTES RÁPIDOS DE BOYACÁ S.A.S.',
    nit: '900389123-5',
    correo: 'seguridadvial@rapidosboyaca.com',
    anoReporte: 2024,
    municipio: 'DUITAMA',
    departamento: 'BOYACÁ',
    sectorEconomico: 'Transporte y almacenamiento',
    codigoCIIU: 'H4923',
    tipoOrganizacion: 'Privada',
    claseOrganizacion: 'Mediana Empresa',
    misionalidad: 'Misionalidad 1',
    clasificacionReportada: 'ESTÁNDAR',
    categoriaFormulario: 'A',
    flagP1: 1, flagP2: 1, flagP3: 1,
    flotaPropia: 35, flotaTerceros: 12,
    conductoresNorma: 48, peatones: 12,
    kmRecorridos: 720000,
    siniestrosFatales: 0, siniestrosGraves: 2, siniestrosLeves: 5, choquesSimples: 8,
    costoDirecto: 68, costoIndirecto: 24,
    riesgosIni: 24, riesgosFin: 28, riesgosAltosIni: 9, riesgosAltosFin: 4,
    metasAlc: 11, metasTot: 13,
    actEjec: 32, actProg: 36,
    diasExcesoJornada: 14, diasTrabajadosMes: 1440,
    vehicVelocidad: 45, desplazamientosExcesoVel: 32, totalDesplazamientos: 550,
    vehicInspeccionadosDia: 44, vehicOperandoDia: 47,
    mantEjec: 34, mantProg: 38,
    capEjec: 15, capProg: 18, colabCap: 52, colabTot: 60,
    ncIdent: 4, ncCerr: 3,
    c29: 7, c14: 3, c02: 4, c38: 0, d01: 0, d04: 0, e03: 0, h04: 2, otrasInf: 4,
    deltaKm: 15000, deltaTSV: 0.16, deltaELVL: 0.42, deltaIDP: 1.1, deltaCPMVh: 1.7
  },
  {
    razonSocial: 'SOCIEDAD PORTUARIA REGIONAL DE BUENAVENTURA S.A.',
    nit: '800222415-3',
    correo: 'seguridad.vial@sprbun.com',
    anoReporte: 2024,
    municipio: 'BUENAVENTURA',
    departamento: 'VALLE DEL CAUCA',
    sectorEconomico: 'Transporte y almacenamiento',
    codigoCIIU: 'H5222',
    tipoOrganizacion: 'Privada',
    claseOrganizacion: 'Grande Empresa',
    misionalidad: 'Misionalidad 2',
    clasificacionReportada: 'AVANZADO',
    categoriaFormulario: 'A',
    flagP1: 1, flagP2: 1, flagP3: 1,
    flotaPropia: 85, flotaTerceros: 40,
    conductoresNorma: 125, peatones: 90,
    kmRecorridos: 1150000,
    siniestrosFatales: 0, siniestrosGraves: 1, siniestrosLeves: 3, choquesSimples: 8,
    costoDirecto: 72, costoIndirecto: 25,
    riesgosIni: 34, riesgosFin: 38, riesgosAltosIni: 11, riesgosAltosFin: 4,
    metasAlc: 13, metasTot: 15,
    actEjec: 36, actProg: 40,
    diasExcesoJornada: 9, diasTrabajadosMes: 3750,
    vehicVelocidad: 118, desplazamientosExcesoVel: 22, totalDesplazamientos: 1100,
    vehicInspeccionadosDia: 120, vehicOperandoDia: 125,
    mantEjec: 62, mantProg: 66,
    capEjec: 20, capProg: 22, colabCap: 195, colabTot: 215,
    ncIdent: 3, ncCerr: 3,
    c29: 4, c14: 2, c02: 3, c38: 0, d01: 0, d04: 0, e03: 0, h04: 1, otrasInf: 5,
    deltaKm: 17000, deltaTSV: 0.09, deltaELVL: 0.20, deltaIDP: 0.6, deltaCPMVh: 1.0
  }
];

// Helper para convertir datos brutos al objeto completo de EmpresaPESV
export function hidratarEmpresa(raw: EmpresaBaseRaw, index: number): EmpresaPESV {
  const muni = MUNICIPIOS_CLAVE.find(m => m.nombre.toUpperCase() === raw.municipio.toUpperCase()) || {
    lat: 4.6097,
    lon: -74.0817,
  };

  const totalVehiculos = raw.flotaPropia + raw.flotaTerceros;
  const totalConductoresNorma = raw.conductoresNorma;

  const clasificacionCalculada = calcularNivelPESV(raw.misionalidad, totalVehiculos, totalConductoresNorma);
  const esClasificacionCorrecta = raw.clasificacionReportada === clasificacionCalculada;
  
  let discrepanciaClasificacion: string | undefined = undefined;
  if (!esClasificacionCorrecta) {
    discrepanciaClasificacion = `Reportó ${raw.clasificacionReportada}, pero por flota (${totalVehiculos}) y conductores (${totalConductoresNorma}) la norma exige ${clasificacionCalculada}`;
  }

  // Fórmulas exactas según Resolución
  const k = 1000000;
  const tsvFatalidades = (raw.siniestrosFatales * k) / raw.kmRecorridos;
  const tsvHeridosGraves = (raw.siniestrosGraves * k) / raw.kmRecorridos;
  const tsvHeridosLeves = (raw.siniestrosLeves * k) / raw.kmRecorridos;
  const tsvChoquesSimples = (raw.choquesSimples * k) / raw.kmRecorridos;
  const tsvTotal = tsvFatalidades + tsvHeridosGraves + tsvHeridosLeves + tsvChoquesSimples;

  const costosTotales = raw.costoDirecto + raw.costoIndirecto;
  const rsvi = raw.riesgosFin - raw.riesgosIni;
  const grv = raw.riesgosAltosFin - raw.riesgosAltosIni;

  const cmPesv = (raw.metasAlc / raw.metasTot) * 100;
  const cPlanPesv = (raw.actEjec / raw.actProg) * 100;
  const porcExcesoJornada = (raw.diasExcesoJornada / raw.diasTrabajadosMes) * 100;
  const gveCobertura = (raw.vehicVelocidad / totalVehiculos) * 100;
  const elvl = (raw.desplazamientosExcesoVel / raw.totalDesplazamientos) * 100;
  const idp = (raw.vehicInspeccionadosDia / raw.vehicOperandoDia) * 100;
  const cpmvh = (raw.mantEjec / raw.mantProg) * 100;
  const cpfCumplimiento = (raw.capEjec / raw.capProg) * 100;
  const cpfCobertura = (raw.colabCap / raw.colabTot) * 100;
  const ncac = raw.ncIdent > 0 ? (raw.ncCerr / raw.ncIdent) * 100 : 100;

  const indicadores: IndicadoresPESV = {
    tsvFatalidades,
    tsvHeridosGraves,
    tsvHeridosLeves,
    tsvChoquesSimples,
    tsvTotal,
    kmRecorridosTrimestre: raw.kmRecorridos,
    costosDirectos: raw.costoDirecto,
    costosIndirectos: raw.costoIndirecto,
    costosTotales,
    riesgosIdentificadosInicio: raw.riesgosIni,
    riesgosIdentificadosFin: raw.riesgosFin,
    rsvi,
    riesgosAltosInicio: raw.riesgosAltosIni,
    riesgosAltosFin: raw.riesgosAltosFin,
    grv,
    metasAlcanzadas: raw.metasAlc,
    metasTotales: raw.metasTot,
    cmPesv,
    actividadesEjecutadas: raw.actEjec,
    actividadesProgramadas: raw.actProg,
    cPlanPesv,
    excesosJornadaDias: raw.diasExcesoJornada,
    sumatoriaDiasTrabajados: raw.diasTrabajadosMes,
    porcExcesoJornada,
    vehiculosGestionVelocidad: raw.vehicVelocidad,
    vehiculosDesplazamientosLaborales: totalVehiculos,
    gveCobertura,
    desplazamientosExcesoVelocidad: raw.desplazamientosExcesoVel,
    totalDesplazamientos: raw.totalDesplazamientos,
    elvl,
    vehiculosInspeccionadosDia: raw.vehicInspeccionadosDia,
    totalVehiculosOperando: raw.vehicOperandoDia,
    idp,
    mantenimientosEjecutados: raw.mantEjec,
    mantenimientosProgramados: raw.mantProg,
    cpmvh,
    capacitacionesEjecutadas: raw.capEjec,
    capacitacionesProgramadas: raw.capProg,
    cpfCumplimiento,
    colaboradoresCapacitados: raw.colabCap,
    totalColaboradores: raw.colabTot,
    cpfCobertura,
    ncIdentificadas: raw.ncIdent,
    ncCerradas: raw.ncCerr,
    ncac,
  };

  const totalInfracciones =
    raw.c29 + raw.c14 + raw.c02 + raw.c38 + raw.d01 + raw.d04 + raw.e03 + raw.h04 + raw.otrasInf;

  const { cumple, faltantes } = verificarIndicadoresEntregados(clasificacionCalculada, indicadores);

  const empresaObj: Partial<EmpresaPESV> = {
    id: `EMP-${(index + 1).toString().padStart(3, '0')}-${raw.anoReporte}`,
    razonSocial: raw.razonSocial,
    tipoDocumento: raw.nit.startsWith('9') || raw.nit.startsWith('8') ? 'NIT' : 'C.C.',
    numeroDocumento: raw.nit,
    correo: raw.correo,
    anoReporte: raw.anoReporte,
    departamento: raw.departamento,
    municipio: raw.municipio,
    lat: muni.lat,
    lon: muni.lon,
    sectorEconomico: raw.sectorEconomico,
    codigoCIIU: raw.codigoCIIU,
    tipoOrganizacion: raw.tipoOrganizacion,
    claseOrganizacion: raw.claseOrganizacion,
    misionalidad: raw.misionalidad,
    clasificacionReportada: raw.clasificacionReportada,
    clasificacionCalculada,
    esClasificacionCorrecta,
    discrepanciaClasificacion,
    categoriaFormulario: raw.categoriaFormulario,
    flagP1: raw.flagP1,
    flagP2: raw.flagP2,
    flagP3: raw.flagP3,
    cantidadFormularios: raw.flagP1 + raw.flagP2 + raw.flagP3,
    estadoParte1: raw.flagP1 === 1 ? raw.categoriaFormulario : '',
    estadoParte2: raw.flagP2 === 1 ? raw.categoriaFormulario : '',
    estadoParte3: raw.flagP3 === 1 ? raw.categoriaFormulario : '',
    cumpleEntregaNivel: cumple,
    indicadoresFaltantesPorNivel: faltantes,
    flota: (() => {
      const carrosCamionetasPropios = Math.round(raw.flotaPropia * 0.4);
      const motosPropias = Math.round(raw.flotaPropia * 0.15);
      const bicicletasMicromovilidadPropias = Math.round(raw.flotaPropia * 0.05);
      const cargaPropios = Math.round(raw.flotaPropia * 0.25);
      const pasajerosPropios = Math.round(raw.flotaPropia * 0.1);
      const maquinariaAmarillaPropia = Math.max(
        0,
        raw.flotaPropia - (carrosCamionetasPropios + motosPropias + bicicletasMicromovilidadPropias + cargaPropios + pasajerosPropios)
      );

      const carrosTerceros = Math.round(raw.flotaTerceros * 0.4);
      const motosTerceros = Math.round(raw.flotaTerceros * 0.3);
      const bicicletasTerceros = Math.round(raw.flotaTerceros * 0.1);
      const cargaTerceros = Math.round(raw.flotaTerceros * 0.15);
      const pasajerosTerceros = Math.max(
        0,
        raw.flotaTerceros - (carrosTerceros + motosTerceros + bicicletasTerceros + cargaTerceros)
      );

      return {
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
        maquinariaAmarillaTerceros: 0,
        totalVehiculos,
      };
    })(),
    conductores: (() => {
      const conductoresCarro = Math.round(raw.conductoresNorma * 0.4);
      const conductoresCarga = Math.round(raw.conductoresNorma * 0.25);
      const conductoresPasajeros = Math.round(raw.conductoresNorma * 0.15);
      const conductoresMaquinaria = Math.round(raw.conductoresNorma * 0.05);
      const conductoresBicicletas = Math.round(raw.conductoresNorma * 0.03);
      const conductoresMotos = Math.max(
        0,
        raw.conductoresNorma - (conductoresCarro + conductoresCarga + conductoresPasajeros + conductoresMaquinaria + conductoresBicicletas)
      );

      return {
        conductoresCarro,
        conductoresCarga,
        conductoresPasajeros,
        conductoresMaquinaria,
        conductoresMotos,
        conductoresCiclomotores: 0,
        conductoresBicicletas,
        conductoresPatinetas: 0,
        peatonesExclusivos: raw.peatones,
        totalConductoresNorma,
      };
    })(),
    indicadores,
    deltasIncertidumbre: {
      tsvTotal: raw.deltaTSV,
      elvl: raw.deltaELVL,
      idp: raw.deltaIDP,
      cpmvh: raw.deltaCPMVh,
      cmPesv: 1.5,
      cPlanPesv: 1.2,
      porcExcesoJornada: 0.3,
      gveCobertura: 1.8,
      cpfCumplimiento: 2.0,
      cpfCobertura: 1.6,
      ncac: 2.5,
    },
    infracciones: {
      C29: raw.c29,
      C14: raw.c14,
      C02: raw.c02,
      C38: raw.c38,
      D01: raw.d01,
      D02: 0,
      D04: raw.d04,
      D05: 0,
      E03: raw.e03,
      H04: raw.h04,
      B01: 1,
      B02: 0,
      otrasInfracciones: raw.otrasInf,
      totalInfracciones,
    },
    deltaInfracciones: Math.round(totalInfracciones * 0.08 * 10) / 10,
  };

  empresaObj.alertas = generarAlertasANSV(empresaObj);
  return empresaObj as EmpresaPESV;
}

export const EMPRESAS_DEMO_PESV: EmpresaPESV[] = EMPRESAS_RAW_SEEDS.map((seed, idx) =>
  hidratarEmpresa(seed, idx)
);
