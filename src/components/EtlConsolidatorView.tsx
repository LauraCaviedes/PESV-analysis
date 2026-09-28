import React, { useState } from 'react';
import {
  RefreshCw,
  AlertCircle,
  FileSpreadsheet,
  CheckCircle2,
  Upload,
  ArrowRight,
  Database,
  Layers,
  Sparkles,
  Download,
  Info,
} from 'lucide-react';
import * as XLSX from 'xlsx';
import {
  ejecutarPipelineETL,
  RegistroFormularioRaw,
  ResumenETL,
} from '../utils/etlPipeline';
import { leerArchivoExcel, convertirExcelConsolidadoAEmpresas } from '../utils/excelImporter';
import { EmpresaPESV } from '../types/pesv';

interface EtlConsolidatorViewProps {
  onActualizarEmpresas: (nuevasEmpresas: EmpresaPESV[]) => void;
}

export const EtlConsolidatorView: React.FC<EtlConsolidatorViewProps> = ({
  onActualizarEmpresas,
}) => {
  const [tabModo, setTabModo] = useState<'TRES_PARTES' | 'EXCEL_UNICO'>('TRES_PARTES');
  const [procesando, setProcesando] = useState<boolean>(false);
  const [pasoActivo, setPasoActivo] = useState<number>(0);
  const [resultadoETL, setResultadoETL] = useState<ResumenETL | null>(null);
  const [notificacionCarga, setNotificacionCarga] = useState<string | null>(null);

  // Estados para las 3 partes
  const [archivosCargados, setArchivosCargados] = useState<{
    p1: File | null;
    p2: File | null;
    p3: File | null;
  }>({ p1: null, p2: null, p3: null });

  // Estado para 1 archivo consolidado único
  const [archivoUnico, setArchivoUnico] = useState<File | null>(null);

  // Generador de datos crudos sintéticos con duplicados y errores para demostrar el script Python
  const generarDatosCrudosPrueba = () => {
    const rawP1: RegistroFormularioRaw[] = [
      {
        'Año del reporte de autogestión': '2024 (opcional)',
        'Razón Social Estándar': 'EXPRESO BOLIVARIANO',
        'Tipo de documento': 'NIT',
        'Número de documento': '860002145-1',
        'Correo Electrónico Estándar': 'seguridadvial@bolivariano.com.co; info@bolivariano.com',
        'Total_Vehiculos_Norma': 285,
        'Total_Conductores_Norma': 320,
      },
      // Duplicado en P1 de la misma empresa con diferente nombre y vacíos
      {
        'Año del reporte de autogestión': '2024',
        'Razón Social Estándar': 'EXPRESO BOLIVARIANO S.A.S.',
        'Tipo de documento': 'NIT',
        'Número de documento': '860002145-1',
        'Correo Electrónico Estándar': 'seguridadvial@bolivariano.com.co',
        'Total_Vehiculos_Norma': 285,
        'Total_Conductores_Norma': 320,
      },
      {
        'Año del reporte de autogestión': '2024 (opcional)',
        'Razón Social Estándar': 'DISTRIBUCIONES VALLE',
        'Tipo de documento': 'C.C.',
        'Número de documento': '900456123-4',
        'Correo Electrónico Estándar': 'hseq@logivalledelvalle.com',
        'Total_Vehiculos_Norma': 62,
        'Total_Conductores_Norma': 65,
      },
      {
        'Año del reporte de autogestión': '2024',
        'Razón Social Estándar': '8001894563', // Puso el NIT en el nombre (debe ser castigado por el algoritmo -500)
        'Tipo de documento': 'NIT',
        'Número de documento': '800189456-3',
        'Correo Electrónico Estándar': 'pesv@transportesvigia.com.co',
        'Total_Vehiculos_Norma': 18,
        'Total_Conductores_Norma': 17,
      },
      {
        'Año del reporte de autogestión': '2024',
        'Razón Social Estándar': 'TRANSPORTES VIGIA LTDA.',
        'Tipo de documento': 'NIT',
        'Número de documento': '800189456-3',
        'Correo Electrónico Estándar': 'pesv@transportesvigia.com.co',
        'Total_Vehiculos_Norma': 18,
        'Total_Conductores_Norma': 17,
      },
    ];

    const rawP2: RegistroFormularioRaw[] = [
      {
        'Año del reporte de autogestión': '2024',
        'Razón Social Estándar': 'EXPRESO BOLIVARIANO S.A.S.',
        'Tipo de documento': 'NIT',
        'Número de documento': '860002145-1',
        'Correo Electrónico Estándar': 'seguridadvial@bolivariano.com.co',
        'kmRecorridosTrimestre': 3850000,
        'tsvTotal': 2.8,
      },
      {
        'Año del reporte de autogestión': '2024 (opcional)',
        'Razón Social Estándar': 'DISTRIBUCIONES Y LOGÍSTICA DEL VALLE S.A.S.',
        'Tipo de documento': 'NIT',
        'Número de documento': '900456123-4',
        'Correo Electrónico Estándar': 'hseq@logivalledelvalle.com',
        'kmRecorridosTrimestre': 620000,
        'tsvTotal': 3.2,
      },
    ];

    const rawP3: RegistroFormularioRaw[] = [
      {
        'Año del reporte de autogestión': '2024',
        'Razón Social Estándar': 'EXPRESO BOLIVARIANO S.A.S.',
        'Tipo de documento': 'NIT',
        'Número de documento': '860002145-1',
        'Correo Electrónico Estándar': 'seguridadvial@bolivariano.com.co',
        'idp': 94.7,
        'cpmvh': 94.7,
      },
    ];

    return { rawP1, rawP2, rawP3 };
  };

  const ejecutarConsolidacion = async (usarArchivos: boolean) => {
    setProcesando(true);
    setPasoActivo(1);
    setNotificacionCarga(null);

    try {
      let p1Data: RegistroFormularioRaw[] = [];
      let p2Data: RegistroFormularioRaw[] = [];
      let p3Data: RegistroFormularioRaw[] = [];

      if (usarArchivos && archivosCargados.p1 && archivosCargados.p2 && archivosCargados.p3) {
        p1Data = await leerArchivoExcel(archivosCargados.p1);
        p2Data = await leerArchivoExcel(archivosCargados.p2);
        p3Data = await leerArchivoExcel(archivosCargados.p3);
      } else {
        const demo = generarDatosCrudosPrueba();
        p1Data = demo.rawP1;
        p2Data = demo.rawP2;
        p3Data = demo.rawP3;
      }

      setPasoActivo(2); // Normalización de Nombres
      await new Promise(r => setTimeout(r, 400));

      setPasoActivo(3); // Duplicados
      await new Promise(r => setTimeout(r, 400));

      setPasoActivo(4); // Incertidumbre Delta_X
      await new Promise(r => setTimeout(r, 400));

      const res = ejecutarPipelineETL(p1Data, p2Data, p3Data);
      setResultadoETL(res);
      setPasoActivo(5); // Finalizado
    } catch (err) {
      console.error('Error al procesar ETL:', err);
    } finally {
      setProcesando(false);
    }
  };

  // Cargar 1 Excel consolidado directo
  const procesarExcelConsolidadoDirecto = async () => {
    if (!archivoUnico) return;
    setProcesando(true);
    setNotificacionCarga(null);

    try {
      const filas = await leerArchivoExcel(archivoUnico);
      const empresas = convertirExcelConsolidadoAEmpresas(filas);
      onActualizarEmpresas(empresas);
      setNotificacionCarga(
        `¡Éxito! Se cargaron ${empresas.length} empresas desde '${archivoUnico.name}' directamente al Dashboard Analítico.`
      );
    } catch (err: any) {
      console.error('Error al leer consolidado:', err);
      setNotificacionCarga(`Error al procesar el archivo: ${err.message}`);
    } finally {
      setProcesando(false);
    }
  };

  // Enviar el resultado del ETL de las 3 partes directamente al dashboard
  const aplicarResultadoAlDashboard = () => {
    if (!resultadoETL) return;
    const empresasLimpias = convertirExcelConsolidadoAEmpresas(resultadoETL.registrosCompletos);
    onActualizarEmpresas(empresasLimpias);
  };

  const descargarExcelResultado = (tipo: 'A' | 'INCOMPLETO') => {
    if (!resultadoETL) return;
    const datos = tipo === 'A' ? resultadoETL.registrosCompletos : resultadoETL.registrosIncompletos;
    const nombre = tipo === 'A'
      ? 'Base_Datos_PESV_Consolidada_Final_Formulario_Completo.xlsx'
      : 'Base_Datos_PESV_Consolidada_Final_Formulario_Incompleto.xlsx';

    const ws = XLSX.utils.json_to_sheet(datos);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, tipo === 'A' ? 'Completos (Cat A)' : 'Incompletos');
    XLSX.writeFile(wb, nombre);
  };

  return (
    <div className="space-y-6">
      {/* 1. Recordatorio Crítico de Duplicados (Solicitado explícitamente en el prompt) */}
      <div className="bg-amber-50 border-2 border-amber-300 rounded-2xl p-5 shadow-xs">
        <div className="flex items-start gap-3.5">
          <div className="p-2.5 bg-amber-100 rounded-xl text-amber-800 shrink-0 mt-0.5">
            <AlertCircle className="w-6 h-6 text-amber-700" />
          </div>
          <div className="space-y-1">
            <h2 className="text-sm font-bold text-amber-950 uppercase tracking-wide">
              ¿Dónde pasar los datos? Recordatorio de Limpieza y Triangulación Previa
            </h2>
            <p className="text-xs text-amber-900 leading-relaxed">
              Puedes cargar tus datos de dos formas según lo que tengas disponible:
              <br />
              <strong>Opción 1:</strong> Si tienes los <strong>3 archivos resultantes del formulario</strong> (Parte 1, Parte 2 y Parte 3), súbelos en la pestaña <em>"Limpieza y Cruce de 3 Partes (ETL)"</em> para estabilizar el año, limpiar duplicados con la función de puntaje formal (<span className="font-mono font-bold">evaluar_nombre_puntaje</span>), calcular la incertidumbre fija, hacer el cruce outer merge y generar el excel con los datos únicos a analizar. Se sugiere que estos datos pasaen por un proceso de limpiaza (de datos de prueba) previa individual por cada parte.
              <br />
              <strong>Opción 2:</strong> Si ya tienes el <strong>Excel Consolidado Completo</strong> (p. ej. <span className="font-mono">Base_Datos_PESV_Consolidada_Final.xlsx</span>), cárgalo en la pestaña <em>"Carga Directa de 1 Excel Consolidado"</em> para analizar de inmediato los indicadores, las infracciones y las alertas técnicas de la ANSV.
            </p>
          </div>
        </div>
      </div>

      {/* 2. Selector de Pestañas: 3 Partes ETL vs 1 Consolidado */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setTabModo('TRES_PARTES')}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
            tabModo === 'TRES_PARTES'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Opción 1: Limpieza y Cruce de 3 Partes (Pipeline ETL Python)</span>
        </button>

        <button
          onClick={() => setTabModo('EXCEL_UNICO')}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
            tabModo === 'EXCEL_UNICO'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <FileSpreadsheet className="w-4 h-4" />
          <span>Opción 2: Carga Directa de 1 Excel Consolidado Completo</span>
        </button>
      </div>

      {notificacionCarga && (
        <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-xl text-emerald-900 text-xs font-medium flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{notificacionCarga}</span>
        </div>
      )}

      {/* CONTENIDO SEGÚN MODO */}
      {tabModo === 'TRES_PARTES' ? (
        <div className="space-y-6">
          {/* Zona de Carga de las 3 Partes */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <RefreshCw className="w-4 h-4 text-blue-600" />
                  Paso 1: Carga los 3 archivos de formulario descargados
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Archivos esperados: Parte 1 (Identificación y flota), Parte 2 (Diagnóstico y rutas) y Parte 3 (Indicadores)
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => ejecutarConsolidacion(false)}
                  disabled={procesando}
                  className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
                  title="Ejecutar con el lote de prueba incluido"
                >
                  <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                  <span>Probar con Datos Sintéticos de Demostración</span>
                </button>
              </div>
            </div>

            {/* Inputs de Archivos */}
            <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100/60 transition-colors">
                <span className="text-xs font-bold text-slate-800 block mb-1">
                  1. Parte1_consolidado.xlsx
                </span>
                <span className="text-[11px] text-slate-500 block mb-2">
                  Identificación, NIT, Razón Social y Flota
                </span>
                <input
                  type="file"
                  accept=".xlsx,.xls,.csv"
                  onChange={e =>
                    setArchivosCargados({ ...archivosCargados, p1: e.target.files?.[0] || null })
                  }
                  className="text-xs text-slate-600 file:mr-2 file:py-1 file:px-2.5 file:rounded-md file:border-0 file:text-[11px] file:bg-blue-600 file:text-white hover:file:bg-blue-700 cursor-pointer w-full"
                />
                {archivosCargados.p1 && (
                  <span className="text-[11px] font-mono text-emerald-700 mt-1 block font-bold">
                    ✓ {archivosCargados.p1.name}
                  </span>
                )}
              </div>

              <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100/60 transition-colors">
                <span className="text-xs font-bold text-slate-800 block mb-1">
                  2. Parte2_consolidado.xlsx
                </span>
                <span className="text-[11px] text-slate-500 block mb-2">
                  Conductores, Rutas y Diagnóstico
                </span>
                <input
                  type="file"
                  accept=".xlsx,.xls,.csv"
                  onChange={e =>
                    setArchivosCargados({ ...archivosCargados, p2: e.target.files?.[0] || null })
                  }
                  className="text-xs text-slate-600 file:mr-2 file:py-1 file:px-2.5 file:rounded-md file:border-0 file:text-[11px] file:bg-blue-600 file:text-white hover:file:bg-blue-700 cursor-pointer w-full"
                />
                {archivosCargados.p2 && (
                  <span className="text-[11px] font-mono text-emerald-700 mt-1 block font-bold">
                    ✓ {archivosCargados.p2.name}
                  </span>
                )}
              </div>

              <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100/60 transition-colors">
                <span className="text-xs font-bold text-slate-800 block mb-1">
                  3. Parte3_consolidado.xlsx
                </span>
                <span className="text-[11px] text-slate-500 block mb-2">
                  Indicadores de Gestión y Sanciones
                </span>
                <input
                  type="file"
                  accept=".xlsx,.xls,.csv"
                  onChange={e =>
                    setArchivosCargados({ ...archivosCargados, p3: e.target.files?.[0] || null })
                  }
                  className="text-xs text-slate-600 file:mr-2 file:py-1 file:px-2.5 file:rounded-md file:border-0 file:text-[11px] file:bg-blue-600 file:text-white hover:file:bg-blue-700 cursor-pointer w-full"
                />
                {archivosCargados.p3 && (
                  <span className="text-[11px] font-mono text-emerald-700 mt-1 block font-bold">
                    ✓ {archivosCargados.p3.name}
                  </span>
                )}
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
              <span className="text-xs text-slate-500">
                {archivosCargados.p1 && archivosCargados.p2 && archivosCargados.p3
                  ? 'Los 3 archivos están cargados y listos para procesar.'
                  : 'Sube los 3 archivos para habilitar la consolidación completa.'}
              </span>

              <button
                onClick={() => ejecutarConsolidacion(true)}
                disabled={!archivosCargados.p1 || !archivosCargados.p2 || !archivosCargados.p3 || procesando}
                className="flex items-center gap-1.5 px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg transition-colors cursor-pointer shadow-sm disabled:opacity-40"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${procesando ? 'animate-spin' : ''}`} />
                <span>{procesando ? 'Ejecutando Pipeline...' : 'Procesar y Limpiar Archivos'}</span>
              </button>
            </div>
          </div>

          {/* Stepper de Visualización de Etapas */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
            <h4 className="text-xs font-bold text-slate-700 mb-3 uppercase tracking-wider">
              Flujo de Transformación Algorítmica (Python Script Pipeline)
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 text-xs">
              <div
                className={`p-3 rounded-lg border transition-colors ${
                  pasoActivo >= 1
                    ? 'bg-blue-50 border-blue-200 text-blue-900 font-semibold'
                    : 'bg-slate-50 border-slate-200 text-slate-500'
                }`}
              >
                <div className="font-mono text-[10px] opacity-70">Paso 1</div>
                <div>Estabilizar Año</div>
                <div className="text-[10px] font-normal text-slate-500 mt-1">
                  Quitar ' (opcional)', trim y cast int.
                </div>
              </div>

              <div
                className={`p-3 rounded-lg border transition-colors ${
                  pasoActivo >= 2
                    ? 'bg-blue-50 border-blue-200 text-blue-900 font-semibold'
                    : 'bg-slate-50 border-slate-200 text-slate-500'
                }`}
              >
                <div className="font-mono text-[10px] opacity-70">Paso 2</div>
                <div>Votación y Nombres</div>
                <div className="text-[10px] font-normal text-slate-500 mt-1">
                  Scoring (+100 SAS, -500 NIT digits).
                </div>
              </div>

              <div
                className={`p-3 rounded-lg border transition-colors ${
                  pasoActivo >= 3
                    ? 'bg-blue-50 border-blue-200 text-blue-900 font-semibold'
                    : 'bg-slate-50 border-slate-200 text-slate-500'
                }`}
              >
                <div className="font-mono text-[10px] opacity-70">Paso 3</div>
                <div>Revisión Duplicados</div>
                <div className="text-[10px] font-normal text-slate-500 mt-1">
                  Conteo de vacíos y sugerencia de acción.
                </div>
              </div>

              <div
                className={`p-3 rounded-lg border transition-colors ${
                  pasoActivo >= 4
                    ? 'bg-blue-50 border-blue-200 text-blue-900 font-semibold'
                    : 'bg-slate-50 border-slate-200 text-slate-500'
                }`}
              >
                <div className="font-mono text-[10px] opacity-70">Paso 4</div>
                <div>Incertidumbre Delta_X</div>
                <div className="text-[10px] font-normal text-slate-500 mt-1">
                  Colapso 1:1 y suma_global_max / T.
                </div>
              </div>

              <div
                className={`p-3 rounded-lg border transition-colors ${
                  pasoActivo >= 5
                    ? 'bg-emerald-50 border-emerald-300 text-emerald-900 font-semibold'
                    : 'bg-slate-50 border-slate-200 text-slate-500'
                }`}
              >
                <div className="font-mono text-[10px] opacity-70">Paso 5</div>
                <div>Cruce Outer Merge</div>
                <div className="text-[10px] font-normal text-slate-500 mt-1">
                  Categorías A, B y C listas para exportar.
                </div>
              </div>
            </div>
          </div>

          {/* Resultados del Pipeline y Carga al Dashboard */}
          {resultadoETL && (
            <div className="space-y-5">
              {/* Métricas de Salida */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
                  <span className="text-slate-500 block text-[11px]">Empresas Únicas (T)</span>
                  <span className="text-xl font-bold font-mono text-slate-900 tabular-nums">
                    {resultadoETL.empresasUnicas}
                  </span>
                </div>
                <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
                  <span className="text-slate-500 block text-[11px]">Categoría A (Completo 3/3)</span>
                  <span className="text-xl font-bold font-mono text-emerald-700 tabular-nums">
                    {resultadoETL.categoriasConteo.A}
                  </span>
                </div>
                <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
                  <span className="text-slate-500 block text-[11px]">Categorías B y C (Incompletas)</span>
                  <span className="text-xl font-bold font-mono text-amber-700 tabular-nums">
                    {resultadoETL.categoriasConteo.B + resultadoETL.categoriasConteo.C}
                  </span>
                </div>
                <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
                  <span className="text-slate-500 block text-[11px]">Duplicados Tratados</span>
                  <span className="text-xl font-bold font-mono text-blue-700 tabular-nums">
                    {resultadoETL.duplicadosDetectados}
                  </span>
                </div>
              </div>

              {/* Botón Principal: Cargar al Dashboard Analítico */}
              <div className="bg-gradient-to-r from-blue-900 to-indigo-900 text-white rounded-xl p-5 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                  <h4 className="text-sm font-bold text-white flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    Consolidación Completada con Éxito
                  </h4>
                  <p className="text-xs text-blue-200 mt-0.5">
                    ¿Deseas enviar estos datos limpios y calculados directamente al Dashboard de Indicadores y Asistencia Técnica?
                  </p>
                </div>

                <button
                  onClick={aplicarResultadoAlDashboard}
                  className="flex items-center gap-2 px-5 py-2.5 text-xs font-bold text-slate-900 bg-white hover:bg-blue-50 rounded-lg transition-colors cursor-pointer shadow-md whitespace-nowrap"
                >
                  <span>Cargar al Dashboard Analítico</span>
                  <ArrowRight className="w-4 h-4 text-blue-600" />
                </button>
              </div>

              {/* Botones de Descarga Excel solicitados por el usuario */}
              <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                  <h4 className="text-sm font-bold text-slate-900">
                    Archivos Consolidados Generados por el Pipeline
                  </h4>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Archivos generados tal como en tu código Python: formulario completo vs incompleto
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => descargarExcelResultado('A')}
                    className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg transition-colors cursor-pointer shadow-xs whitespace-nowrap"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Base_Final_Completo (Cat A).xlsx</span>
                  </button>
                  <button
                    onClick={() => descargarExcelResultado('INCOMPLETO')}
                    className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-amber-900 bg-amber-100 hover:bg-amber-200 border border-amber-300 rounded-lg transition-colors cursor-pointer whitespace-nowrap"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Base_Final_Incompleto.xlsx</span>
                  </button>
                </div>
              </div>

              {/* Muestra de la Clasificación Inteligente de Duplicados */}
              {resultadoETL.resumenDuplicados.length > 0 && (
                <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
                  <h4 className="text-xs font-bold text-slate-800 mb-3">
                    Muestra de Clasificación Inteligente de Duplicados
                  </h4>
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs text-left">
                      <thead>
                        <tr className="border-b border-slate-200 bg-slate-50 text-slate-600 font-semibold">
                          <th className="py-2 px-3">NIT</th>
                          <th className="py-2 px-3">Razón Social Triangulada</th>
                          <th className="py-2 px-3 text-center">Campos Vacíos</th>
                          <th className="py-2 px-3 font-mono">Sugerencia de Acción</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 font-mono">
                        {resultadoETL.resumenDuplicados.map((dup, idx) => (
                          <tr key={idx} className="hover:bg-slate-50">
                            <td className="py-2 px-3">{dup.registro['Número de documento']}</td>
                            <td className="py-2 px-3 font-sans font-semibold text-slate-900">
                              {dup.registro['Razón Social Estándar']}
                            </td>
                            <td className="py-2 px-3 text-center">{dup.totalVacios} vacíos</td>
                            <td className="py-2 px-3">
                              <span
                                className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                                  dup.sugerenciaAccion.includes('Conservar')
                                    ? 'bg-emerald-100 text-emerald-800'
                                    : 'bg-red-100 text-red-800'
                                }`}
                              >
                                {dup.sugerenciaAccion}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      ) : (
        /* MODO 2: CARGA DIRECTA DE 1 EXCEL CONSOLIDADO */
        <div className="bg-white border border-slate-200 rounded-xl p-8 shadow-xs text-center space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto border border-blue-100">
            <FileSpreadsheet className="w-7 h-7" />
          </div>

          <div>
            <h3 className="text-base font-bold text-slate-900">
              Carga Directa de Base de Datos PESV Consolidada
            </h3>
            <p className="text-xs text-slate-500 mt-1 max-w-lg mx-auto leading-relaxed">
              Si ya tienes tu archivo <span className="font-mono font-semibold text-slate-700">Base_Datos_PESV_Consolidada_Final.xlsx</span> (o cualquier tabla con los datos del censo ministerial), súbelo aquí. El sistema leerá automáticamente las empresas, calculará las tasas e incertidumbres y auditará las alertas.
            </p>
          </div>

          <div className="max-w-md mx-auto p-4 border-2 border-dashed border-slate-200 rounded-xl bg-slate-50/50 space-y-3">
            <input
              type="file"
              accept=".xlsx,.xls,.csv"
              onChange={e => setArchivoUnico(e.target.files?.[0] || null)}
              className="text-xs text-slate-600 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700 cursor-pointer mx-auto block"
            />

            {archivoUnico && (
              <div className="text-xs font-mono font-bold text-blue-700 pt-1">
                ✓ {archivoUnico.name} ({(archivoUnico.size / 1024).toFixed(1)} KB)
              </div>
            )}
          </div>

          <div>
            <button
              onClick={procesarExcelConsolidadoDirecto}
              disabled={!archivoUnico || procesando}
              className="px-6 py-2.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 rounded-lg transition-colors cursor-pointer shadow-sm disabled:opacity-40"
            >
              {procesando ? 'Procesando y Auditando...' : 'Cargar y Visualizar en el Dashboard'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
