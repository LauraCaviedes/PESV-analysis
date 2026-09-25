import React, { useState } from 'react';
import {
  X,
  Upload,
  FileSpreadsheet,
  Layers,
  AlertCircle,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  Info,
} from 'lucide-react';
import { leerArchivoExcel, convertirExcelConsolidadoAEmpresas } from '../utils/excelImporter';
import { ejecutarPipelineETL, RegistroFormularioRaw } from '../utils/etlPipeline';
import { EmpresaPESV } from '../types/pesv';
import { EMPRESAS_DEMO_PESV } from '../utils/sampleData';

interface DataImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCargarEmpresas: (empresas: EmpresaPESV[]) => void;
  onIrAETL: () => void;
}

export const DataImportModal: React.FC<DataImportModalProps> = ({
  isOpen,
  onClose,
  onCargarEmpresas,
  onIrAETL,
}) => {
  if (!isOpen) return null;

  const [modo, setModo] = useState<'EXCEL_COMPLETO' | 'TRES_PARTES'>('EXCEL_COMPLETO');
  const [archivoConsolidado, setArchivoConsolidado] = useState<File | null>(null);
  const [cargando, setCargando] = useState<boolean>(false);
  const [mensajeExito, setMensajeExito] = useState<string | null>(null);
  const [mensajeError, setMensajeError] = useState<string | null>(null);

  // Estados para las tres partes
  const [p1File, setP1File] = useState<File | null>(null);
  const [p2File, setP2File] = useState<File | null>(null);
  const [p3File, setP3File] = useState<File | null>(null);

  // Procesar archivo consolidado único
  const procesarExcelUnico = async () => {
    if (!archivoConsolidado) {
      setMensajeError('Por favor selecciona un archivo Excel (.xlsx o .xls).');
      return;
    }
    setCargando(true);
    setMensajeError(null);
    setMensajeExito(null);

    try {
      const filas = await leerArchivoExcel(archivoConsolidado);
      if (!filas || filas.length === 0) {
        throw new Error('El archivo no contiene filas de datos legibles.');
      }
      const empresasParseadas = convertirExcelConsolidadoAEmpresas(filas);
      onCargarEmpresas(empresasParseadas);
      setMensajeExito(
        `¡Éxito! Se cargaron y auditaron ${empresasParseadas.length} empresas desde ${archivoConsolidado.name}.`
      );
      setTimeout(() => {
        onClose();
      }, 1200);
    } catch (err: any) {
      setMensajeError(err.message || 'Error al procesar el archivo Excel consolidado.');
    } finally {
      setCargando(false);
    }
  };

  // Procesar las 3 partes simultáneas con el pipeline ETL
  const procesarTresPartes = async () => {
    if (!p1File || !p2File || !p3File) {
      setMensajeError('Debes seleccionar los 3 archivos de formularios (Parte 1, Parte 2 y Parte 3).');
      return;
    }
    setCargando(true);
    setMensajeError(null);
    setMensajeExito(null);

    try {
      const p1 = await leerArchivoExcel(p1File);
      const p2 = await leerArchivoExcel(p2File);
      const p3 = await leerArchivoExcel(p3File);

      const resumen = ejecutarPipelineETL(p1, p2, p3);
      // Convertir registros maestros a EmpresaPESV
      const empresasLimpias = convertirExcelConsolidadoAEmpresas(resumen.registrosCompletos);
      onCargarEmpresas(empresasLimpias);
      setMensajeExito(
        `¡Pipeline ETL finalizado! Se limpiaron ${resumen.duplicadosDetectados} duplicados, triangulando nombres oficiales y calculando Delta_X para ${empresasLimpias.length} empresas únicas.`
      );
      setTimeout(() => {
        onClose();
      }, 1400);
    } catch (err: any) {
      setMensajeError(err.message || 'Error al ejecutar el pipeline ETL de las 3 partes.');
    } finally {
      setCargando(false);
    }
  };

  // Restablecer a datos de demostración
  const cargarDatosDemo = () => {
    onCargarEmpresas(EMPRESAS_DEMO_PESV);
    setMensajeExito(`Se restablecieron los datos con la muestra oficial predeterminada.`);
    setTimeout(() => {
      onClose();
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-3xl w-full shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header Modal */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-blue-600 rounded-lg">
              <Upload className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                Carga y Procesamiento de Datos PESV
              </h3>
              <p className="text-xs text-slate-400">
                Selecciona si deseas cargar el Excel consolidado completo o las 3 partes separadas para limpieza ETL
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Selector de Modo */}
        <div className="p-6 space-y-5 text-xs text-slate-800">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Modo 1 */}
            <button
              onClick={() => {
                setModo('EXCEL_COMPLETO');
                setMensajeError(null);
              }}
              className={`p-4 rounded-xl border text-left transition-all cursor-pointer ${
                modo === 'EXCEL_COMPLETO'
                  ? 'border-blue-600 bg-blue-50/60 ring-2 ring-blue-600/20'
                  : 'border-slate-200 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center gap-2">
                <FileSpreadsheet
                  className={`w-5 h-5 ${
                    modo === 'EXCEL_COMPLETO' ? 'text-blue-600' : 'text-slate-500'
                  }`}
                />
                <span className="font-bold text-slate-900 text-sm">
                  1. Excel Completo Consolidado
                </span>
              </div>
              <p className="text-slate-600 text-[11px] mt-1.5 leading-relaxed">
                Usa esta opción si ya tienes el archivo final (p. ej. <span className="font-mono font-semibold">Base_Datos_PESV_Consolidada.xlsx</span>) y deseas ir directo al análisis, indicadores e informe de asistencia técnica.
              </p>
            </button>

            {/* Modo 2 */}
            <button
              onClick={() => {
                setModo('TRES_PARTES');
                setMensajeError(null);
              }}
              className={`p-4 rounded-xl border text-left transition-all cursor-pointer ${
                modo === 'TRES_PARTES'
                  ? 'border-blue-600 bg-blue-50/60 ring-2 ring-blue-600/20'
                  : 'border-slate-200 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center gap-2">
                <Layers
                  className={`w-5 h-5 ${
                    modo === 'TRES_PARTES' ? 'text-blue-600' : 'text-slate-500'
                  }`}
                />
                <span className="font-bold text-slate-900 text-sm">
                  2. Tres Excel Separados (Partes 1, 2 y 3)
                </span>
              </div>
              <p className="text-slate-600 text-[11px] mt-1.5 leading-relaxed">
                Usa esta opción si tienes los archivos resultantes del formulario para ejecutar la limpieza de duplicados, votación de razones sociales, cálculo de delta de incertidumbre y cruce outer-merge.
              </p>
            </button>
          </div>

          {/* Recordatorio de duplicados siempre visible */}
          <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold">Recordatorio previo a la carga: </span>
              <span className="text-[11px] leading-relaxed">
                Verifica que las empresas hayan estabilizado el campo de año y revisado duplicados. El motor ejecutará el algoritmo de desempate de nombres formales (+100 S.A.S., -500 NIT) y calculará la incertidumbre fija para que no distorsione las métricas.
              </span>
            </div>
          </div>

          {/* MENSAJES DE ESTADO */}
          {mensajeExito && (
            <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-xl text-emerald-900 flex items-center gap-2 font-medium">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{mensajeExito}</span>
            </div>
          )}

          {mensajeError && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-900 flex items-center gap-2 font-medium">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
              <span>{mensajeError}</span>
            </div>
          )}

          {/* FORMULARIO SEGÚN MODO SELECCIONADO */}
          {modo === 'EXCEL_COMPLETO' ? (
            <div className="p-5 border-2 border-dashed border-slate-200 rounded-xl bg-slate-50/60 text-center space-y-3">
              <FileSpreadsheet className="w-10 h-10 text-blue-600 mx-auto" />
              <div>
                <span className="font-bold text-slate-900 text-sm block">
                  Selecciona o arrastra el archivo Excel Consolidado (.xlsx o .xls)
                </span>
                <span className="text-slate-500 text-[11px]">
                  Compatible con las columnas finales del censo PESV, indicadores e infracciones
                </span>
              </div>

              <input
                type="file"
                accept=".xlsx,.xls,.csv"
                onChange={e => {
                  setArchivoConsolidado(e.target.files?.[0] || null);
                  setMensajeError(null);
                }}
                className="block w-full max-w-sm mx-auto text-xs text-slate-600 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700 cursor-pointer"
              />

              {archivoConsolidado && (
                <div className="text-xs font-mono font-bold text-blue-700 pt-1">
                  Archivo listo: {archivoConsolidado.name} ({(archivoConsolidado.size / 1024).toFixed(1)} KB)
                </div>
              )}

              <div className="pt-2">
                <button
                  onClick={procesarExcelUnico}
                  disabled={!archivoConsolidado || cargando}
                  className="px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 rounded-lg transition-colors cursor-pointer shadow-sm disabled:opacity-50"
                >
                  {cargando ? 'Procesando y Auditando...' : 'Cargar y Actualizar Dashboard'}
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3 border border-slate-200 rounded-xl bg-slate-50">
                  <span className="font-bold text-slate-800 block text-xs mb-1">
                    Parte 1: Consolidado
                  </span>
                  <span className="text-[10px] text-slate-500 block mb-2">
                    Identificación, Razón Social, Flota
                  </span>
                  <input
                    type="file"
                    accept=".xlsx,.xls,.csv"
                    onChange={e => setP1File(e.target.files?.[0] || null)}
                    className="text-[11px] text-slate-600 file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:bg-blue-50 file:text-blue-700 cursor-pointer w-full"
                  />
                  {p1File && <span className="text-[10px] font-mono text-emerald-700 mt-1 block">✓ {p1File.name}</span>}
                </div>

                <div className="p-3 border border-slate-200 rounded-xl bg-slate-50">
                  <span className="font-bold text-slate-800 block text-xs mb-1">
                    Parte 2: Consolidado
                  </span>
                  <span className="text-[10px] text-slate-500 block mb-2">
                    Conductores, Rutas, Diagnóstico
                  </span>
                  <input
                    type="file"
                    accept=".xlsx,.xls,.csv"
                    onChange={e => setP2File(e.target.files?.[0] || null)}
                    className="text-[11px] text-slate-600 file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:bg-blue-50 file:text-blue-700 cursor-pointer w-full"
                  />
                  {p2File && <span className="text-[10px] font-mono text-emerald-700 mt-1 block">✓ {p2File.name}</span>}
                </div>

                <div className="p-3 border border-slate-200 rounded-xl bg-slate-50">
                  <span className="font-bold text-slate-800 block text-xs mb-1">
                    Parte 3: Consolidado
                  </span>
                  <span className="text-[10px] text-slate-500 block mb-2">
                    Indicadores de Gestión y Auditoría
                  </span>
                  <input
                    type="file"
                    accept=".xlsx,.xls,.csv"
                    onChange={e => setP3File(e.target.files?.[0] || null)}
                    className="text-[11px] text-slate-600 file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:bg-blue-50 file:text-blue-700 cursor-pointer w-full"
                  />
                  {p3File && <span className="text-[10px] font-mono text-emerald-700 mt-1 block">✓ {p3File.name}</span>}
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <button
                  onClick={() => {
                    onClose();
                    onIrAETL();
                  }}
                  className="text-xs text-blue-600 hover:text-blue-800 font-semibold cursor-pointer"
                >
                  Abrir Consolidador ETL Completo →
                </button>

                <button
                  onClick={procesarTresPartes}
                  disabled={!p1File || !p2File || !p3File || cargando}
                  className="px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg transition-colors cursor-pointer shadow-sm disabled:opacity-50"
                >
                  {cargando ? 'Ejecutando Limpieza y Cruce...' : 'Ejecutar Limpieza ETL y Cargar'}
                </button>
              </div>
            </div>
          )}

          {/* Opción de Restablecer a Datos Demo */}
          <div className="pt-3 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
            <span>¿Quieres probar la aplicación sin subir archivos aún?</span>
            <button
              onClick={cargarDatosDemo}
              className="text-slate-700 hover:text-slate-900 font-semibold cursor-pointer underline"
            >
              Cargar Base de Demostración Oficial
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
