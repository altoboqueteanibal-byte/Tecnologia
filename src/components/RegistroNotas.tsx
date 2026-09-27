import React, { useState, useMemo } from 'react';
import { Grupo, ActividadEvaluacion, TipoActividadEvaluacion } from '../types';
import { ModalGestionarActividades } from './ModalGestionarActividades';
import { 
  Award, 
  Users, 
  TrendingUp, 
  AlertCircle, 
  CheckCircle, 
  Sparkles, 
  Plus, 
  Layers, 
  Trash2, 
  Edit3, 
  FileSpreadsheet, 
  Zap, 
  HelpCircle,
  Calendar
} from 'lucide-react';

interface RegistroNotasProps {
  grupo: Grupo;
  trimestreActual: 1 | 2 | 3;
  onSelectTrimestre: (t: 1 | 2 | 3) => void;
  onUpdateNota: (estudianteIdx: number, actividadId: string, valor: number | null) => void;
  onOpenEstudiantes: () => void;
  onAgregarActividad: (nombre: string, tipo: TipoActividadEvaluacion, fecha?: string) => void;
  onEditarActividad: (actividadId: string, nombre: string, tipo: TipoActividadEvaluacion) => void;
  onEliminarActividad: (actividadId: string) => void;
  onAsignarNotaMasiva?: (actividadId: string, valor: number) => void;
  onVaciarActividades?: () => void;
}

