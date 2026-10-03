import React from 'react';
import { Grupo, AppConfig } from '../types';
import { 
  FileSpreadsheet, 
  CalendarCheck, 
  Award, 
  BookMarked, 
  Sparkles, 
  Cloud, 
  UserCheck, 
  Users, 
  Layers, 
  Save, 
  FileDown, 
  Printer, 
  PanelLeftClose, 
  PanelLeft, 
  X,
  ChevronDown,
  GraduationCap
} from 'lucide-react';

export type TabPrincipalType = 'notas' | 'asistencia' | 'boletin' | 'secuencias' | 'seguimiento' | 'herramientas' | 'workspace';

interface SidebarProps {
  isExpanded: boolean;
  onToggleExpand: () => void;
  mobileOpen: boolean;
  onCloseMobile: () => void;
  activeTab: TabPrincipalType;
  onSelectTab: (tab: TabPrincipalType) => void;
  grupos: Grupo[];
  grupoActualIndex: number;
  onSelectGrupo: (index: number) => void;
  onOpenGestionGrupos: () => void;
  onOpenGestionEstudiantes: () => void;
  onOpenRespaldos: () => void;
  onExportarJSON: () => void;
  onImprimir: () => void;
  config: AppConfig;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isExpanded,
  onToggleExpand,
  mobileOpen,
  onCloseMobile,
  activeTab,
  onSelectTab,
  grupos,
  grupoActualIndex,
  onSelectGrupo,
  onOpenGestionGrupos,
  onOpenGestionEstudiantes,
  onOpenRespaldos,
  onExportarJSON,
  onImprimir,
  config
}) => {
  const currentGrupo = grupos[grupoActualIndex] || grupos[0];

  const navItems = [
    {
      id: 'notas' as TabPrincipalType,
      label: 'Calificaciones y Notas',
      shortLabel: 'Notas',
      icon: FileSpreadsheet,
      category: 'Evaluación y Registro',
      badge: `${currentGrupo?.estudiantes?.length || 0} est.`
    },
    {
      id: 'asistencia' as TabPrincipalType,
      label: 'Control de Asistencia',
      shortLabel: 'Asistencia',
      icon: CalendarCheck,
      category: 'Evaluación y Registro'
    },
    {
      id: 'boletin' as TabPrincipalType,
      label: 'Boletín Consolidado',
      shortLabel: 'Boletín',
      icon: Award,
      category: 'Evaluación y Registro'
    },
    {
      id: 'seguimiento' as TabPrincipalType,
      label: 'Seguimiento a Estudiantes',
      shortLabel: 'Seguimiento',
      icon: UserCheck,
      category: 'Evaluación y Registro',
      badge: 'Bitácora'
    },
    {
      id: 'herramientas' as TabPrincipalType,
      label: 'Herramientas de Aula',
      shortLabel: 'Aula',
      icon: Sparkles,
      category: 'Dinámica Escolar',
      badge: 'Interactivo'
    },
    {
      id: 'secuencias' as TabPrincipalType,
      label: 'Secuencias Didácticas',
      shortLabel: 'Secuencias',
      icon: BookMarked,
      category: 'Planificación Curricular',
      badge: 'MEDUCA'
    },
    {
      id: 'workspace' as TabPrincipalType,
      label: 'Google Workspace',
      shortLabel: 'Workspace',
      icon: Cloud,
      category: 'Planificación Curricular'
    }
  ];

  const handleNavClick = (tab: TabPrincipalType) => {
    onSelectTab(tab);
    onCloseMobile();
  };

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {mobileOpen && (
        <div 
          onClick={onCloseMobile}
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-xs md:hidden transition-opacity"
          aria-hidden="true"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 bg-[#0a1628] text-white flex flex-col border-r border-[#1a2d4b] transition-all duration-300 ease-in-out ${
          // Desktop sizing
          isExpanded ? 'md:w-64 lg:w-72' : 'md:w-20'
        } ${
          // Mobile responsive slide-over
          mobileOpen ? 'translate-x-0 w-72 shadow-2xl' : '-translate-x-full md:translate-x-0'
        }`}
      >
        {/* Brand / Top Header */}
        <div className={`h-16 border-b border-[#1a2d4b] shrink-0 flex items-center ${
          isExpanded || mobileOpen ? 'px-4 justify-between' : 'px-2 justify-center'
        }`}>
          {(isExpanded || mobileOpen) ? (
            <>
              <div className="flex items-center gap-3 overflow-hidden">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#c9a84c] to-[#96762f] text-[#0a1628] flex items-center justify-center font-black text-base shrink-0 shadow-md">
                  🇵🇦
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-[10px] uppercase font-bold tracking-widest text-[#c9a84c] truncate">
                    MEDUCA · PANAMÁ
                  </span>
                  <span className="text-xs font-extrabold text-white tracking-tight truncate">
                    SISTEMA DOCENTE
                  </span>
                </div>
              </div>

              {/* Desktop Collapse Toggle */}
              <button
                onClick={onToggleExpand}
                className="hidden md:flex p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
                title="Colapsar menú lateral"
              >
                <PanelLeftClose className="w-4 h-4 text-[#c9a84c]" />
              </button>
            </>
          ) : (
            <button
              onClick={onToggleExpand}
              className="w-10 h-10 rounded-xl bg-[#11223b] hover:bg-[#1a3359] border border-[#233a60] flex items-center justify-center transition-all group relative cursor-pointer"
              title="Expandir menú lateral"
            >
              <PanelLeft className="w-5 h-5 text-[#c9a84c] group-hover:scale-110 transition-transform" />
              {/* Tooltip */}
              <div className="absolute left-full ml-3 top-1/2 -translate-y-1/2 px-2.5 py-1 bg-slate-900 text-white text-xs font-bold rounded-lg shadow-xl whitespace-nowrap hidden group-hover:block z-50 pointer-events-none border border-slate-700">
                Expandir menú
              </div>
            </button>
          )}

          {/* Mobile Close Button */}
          {mobileOpen && (
            <button
              onClick={onCloseMobile}
              className="md:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10"
              title="Cerrar menú"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Group Selector Quick Bar */}
        {(isExpanded || mobileOpen) ? (
          <div className="p-3 border-b border-[#1a2d4b] bg-white/5">
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
              Grupo Activo:
            </label>
            <div className="relative">
              <select
                value={grupoActualIndex}
                onChange={(e) => onSelectGrupo(parseInt(e.target.value, 10))}
                className="w-full bg-[#11223b] text-white border border-[#233a60] text-xs font-bold rounded-lg px-2.5 py-2 pr-7 appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#c9a84c]"
              >
                {grupos.map((g, idx) => (
                  <option key={g.id} value={idx}>
                    {g.nombre} ({g.estudiantes?.length || 0} est.)
                  </option>
                ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>
        ) : (
          <div className="p-2 border-b border-[#1a2d4b] flex justify-center group relative">
            <div 
              className="w-10 h-10 rounded-lg bg-[#11223b] border border-[#233a60] flex items-center justify-center text-xs font-black text-[#c9a84c] cursor-pointer"
              title={`Grupo: ${currentGrupo?.nombre}`}
            >
              {currentGrupo?.grado || '5°'}
            </div>
            {/* Tooltip on hover */}
            <div className="absolute left-full ml-2 top-2 px-2.5 py-1 bg-slate-900 text-white text-xs font-bold rounded shadow-lg whitespace-nowrap hidden group-hover:block z-50 pointer-events-none border border-slate-700">
              {currentGrupo?.nombre}
            </div>
          </div>
        )}

        {/* Navigation Items List */}
        <div className="flex-1 overflow-y-auto py-3 px-2 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <div key={item.id} className="relative group">
                <button
                  onClick={() => handleNavClick(item.id)}
                  title={!isExpanded && !mobileOpen ? `${item.label}${item.badge ? ` (${item.badge})` : ''}` : undefined}
                  className={`w-full flex items-center rounded-xl transition-all ${
                    isExpanded || mobileOpen
                      ? 'px-3 py-2.5 gap-3 text-left'
                      : 'p-3 justify-center'
                  } ${
                    isActive
                      ? 'bg-gradient-to-r from-[#c9a84c] to-[#b3923c] text-[#0a1628] font-black shadow-md'
                      : 'text-slate-300 hover:text-white hover:bg-white/10 font-semibold'
                  }`}
                >
                  <Icon className={`w-5 h-5 shrink-0 ${isActive ? 'text-[#0a1628]' : 'text-[#c9a84c]'}`} />

                  {(isExpanded || mobileOpen) && (
                    <div className="flex-1 flex items-center justify-between min-w-0">
                      <span className="text-xs truncate">{item.label}</span>
                      {item.badge && (
                        <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider shrink-0 ml-1.5 ${
                          isActive 
                            ? 'bg-[#0a1628] text-[#c9a84c]' 
                            : 'bg-white/10 text-slate-300'
                        }`}>
                          {item.badge}
                        </span>
                      )}
                    </div>
                  )}
                </button>

                {/* Collapsed Tooltip Flyout */}
                {!isExpanded && !mobileOpen && (
                  <div className="absolute left-full ml-3 top-1/2 -translate-y-1/2 px-3 py-1.5 bg-slate-900 text-white text-xs font-bold rounded-lg shadow-xl whitespace-nowrap hidden group-hover:flex items-center gap-2 z-50 pointer-events-none border border-slate-700 animate-in fade-in duration-100">
                    <span>{item.label}</span>
                    {item.badge && (
                      <span className="text-[9px] px-1.5 py-0.2 bg-[#c9a84c] text-[#0a1628] rounded font-black">
                        {item.badge}
                      </span>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Quick Management & Actions Footer */}
        <div className="p-3 border-t border-[#1a2d4b] bg-[#07101f] shrink-0 space-y-2">
          {(isExpanded || mobileOpen) ? (
            <>
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 px-1 mb-1">
                Herramientas del Sistema:
              </div>
              <div className="grid grid-cols-2 gap-1.5">
                <button
                  onClick={() => { onOpenGestionGrupos(); onCloseMobile(); }}
                  className="px-2.5 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white text-[11px] font-bold flex items-center gap-1.5 transition-colors border border-white/5"
                  title="Gestionar grupos escolares"
                >
                  <Layers className="w-3.5 h-3.5 text-[#c9a84c]" />
                  <span className="truncate">Grupos</span>
                </button>

                <button
                  onClick={() => { onOpenGestionEstudiantes(); onCloseMobile(); }}
                  className="px-2.5 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white text-[11px] font-bold flex items-center gap-1.5 transition-colors border border-white/5"
                  title="Gestionar lista de estudiantes"
                >
                  <Users className="w-3.5 h-3.5 text-[#c9a84c]" />
                  <span className="truncate">Alumnos</span>
                </button>

                <button
                  onClick={() => { onOpenRespaldos(); onCloseMobile(); }}
                  className="px-2.5 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white text-[11px] font-bold flex items-center gap-1.5 transition-colors border border-white/5"
                  title="Copias de seguridad"
                >
                  <Save className="w-3.5 h-3.5 text-[#c9a84c]" />
                  <span className="truncate">Respaldos</span>
                </button>

                <button
                  onClick={() => { onExportarJSON(); onCloseMobile(); }}
                  className="px-2.5 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white text-[11px] font-bold flex items-center gap-1.5 transition-colors border border-white/5"
                  title="Exportar archivo JSON"
                >
                  <FileDown className="w-3.5 h-3.5 text-[#c9a84c]" />
                  <span className="truncate">Exportar</span>
                </button>
              </div>

              <div className="pt-2 border-t border-[#1a2d4b]/60 flex items-center justify-between text-[10px] text-slate-400">
                <span className="truncate">Docente: {config.docente}</span>
                <button
                  onClick={onImprimir}
                  className="p-1 hover:text-white transition-colors"
                  title="Imprimir planilla actual"
                >
                  <Printer className="w-3.5 h-3.5 text-slate-300 hover:text-[#c9a84c]" />
                </button>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <button
                onClick={onOpenRespaldos}
                className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition-colors group relative"
                title="Copias de seguridad y respaldos"
              >
                <Save className="w-4 h-4 text-[#c9a84c]" />
                <div className="absolute left-full ml-3 top-1/2 -translate-y-1/2 px-2.5 py-1 bg-slate-900 text-white text-xs font-bold rounded shadow-lg whitespace-nowrap hidden group-hover:block z-50 pointer-events-none border border-slate-700">
                  Respaldos
                </div>
              </button>

              <button
                onClick={onOpenGestionEstudiantes}
                className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition-colors group relative"
                title="Gestionar estudiantes"
              >
                <Users className="w-4 h-4 text-[#c9a84c]" />
                <div className="absolute left-full ml-3 top-1/2 -translate-y-1/2 px-2.5 py-1 bg-slate-900 text-white text-xs font-bold rounded shadow-lg whitespace-nowrap hidden group-hover:block z-50 pointer-events-none border border-slate-700">
                  Estudiantes
                </div>
              </button>

              <button
                onClick={onToggleExpand}
                className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition-colors group relative"
                title="Expandir menú lateral"
              >
                <PanelLeft className="w-4 h-4 text-[#c9a84c]" />
                <div className="absolute left-full ml-3 top-1/2 -translate-y-1/2 px-2.5 py-1 bg-slate-900 text-white text-xs font-bold rounded shadow-lg whitespace-nowrap hidden group-hover:block z-50 pointer-events-none border border-slate-700">
                  Expandir Menú
                </div>
              </button>
            </div>
          )}
        </div>
      </aside>
    </>
  );
};
