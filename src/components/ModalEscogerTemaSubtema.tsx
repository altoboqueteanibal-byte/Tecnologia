import React, { useState } from 'react';
import { TemaCurricularItem, SecuenciaDidactica } from '../types';
import { CATALOGO_TEMAS_CURRICULARES } from '../data/catalogoTemasCurriculares';
import { 
  X, 
  Search, 
  BookOpen, 
  Check, 
  Sparkles, 
  Layers, 
  GraduationCap, 
  Filter, 
  Edit3, 
  ArrowRight,
  Lightbulb
} from 'lucide-react';

interface ModalEscogerTemaSubtemaProps {
  isOpen: boolean;
  onClose: () => void;
  secuenciaActual: SecuenciaDidactica | null;
  onAplicarTema: (secuenciaId: string, datos: Partial<SecuenciaDidactica>) => void;
}

export const ModalEscogerTemaSubtema: React.FC<ModalEscogerTemaSubtemaProps> = ({
  isOpen,
  onClose,
  secuenciaActual,
  onAplicarTema
}) => {
  const [modo, setModo] = useState<'catalogo' | 'personalizado'>('catalogo');
  const [filtroGrado, setFiltroGrado] = useState<string>(secuenciaActual?.grado || 'Todos');
  const [filtroTrimestre, setFiltroTrimestre] = useState<string>('Todos');
  const [busqueda, setBusqueda] = useState<string>('');
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState<string>('Todas');

  // Custom fields
  const [customArea, setCustomArea] = useState<string>(secuenciaActual?.area || '');
  const [customTema, setCustomTema] = useState<string>(secuenciaActual?.tema || '');
  const [customSubtema, setCustomSubtema] = useState<string>(secuenciaActual?.subtema || '');
  const [customConceptual, setCustomConceptual] = useState<string>(secuenciaActual?.conceptual || '');

  // Options when applying catalog item
  const [actualizarContenidos, setActualizarContenidos] = useState(true);
  const [actualizarActividades, setActualizarActividades] = useState(true);

  if (!isOpen || !secuenciaActual) return null;

  // Filter catalog
  const catalogoFiltrado = CATALOGO_TEMAS_CURRICULARES.filter((item) => {
    if (filtroGrado !== 'Todos' && item.gradoSugerido !== 'Todos' && item.gradoSugerido !== filtroGrado) {
      return false;
    }
    if (filtroTrimestre !== 'Todos' && item.trimestreSugerido !== 'Todos' && item.trimestreSugerido !== filtroTrimestre) {
      return false;
    }
    if (categoriaSeleccionada !== 'Todas') {
      if (categoriaSeleccionada === 'Hardware' && !item.area.toLowerCase().includes('hardware')) return false;
      if (categoriaSeleccionada === 'Programas' && !item.area.toLowerCase().includes('programas')) return false;
      if (categoriaSeleccionada === 'Seguridad' && !item.area.toLowerCase().includes('seguridad') && !item.area.toLowerCase().includes('internet')) return false;
      if (categoriaSeleccionada === 'Programacion' && !item.area.toLowerCase().includes('programación') && !item.area.toLowerCase().includes('pensamiento')) return false;
    }
    if (busqueda.trim() !== '') {
      const q = busqueda.toLowerCase();
      const match =
        item.tema.toLowerCase().includes(q) ||
        item.subtema.toLowerCase().includes(q) ||
        item.area.toLowerCase().includes(q) ||
        item.conceptual.toLowerCase().includes(q);
      if (!match) return false;
    }
    return true;
  });

  const handleSeleccionarCatalogo = (item: TemaCurricularItem) => {
    const update: Partial<SecuenciaDidactica> = {
      area: item.area,
      tema: item.tema,
      subtema: item.subtema
    };

    if (actualizarContenidos) {
      update.conceptual = item.conceptual;
      update.procedimental = item.procedimental;
      update.actitudinal = item.actitudinal;
      update.indicador = item.indicador;
      update.competencia = item.competencia;
      update.objetivo = item.objetivo;
    }

    if (actualizarActividades) {
      update.act_inicio = item.act_inicio;
      update.act_desarrollo = item.act_desarrollo;
      update.act_cierre = item.act_cierre;
      update.evidencia = item.evidencia;
      update.criterios = item.criterios;
      update.tipo_eval = item.tipo_eval;
    }

    onAplicarTema(secuenciaActual.id, update);
    onClose();
  };

  const handleAplicarPersonalizado = () => {
    if (!customTema.trim()) {
      alert('Por favor escribe al menos el nombre del tema.');
      return;
    }

    const update: Partial<SecuenciaDidactica> = {
      area: customArea.trim() || secuenciaActual.area,
      tema: customTema.trim(),
      subtema: customSubtema.trim()
    };

    if (customConceptual.trim()) {
      update.conceptual = customConceptual.trim();
    }

    onAplicarTema(secuenciaActual.id, update);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 bg-[#0a1628] text-white flex items-center justify-between border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#c9a84c]/20 border border-[#c9a84c]/40 flex items-center justify-center text-[#e8d5a3]">
              <BookOpen className="w-5 h-5 text-[#c9a84c]" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                <span>Escoger Tema y Subtema Curricular</span>
                <span className="text-xs px-2.5 py-0.5 bg-[#c9a84c] text-[#0a1628] font-black rounded-full uppercase tracking-wider">
                  MEDUCA
                </span>
              </h3>
              <p className="text-xs text-slate-300">
                Secuencia: <strong>{secuenciaActual.grado} · Trimestre {secuenciaActual.trimestre} (Sem. {secuenciaActual.semana})</strong>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab switcher: Catálogo Curricular vs Personalizado */}
        <div className="flex items-center gap-2 px-4 pt-3 border-b border-slate-200 bg-slate-50 shrink-0">
          <button
            onClick={() => setModo('catalogo')}
            className={`px-4 py-2 text-xs font-bold rounded-t-lg transition-all flex items-center gap-2 border-t border-x ${
              modo === 'catalogo'
                ? 'bg-white text-[#0a1628] border-slate-200 border-b-transparent shadow-xs font-extrabold -mb-[1px]'
                : 'text-slate-600 hover:text-slate-900 border-transparent'
            }`}
          >
            <Layers className="w-4 h-4 text-[#c9a84c]" />
            <span>Catálogo Curricular Oficial ({CATALOGO_TEMAS_CURRICULARES.length} Temas)</span>
          </button>

          <button
            onClick={() => setModo('personalizado')}
            className={`px-4 py-2 text-xs font-bold rounded-t-lg transition-all flex items-center gap-2 border-t border-x ${
              modo === 'personalizado'
                ? 'bg-white text-[#0a1628] border-slate-200 border-b-transparent shadow-xs font-extrabold -mb-[1px]'
                : 'text-slate-600 hover:text-slate-900 border-transparent'
            }`}
          >
            <Edit3 className="w-4 h-4 text-[#c9a84c]" />
            <span>Escribir Tema Personalizado a Conveniencia</span>
          </button>
        </div>

        {/* Body content */}
        {modo === 'catalogo' ? (
          <div className="flex flex-col flex-1 overflow-hidden p-4">
            {/* Filter toolbar */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 mb-3 shrink-0 space-y-2.5">
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={busqueda}
                    onChange={(e) => setBusqueda(e.target.value)}
                    placeholder="Buscar tema, subtema o contenido (ej. Scratch, Paint, Teclado, Hoja de cálculo, Redes)..."
                    className="w-full text-xs pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#c9a84c]"
                  />
                  {busqueda && (
                    <button
                      onClick={() => setBusqueda('')}
                      className="absolute right-2.5 top-2 text-slate-400 hover:text-slate-600 text-xs font-bold"
                    >
                      ✕
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <div className="flex items-center gap-1 bg-white border border-slate-200 p-1 rounded-lg">
                    <span className="text-[10px] font-bold text-slate-400 px-1">Grado:</span>
                    {['Todos', '3°', '4°', '5°', '6°'].map((g) => (
                      <button
                        key={g}
                        onClick={() => setFiltroGrado(g)}
                        className={`px-2 py-0.5 rounded text-[11px] font-bold transition-all ${
                          filtroGrado === g
                            ? 'bg-[#c9a84c] text-[#0a1628]'
                            : 'text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        {g}
                      </button>
                    ))}
                  </div>

                  <div className="flex items-center gap-1 bg-white border border-slate-200 p-1 rounded-lg">
                    <span className="text-[10px] font-bold text-slate-400 px-1">Trimestre:</span>
                    {['Todos', 'PRIMERO', 'SEGUNDO', 'TERCERO'].map((t) => (
                      <button
                        key={t}
                        onClick={() => setFiltroTrimestre(t)}
                        className={`px-2 py-0.5 rounded text-[11px] font-bold transition-all ${
                          filtroTrimestre === t
                            ? 'bg-[#0a1628] text-white'
                            : 'text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        {t === 'Todos' ? 'Todos' : t === 'PRIMERO' ? 'T1' : t === 'SEGUNDO' ? 'T2' : 'T3'}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Category Pills & Preferences */}
              <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-slate-200/80 text-xs">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-[10px] font-bold uppercase text-slate-400">Áreas:</span>
                  {[
                    { id: 'Todas', label: 'Todas' },
                    { id: 'Hardware', label: '🖥️ Hardware' },
                    { id: 'Programas', label: '📊 Ofimática y Software' },
                    { id: 'Seguridad', label: '🛡️ Internet y Seguridad' },
                    { id: 'Programacion', label: '🧩 Scratch y Algoritmos' }
                  ].map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => setCategoriaSeleccionada(cat.id)}
                      className={`px-2 py-0.5 rounded-full text-[11px] font-medium transition-all ${
                        categoriaSeleccionada === cat.id
                          ? 'bg-slate-800 text-white font-bold'
                          : 'bg-white border border-slate-200 text-slate-600 hover:border-slate-300'
                      }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-3 text-[11px] text-slate-600">
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={actualizarContenidos}
                      onChange={(e) => setActualizarContenidos(e.target.checked)}
                      className="rounded text-[#c9a84c] focus:ring-[#c9a84c]"
                    />
                    <span>Autocompletar Contenidos y Objetivos</span>
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={actualizarActividades}
                      onChange={(e) => setActualizarActividades(e.target.checked)}
                      className="rounded text-[#c9a84c] focus:ring-[#c9a84c]"
                    />
                    <span>Sugerir Actividades de Inicio, Desarrollo y Cierre</span>
                  </label>
                </div>
              </div>
            </div>

            {/* Catalog List */}
            <div className="flex-1 overflow-y-auto space-y-2.5 pr-1">
              {catalogoFiltrado.length === 0 ? (
                <div className="text-center py-12 px-4 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                  <Lightbulb className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                  <p className="text-sm font-bold text-slate-700">No hay temas que coincidan con la búsqueda</p>
                  <p className="text-xs text-slate-400 mt-1">Prueba seleccionando "Todos" los grados o una búsqueda más amplia.</p>
                </div>
              ) : (
                catalogoFiltrado.map((item) => {
                  const isCurrent = secuenciaActual.tema === item.tema;

                  return (
                    <div
                      key={item.id}
                      className={`p-3.5 sm:p-4 rounded-xl border transition-all ${
                        isCurrent
                          ? 'bg-amber-50/80 border-[#c9a84c] shadow-xs'
                          : 'bg-white border-slate-200 hover:border-slate-300 hover:shadow-xs'
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 flex-wrap mb-1">
                            <span className="text-[10px] font-bold px-2 py-0.5 bg-slate-100 text-slate-700 rounded-md border border-slate-200">
                              {item.area}
                            </span>
                            <span className="text-[10px] font-bold px-2 py-0.5 bg-blue-50 text-blue-700 rounded-md">
                              Grado: {item.gradoSugerido}
                            </span>
                            <span className="text-[10px] font-bold px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded-md">
                              {item.trimestreSugerido === 'Todos' ? 'Cualquier Trimestre' : `Trimestre ${item.trimestreSugerido}`}
                            </span>
                            {isCurrent && (
                              <span className="text-[10px] font-black px-2 py-0.5 bg-[#c9a84c] text-[#0a1628] rounded-md">
                                ✓ Tema Actual de la Secuencia
                              </span>
                            )}
                          </div>

                          <h4 className="text-sm font-bold text-slate-900 mt-0.5 flex items-center gap-1.5">
                            <span>📌 Tema: {item.tema}</span>
                          </h4>

                          <div className="text-xs text-slate-700 font-medium mt-0.5">
                            <strong className="text-slate-800">Subtema:</strong> {item.subtema}
                          </div>

                          <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">
                            <strong className="text-slate-600">Contenido conceptual:</strong> {item.conceptual}
                          </p>
                        </div>

                        <button
                          onClick={() => handleSeleccionarCatalogo(item)}
                          className={`px-4 py-2 rounded-lg text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 shadow-xs ${
                            isCurrent
                              ? 'bg-[#c9a84c] hover:bg-[#d4b55a] text-[#0a1628]'
                              : 'bg-[#0a1628] hover:bg-[#1a2a4a] text-white'
                          }`}
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>{isCurrent ? 'Volver a Aplicar' : 'Elegir este Tema'}</span>
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        ) : (
          /* Custom theme form */
          <div className="p-5 flex-1 overflow-y-auto space-y-4">
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-900 flex items-start gap-2.5">
              <Sparkles className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <strong>Libertad pedagógica:</strong> Puedes escribir cualquier tema y subtema que desees impartir en esta secuencia según tus necesidades de aula, proyectos transversales o adaptaciones curriculares.
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Área Curricular
                </label>
                <input
                  type="text"
                  value={customArea}
                  onChange={(e) => setCustomArea(e.target.value)}
                  placeholder="Ej. Área 1: Conceptos Básicos / Hardware / Robótica Escolar..."
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#c9a84c]"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Nombre del Tema Principal <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={customTema}
                  onChange={(e) => setCustomTema(e.target.value)}
                  placeholder="Ej. Inteligencia Artificial en el Aula, Mecanografía, etc."
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#c9a84c]"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Subtema Específico
                </label>
                <input
                  type="text"
                  value={customSubtema}
                  onChange={(e) => setCustomSubtema(e.target.value)}
                  placeholder="Ej. Reconocimiento de voz, traducción automática..."
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#c9a84c]"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Contenido Conceptual (opcional)
                </label>
                <textarea
                  value={customConceptual}
                  onChange={(e) => setCustomConceptual(e.target.value)}
                  rows={3}
                  placeholder="Escribe aquí los conceptos clave, definiciones o vocabulario que abordará este tema..."
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#c9a84c] resize-none"
                />
              </div>
            </div>

            <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-slate-300 hover:bg-slate-100 text-slate-700 rounded-lg text-xs font-bold transition-colors"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleAplicarPersonalizado}
                className="px-5 py-2 bg-gradient-to-r from-[#c9a84c] to-[#a8893a] text-[#0a1628] rounded-lg text-xs font-bold transition-all shadow-md flex items-center gap-1.5"
              >
                <span>Aplicar a esta Secuencia</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* Footer info */}
        <div className="p-3 bg-slate-100 border-t border-slate-200 text-center text-[11px] text-slate-500 shrink-0">
          💡 Los temas y subtemas seleccionados se insertan inmediatamente en el formato oficial de la secuencia didáctica para impresión o edición continua.
        </div>
      </div>
    </div>
  );
};
