/**
 * Aplicación Principal PESV - Analítica, Indicadores e Incertidumbre ANSV
 * Cumplimiento de la Resolución Mintransporte / ANSV (Ley 1503 / Ley 2050)
 */

import React, { useState, useMemo } from 'react';
import { Header } from './components/Header';
import { TabsNavigation, TabId } from './components/TabsNavigation';
import { FilterBar, FiltrosState } from './components/FilterBar';
import { DashboardOverview } from './components/DashboardOverview';
import { IndicatorsView } from './components/IndicatorsView';
import { ClassificationAuditView } from './components/ClassificationAuditView';
import { InfractionsAnalysisView } from './components/InfractionsAnalysisView';
import { TechnicalAssistanceView } from './components/TechnicalAssistanceView';
import { RiskHeatmapView } from './components/RiskHeatmapView';
import { GoalsTextAnalyticsView } from './components/GoalsTextAnalyticsView';
import { GeoDistributionView } from './components/GeoDistributionView';
import { EtlConsolidatorView } from './components/EtlConsolidatorView';
import { ReportsView } from './components/ReportsView';
import { CompanyDetailModal } from './components/CompanyDetailModal';
import { DataImportModal } from './components/DataImportModal';
import { MethodologyModal } from './components/MethodologyModal';
import { EMPRESAS_DEMO_PESV } from './utils/sampleData';
import { EmpresaPESV } from './types/pesv';

