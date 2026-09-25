import React, { useState } from 'react';
import { Grupo, Estudiante } from '../types';
import { X, Plus, Trash2, Users, FileText, Check } from 'lucide-react';

interface ModalGestionarEstudiantesProps {
  grupo: Grupo;
  onClose: () => void;
  onAddEstudiante: () => void;
  onAddMultiplesEstudiantes: (nombres: string[]) => void;
  onUpdateEstudiante: (idx: number, campo: keyof Estudiante, valor: string) => void;
  onDeleteEstudiante: (idx: number) => void;
}

export const ModalGestionarEstudiantes: React.FC<ModalGestionarEstudiantesProps> = ({
  grupo,
  onClose,
  onAddEstudiante,
  onAddMultiplesEstudiantes,
  onUpdateEstudiante,
  onDeleteEstudiante
}) => {
  const [showMultiplesModal, setShowMultiplesModal] = useState(false);
  const [multiplesTexto, setMultiplesTexto] = useState('');

  const estudiantes = grupo.estudiantes || [];

  const handleProcesarMultiples = () => {
    if (!multiplesTexto.trim()) return;
    const lineas = multiplesTexto
      .split('\n')
      .map((l) => l.trim())
      .filter((l) => l.length > 0);

    if (lineas.length > 0) {
      onAddMultiplesEstudiantes(lineas);
      setMultiplesTexto('');
      setShowMultiplesModal(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-4xl w-full max-h-[88vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between p-4 md:p-5 border-b border-slate-200 bg-[#0a1628] text-white">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#c9a84c]/20 text-[#c9a84c] flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold">LISTA DE ESTUDIANTES · {grupo.nombre}</h2>
              <div className="text-xs text-slate-300">
                Total: <strong>{estudiantes.length}</strong> alumnos matriculados
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowMultiplesModal(true)}
              className="px-3 py-1.5 bg-[#1a2a4a] hover:bg-[#253966] text-[#e8d5a3] border border-[#c9a84c]/40 rounded-lg text-xs font-semibold flex items-center gap-1.5"
            >
              <FileText className="w-3.5 h-3.5 text-[#c9a84c]" />
              <span>Pegar Lista</span>
            </button>
            <button
              onClick={onAddEstudiante}
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Agregar Alumno</span>
            </button>
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 ml-2"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Table */}
        <div className="p-4 md:p-6 overflow-y-auto flex-1">
          {estudiantes.length === 0 ? (
            <div className="text-center py-12 border-2 border-dashed border-slate-200 rounded-xl">
              <Users className="w-12 h-12 text-slate-300 mx-auto mb-2" />
              <h3 className="text-sm font-bold text-slate-700">Sin alumnos registrados</h3>
              <p className="text-xs text-slate-500 mb-4">
                Puedes agregar estudiantes uno a uno o pegar una lista completa copiada de Excel o Word.
              </p>
              <div className="flex justify-center gap-2">
                <button
                  onClick={onAddEstudiante}
                  className="px-3.5 py-2 bg-emerald-600 text-white rounded-lg text-xs font-bold"
                >
                  ➕ Agregar Alumno
                </button>
                <button
                  onClick={() => setShowMultiplesModal(true)}
                  className="px-3.5 py-2 bg-[#0a1628] text-[#e8d5a3] rounded-lg text-xs font-bold"
                >
                  📋 Pegar Lista Completa
                </button>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-slate-200">
              <table className="w-full text-xs text-left border-collapse">
                <thead>
                  <tr className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                    <th className="py-2.5 px-3 w-10 text-center">N°</th>
                    <th className="py-2.5 px-3 min-w-[200px]">APELLIDOS Y NOMBRES</th>
                    <th className="py-2.5 px-3 min-w-[130px]">CÉDULA</th>
                    <th className="py-2.5 px-3 min-w-[170px]">ACUDIENTE / TUTOR</th>
                    <th className="py-2.5 px-3 min-w-[130px]">TELÉFONO</th>
                    <th className="py-2.5 px-3 w-12 text-center">ELIMINAR</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 bg-white">
                  {estudiantes.map((est, idx) => (
                    <tr key={est.id || idx} className="hover:bg-slate-50">
                      <td className="py-2 px-3 text-center font-mono font-bold text-slate-500">
                        {idx + 1}
                      </td>
                      <td className="py-1.5 px-2">
                        <input
                          type="text"
                          value={est.nombre}
                          onChange={(e) => onUpdateEstudiante(idx, 'nombre', e.target.value)}
                          placeholder="Nombre completo"
                          className="w-full text-xs font-semibold px-2 py-1 border border-slate-200 rounded focus:border-[#c9a84c] focus:outline-none"
                        />
                      </td>
                      <td className="py-1.5 px-2">
                        <input
                          type="text"
                          value={est.cedula || ''}
                          onChange={(e) => onUpdateEstudiante(idx, 'cedula', e.target.value)}
                          placeholder="Cédula (ej. 4-812-1402)"
                          className="w-full text-xs font-mono px-2 py-1 border border-slate-200 rounded focus:border-[#c9a84c] focus:outline-none"
                        />
                      </td>
                      <td className="py-1.5 px-2">
                        <input
                          type="text"
                          value={est.acudiente || ''}
                          onChange={(e) => onUpdateEstudiante(idx, 'acudiente', e.target.value)}
                          placeholder="Nombre del acudiente"
                          className="w-full text-xs px-2 py-1 border border-slate-200 rounded focus:border-[#c9a84c] focus:outline-none"
                        />
                      </td>
                      <td className="py-1.5 px-2">
                        <input
                          type="text"
                          value={est.telefono || ''}
                          onChange={(e) => onUpdateEstudiante(idx, 'telefono', e.target.value)}
                          placeholder="Teléfono (ej. 6712-3456)"
                          className="w-full text-xs font-mono px-2 py-1 border border-slate-200 rounded focus:border-[#c9a84c] focus:outline-none"
                        />
                      </td>
                      <td className="py-1.5 px-2 text-center">
                        <button
                          onClick={() => {
                            if (confirm(`¿Eliminar al estudiante "${est.nombre}"?`)) {
                              onDeleteEstudiante(idx);
                            }
                          }}
                          className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded"
                          title="Eliminar estudiante"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="text-xs text-slate-500">
            Los cambios se guardan automáticamente en tu registro escolar.
          </div>
          <button
            onClick={onClose}
            className="px-5 py-2 bg-[#0a1628] hover:bg-[#1a2a4a] text-white font-bold rounded-lg text-xs"
          >
            Guardar y Cerrar
          </button>
        </div>

        {/* Sub-modal to paste multiple students */}
        {showMultiplesModal && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
            <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-5 space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-[#c9a84c]" />
                  <span>Pegar Lista de Estudiantes</span>
                </h3>
                <button
                  onClick={() => setShowMultiplesModal(false)}
                  className="p-1 text-slate-400 hover:text-slate-700"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1">
                  Pega los nombres de los estudiantes (uno por línea):
                </label>
                <textarea
                  rows={8}
                  value={multiplesTexto}
                  onChange={(e) => setMultiplesTexto(e.target.value)}
                  placeholder={`Abrego, Juan&#10;Castillo, María&#10;Jiménez, Carlos&#10;Montezuma, Elena...`}
                  className="w-full text-xs p-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#c9a84c] font-mono"
                />
              </div>

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowMultiplesModal(false)}
                  className="px-3.5 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleProcesarMultiples}
                  disabled={!multiplesTexto.trim()}
                  className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold disabled:opacity-50"
                >
                  Importar Lista
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
