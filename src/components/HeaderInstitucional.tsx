import React from 'react';
import { AppConfig, Grupo } from '../types';
import { PWAInstallButton } from './PWAInstallButton';
import { 
  Building2, 
  GraduationCap, 
  Calendar, 
  Users, 
  FolderPlus, 
  Save, 
  FileDown, 
  FileUp, 
  Printer, 
  CheckCircle2, 
  BookOpen, 
  Layers,
  PanelLeftClose,
  PanelLeft,
  Menu
} from 'lucide-react';

interface HeaderInstitucionalProps {
  config: AppConfig;
  onChangeConfig: (newConfig: AppConfig) => void;
  grupos: Grupo[];
  grupoActualIndex: number;
  onSelectGrupo: (index: number) => void;
  onOpenGestionGrupos: () => void;
  onOpenGestionEstudiantes: () => void;
  onOpenRespaldos: () => void;
  onExportarJSON: () => void;
  onImportarJSON: () => void;
  onImprimir: () => void;
  autoSaveMessage: string | null;
  onToggleSidebar?: () => void;
  isSidebarExpanded?: boolean;
}

export const HeaderInstitucional: React.FC<HeaderInstitucionalProps> = ({
  config,
  onChangeConfig,
  grupos,
  grupoActualIndex,
  onSelectGrupo,
  onOpenGestionGrupos,
  onOpenGestionEstudiantes,
  onOpenRespaldos,
  onExportarJSON,
  onImportarJSON,
  onImprimir,
  autoSaveMessage,
  onToggleSidebar,
  isSidebarExpanded
}) => {
  const currentGrupo = grupos[grupoActualIndex];

  return (
    <header className="mb-6">
      {/* Top Banner Institucional */}
      <div className="bg-[#0a1628] text-white rounded-xl shadow-lg border-b-4 border-[#c9a84c] p-4 md:p-6 mb-4 relative overflow-hidden">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 relative z-10">
          <div className="flex items-center gap-3.5 text-center md:text-left w-full md:w-auto">
            {onToggleSidebar && (
              <button
                onClick={onToggleSidebar}
                className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-[#c9a84c] border border-white/10 flex items-center justify-center transition-all shrink-0 no-print hover:scale-105 active:scale-95 shadow-sm"
                title={isSidebarExpanded ? 'Colapsar menú lateral' : 'Expandir menú lateral'}
              >
                <span className="hidden md:inline">
                  {isSidebarExpanded ? <PanelLeftClose className="w-5 h-5" /> : <PanelLeft className="w-5 h-5" />}
                </span>
                <span className="md:hidden">
                  <Menu className="w-5 h-5" />
                </span>
              </button>
            )}
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#c9a84c] to-[#a8893a] flex items-center justify-center text-2xl font-bold shadow-md shrink-0 text-[#0a1628] border-2 border-white/20">
              🇵🇦
            </div>
            <div>
              <div className="flex items-center gap-2 justify-center md:justify-start">
                <span className="text-xs uppercase tracking-widest text-[#c9a84c] font-semibold">
                  REPÚBLICA DE PANAMÁ · MEDUCA
                </span>
                <span className="text-[10px] bg-white/10 px-2 py-0.5 rounded text-white/80 font-mono">
                  AÑO {config.anio}
                </span>
              </div>
              <h1 className="text-xl md:text-2xl font-extrabold text-white tracking-tight">
                SISTEMA INTEGRAL DE REGISTRO Y SECUENCIAS · <span className="text-[#c9a84c]">TECNOLOGÍA</span>
              </h1>
              <p className="text-xs text-slate-300">
                Dirección Regional de Educación · Control de Calificaciones, Asistencia y Planificación Curricular
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap justify-center md:justify-end no-print">
            <PWAInstallButton />
            {autoSaveMessage && (
              <div className="flex items-center gap-1.5 bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 px-3 py-1.5 rounded-full text-xs font-medium animate-pulse">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>{autoSaveMessage}</span>
              </div>
            )}
            <button
              onClick={onOpenRespaldos}
              className="px-3 py-1.5 bg-[#1a2a4a] hover:bg-[#253966] text-[#e8d5a3] border border-[#c9a84c]/30 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm"
              title="Ver copias de seguridad y respaldar"
            >
              <Save className="w-3.5 h-3.5 text-[#c9a84c]" />
              <span>Respaldos</span>
            </button>
            <button
              onClick={onExportarJSON}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors border border-white/10"
              title="Descargar archivo JSON con todos los datos"
            >
              <FileDown className="w-3.5 h-3.5" />
              <span>Exportar</span>
            </button>
            <button
              onClick={onImportarJSON}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors border border-white/10"
              title="Cargar archivo JSON existente"
            >
              <FileUp className="w-3.5 h-3.5" />
              <span>Importar</span>
            </button>
            <button
              onClick={onImprimir}
              className="px-3.5 py-1.5 bg-gradient-to-r from-[#c9a84c] to-[#a8893a] hover:from-[#d5b65a] hover:to-[#b89844] text-[#0a1628] rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all shadow-md active:scale-95"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Imprimir</span>
            </button>
          </div>
        </div>
      </div>

      {/* Datos Institucionales Editables */}
      <div className="bg-white border border-[#d4c8b0] rounded-xl p-4 shadow-sm mb-4">
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-3">
          <div>
            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block mb-1 flex items-center gap-1">
              <Building2 className="w-3 h-3 text-[#c9a84c]" /> Centro Educativo
            </label>
            <input
              type="text"
              value={config.escuela}
              onChange={(e) => onChangeConfig({ ...config, escuela: e.target.value })}
              className="w-full text-xs font-semibold px-2.5 py-1.5 rounded-lg border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#c9a84c] text-slate-800"
              placeholder="Nombre del colegio"
            />
          </div>

          <div>
            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block mb-1 flex items-center gap-1">
              <GraduationCap className="w-3 h-3 text-[#c9a84c]" /> Docente
            </label>
            <input
              type="text"
              value={config.docente}
              onChange={(e) => onChangeConfig({ ...config, docente: e.target.value })}
              className="w-full text-xs font-semibold px-2.5 py-1.5 rounded-lg border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#c9a84c] text-slate-800"
              placeholder="Nombre del docente"
            />
          </div>

          <div>
            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block mb-1 flex items-center gap-1">
              <Calendar className="w-3 h-3 text-[#c9a84c]" /> Año Lectivo
            </label>
            <input
              type="text"
              value={config.anio}
              onChange={(e) => onChangeConfig({ ...config, anio: e.target.value })}
              className="w-full text-xs font-semibold px-2.5 py-1.5 rounded-lg border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#c9a84c] text-slate-800 font-mono"
            />
          </div>

          <div>
            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block mb-1 flex items-center gap-1">
              <BookOpen className="w-3 h-3 text-[#c9a84c]" /> Asignatura
            </label>
            <input
              type="text"
              value={config.asignatura}
              onChange={(e) => onChangeConfig({ ...config, asignatura: e.target.value })}
              className="w-full text-xs font-semibold px-2.5 py-1.5 rounded-lg border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#c9a84c] text-slate-800"
            />
          </div>

          <div className="flex items-end gap-2">
            <button
              onClick={onOpenGestionGrupos}
              className="flex-1 px-3 py-1.5 bg-[#0a1628] hover:bg-[#1a2a4a] text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors shadow-sm"
            >
              <Layers className="w-3.5 h-3.5 text-[#c9a84c]" />
              <span>Grupos ({grupos.length})</span>
            </button>
            <button
              onClick={onOpenGestionEstudiantes}
              disabled={!currentGrupo}
              className="flex-1 px-3 py-1.5 bg-[#c9a84c] hover:bg-[#a8893a] text-[#0a1628] rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-colors shadow-sm disabled:opacity-50"
            >
              <Users className="w-3.5 h-3.5" />
              <span>Alumnos ({currentGrupo?.estudiantes?.length || 0})</span>
            </button>
          </div>
        </div>
      </div>

      {/* Selector de Grupos Creados */}
      {grupos.length > 0 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-print">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider shrink-0 mr-1">
            Grupo Activo:
          </span>
          {grupos.map((grp, idx) => {
            const isActive = idx === grupoActualIndex;
            return (
              <button
                key={grp.id || idx}
                onClick={() => onSelectGrupo(idx)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
                  isActive
                    ? 'bg-[#c9a84c] text-[#0a1628] shadow-sm ring-2 ring-[#0a1628]/20'
                    : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                <span>{grp.nombre}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                  isActive ? 'bg-[#0a1628] text-white' : 'bg-slate-100 text-slate-600'
                }`}>
                  {grp.estudiantes.length}
                </span>
              </button>
            );
          })}
          <button
            onClick={onOpenGestionGrupos}
            className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg text-xs font-medium border border-dashed border-slate-300 shrink-0"
            title="Agregar o editar grupos"
          >
            <FolderPlus className="w-4 h-4" />
          </button>
        </div>
      )}
    </header>
  );
};
