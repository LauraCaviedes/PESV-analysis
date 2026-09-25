import React from 'react';
import {
  LayoutDashboard,
  Calculator,
  GitCompare,
  AlertOctagon,
  LifeBuoy,
  MapPin,
  RefreshCw,
  FileText,
  Flame,
  Target,
} from 'lucide-react';

export type TabId =
  | 'dashboard'
  | 'indicadores'
  | 'riesgo'
  | 'metas'
  | 'clasificacion'
  | 'infracciones'
  | 'asistencia'
  | 'geo'
  | 'etl'
  | 'reportes';

interface TabItem {
  id: TabId;
  label: string;
  icon: React.ElementType;
  badge?: number;
}

interface TabsNavigationProps {
  activeTab: TabId;
  onTabChange: (tab: TabId) => void;
  discrepanciasCount: number;
  alertasCount: number;
}

export const TabsNavigation: React.FC<TabsNavigationProps> = ({
  activeTab,
  onTabChange,
  discrepanciasCount,
  alertasCount,
}) => {
  const tabs: TabItem[] = [
    { id: 'dashboard', label: 'Dashboard General', icon: LayoutDashboard },
    { id: 'indicadores', label: 'Indicadores & Incertidumbre', icon: Calculator },
    { id: 'riesgo', label: 'Mapa de Calor Riesgos (Paso 6)', icon: Flame },
    { id: 'metas', label: 'Analítica de Metas (Paso 7)', icon: Target },
    {
      id: 'clasificacion',
      label: 'Verificación de Clasificación',
      icon: GitCompare,
      badge: discrepanciasCount,
    },
    { id: 'infracciones', label: 'Análisis de Infracciones', icon: AlertOctagon },
    {
      id: 'asistencia',
      label: 'Asistencia Técnica ANSV',
      icon: LifeBuoy,
      badge: alertasCount,
    },
    { id: 'geo', label: 'Distribución Territorial', icon: MapPin },
    { id: 'etl', label: 'Consolidador ETL Formularios', icon: RefreshCw },
    { id: 'reportes', label: 'Reportes PDF & Excel', icon: FileText },
  ];

  return (
    <nav className="w-full bg-white border-b border-slate-200 sticky top-16 z-20 overflow-x-auto scrollbar-none shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center gap-1 py-1.5 min-w-max">
        {tabs.map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex items-center gap-2 px-3 py-2 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
                isActive
                  ? 'bg-blue-50 text-blue-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-blue-600' : 'text-slate-400'}`} />
              <span>{tab.label}</span>
              {tab.badge !== undefined && tab.badge > 0 && (
                <span
                  className={`text-[10px] font-mono tabular-nums px-1.5 py-0.2 rounded-full font-bold ${
                    tab.id === 'asistencia'
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-red-100 text-red-800'
                  }`}
                >
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