export const RegistroNotas: React.FC<RegistroNotasProps> = ({
  grupo,
  trimestreActual,
  onSelectTrimestre,
  onUpdateNota,
  onOpenEstudiantes,
  onAgregarActividad,
  onEditarActividad,
  onEliminarActividad,
  onAsignarNotaMasiva,
  onVaciarActividades
}) => {
  const estudiantes = grupo.estudiantes || [];
  const notasTrimestre = grupo.notas[trimestreActual] || {};

  const [modalActividadesOpen, setModalActividadesOpen] = useState(false);
  const [quickAddOpen, setQuickAddOpen] = useState(false);
  const [quickNombre, setQuickNombre] = useState('');
  const [quickTipo, setQuickTipo] = useState<TipoActividadEvaluacion>('Taller');

  // Extract dynamic activity columns for this trimester
  const actividadesTrimestre: ActividadEvaluacion[] = useMemo(() => {
    if (grupo.actividades && Array.isArray(grupo.actividades[trimestreActual])) {
      return grupo.actividades[trimestreActual] || [];
    }
    return [];
  }, [grupo.actividades, trimestreActual]);

  // Calculate statistics across active dynamic activities
  let sumaPromedios = 0;
  let estudiantesConNota = 0;
  let aprobados = 0;
  let reprobados = 0;

  estudiantes.forEach((_, idx) => {
    let suma = 0;
    let count = 0;

    actividadesTrimestre.forEach((act) => {
      const val = notasTrimestre[`${idx}_${act.id}`];
      if (val !== undefined && val !== null && !isNaN(val)) {
        suma += val;
        count++;
      }
    });

    if (count > 0) {
      const prom = suma / count;
      sumaPromedios += prom;
      estudiantesConNota++;
      if (prom >= 3.0) {
        aprobados++;
      } else {
        reprobados++;
      }
    }
  });

  const promedioGeneral = estudiantesConNota > 0 ? (sumaPromedios / estudiantesConNota).toFixed(2) : '-';
  const porcentajeAprobacion = estudiantesConNota > 0 ? Math.round((aprobados / estudiantesConNota) * 100) : 0;

  const handleQuickAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickNombre.trim()) return;
    onAgregarActividad(quickNombre.trim(), quickTipo);
    setQuickNombre('');
    setQuickAddOpen(false);
  };

  return (
    <div className="bg-white border border-[#d4c8b0] rounded-xl p-4 md:p-6 shadow-sm">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 mb-6 no-print">
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
            <Users className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Estudiantes</div>
            <div className="text-lg font-extrabold text-slate-800 tabular-nums">{estudiantes.length}</div>
          </div>
        </div>

        <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0">
            <Layers className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Actividades</div>
            <div className="text-lg font-extrabold text-indigo-700 tabular-nums">{actividadesTrimestre.length}</div>
          </div>
        </div>

        <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
            <TrendingUp className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Promedio T{trimestreActual}</div>
            <div className="text-lg font-extrabold text-[#a8893a] tabular-nums">{promedioGeneral}</div>
          </div>
        </div>

        <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
            <CheckCircle className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Aprobados</div>
            <div className="text-lg font-extrabold text-emerald-700 tabular-nums">{aprobados}</div>
          </div>
        </div>

        <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-red-100 text-red-700 flex items-center justify-center shrink-0">
            <AlertCircle className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Reprobados</div>
            <div className="text-lg font-extrabold text-red-600 tabular-nums">{reprobados}</div>
          </div>
        </div>

        <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-[#c9a84c]/20 text-[#a8893a] flex items-center justify-center shrink-0">
            <Award className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">% Aprobación</div>
            <div className="text-lg font-extrabold text-slate-800 tabular-nums">{porcentajeAprobacion}%</div>
          </div>
        </div>
      </div>

      {/* Header Bar and Sub-tabs */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 mb-4 pb-3 border-b border-slate-200 no-print">
        <div>
          <h2 className="text-base font-bold text-[#0a1628] flex items-center gap-2">
            <span>REGISTRO DE CALIFICACIONES</span>
            <span className="text-xs px-2 py-0.5 bg-[#c9a84c]/20 text-[#a8893a] font-semibold rounded">
              Escala Oficial 1.0 - 5.0
            </span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Grupo: <strong className="text-slate-700">{grupo.nombre}</strong> · Cada actividad agregada crea dinámicamente una columna de evaluación.
          </p>
        </div>

        {/* Action Toolbar: Add activity & Trimestre Selector */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setQuickAddOpen(!quickAddOpen)}
            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Agregar Actividad (Columna)</span>
          </button>

          <button
            onClick={() => setModalActividadesOpen(true)}
            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5"
          >
            <Layers className="w-4 h-4 text-slate-500" />
            <span>Gestionar Columnas ({actividadesTrimestre.length})</span>
          </button>

          {/* Trimestre Selector */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
            {([1, 2, 3] as const).map((t) => (
              <button
                key={t}
                onClick={() => onSelectTrimestre(t)}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                  trimestreActual === t
                    ? 'bg-[#c9a84c] text-[#0a1628] shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Trimestre {t}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Add Inline Form */}
      {quickAddOpen && (
        <form 
          onSubmit={handleQuickAddSubmit} 
          className="mb-4 p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 animate-in slide-in-from-top-2 no-print"
        >
          <div className="flex items-center gap-2 flex-1">
            <span className="text-xs font-bold text-emerald-900 whitespace-nowrap">Nueva Columna:</span>
            <input
              type="text"
              value={quickNombre}
              onChange={(e) => setQuickNombre(e.target.value)}
              placeholder="Ej. Taller 1: El Teclado, Laboratorio Paint, Investigación, Examen..."
              className="flex-1 text-xs p-2 bg-white border border-emerald-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500 font-medium"
              autoFocus
            />
          </div>

          <div className="flex items-center gap-2">
            <select
              value={quickTipo}
              onChange={(e) => setQuickTipo(e.target.value as TipoActividadEvaluacion)}
              className="text-xs p-2 bg-white border border-emerald-300 rounded-lg font-medium"
            >
              <option value="Taller">🛠️ Taller</option>
              <option value="Laboratorio">🧪 Laboratorio</option>
              <option value="Tarea">📝 Tarea</option>
              <option value="Investigación">🔍 Investigación</option>
              <option value="Proyecto">🏆 Proyecto</option>
              <option value="Parcial">📋 Parcial</option>
              <option value="Apreciación">⭐ Apreciación</option>
            </select>

            <button
              type="submit"
              disabled={!quickNombre.trim()}
              className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 text-white rounded-lg text-xs font-bold whitespace-nowrap shadow-xs"
            >
              Insertar Columna
            </button>

            <button
              type="button"
              onClick={() => setQuickAddOpen(false)}
              className="px-2 py-2 text-slate-500 hover:text-slate-700 text-xs font-bold"
            >
              ✕
            </button>
          </div>
        </form>
      )}

      {/* Empty State if no students */}
      {estudiantes.length === 0 ? (
        <div className="text-center py-12 px-4 border-2 border-dashed border-slate-200 rounded-xl">
          <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-700 mb-1">No hay estudiantes en este grupo</h3>
          <p className="text-xs text-slate-500 mb-4 max-w-md mx-auto">
            Agrega los nombres y cédulas de tus estudiantes para comenzar a registrar actividades y calificaciones.
          </p>
          <button
            onClick={onOpenEstudiantes}
            className="px-4 py-2 bg-[#0a1628] hover:bg-[#1a2a4a] text-white rounded-lg text-xs font-bold transition-colors inline-flex items-center gap-2"
          >
            <Sparkles className="w-4 h-4 text-[#c9a84c]" />
            <span>Gestionar Lista de Estudiantes</span>
          </button>
        </div>
      ) : (
        /* Tabular Dynamic Gradebook */
        <div className="overflow-x-auto rounded-xl border border-slate-200 shadow-2xs">
          <table className="w-full text-xs text-center border-collapse">
            <thead>
              <tr className="bg-[#0a1628] text-white">
                <th className="py-2.5 px-2 font-bold w-10 sticky left-0 z-20 bg-[#0a1628] border-r border-slate-700">
                  N°
                </th>
                <th className="py-2.5 px-3 font-bold text-left min-w-[200px] sticky left-10 z-20 bg-[#0a1628] border-r border-slate-700 text-[#e8d5a3]">
                  APELLIDOS Y NOMBRES
                </th>

                {/* Dynamic Activity Columns (No static daily note columns!) */}
                {actividadesTrimestre.length === 0 ? (
                  <th className="py-4 px-6 text-center text-slate-300 font-normal bg-slate-800/80 border-r border-slate-700">
                    <div className="flex items-center justify-center gap-2 text-xs">
                      <span>No hay columnas de actividades en este trimestre.</span>
                      <button
                        onClick={() => setQuickAddOpen(true)}
                        className="px-2.5 py-1 bg-[#c9a84c] text-[#0a1628] font-bold rounded hover:bg-[#d5b75b] transition-all inline-flex items-center gap-1"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Agregar Columna</span>
                      </button>
                    </div>
                  </th>
                ) : (
                  actividadesTrimestre.map((act, actIdx) => (
                    <th 
                      key={act.id} 
                      className="py-2 px-1 font-bold min-w-[95px] max-w-[125px] border-r border-slate-700 text-slate-200 group relative"
                    >
                      <div className="flex flex-col items-center justify-center">
                        <span className="text-[10px] text-[#c9a84c] font-black uppercase tracking-wider">
                          Act {actIdx + 1}
                        </span>
                        <span 
                          className="text-[11px] font-bold text-white truncate max-w-[110px] block" 
                          title={act.nombre}
                        >
                          {act.nombre}
                        </span>
                        <span className="text-[9px] px-1.5 py-0.2 bg-slate-800 text-slate-300 rounded font-normal mt-0.5">
                          {act.tipo}
                        </span>
                      </div>

                      {/* Header quick actions on hover (no-print) */}
                      <div className="hidden group-hover:flex items-center justify-center gap-1 mt-1 no-print">
                        <button
                          type="button"
                          onClick={() => {
                            const nuevo = prompt('Cambiar nombre de la actividad:', act.nombre);
                            if (nuevo && nuevo.trim()) {
                              onEditarActividad(act.id, nuevo.trim(), act.tipo);
                            }
                          }}
                          title="Renombrar actividad"
                          className="p-0.5 text-slate-400 hover:text-white"
                        >
                          <Edit3 className="w-3 h-3" />
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            if (confirm(`¿Eliminar la columna "${act.nombre}"?`)) {
                              onEliminarActividad(act.id);
                            }
                          }}
                          title="Eliminar columna"
                          className="p-0.5 text-red-400 hover:text-red-300"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </th>
                  ))
                )}

                {/* Add column quick button in table header */}
                <th className="py-2 px-2 w-10 border-r border-slate-700 bg-slate-800/60 no-print">
                  <button
                    onClick={() => setQuickAddOpen(true)}
                    title="Añadir otra columna de actividad"
                    className="w-7 h-7 rounded bg-[#c9a84c]/20 hover:bg-[#c9a84c] text-[#c9a84c] hover:text-[#0a1628] flex items-center justify-center mx-auto transition-colors font-bold"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </th>

                <th className="py-2.5 px-2 font-extrabold w-24 bg-[#1a2a4a] border-r border-slate-700 text-[#c9a84c]">
                  PROMEDIO
                </th>
                <th className="py-2.5 px-2 font-bold w-28 bg-[#1a2a4a]">
                  CONDICIÓN
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 bg-white">
              {estudiantes.map((est, idx) => {
                let suma = 0;
                let count = 0;

                actividadesTrimestre.forEach((act) => {
                  const val = notasTrimestre[`${idx}_${act.id}`];
                  if (val !== undefined && val !== null && !isNaN(val)) {
                    suma += val;
                    count++;
                  }
                });

                const promedio = count > 0 ? (suma / count).toFixed(2) : '-';
                const promNum = count > 0 ? suma / count : 0;
                const aprobado = count > 0 && promNum >= 3.0;

                return (
                  <tr key={est.id || idx} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-2 px-2 font-mono font-bold text-slate-500 sticky left-0 bg-white z-10 border-r border-slate-200">
                      {idx + 1}
                    </td>
                    <td className="py-2 px-3 text-left font-medium text-slate-800 sticky left-10 bg-white z-10 border-r border-slate-200">
                      <div className="font-semibold text-slate-800">{est.nombre}</div>
                      {est.cedula && (
                        <div className="text-[10px] text-slate-400 font-mono">{est.cedula}</div>
                      )}
                    </td>

                    {/* Render input cells for dynamic activities */}
                    {actividadesTrimestre.length === 0 ? (
                      <td className="p-2 border-r border-slate-200 text-slate-400 italic text-[11px]">
                        Sin actividades creadas
                      </td>
                    ) : (
                      actividadesTrimestre.map((act) => {
                        const val = notasTrimestre[`${idx}_${act.id}`];
                        const valDisplay = val !== undefined && val !== null ? val : '';
                        const isLow = typeof val === 'number' && val < 3.0;

                        return (
                          <td key={act.id} className="p-1 border-r border-slate-200">
                            <input
                              type="number"
                              min="1.0"
                              max="5.0"
                              step="0.1"
                              value={valDisplay}
                              onChange={(e) => {
                                const raw = e.target.value;
                                if (raw === '') {
                                  onUpdateNota(idx, act.id, null);
                                } else {
                                  const parsed = parseFloat(raw);
                                  if (!isNaN(parsed) && parsed >= 1.0 && parsed <= 5.0) {
                                    onUpdateNota(idx, act.id, parsed);
                                  }
                                }
                              }}
                              placeholder="--"
                              className={`w-12 text-center py-1 px-0.5 rounded text-xs font-mono font-bold border transition-colors ${
                                isLow
                                  ? 'bg-red-50 text-red-700 border-red-300 focus:border-red-500'
                                  : val !== undefined
                                  ? 'bg-slate-50 text-slate-800 border-slate-200 focus:border-[#c9a84c]'
                                  : 'bg-transparent text-slate-400 border-slate-200 hover:bg-slate-50'
                              } focus:outline-none focus:ring-1 focus:ring-[#c9a84c]`}
                            />
                          </td>
                        );
                      })
                    )}

                    {/* Column spacer for plus column */}
                    <td className="p-1 border-r border-slate-200 bg-slate-50/40 no-print"></td>

                    {/* Average */}
                    <td className="py-2 px-2 font-mono font-extrabold border-r border-slate-200">
                      {promedio !== '-' ? (
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded text-xs ${
                            aprobado
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                              : 'bg-red-100 text-red-800 border border-red-300'
                          }`}
                        >
                          {promedio}
                        </span>
                      ) : (
                        <span className="text-slate-400">-</span>
                      )}
                    </td>

                    {/* Condition */}
                    <td className="py-2 px-2 font-bold text-[11px]">
                      {count === 0 ? (
                        <span className="text-slate-400">Sin notas</span>
                      ) : aprobado ? (
                        <span className="text-emerald-700 flex items-center justify-center gap-1">
                          <CheckCircle className="w-3.5 h-3.5" /> Aprobado
                        </span>
                      ) : (
                        <span className="text-red-600 flex items-center justify-center gap-1">
                          <AlertCircle className="w-3.5 h-3.5" /> Reprobado
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Footer Notes */}
      <div className="mt-4 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-500 border-t border-slate-100 pt-3 gap-2">
        <div>
          📌 <em>La calificación mínima de aprobación según normativa de MEDUCA es de <strong>3.0</strong> en escala de 1.0 a 5.0.</em>
        </div>
        <div className="font-medium text-slate-600 flex items-center gap-2">
          <span>Trimestre {trimestreActual}</span>
          <span>·</span>
          <span>{actividadesTrimestre.length} columnas de actividad</span>
          <span>·</span>
          <span>{estudiantesConNota} de {estudiantes.length} evaluados</span>
        </div>
      </div>

      {/* Modal to manage activity columns */}
      <ModalGestionarActividades
        isOpen={modalActividadesOpen}
        onClose={() => setModalActividadesOpen(false)}
        trimestre={trimestreActual}
        actividades={actividadesTrimestre}
        onAgregarActividad={onAgregarActividad}
        onEditarActividad={onEditarActividad}
        onEliminarActividad={onEliminarActividad}
        onAsignarNotaMasiva={onAsignarNotaMasiva}
        onVaciarActividades={onVaciarActividades}
      />
    </div>
  );
};
