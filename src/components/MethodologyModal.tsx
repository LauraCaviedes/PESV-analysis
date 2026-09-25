import React from 'react';
import { X, BookOpen, Calculator, Layers, AlertTriangle, ShieldCheck, FileSpreadsheet, MapPin } from 'lucide-react';

interface MethodologyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MethodologyModal: React.FC<MethodologyModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200">
        {/* Header Modal */}
        <div className="sticky top-0 bg-slate-900 text-white px-6 py-4 rounded-t-2xl flex items-center justify-between z-10">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-blue-600 rounded-lg">
              <BookOpen className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                Guía Metodológica Oficial & Manual de Análisis PESV
              </h3>
              <p className="text-xs text-slate-400">
                Resolución Mintransporte · Ley 1503 de 2011 · Ley 2050 de 2020 · Modelo de Incertidumbre
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

        <div className="p-6 space-y-6 text-xs text-slate-800">
          {/* Sección 1: Dónde se hace cada análisis */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2 border-b border-slate-200 pb-1.5">
              <Layers className="w-4 h-4 text-blue-600" />
              1. En Dónde se Ejecuta Cada Análisis en la Plataforma
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                <span className="font-bold text-slate-900 block">Pestaña "Consolidador ETL Formularios"</span>
                <p className="text-slate-600 text-[11px] mt-1">
                  Aquí subes las Partes 1, 2 y 3 para limpiar duplicados, desempatar nombres por puntaje (+100 S.A.S.), calcular $Delta\_X$ y generar las bases completas e incompletas.
                </p>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                <span className="font-bold text-slate-900 block">Pestaña "Indicadores & Incertidumbre"</span>
                <p className="text-slate-600 text-[11px] mt-1">
                  Aquí se calculan los 13 indicadores de la Tabla 10 con su formulación matemática y su incertidumbre poblacional e individual (X̄ ± δx).
                </p>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                <span className="font-bold text-slate-900 block">Pestaña "Verificación de Clasificación"</span>
                <p className="text-slate-600 text-[11px] mt-1">
                  Aquí se audita si la empresa es Básica, Estándar o Avanzada por su flota y conductores, y si entregó los indicadores exigibles para su nivel.
                </p>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                <span className="font-bold text-slate-900 block">Pestaña "Asistencia Técnica ANSV"</span>
                <p className="text-slate-600 text-[11px] mt-1">
                  Aquí se identifican las alertas para que la ANSV realice acompañamiento técnico prioritario (en velocidad, fatiga, mantenimiento, formación o siniestros).
                </p>
              </div>
            </div>
          </div>

          {/* Sección 2: Cómo se hace cada análisis */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2 border-b border-slate-200 pb-1.5">
              <Calculator className="w-4 h-4 text-emerald-600" />
              2. Cómo se Hace Cada Análisis Matemático y Normativo
            </h4>

            <div className="space-y-3">
              <div className="p-3.5 bg-blue-50/60 border border-blue-200 rounded-xl">
                <span className="font-bold text-blue-950 block">A. Modelo de Incertidumbre en Duplicados y Población</span>
                <p className="text-blue-900 text-[11px] mt-1 leading-relaxed">
                  Si una empresa envió varias veces el formulario con los mismos datos, aporta el promedio y su incertidumbre es 0. Si hay dispersión, la incertidumbre global se calcula como:
                  <br />
                  <span className="font-mono font-bold">δx = (Σ Fj * max(fi)) / T</span>
                  <br />
                  Y el valor de cada variable queda expresado como:
                  <span className="font-mono font-bold ml-1">X̄ = (Σ Ui + Σ F̄j) / T ± δx</span>
                </p>
              </div>

              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
                <span className="font-bold text-slate-900 block">B. Clasificación de Empresa (Regla del Nivel Más Alto)</span>
                <p className="text-slate-700 text-[11px] mt-1 leading-relaxed">
                  Se evalúa el tamaño de la flota vehicular y el personal de conductores (excluyendo peatones). Se toma el nivel mayor entre vehículos y conductores:
                  <br />
                  · <strong>Misionalidad 1 (Transporte):</strong> Básico (11-19 veh / 2-19 cond), Estándar (20-50 veh / 20-50 cond), Avanzado (&gt;50 veh / &gt;50 cond).
                  <br />
                  · <strong>Misionalidad 2 (No Transporte):</strong> Básico (11-49 veh / 2-49 cond), Estándar (50-100 veh / 50-100 cond), Avanzado (&gt;100 veh / &gt;100 cond).
                </p>
              </div>

              <div className="p-3.5 bg-amber-50/60 border border-amber-200 rounded-xl">
                <span className="font-bold text-amber-950 block">C. Verificación de Entrega según Nivel</span>
                <p className="text-amber-900 text-[11px] mt-1 leading-relaxed">
                  · <strong>Básico (18 pasos):</strong> No requiere comité CSV, investigación de siniestros, costos de siniestralidad, ni control a bordo ELVL.
                  <br />
                  · <strong>Estándar (22 pasos):</strong> Requiere comité CSV, investigación, costos de siniestros y programa GVE.
                  <br />
                  · <strong>Avanzado (24 pasos):</strong> Requiere todos los pasos, incluyendo Paso 11 (Comportamiento seguro), Paso 21 (Pirámide de Hyden y nivel de pérdida) y monitoreo de velocidad ELVL.
                </p>
              </div>
            </div>
          </div>

          {/* Sección 3: Infracciones y Asistencia Técnica */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2 border-b border-slate-200 pb-1.5">
              <AlertTriangle className="w-4 h-4 text-red-600" />
              3. Infracciones de Tránsito y Alertas de Asistencia Técnica ANSV
            </h4>
            <p className="text-slate-600 text-[11px] leading-relaxed">
              La plataforma analiza comparendos de la Ley 769 de 2002 (C29 velocidad, C14 pico y placa, C38 técnico-mecánica, D04 SOAT, H04 sobrejornada laboral, E03 alcohol) y vincula cada hallazgo con el paso exacto de la metodología PESV para emitir la <strong>Orden de Asistencia Técnica Oficial de la ANSV</strong>.
            </p>
          </div>

          <div className="pt-4 border-t border-slate-200 flex justify-end">
            <button
              onClick={onClose}
              className="px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 rounded-lg transition-colors cursor-pointer"
            >
              Entendido, volver a la aplicación
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
