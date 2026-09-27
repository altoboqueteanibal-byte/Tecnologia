import React, { useState } from 'react';
import { ActividadEvaluacion, TipoActividadEvaluacion } from '../types';
import { 
  X, 
  Plus, 
  Trash2, 
  Edit3, 
  Check, 
  Layers, 
  Calendar, 
  Sparkles, 
  FileSpreadsheet, 
  Award, 
  Zap,
  HelpCircle
} from 'lucide-react';

interface ModalGestionarActividadesProps {
  isOpen: boolean;
  onClose: () => void;
  trimestre: 1 | 2 | 3;
  actividades: ActividadEvaluacion[];
  onAgregarActividad: (nombre: string, tipo: TipoActividadEvaluacion, fecha?: string) => void;
  onEditarActividad: (actividadId: string, nombre: string, tipo: TipoActividadEvaluacion) => void;
  onEliminarActividad: (actividadId: string) => void;
  onAsignarNotaMasiva?: (actividadId: string, valor: number) => void;
  onVaciarActividades?: () => void;
}

const TIPOS_ACTIVIDAD: { tipo: TipoActividadEvaluacion; color: string; icon: string }[] = [
  { tipo: 'Taller', color: 'bg-blue-100 text-blue-800 border-blue-200', icon: '🛠️' },
  { tipo: 'Laboratorio', color: 'bg-purple-100 text-purple-800 border-purple-200', icon: '🧪' },
  { tipo: 'Tarea', color: 'bg-amber-100 text-amber-800 border-amber-200', icon: '📝' },
  { tipo: 'Investigación', color: 'bg-teal-100 text-teal-800 border-teal-200', icon: '🔍' },
  { tipo: 'Proyecto', color: 'bg-emerald-100 text-emerald-800 border-emerald-200', icon: '🏆' },
  { tipo: 'Parcial', color: 'bg-red-100 text-red-800 border-red-200', icon: '📋' },
  { tipo: 'Apreciación', color: 'bg-indigo-100 text-indigo-800 border-indigo-200', icon: '⭐' }
];