export default function App() {
  const [empresas, setEmpresas] = useState<EmpresaPESV[]>(EMPRESAS_DEMO_PESV);
  const [activeTab, setActiveTab] = useState<TabId>('dashboard');
  const [empresaModal, setEmpresaModal] = useState<EmpresaPESV | null>(null);
  const [empresaFocoReporte, setEmpresaFocoReporte] = useState<EmpresaPESV | null>(null);
  const [modalImportarAbierto, setModalImportarAbierto] = useState<boolean>(false);
  const [modalGuiaAbierto, setModalGuiaAbierto] = useState<boolean>(false);

  const [filtros, setFiltros] = useState<FiltrosState>({
    busqueda: '',
    nivel: 'TODOS',
    misionalidad: 'TODAS',
    sector: 'TODOS',
    categoria: 'TODAS',
    ano: 'TODOS',
    soloDiscrepancias: false,
  });

  // Extraer valores únicos para dropdowns
  const sectoresDisponibles = useMemo(() => {
    return Array.from(new Set(empresas.map(e => e.sectorEconomico))).sort();
  }, [empresas]);

  const anosDisponibles = useMemo(() => {
    return Array.from(new Set(empresas.map(e => e.anoReporte))).sort((a, b) => b - a);
  }, [empresas]);

  // Conteos de registros por año de autogestión
  const conteosPorAno = useMemo(() => {
    const counts: Record<number, number> = {};
    empresas.forEach(e => {
      counts[e.anoReporte] = (counts[e.anoReporte] || 0) + 1;
    });
    return counts;
  }, [empresas]);

  // Filtrado reactivo de empresas
  const empresasFiltradas = useMemo(() => {
    return empresas.filter(emp => {
      // 1. Búsqueda por texto (NIT o Razón Social)
      if (filtros.busqueda.trim()) {
        const q = filtros.busqueda.toLowerCase().trim();
        const matchNom = emp.razonSocial.toLowerCase().includes(q);
        const matchNit = emp.numeroDocumento.includes(q);
        const matchMun = emp.municipio.toLowerCase().includes(q);
        if (!matchNom && !matchNit && !matchMun) return false;
      }

      // 2. Nivel PESV (Calculado o Reportado)
      if (filtros.nivel !== 'TODOS') {
        if (emp.clasificacionCalculada !== filtros.nivel && emp.clasificacionReportada !== filtros.nivel) {
          return false;
        }
      }

      // 3. Misionalidad
      if (filtros.misionalidad !== 'TODAS' && emp.misionalidad !== filtros.misionalidad) {
        return false;
      }

      // 4. Sector Económico
      if (filtros.sector !== 'TODOS' && emp.sectorEconomico !== filtros.sector) {
        return false;
      }

      // 5. Categoría de Formulario
      if (filtros.categoria !== 'TODAS' && emp.categoriaFormulario !== filtros.categoria) {
        return false;
      }

      // 6. Año
      if (filtros.ano !== 'TODOS' && emp.anoReporte.toString() !== filtros.ano) {
        return false;
      }

      // 7. Solo Discrepancias
      if (filtros.soloDiscrepancias && emp.esClasificacionCorrecta) {
        return false;
      }

      return true;
    });
  }, [empresas, filtros]);

  // Conteos para insignias de navegación
  const discrepanciasCount = useMemo(() => {
    return empresas.filter(e => !e.esClasificacionCorrecta).length;
  }, [empresas]);

  const alertasCriticasCount = useMemo(() => {
    return empresas.flatMap(e => e.alertas).filter(a => a.severidad === 'CRÍTICA').length;
  }, [empresas]);

  const totalAlertasCount = useMemo(() => {
    return empresas.flatMap(e => e.alertas).length;
  }, [empresas]);

  // Acciones de navegación cruzada
  const handleSeleccionarEmpresa = (empresa: EmpresaPESV) => {
    setEmpresaModal(empresa);
  };

  const handleIrAAsistencia = (empresa: EmpresaPESV) => {
    setEmpresaModal(null);
    setFiltros(prev => ({ ...prev, busqueda: empresa.numeroDocumento }));
    setActiveTab('asistencia');
  };

  const handleIrAReportes = (empresa: EmpresaPESV) => {
    setEmpresaModal(null);
    setEmpresaFocoReporte(empresa);
    setActiveTab('reportes');
  };

  const handleGenerarReporteGeneral = () => {
    setEmpresaFocoReporte(null);
    setActiveTab('reportes');
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans text-slate-900 selection:bg-blue-100 selection:text-blue-900">
      {/* Top Header */}
      <Header
        empresas={empresasFiltradas}
        onGenerarReporte={handleGenerarReporteGeneral}
        onAbrirCargaDatos={() => setModalImportarAbierto(true)}
        onAbrirGuia={() => setModalGuiaAbierto(true)}
        alertaCriticaCount={alertasCriticasCount}
        anosDisponibles={anosDisponibles}
        anoSeleccionado={filtros.ano}
        onSeleccionarAno={ano => setFiltros(prev => ({ ...prev, ano }))}
        conteosPorAno={conteosPorAno}
        totalBaseCount={empresas.length}
      />

      {/* Tabs Navigation */}
      <TabsNavigation
        activeTab={activeTab}
        onTabChange={tab => setActiveTab(tab)}
        discrepanciasCount={discrepanciasCount}
        alertasCount={totalAlertasCount}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Barra de Filtros (visible en las vistas analíticas) */}
        {['dashboard', 'indicadores', 'clasificacion', 'infracciones', 'geo'].includes(activeTab) && (
          <FilterBar
            filtros={filtros}
            onFiltrosChange={setFiltros}
            sectoresDisponibles={sectoresDisponibles}
            anosDisponibles={anosDisponibles}
            totalResultados={empresasFiltradas.length}
            conteosPorAno={conteosPorAno}
            totalBase={empresas.length}
          />
        )}

        {/* 1. Dashboard General */}
        {activeTab === 'dashboard' && (
          <DashboardOverview
            empresas={empresasFiltradas}
            onSeleccionarEmpresa={handleSeleccionarEmpresa}
            onIrATab={tab => setActiveTab(tab)}
          />
        )}

        {/* 2. Indicadores e Incertidumbre */}
        {activeTab === 'indicadores' && (
          <IndicatorsView
            empresas={empresasFiltradas}
            onSeleccionarEmpresa={handleSeleccionarEmpresa}
          />
        )}

        {/* 2.1 Mapa de Calor de Riesgos Viales (Paso 6 - Res. 40595) */}
        {activeTab === 'riesgo' && (
          <RiskHeatmapView
            empresas={empresasFiltradas}
            onSeleccionarEmpresa={handleSeleccionarEmpresa}
          />
        )}

        {/* 2.2 Clasificación Inteligente de Metas (Paso 7 - Text Analytics) */}
        {activeTab === 'metas' && (
          <GoalsTextAnalyticsView
            empresas={empresasFiltradas}
            onSeleccionarEmpresa={handleSeleccionarEmpresa}
          />
        )}

        {/* 3. Verificación de Clasificación y Entrega */}
        {activeTab === 'clasificacion' && (
          <ClassificationAuditView
            empresas={empresasFiltradas}
            onSeleccionarEmpresa={handleSeleccionarEmpresa}
            onGenerarAsistencia={handleIrAAsistencia}
          />
        )}

        {/* 4. Infracciones de Tránsito */}
        {activeTab === 'infracciones' && (
          <InfractionsAnalysisView
            empresas={empresasFiltradas}
            onSeleccionarEmpresa={handleSeleccionarEmpresa}
          />
        )}

        {/* 5. Alertas y Asistencia Técnica ANSV */}
        {activeTab === 'asistencia' && (
          <TechnicalAssistanceView
            empresas={empresasFiltradas}
            onSeleccionarEmpresa={handleSeleccionarEmpresa}
          />
        )}

        {/* 6. Distribución Territorial */}
        {activeTab === 'geo' && (
          <GeoDistributionView
            empresas={empresasFiltradas}
            onSeleccionarEmpresa={handleSeleccionarEmpresa}
          />
        )}

        {/* 7. Consolidador ETL Formularios */}
        {activeTab === 'etl' && (
          <EtlConsolidatorView
            onActualizarEmpresas={nuevas => {
              setEmpresas(nuevas);
              setActiveTab('dashboard');
            }}
          />
        )}

        {/* 8. Reportes PDF & Excel */}
        {activeTab === 'reportes' && (
          <ReportsView
            empresas={empresasFiltradas}
            empresaFoco={empresaFocoReporte}
          />
        )}
      </main>

      {/* Modal Ficha Completa de la Empresa */}
      <CompanyDetailModal
        empresa={empresaModal}
        todasLasEmpresas={empresas}
        onSeleccionarEmpresa={handleSeleccionarEmpresa}
        onClose={() => setEmpresaModal(null)}
        onIrAAsistencia={handleIrAAsistencia}
        onIrAReportes={handleIrAReportes}
      />

      {/* Modal Unificado de Carga de Datos (Excel Completo o 3 Partes) */}
      <DataImportModal
        isOpen={modalImportarAbierto}
        onClose={() => setModalImportarAbierto(false)}
        onCargarEmpresas={nuevas => {
          setEmpresas(nuevas);
          setActiveTab('dashboard');
        }}
        onIrAETL={() => {
          setModalImportarAbierto(false);
          setActiveTab('etl');
        }}
      />

      {/* Modal de Guía Metodológica y Documentación */}
      <MethodologyModal
        isOpen={modalGuiaAbierto}
        onClose={() => setModalGuiaAbierto(false)}
      />

      {/* Footer minimalista */}
      <footer className="w-full bg-white border-t border-slate-200 py-4 text-center text-xs text-slate-500 print:hidden">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>
            Agencia Nacional de Seguridad Vial (ANSV) · República de Colombia · Ley 1503 / Ley 2050
          </span>
          <span className="font-mono text-[11px] text-slate-400">
            Control de Incertidumbre δx · Metodología Oficial PESV
          </span>
        </div>
      </footer>
    </div>
  );
}
