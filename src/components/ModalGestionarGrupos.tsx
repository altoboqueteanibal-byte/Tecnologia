import React, { useState } from 'react';
import { Grupo } from '../types';
import { X, Plus, Trash2, Edit3, Layers, AlertCircle } from 'lucide-react';

interface ModalGestionarGruposProps {
  grupos: Grupo[];
  grupoActualIndex: number;
  onClose: () => void;
  onSelectGrupo: (idx: number) => void;
  onAgregarGrupo: (nombre: string, grado: string) => void;
  onEditarGrupo: (idx: number, nuevoNombre: string) => void;
  onEliminarGrupo: (idx: number) => void;
}

export const ModalGestionarGrupos: React.FC<ModalGestionarGruposProps> = ({
  grupos,
  grupoActualIndex,
  onClose,
  onSelectGrupo,
  onAgregarGrupo,
  onEditarGrupo,
  onEliminarGrupo
}) => {
  const [nuevoNombre, setNuevoNombre] = useState('');
  const [nuevoGrado, setNuevoGrado] = useState('5°');
  const [editingIdx, setEditingIdx] = useState<number | null>(null);
  const [editNombreVal, setEditNombreVal] = useState('');

  const handleCrear = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nuevoNombre.trim()) return;
    if (grupos.length >= 20) {
      alert('⚠️ Se ha alcanzado el límite máximo de 20 grupos.');
      return;
    }
    onAgregarGrupo(nuevoNombre.trim(), nuevoGrado);
    setNuevoNombre('');
  };

  const handleStartEdit = (idx: number, currentName: string) => {
    setEditingIdx(idx);
    setEditNombreVal(currentName);
  };

  const handleSaveEdit = (idx: number) => {
    if (editNombreVal.trim()) {
      onEditarGrupo(idx, editNombreVal.trim());
    }
    setEditingIdx(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-xl w-full max-h-[85vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between p-4 md:p-5 border-b border-slate-200 bg-[#0a1628] text-white">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#c9a84c]/20 text-[#c9a84c] flex items-center justify-center">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold">ADMINISTRACIÓN DE GRUPOS</h2>
              <div className="text-xs text-slate-300">
                {grupos.length} de 20 grupos creados
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 md:p-6 overflow-y-auto flex-1 space-y-4">
          {/* Create new group form */}
          <form onSubmit={handleCrear} className="bg-slate-50 border border-slate-200 p-3.5 rounded-xl space-y-2.5">
            <div className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <Plus className="w-3.5 h-3.5 text-emerald-600" />
              <span>Crear Nuevo Grupo</span>
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={nuevoNombre}
                onChange={(e) => setNuevoNombre(e.target.value)}
                placeholder="Nombre del grupo (ej. 5° Grado B - Informática)"
                className="flex-1 text-xs px-3 py-2 rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-1 focus:ring-[#c9a84c]"
              />
              <select
                value={nuevoGrado}
                onChange={(e) => setNuevoGrado(e.target.value)}
                className="text-xs px-2.5 py-2 rounded-lg border border-slate-200 bg-white font-bold text-slate-700 focus:outline-none focus:ring-1 focus:ring-[#c9a84c]"
              >
                <option value="3°">3° Grado</option>
                <option value="4°">4° Grado</option>
                <option value="5°">5° Grado</option>
                <option value="6°">6° Grado</option>
                <option value="Multigrado">Multigrado</option>
              </select>
              <button
                type="submit"
                disabled={!nuevoNombre.trim()}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-colors disabled:opacity-50"
              >
                Agregar
              </button>
            </div>
          </form>

          {/* List of groups */}
          <div className="space-y-2">
            {grupos.map((grp, idx) => {
              const isSelected = idx === grupoActualIndex;
              const isEditing = editingIdx === idx;

              return (
                <div
                  key={grp.id || idx}
                  className={`p-3 rounded-xl border flex items-center justify-between gap-3 transition-colors ${
                    isSelected
                      ? 'bg-amber-50/60 border-[#c9a84c] ring-1 ring-[#c9a84c]'
                      : 'bg-white border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex-1 min-w-0">
                    {isEditing ? (
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={editNombreVal}
                          onChange={(e) => setEditNombreVal(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && handleSaveEdit(idx)}
                          className="flex-1 text-xs px-2 py-1 border border-slate-300 rounded font-semibold focus:outline-none focus:ring-1 focus:ring-[#c9a84c]"
                          autoFocus
                        />
                        <button
                          onClick={() => handleSaveEdit(idx)}
                          className="px-2.5 py-1 bg-emerald-600 text-white text-xs font-bold rounded"
                        >
                          Guardar
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs text-slate-800 truncate">
                          {grp.nombre}
                        </span>
                        <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-mono shrink-0">
                          {grp.estudiantes.length} alumnos
                        </span>
                        {isSelected && (
                          <span className="text-[10px] font-bold text-amber-800 bg-amber-200/60 px-2 py-0.5 rounded shrink-0">
                            Activo
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    {!isSelected && (
                      <button
                        onClick={() => {
                          onSelectGrupo(idx);
                          onClose();
                        }}
                        className="px-2.5 py-1 bg-[#0a1628] hover:bg-[#1a2a4a] text-white rounded text-xs font-semibold"
                      >
                        Seleccionar
                      </button>
                    )}
                    <button
                      onClick={() => handleStartEdit(idx, grp.nombre)}
                      className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded"
                      title="Editar nombre"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => onEliminarGrupo(idx)}
                      disabled={grupos.length <= 1}
                      className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded disabled:opacity-30"
                      title="Eliminar grupo"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
            <AlertCircle className="w-3.5 h-3.5 text-slate-400" />
            <span>Eliminar un grupo borrará también sus notas y asistencias registradas.</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold rounded-lg text-xs"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