export const ModalGestionarActividades: React.FC<ModalGestionarActividadesProps> = ({
  isOpen,
  onClose,
  trimestre,
  actividades,
  onAgregarActividad,
  onEditarActividad,
  onEliminarActividad,
  onAsignarNotaMasiva,
  onVaciarActividades
}) => {
  const [nombre, setNombre] = useState('');
  const [tipo, setTipo] = useState<TipoActividadEvaluacion>('Taller');
  const [fecha, setFecha] = useState('');
  
  // Inline edit state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editNombre, setEditNombre] = useState('');
  const [editTipo, setEditTipo] = useState<TipoActividadEvaluacion>('Taller');

  // Quick mass grade state
  const [massGradeId, setMassGradeId] = useState<string | null>(null);
  const [massGradeVal, setMassGradeVal] = useState<string>('5.0');

  if (!isOpen) return null;

  const handleCrear = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre.trim()) return;

    onAgregarActividad(nombre.trim(), tipo, fecha || undefined);
    setNombre('');
    setFecha('');
  };

  const startEdit = (act: ActividadEvaluacion) => {
    setEditingId(act.id);
    setEditNombre(act.nombre);
    setEditTipo(act.tipo);
  };

  const saveEdit = (actId: string) => {
    if (!editNombre.trim()) return;
    onEditarActividad(actId, editNombre.trim(), editTipo);
    setEditingId(null);
  };

  const applyMassGrade = (actId: string) => {
    const num = parseFloat(massGradeVal);
    if (!isNaN(num) && num >= 1.0 && num <= 5.0 && onAsignarNotaMasiva) {
      onAsignarNotaMasiva(actId, num);
      setMassGradeId(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 bg-[#0a1628] text-white flex items-center justify-between border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#c9a84c]/20 border border-[#c9a84c]/40 flex items-center justify-center text-[#e8d5a3]">
              <FileSpreadsheet className="w-5 h-5 text-[#c9a84c]" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                <span>Gestionar Columnas de Actividades</span>
                <span className="text-xs px-2.5 py-0.5 bg-[#c9a84c] text-[#0a1628] font-black rounded-full">
                  Trimestre {trimestre}
                </span>
              </h3>
              <p className="text-xs text-slate-300">
                Agrega, edita o elimina columnas evaluativas dinámicas en el registro.
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

        {/* Content body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6 flex-1">
          {/* Form to add an activity column */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-3 flex items-center gap-2">
              <Plus className="w-4 h-4 text-[#c9a84c]" />
              <span>Agregar Nueva Columna de Evaluación</span>
            </h4>

            <form onSubmit={handleCrear} className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5">
                <div className="sm:col-span-6">
                  <label className="text-[11px] font-bold text-slate-600 block mb-1">
                    Nombre de la Actividad *
                  </label>
                  <input
                    type="text"
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
                    placeholder="Ej. Taller 1: El Teclado, Práctica Paint, Parcial..."
                    className="w-full text-xs p-2.5 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#c9a84c] font-medium"
                    autoFocus
                  />
                </div>

                <div className="sm:col-span-3">
                  <label className="text-[11px] font-bold text-slate-600 block mb-1">
                    Tipo de Evaluación
                  </label>
                  <select
                    value={tipo}
                    onChange={(e) => setTipo(e.target.value as TipoActividadEvaluacion)}
                    className="w-full text-xs p-2.5 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#c9a84c] font-medium"
                  >
                    {TIPOS_ACTIVIDAD.map((t) => (
                      <option key={t.tipo} value={t.tipo}>
                        {t.icon} {t.tipo}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="sm:col-span-3">
                  <label className="text-[11px] font-bold text-slate-600 block mb-1">
                    Fecha (Opcional)
                  </label>
                  <input
                    type="date"
                    value={fecha}
                    onChange={(e) => setFecha(e.target.value)}
                    className="w-full text-xs p-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#c9a84c]"
                  />
                </div>
              </div>

              {/* Quick suggestions pills */}
              <div className="flex items-center gap-1.5 flex-wrap pt-1">
                <span className="text-[10px] font-bold uppercase text-slate-400">Sugerencias rápidas:</span>
                {[
                  'Taller Práctico',
                  'Laboratorio de Computación',
                  'Investigación',
                  'Tarea',
                  'Proyecto en Bloques',
                  'Examen Parcial'
                ].map((sug) => (
                  <button
                    key={sug}
                    type="button"
                    onClick={() => {
                      setNombre(sug);
                      if (sug.includes('Laboratorio')) setTipo('Laboratorio');
                      else if (sug.includes('Parcial')) setTipo('Parcial');
                      else if (sug.includes('Investigación')) setTipo('Investigación');
                      else if (sug.includes('Proyecto')) setTipo('Proyecto');
                      else setTipo('Taller');
                    }}
                    className="text-[10px] bg-white border border-slate-200 hover:border-[#c9a84c] hover:bg-amber-50 text-slate-600 px-2 py-0.5 rounded-full transition-colors"
                  >
                    + {sug}
                  </button>
                ))}
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={!nombre.trim()}
                  className="px-4 py-2 bg-[#0a1628] hover:bg-[#1a2a4a] disabled:opacity-50 text-white rounded-lg text-xs font-bold transition-all shadow-xs flex items-center gap-2"
                >
                  <Plus className="w-4 h-4 text-[#c9a84c]" />
                  <span>Insertar Columna de Actividad</span>
                </button>
              </div>
            </form>
          </div>

          {/* List of currently created activity columns */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-slate-500" />
                <span>Columnas Creadas en Trimestre {trimestre} ({actividades.length})</span>
              </h4>
              <span className="text-[11px] text-slate-500">
                El promedio trimestral se calcula sobre estas actividades
              </span>
            </div>

            {actividades.length === 0 ? (
              <div className="text-center py-8 px-4 bg-slate-50 border border-dashed border-slate-200 rounded-xl text-slate-500">
                <FileSpreadsheet className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                <p className="text-xs font-bold text-slate-700">No hay columnas de actividades en este trimestre</p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Usa el formulario arriba para agregar tu primera columna de evaluación.
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {actividades.map((act, idx) => {
                  const isEditing = editingId === act.id;
                  const isMassGrading = massGradeId === act.id;
                  const tipoInfo = TIPOS_ACTIVIDAD.find((t) => t.tipo === act.tipo) || TIPOS_ACTIVIDAD[0];

                  return (
                    <div
                      key={act.id}
                      className="p-3 bg-white border border-slate-200 rounded-xl hover:border-slate-300 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs"
                    >
                      {isEditing ? (
                        <div className="flex-1 flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                          <input
                            type="text"
                            value={editNombre}
                            onChange={(e) => setEditNombre(e.target.value)}
                            className="flex-1 text-xs p-1.5 bg-slate-50 border border-slate-300 rounded font-medium focus:outline-none focus:ring-1 focus:ring-[#c9a84c]"
                          />
                          <select
                            value={editTipo}
                            onChange={(e) => setEditTipo(e.target.value as TipoActividadEvaluacion)}
                            className="text-xs p-1.5 bg-slate-50 border border-slate-300 rounded"
                          >
                            {TIPOS_ACTIVIDAD.map((t) => (
                              <option key={t.tipo} value={t.tipo}>
                                {t.icon} {t.tipo}
                              </option>
                            ))}
                          </select>
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => saveEdit(act.id)}
                              className="px-2.5 py-1.5 bg-emerald-600 text-white rounded text-xs font-bold hover:bg-emerald-700"
                            >
                              <Check className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => setEditingId(null)}
                              className="px-2.5 py-1.5 bg-slate-200 text-slate-700 rounded text-xs font-bold hover:bg-slate-300"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center gap-3">
                          <div className="w-7 h-7 rounded-lg bg-slate-100 text-slate-700 font-bold text-xs flex items-center justify-center shrink-0 font-mono">
                            {idx + 1}
                          </div>
                          <div>
                            <div className="text-xs font-bold text-slate-800 flex items-center gap-2">
                              <span>{act.nombre}</span>
                              <span className={`text-[10px] px-2 py-0.5 rounded-full border font-semibold ${tipoInfo.color}`}>
                                {tipoInfo.icon} {act.tipo}
                              </span>
                            </div>
                            {act.fecha && (
                              <div className="text-[10px] text-slate-400 mt-0.5 flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                <span>{act.fecha}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Actions */}
                      {!isEditing && (
                        <div className="flex items-center gap-1.5 self-end sm:self-auto">
                          {isMassGrading ? (
                            <div className="flex items-center gap-1 bg-amber-50 p-1 rounded-lg border border-amber-200">
                              <span className="text-[10px] font-bold text-amber-800 pl-1">Nota:</span>
                              <input
                                type="number"
                                min="1.0"
                                max="5.0"
                                step="0.1"
                                value={massGradeVal}
                                onChange={(e) => setMassGradeVal(e.target.value)}
                                className="w-12 text-center text-xs p-1 bg-white border border-amber-300 rounded font-bold font-mono"
                              />
                              <button
                                onClick={() => applyMassGrade(act.id)}
                                className="px-2 py-1 bg-emerald-600 text-white rounded text-[10px] font-bold hover:bg-emerald-700"
                              >
                                Aplicar a todos
                              </button>
                              <button
                                onClick={() => setMassGradeId(null)}
                                className="px-1.5 py-1 text-slate-500 hover:text-slate-700 text-xs"
                              >
                                ✕
                              </button>
                            </div>
                          ) : (
                            onAsignarNotaMasiva && (
                              <button
                                onClick={() => setMassGradeId(act.id)}
                                title="Asignar nota fija a todos los estudiantes en esta columna"
                                className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-[11px] font-medium transition-colors flex items-center gap-1"
                              >
                                <Zap className="w-3 h-3 text-[#c9a84c]" />
                                <span>Asignar a todos</span>
                              </button>
                            )
                          )}

                          <button
                            onClick={() => startEdit(act)}
                            title="Editar nombre o tipo"
                            className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded transition-colors"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => {
                              if (confirm(`¿Eliminar la columna "${act.nombre}"? Se borrarán las calificaciones asignadas a esta actividad.`)) {
                                onEliminarActividad(act.id);
                              }
                            }}
                            title="Eliminar columna de actividad"
                            className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 sm:p-4 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500 shrink-0">
          <div className="flex items-center gap-3">
            <span>Total: <strong>{actividades.length}</strong> columnas en Trimestre {trimestre}.</span>
            {actividades.length > 0 && onVaciarActividades && (
              <button
                type="button"
                onClick={() => {
                  if (confirm(`¿Vaciar todas las ${actividades.length} actividades del Trimestre ${trimestre}? Esta acción eliminará todas las columnas y notas asociadas en este trimestre.`)) {
                    onVaciarActividades();
                  }
                }}
                className="text-red-600 hover:text-red-700 font-bold hover:underline flex items-center gap-1"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Vaciar Todas</span>
              </button>
            )}
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-[#0a1628] hover:bg-[#1a2a4a] text-white rounded-lg text-xs font-bold transition-colors"
          >
            Listo / Volver a la Libreta
          </button>
        </div>
      </div>
    </div>
  );
};
