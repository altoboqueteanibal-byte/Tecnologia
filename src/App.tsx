import React, { useState, useEffect, useRef } from 'react';
import { Grupo, AppConfig, SecuenciaDidactica, RespaldoItem, TipoAsistencia, Estudiante, TipoActividadEvaluacion, ActividadEvaluacion } from './types';
import { GRUPOS_INICIALES, CONFIG_INICIAL } from './data/gruposDefault';
import { SECUENCIAS_INICIALES } from './data/secuenciasDefault';
import { HeaderInstitucional } from './components/HeaderInstitucional';
import { RegistroNotas } from './components/RegistroNotas';
import { ControlAsistencia } from './components/ControlAsistencia';
import { BoletinOficial } from './components/BoletinOficial';
import { SecuenciasDidacticas } from './components/SecuenciasDidacticas';
import { ModalGestionarGrupos } from './components/ModalGestionarGrupos';
import { ModalGestionarEstudiantes } from './components/ModalGestionarEstudiantes';
import { ModalRespaldos } from './components/ModalRespaldos';
import { OfflineIndicator } from './components/OfflineIndicator';
import { GoogleWorkspacePanel } from './components/GoogleWorkspacePanel';
import { HerramientasAula } from './components/HerramientasAula';
import { SeguimientoEstudiantes } from './components/SeguimientoEstudiantes';
import { Sidebar, TabPrincipalType } from './components/Sidebar';
import { 
  FileSpreadsheet, 
  CalendarCheck, 
  Award, 
  BookMarked, 
  Sparkles, 
  Cloud, 
  UserCheck,
  PanelLeftClose,
  PanelLeft,
  Menu
} from 'lucide-react';

export default function App() {
  // --- Persistent State Initialization ---
  const [config, setConfig] = useState<AppConfig>(() => {
    try {
      const saved = localStorage.getItem('meduca_config');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return CONFIG_INICIAL;
  });

  const [grupos, setGrupos] = useState<Grupo[]>(() => {
    try {
      const cleanApplied = localStorage.getItem('meduca_clean_activities_v2');
      const saved = localStorage.getItem('meduca_grupos');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          if (!cleanApplied) {
            // Apply clean activities: strip preloaded activities and sample grades
            const cleaned = parsed.map((g: Grupo) => ({
              ...g,
              actividades: { 1: [], 2: [], 3: [] },
              notas: { 1: {}, 2: {}, 3: {} }
            }));
            localStorage.setItem('meduca_clean_activities_v2', 'true');
            localStorage.setItem('meduca_grupos', JSON.stringify(cleaned));
            return cleaned;
          }
          return parsed;
        }
      }
      localStorage.setItem('meduca_clean_activities_v2', 'true');
    } catch (e) {
      console.error(e);
    }
    return GRUPOS_INICIALES;
  });

  const [grupoActualIndex, setGrupoActualIndex] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('meduca_grupo_actual');
      if (saved) {
        const idx = parseInt(saved, 10);
        if (!isNaN(idx) && idx >= 0) return idx;
      }
    } catch (e) {}
    return 0;
  });

  const [secuencias, setSecuencias] = useState<SecuenciaDidactica[]>(() => {
    try {
      const saved = localStorage.getItem('meduca_secuencias');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.error(e);
    }
    return SECUENCIAS_INICIALES;
  });

  const [respaldos, setRespaldos] = useState<RespaldoItem[]>(() => {
    try {
      const saved = localStorage.getItem('meduca_respaldos');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return [];
  });

  // --- Sidebar & Navigation State ---
  const [sidebarExpanded, setSidebarExpanded] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('meduca_sidebar_expanded');
      if (saved !== null) return JSON.parse(saved);
    } catch (e) {}
    return true;
  });
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleToggleSidebar = () => {
    setSidebarExpanded((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('meduca_sidebar_expanded', JSON.stringify(next));
      } catch (e) {}
      return next;
    });
  };

  // --- UI Navigation State ---
  const [tabPrincipal, setTabPrincipal] = useState<TabPrincipalType>('notas');
  const [trimestreNotas, setTrimestreNotas] = useState<1 | 2 | 3>(1);
  const [trimestreAsistencia, setTrimestreAsistencia] = useState<1 | 2 | 3>(1);
  const [semanaActual, setSemanaActual] = useState<number>(0);

  // --- Modals State ---
  const [showModalGrupos, setShowModalGrupos] = useState(false);
  const [showModalEstudiantes, setShowModalEstudiantes] = useState(false);
  const [showModalRespaldos, setShowModalRespaldos] = useState(false);
  const [autoSaveMessage, setAutoSaveMessage] = useState<string | null>(null);

  // Auto-save debouncing
  const changesCountRef = useRef(0);
  const autoSaveTimerRef = useRef<any>(null);

  const triggerAutoSaveToast = (msg: string = 'Guardado') => {
    setAutoSaveMessage(msg);
    if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);
    autoSaveTimerRef.current = setTimeout(() => {
      setAutoSaveMessage(null);
    }, 1800);
  };

  // Synchronize state to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('meduca_config', JSON.stringify(config));
      localStorage.setItem('meduca_grupos', JSON.stringify(grupos));
      localStorage.setItem('meduca_grupo_actual', String(grupoActualIndex));
      localStorage.setItem('meduca_secuencias', JSON.stringify(secuencias));
      localStorage.setItem('meduca_respaldos', JSON.stringify(respaldos));

      changesCountRef.current++;
      // Auto-create snapshot every 20 significant changes
      if (changesCountRef.current >= 20) {
        crearRespaldoSnapshot(`Auto-${new Date().toLocaleDateString('es-PA')}`);
        changesCountRef.current = 0;
      }
    } catch (e) {
      console.error('Error saving to localStorage:', e);
    }
  }, [config, grupos, grupoActualIndex, secuencias, respaldos]);

  // Safe current group reference
  const safeGrupoIndex = grupoActualIndex < grupos.length ? grupoActualIndex : 0;
  const currentGrupo = grupos[safeGrupoIndex] || grupos[0];

  // --- Gradebook Handlers ---
  const handleUpdateNota = (estudianteIdx: number, actividadId: string, valor: number | null) => {
    setGrupos((prev) => {
      const next = [...prev];
      const targetGrupo = { ...next[safeGrupoIndex] };
      const targetNotas = { ...targetGrupo.notas };
      const currentTrimNotas = { ...(targetNotas[trimestreNotas] || {}) };

      const key = `${estudianteIdx}_${actividadId}`;
      if (valor === null || isNaN(valor)) {
        delete currentTrimNotas[key];
      } else {
        currentTrimNotas[key] = valor;
      }

      targetNotas[trimestreNotas] = currentTrimNotas;
      targetGrupo.notas = targetNotas;
      next[safeGrupoIndex] = targetGrupo;
      return next;
    });
    triggerAutoSaveToast('Nota actualizada');
  };

  const handleAgregarActividad = (nombre: string, tipo: TipoActividadEvaluacion, fecha?: string) => {
    setGrupos((prev) => {
      const next = [...prev];
      const targetGrupo = { ...next[safeGrupoIndex] };
      const targetActividades = { ...(targetGrupo.actividades || {}) };
      const currentList = [...(targetActividades[trimestreNotas] || [])];

      const nuevaAct: ActividadEvaluacion = {
        id: `act-${Date.now()}-${currentList.length + 1}`,
        nombre: nombre.trim(),
        tipo,
        fecha: fecha || new Date().toISOString().split('T')[0]
      };

      targetActividades[trimestreNotas] = [...currentList, nuevaAct];
      targetGrupo.actividades = targetActividades;
      next[safeGrupoIndex] = targetGrupo;
      return next;
    });
    triggerAutoSaveToast(`Columna "${nombre}" agregada`);
  };

  const handleEditarActividad = (actividadId: string, nuevoNombre: string, nuevoTipo: TipoActividadEvaluacion) => {
    setGrupos((prev) => {
      const next = [...prev];
      const targetGrupo = { ...next[safeGrupoIndex] };
      const targetActividades = { ...(targetGrupo.actividades || {}) };
      const currentList = [...(targetActividades[trimestreNotas] || [])];

      targetActividades[trimestreNotas] = currentList.map((a) =>
        a.id === actividadId ? { ...a, nombre: nuevoNombre, tipo: nuevoTipo } : a
      );
      targetGrupo.actividades = targetActividades;
      next[safeGrupoIndex] = targetGrupo;
      return next;
    });
    triggerAutoSaveToast('Actividad actualizada');
  };

  const handleEliminarActividad = (actividadId: string) => {
    setGrupos((prev) => {
      const next = [...prev];
      const targetGrupo = { ...next[safeGrupoIndex] };
      const targetActividades = { ...(targetGrupo.actividades || {}) };
      const currentList = targetActividades[trimestreNotas] || [];

      targetActividades[trimestreNotas] = currentList.filter((a) => a.id !== actividadId);
      targetGrupo.actividades = targetActividades;

      // Remove notes associated with this activity
      const targetNotas = { ...targetGrupo.notas };
      const currentNotas = { ...(targetNotas[trimestreNotas] || {}) };
      Object.keys(currentNotas).forEach((k) => {
        if (k.endsWith(`_${actividadId}`)) {
          delete currentNotas[k];
        }
      });
      targetNotas[trimestreNotas] = currentNotas;
      targetGrupo.notas = targetNotas;

      next[safeGrupoIndex] = targetGrupo;
      return next;
    });
    triggerAutoSaveToast('Columna eliminada');
  };

  const handleAsignarNotaMasiva = (actividadId: string, valor: number) => {
    setGrupos((prev) => {
      const next = [...prev];
      const targetGrupo = { ...next[safeGrupoIndex] };
      const targetNotas = { ...targetGrupo.notas };
      const currentNotas = { ...(targetNotas[trimestreNotas] || {}) };

      targetGrupo.estudiantes.forEach((_, idx) => {
        currentNotas[`${idx}_${actividadId}`] = valor;
      });

      targetNotas[trimestreNotas] = currentNotas;
      targetGrupo.notas = targetNotas;
      next[safeGrupoIndex] = targetGrupo;
      return next;
    });
    triggerAutoSaveToast(`Nota ${valor.toFixed(1)} asignada a todos`);
  };

  const handleVaciarActividades = () => {
    setGrupos((prev) => {
      const next = [...prev];
      const targetGrupo = { ...next[safeGrupoIndex] };
      const currentActividades = { ...(targetGrupo.actividades || {}) };
      currentActividades[trimestreNotas] = [];
      targetGrupo.actividades = currentActividades;

      // Clear notas for this trimester
      const currentNotas = { ...targetGrupo.notas };
      currentNotas[trimestreNotas] = {};
      targetGrupo.notas = currentNotas;

      next[safeGrupoIndex] = targetGrupo;
      return next;
    });
    triggerAutoSaveToast('Actividades vaciadas para este trimestre');
  };

  const handleUpdateEstudianteSeguimiento = (estudianteId: string, updated: Partial<Estudiante>) => {
    setGrupos((prev) => {
      const next = [...prev];
      const targetGrupo = { ...next[safeGrupoIndex] };
      targetGrupo.estudiantes = targetGrupo.estudiantes.map((e) =>
        e.id === estudianteId ? { ...e, ...updated } : e
      );
      next[safeGrupoIndex] = targetGrupo;
      return next;
    });
    triggerAutoSaveToast('Seguimiento guardado');
  };

  // --- Attendance Handlers ---
  const handleUpdateAsistencia = (estudianteIdx: number, dia: number, valor: TipoAsistencia) => {
    setGrupos((prev) => {
      const next = [...prev];
      const targetGrupo = { ...next[safeGrupoIndex] };
      const targetAsistencia = { ...targetGrupo.asistencia };

      const key = `${trimestreAsistencia}_semana_${semanaActual}_${estudianteIdx}_${dia}`;
      targetAsistencia[key] = valor;

      targetGrupo.asistencia = targetAsistencia;
      next[safeGrupoIndex] = targetGrupo;
      return next;
    });
    triggerAutoSaveToast('Asistencia guardada');
  };

  const handleMarcarTodosPresentes = () => {
    setGrupos((prev) => {
      const next = [...prev];
      const targetGrupo = { ...next[safeGrupoIndex] };
      const targetAsistencia = { ...targetGrupo.asistencia };

      targetGrupo.estudiantes.forEach((_, estIdx) => {
        for (let dia = 0; dia < 5; dia++) {
          const key = `${trimestreAsistencia}_semana_${semanaActual}_${estIdx}_${dia}`;
          targetAsistencia[key] = 'P';
        }
      });

      targetGrupo.asistencia = targetAsistencia;
      next[safeGrupoIndex] = targetGrupo;
      return next;
    });
    triggerAutoSaveToast('Semana marcada presente');
  };

  // --- Student Management Handlers ---
  const handleAddEstudiante = () => {
    setGrupos((prev) => {
      const next = [...prev];
      const targetGrupo = { ...next[safeGrupoIndex] };
      const newEst: Estudiante = {
        id: `est-${Date.now()}`,
        nombre: `Estudiante ${targetGrupo.estudiantes.length + 1}`,
        cedula: '',
        acudiente: '',
        telefono: ''
      };
      targetGrupo.estudiantes = [...targetGrupo.estudiantes, newEst];
      next[safeGrupoIndex] = targetGrupo;
      return next;
    });
    triggerAutoSaveToast('Estudiante agregado');
  };

  const handleAddMultiplesEstudiantes = (nombres: string[]) => {
    setGrupos((prev) => {
      const next = [...prev];
      const targetGrupo = { ...next[safeGrupoIndex] };
      const nuevos = nombres.map((nom, i) => ({
        id: `est-bulk-${Date.now()}-${i}`,
        nombre: nom,
        cedula: '',
        acudiente: '',
        telefono: ''
      }));
      targetGrupo.estudiantes = [...targetGrupo.estudiantes, ...nuevos];
      next[safeGrupoIndex] = targetGrupo;
      return next;
    });
    triggerAutoSaveToast(`${nombres.length} estudiantes agregados`);
  };

  const handleUpdateEstudiante = (idx: number, campo: keyof Estudiante, valor: string) => {
    setGrupos((prev) => {
      const next = [...prev];
      const targetGrupo = { ...next[safeGrupoIndex] };
      const list = [...targetGrupo.estudiantes];
      if (list[idx]) {
        list[idx] = { ...list[idx], [campo]: valor };
      }
      targetGrupo.estudiantes = list;
      next[safeGrupoIndex] = targetGrupo;
      return next;
    });
    triggerAutoSaveToast();
  };

  const handleDeleteEstudiante = (idx: number) => {
    setGrupos((prev) => {
      const next = [...prev];
      const targetGrupo = { ...next[safeGrupoIndex] };
      targetGrupo.estudiantes = targetGrupo.estudiantes.filter((_, i) => i !== idx);
      next[safeGrupoIndex] = targetGrupo;
      return next;
    });
    triggerAutoSaveToast('Estudiante eliminado');
  };

  // --- Group Management Handlers ---
  const handleAddGrupo = (nombre: string, grado: string) => {
    const nuevo: Grupo = {
      id: `grp-${Date.now()}`,
      nombre,
      grado,
      estudiantes: [],
      notas: { 1: {}, 2: {}, 3: {} },
      asistencia: {}
    };
    setGrupos((prev) => [...prev, nuevo]);
    setGrupoActualIndex(grupos.length);
    triggerAutoSaveToast(`Grupo ${nombre} creado`);
  };

  const handleEditGrupo = (idx: number, nuevoNombre: string) => {
    setGrupos((prev) => {
      const next = [...prev];
      if (next[idx]) {
        next[idx] = { ...next[idx], nombre: nuevoNombre };
      }
      return next;
    });
    triggerAutoSaveToast('Nombre actualizado');
  };

  const handleDeleteGrupo = (idx: number) => {
    if (grupos.length <= 1) {
      alert('⚠️ No se puede eliminar el último grupo.');
      return;
    }
    if (confirm(`¿Eliminar el grupo "${grupos[idx].nombre}"? Esta acción borrará todas sus calificaciones.`)) {
      setGrupos((prev) => prev.filter((_, i) => i !== idx));
      setGrupoActualIndex(0);
      triggerAutoSaveToast('Grupo eliminado');
    }
  };

  // --- Sequences Handlers ---
  const handleUpdateSecuencia = (id: string, updated: Partial<SecuenciaDidactica>) => {
    setSecuencias((prev) =>
      prev.map((s) => (s.id === id ? { ...s, ...updated } : s))
    );
    triggerAutoSaveToast('Secuencia guardada');
  };

  const handleCrearSecuencia = (nueva: SecuenciaDidactica) => {
    setSecuencias((prev) => [nueva, ...prev]);
    triggerAutoSaveToast('Secuencia agregada');
  };

  const handleReordenarSecuencias = (nuevas: SecuenciaDidactica[]) => {
    setSecuencias(nuevas);
    triggerAutoSaveToast('Secuencias reordenadas');
  };

  const handleEliminarSecuencia = (id: string) => {
    setSecuencias((prev) => prev.filter((s) => s.id !== id));
    triggerAutoSaveToast('Secuencia eliminada');
  };

  const handleDuplicarSecuencia = (sec: SecuenciaDidactica) => {
    const dup: SecuenciaDidactica = {
      ...sec,
      id: `sec-dup-${Date.now()}`,
      tema: `${sec.tema || sec.area} (Copia)`
    };
    setSecuencias((prev) => [dup, ...prev]);
    triggerAutoSaveToast('Secuencia duplicada');
  };

  // --- Backup and Restore Handlers ---
  const crearRespaldoSnapshot = (etiqueta?: string) => {
    const fecha = new Date();
    const nombre =
      etiqueta ||
      `Respaldo ${fecha.toLocaleDateString('es-PA')} ${fecha.getHours()}:${String(fecha.getMinutes()).padStart(2, '0')}`;

    const totalEstudiantes = grupos.reduce((acc, g) => acc + g.estudiantes.length, 0);

    const snapshot: RespaldoItem = {
      id: `bk-${Date.now()}`,
      nombre,
      fecha: fecha.toISOString(),
      gruposCount: grupos.length,
      estudiantesCount: totalEstudiantes,
      data: {
        grupos,
        grupoActualIndex: safeGrupoIndex,
        config,
        secuencias
      }
    };

    setRespaldos((prev) => [snapshot, ...prev.slice(0, 30)]);
    triggerAutoSaveToast('Copia de respaldo guardada');
  };

  const handleRestaurarRespaldo = (id: string) => {
    const target = respaldos.find((r) => r.id === id);
    if (!target) return;
    if (target.data.grupos) setGrupos(target.data.grupos);
    if (target.data.config) setConfig(target.data.config);
    if (target.data.secuencias) setSecuencias(target.data.secuencias);
    if (target.data.grupoActualIndex !== undefined) setGrupoActualIndex(target.data.grupoActualIndex);
    setShowModalRespaldos(false);
    triggerAutoSaveToast('Copia restaurada exitosamente');
  };

  const handleEliminarRespaldo = (id: string) => {
    setRespaldos((prev) => prev.filter((r) => r.id !== id));
    triggerAutoSaveToast('Respaldo eliminado');
  };

  const handleExportarJSON = () => {
    const backupData = {
      version: '3.0',
      fechaExportacion: new Date().toISOString(),
      config,
      grupos,
      grupoActualIndex: safeGrupoIndex,
      secuencias
    };

    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `meduca_tecnologia_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    triggerAutoSaveToast('Archivo JSON descargado');
  };

  const handleImportarJSONFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const parsed = JSON.parse(e.target?.result as string);
        if (!parsed.grupos || !Array.isArray(parsed.grupos)) {
          throw new Error('El archivo no contiene un formato de registro válido.');
        }

        if (parsed.config) setConfig(parsed.config);
        if (parsed.grupos) setGrupos(parsed.grupos);
        if (parsed.secuencias && Array.isArray(parsed.secuencias)) setSecuencias(parsed.secuencias);
        if (parsed.grupoActualIndex !== undefined) setGrupoActualIndex(parsed.grupoActualIndex);

        crearRespaldoSnapshot(`Importado de ${file.name}`);
        setShowModalRespaldos(false);
        alert('✅ Datos importados correctamente y respaldo generado.');
      } catch (err: any) {
        alert('❌ Error al importar archivo: ' + err.message);
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="min-h-screen bg-[#f0f2f5] text-[#1a1a2e] flex font-sans">
      {/* Collapsible Sidebar */}
      <Sidebar
        isExpanded={sidebarExpanded}
        onToggleExpand={handleToggleSidebar}
        mobileOpen={mobileMenuOpen}
        onCloseMobile={() => setMobileMenuOpen(false)}
        activeTab={tabPrincipal}
        onSelectTab={setTabPrincipal}
        grupos={grupos}
        grupoActualIndex={safeGrupoIndex}
        onSelectGrupo={setGrupoActualIndex}
        onOpenGestionGrupos={() => setShowModalGrupos(true)}
        onOpenGestionEstudiantes={() => setShowModalEstudiantes(true)}
        onOpenRespaldos={() => setShowModalRespaldos(true)}
        onExportarJSON={handleExportarJSON}
        onImprimir={() => window.print()}
        config={config}
      />

      {/* Main Content Area (Respects Collapsible Sidebar with smooth transition) */}
      <div className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ease-in-out ${
        sidebarExpanded ? 'md:pl-64 lg:pl-72' : 'md:pl-20'
      }`}>
        <div className="max-w-[1600px] w-full mx-auto p-3 sm:p-4 md:p-6 flex-1 pb-16">
          {/* Institutional Header with Toggle Button */}
          <HeaderInstitucional
            config={config}
            onChangeConfig={setConfig}
            grupos={grupos}
            grupoActualIndex={safeGrupoIndex}
            onSelectGrupo={setGrupoActualIndex}
            onOpenGestionGrupos={() => setShowModalGrupos(true)}
            onOpenGestionEstudiantes={() => setShowModalEstudiantes(true)}
            onOpenRespaldos={() => setShowModalRespaldos(true)}
            onExportarJSON={handleExportarJSON}
            onImportarJSON={() => setShowModalRespaldos(true)}
            onImprimir={() => window.print()}
            autoSaveMessage={autoSaveMessage}
            onToggleSidebar={() => {
              if (window.innerWidth < 768) {
                setMobileMenuOpen(true);
              } else {
                handleToggleSidebar();
              }
            }}
            isSidebarExpanded={sidebarExpanded}
          />

        {/* Active Module Context Bar (Replaces duplicated menu with clean header and controls) */}
        <div className="bg-white border border-[#d4c8b0] rounded-xl p-3 md:p-4 mb-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 no-print">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#0a1628] text-[#c9a84c] flex items-center justify-center shrink-0 shadow-xs border border-[#c9a84c]/30">
              {tabPrincipal === 'notas' && <FileSpreadsheet className="w-5 h-5" />}
              {tabPrincipal === 'asistencia' && <CalendarCheck className="w-5 h-5" />}
              {tabPrincipal === 'boletin' && <Award className="w-5 h-5" />}
              {tabPrincipal === 'seguimiento' && <UserCheck className="w-5 h-5" />}
              {tabPrincipal === 'herramientas' && <Sparkles className="w-5 h-5" />}
              {tabPrincipal === 'secuencias' && <BookMarked className="w-5 h-5" />}
              {tabPrincipal === 'workspace' && <Cloud className="w-5 h-5" />}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] uppercase font-extrabold tracking-wider px-2 py-0.5 rounded-full bg-[#0a1628]/5 text-[#0a1628] border border-[#0a1628]/10">
                  MÓDULO ACTIVO
                </span>
                <span className="text-xs font-bold text-slate-500">
                  {currentGrupo ? `${currentGrupo.nombre} · ${currentGrupo.estudiantes?.length || 0} estudiantes` : 'Tecnología'}
                </span>
              </div>
              <h2 className="text-base md:text-lg font-black text-[#0a1628] tracking-tight">
                {tabPrincipal === 'notas' && 'CALIFICACIONES Y REGISTRO DE NOTAS'}
                {tabPrincipal === 'asistencia' && 'CONTROL DIARIO Y SEMANAL DE ASISTENCIA'}
                {tabPrincipal === 'boletin' && 'BOLETÍN CONSOLIDADO DE CALIFICACIONES'}
                {tabPrincipal === 'seguimiento' && 'SEGUIMIENTO INTEGRAL A ESTUDIANTES'}
                {tabPrincipal === 'herramientas' && 'HERRAMIENTAS INTERACTIVAS DE AULA'}
                {tabPrincipal === 'secuencias' && 'SECUENCIAS DIDÁCTICAS MEDUCA (3° A 6°)'}
                {tabPrincipal === 'workspace' && 'INTEGRACIÓN CON GOOGLE WORKSPACE'}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
            {/* Mobile Open Sidebar */}
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="md:hidden px-3 py-1.5 rounded-lg bg-[#0a1628] text-white text-xs font-bold flex items-center gap-1.5 shadow-xs hover:bg-[#11223b]"
            >
              <Menu className="w-4 h-4 text-[#c9a84c]" />
              <span>Menú</span>
            </button>

            {/* Desktop Toggle Sidebar */}
            <button
              onClick={handleToggleSidebar}
              className="hidden md:flex px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold items-center gap-1.5 transition-colors border border-slate-200"
              title={sidebarExpanded ? 'Colapsar menú lateral' : 'Expandir menú lateral'}
            >
              {sidebarExpanded ? (
                <>
                  <PanelLeftClose className="w-4 h-4 text-slate-500" />
                  <span>Colapsar Menú</span>
                </>
              ) : (
                <>
                  <PanelLeft className="w-4 h-4 text-[#c9a84c]" />
                  <span>Expandir Menú</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Tab Content Display */}
        <main>
          {tabPrincipal === 'notas' && (
            <RegistroNotas
              grupo={currentGrupo}
              trimestreActual={trimestreNotas}
              onSelectTrimestre={setTrimestreNotas}
              onUpdateNota={handleUpdateNota}
              onOpenEstudiantes={() => setShowModalEstudiantes(true)}
              onAgregarActividad={handleAgregarActividad}
              onEditarActividad={handleEditarActividad}
              onEliminarActividad={handleEliminarActividad}
              onAsignarNotaMasiva={handleAsignarNotaMasiva}
              onVaciarActividades={handleVaciarActividades}
            />
          )}

          {tabPrincipal === 'asistencia' && (
            <ControlAsistencia
              grupo={currentGrupo}
              trimestreActual={trimestreAsistencia}
              semanaActual={semanaActual}
              onSelectTrimestre={setTrimestreAsistencia}
              onChangeSemana={(delta) => setSemanaActual((prev) => prev + delta)}
              onResetSemana={() => setSemanaActual(0)}
              onUpdateAsistencia={handleUpdateAsistencia}
              onMarcarTodosPresentes={handleMarcarTodosPresentes}
              diaInicio={config.diaInicio}
              mesInicio={config.mesInicio}
              anioInicio={config.anioInicio}
            />
          )}

          {tabPrincipal === 'boletin' && (
            <BoletinOficial
              grupo={currentGrupo}
              config={config}
              onImprimir={() => window.print()}
            />
          )}

          {tabPrincipal === 'secuencias' && (
            <SecuenciasDidacticas
              secuencias={secuencias}
              config={config}
              onUpdateSecuencia={handleUpdateSecuencia}
              onCrearSecuencia={handleCrearSecuencia}
              onReordenarSecuencias={handleReordenarSecuencias}
              onEliminarSecuencia={handleEliminarSecuencia}
              onDuplicarSecuencia={handleDuplicarSecuencia}
              onImprimir={() => window.print()}
            />
          )}

          {tabPrincipal === 'seguimiento' && (
            <SeguimientoEstudiantes
              grupo={currentGrupo}
              config={config}
              onUpdateEstudiante={handleUpdateEstudianteSeguimiento}
              trimestreActual={trimestreNotas}
            />
          )}

          {tabPrincipal === 'herramientas' && (
            <HerramientasAula
              grupo={currentGrupo}
              docente={config.docente}
            />
          )}

          {tabPrincipal === 'workspace' && (
            <GoogleWorkspacePanel
              grupo={currentGrupo}
              config={config}
              secuencias={secuencias}
              allGrupos={grupos}
            />
          )}
        </main>
      </div>
    </div>

      {/* Modals */}
      {showModalGrupos && (
        <ModalGestionarGrupos
          grupos={grupos}
          grupoActualIndex={safeGrupoIndex}
          onClose={() => setShowModalGrupos(false)}
          onSelectGrupo={setGrupoActualIndex}
          onAgregarGrupo={handleAddGrupo}
          onEditarGrupo={handleEditGrupo}
          onEliminarGrupo={handleDeleteGrupo}
        />
      )}

      {showModalEstudiantes && currentGrupo && (
        <ModalGestionarEstudiantes
          grupo={currentGrupo}
          onClose={() => setShowModalEstudiantes(false)}
          onAddEstudiante={handleAddEstudiante}
          onAddMultiplesEstudiantes={handleAddMultiplesEstudiantes}
          onUpdateEstudiante={handleUpdateEstudiante}
          onDeleteEstudiante={handleDeleteEstudiante}
        />
      )}

      {showModalRespaldos && (
        <ModalRespaldos
          respaldos={respaldos}
          onClose={() => setShowModalRespaldos(false)}
          onCrearRespaldo={crearRespaldoSnapshot}
          onRestaurarRespaldo={handleRestaurarRespaldo}
          onEliminarRespaldo={handleEliminarRespaldo}
          onExportarJSON={handleExportarJSON}
          onImportarJSONFile={handleImportarJSONFile}
        />
      )}

      {/* Floating Teacher Credit (as in base file) */}
      <footer className="fixed bottom-3 right-3 z-40 bg-[#0a1628] text-[#e8d5a3] text-[11px] font-semibold px-4 py-1.5 rounded-full border border-[#c9a84c]/30 shadow-lg no-print flex items-center gap-1.5">
        <Sparkles className="w-3 h-3 text-[#c9a84c]" />
        <span>Desarrollado por <strong className="text-[#c9a84c]">Aníbal Castillo</strong> | MEDUCA · Tecnología</span>
      </footer>

      <OfflineIndicator />
    </div>
  );
}
