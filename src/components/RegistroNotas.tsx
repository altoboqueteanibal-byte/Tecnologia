import React from 'react';
import { Grupo } from '../types';
import { Award, Users, TrendingUp, AlertCircle, CheckCircle, Sparkles } from 'lucide-react';

interface RegistroNotasProps {
  grupo: Grupo;
  trimestreActual: 1 | 2 | 3;
  onSelectTrimestre: (t: 1 | 2 | 3) => void;
  onUpdateNota: (estudianteIdx: number, notaNum: number, valor: number | null) => void;
  onOpenEstudiantes: () => void;
}

export const RegistroNotas: React.FC<RegistroNotasProps> = ({
  grupo,
  trimestreActual,
  onSelectTrimestre,
  onUpdateNota,
  onOpenEstudiantes
}) => {
  const estudiantes = grupo.estudiantes || [];
  const notasTrimestre = grupo.notas[trimestreActual] || {};

  // Calculate statistics
  let sumaPromedios = 0;
  let estudiantesConNota = 0;
  let aprobados = 0;
  let reprobados = 0;

  estudiantes.forEach((_, idx) => {
    let suma = 0;
    let count = 0;
    for (let n = 1; n <= 8; n++) {
      const val = notasTrimestre[`${idx}_${n}`];
      if (val !== undefined && val !== null && !isNaN(val)) {
        suma += val;
        count++;
      }
    }
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

  return (
    <div className="bg-white border border-[#d4c8b0] rounded-xl p-4 md:p-6 shadow-sm">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-5 gap-3 mb-6 no-print">
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Estudiantes</div>
            <div className="text-xl font-extrabold text-slate-800 tabular-nums">{estudiantes.length}</div>
          </div>
        </div>

        <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Promedio T{trimestreActual}</div>
            <div className="text-xl font-extrabold text-[#a8893a] tabular-nums">{promedioGeneral}</div>
          </div>
        </div>

        <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
            <CheckCircle className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Aprobados (≥ 3.0)</div>
            <div className="text-xl font-extrabold text-emerald-700 tabular-nums">{aprobados}</div>
          </div>
        </div>

        <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-red-100 text-red-700 flex items-center justify-center shrink-0">
            <AlertCircle className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Reprobados (&lt; 3.0)</div>
            <div className="text-xl font-extrabold text-red-600 tabular-nums">{reprobados}</div>
          </div>
        </div>

        <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 flex items-center gap-3 col-span-2 md:col-span-1">
          <div className="w-10 h-10 rounded-lg bg-[#c9a84c]/20 text-[#a8893a] flex items-center justify-center shrink-0">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500">% Aprobación</div>
            <div className="text-xl font-extrabold text-slate-800 tabular-nums">{porcentajeAprobacion}%</div>
          </div>
        </div>
      </div>

      {/* Header Bar and Sub-tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-3 border-b border-slate-200 no-print">
        <div>
          <h2 className="text-base font-bold text-[#0a1628] flex items-center gap-2">
            <span>REGISTRO DE CALIFICACIONES</span>
            <span className="text-xs px-2 py-0.5 bg-[#c9a84c]/20 text-[#a8893a] font-semibold rounded">
              Escala Oficial 1.0 - 5.0
            </span>
          </h2>
          <p className="text-xs text-slate-500">
            Grupo: <strong className="text-slate-700">{grupo.nombre}</strong> · Evaluaciones parciales (N1 a N8)
          </p>
        </div>

        {/* Trimestre Selector */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
          {([1, 2, 3] as const).map((t) => (
            <button
              key={t}
              onClick={() => onSelectTrimestre(t)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
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

      {/* Empty State if no students */}
      {estudiantes.length === 0 ? (
        <div className="text-center py-12 px-4 border-2 border-dashed border-slate-200 rounded-xl">
          <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-700 mb-1">No hay estudiantes en este grupo</h3>
          <p className="text-xs text-slate-500 mb-4 max-w-md mx-auto">
            Agrega los nombres y cédulas de tus estudiantes para comenzar a registrar calificaciones de este trimestre.
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
        /* Tabular Gradebook */
        <div className="overflow-x-auto rounded-xl border border-slate-200">
          <table className="w-full text-xs text-center border-collapse">
            <thead>
              <tr className="bg-[#0a1628] text-white">
                <th className="py-2.5 px-2 font-bold w-10 sticky left-0 z-20 bg-[#0a1628] border-r border-slate-700">N°</th>
                <th className="py-2.5 px-3 font-bold text-left min-w-[200px] sticky left-10 z-20 bg-[#0a1628] border-r border-slate-700 text-[#e8d5a3]">
                  APELLIDOS Y NOMBRES
                </th>
                {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
                  <th key={n} className="py-2.5 px-1.5 font-bold w-12 border-r border-slate-700 text-slate-200">
                    N{n}
                  </th>
                ))}
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

                for (let n = 1; n <= 8; n++) {
                  const val = notasTrimestre[`${idx}_${n}`];
                  if (val !== undefined && val !== null && !isNaN(val)) {
                    suma += val;
                    count++;
                  }
                }

                const promedio = count > 0 ? (suma / count).toFixed(2) : '-';
                const promNum = count > 0 ? suma / count : 0;
                const aprobado = count > 0 && promNum >= 3.0;
                const reprobado = count > 0 && promNum < 3.0;

                return (
                  <tr key={est.id || idx} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-2 px-2 font-mono font-bold text-slate-500 sticky left-0 bg-white z-10 border-r border-slate-200">
                      {idx + 1}
                    </td>
                    <td className="py-2 px-3 text-left font-medium text-slate-800 sticky left-10 bg-white z-10 border-r border-slate-200">
                      <div>{est.nombre}</div>
                      {est.cedula && (
                        <div className="text-[10px] text-slate-400 font-mono">{est.cedula}</div>
                      )}
                    </td>

                    {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => {
                      const val = notasTrimestre[`${idx}_${n}`];
                      const valDisplay = val !== undefined && val !== null ? val : '';
                      const isLow = typeof val === 'number' && val < 3.0;

                      return (
                        <td key={n} className="p-1 border-r border-slate-200">
                          <input
                            type="number"
                            min="1.0"
                            max="5.0"
                            step="0.1"
                            value={valDisplay}
                            onChange={(e) => {
                              const raw = e.target.value;
                              if (raw === '') {
                                onUpdateNota(idx, n, null);
                              } else {
                                const parsed = parseFloat(raw);
                                if (!isNaN(parsed) && parsed >= 1.0 && parsed <= 5.0) {
                                  onUpdateNota(idx, n, parsed);
                                }
                              }
                            }}
                            placeholder="--"
                            className={`w-11 text-center py-1 px-0.5 rounded text-xs font-mono font-bold border transition-colors ${
                              isLow
                                ? 'bg-red-50 text-red-700 border-red-300 focus:border-red-500'
                                : val !== undefined
                                ? 'bg-slate-50 text-slate-800 border-slate-200 focus:border-[#c9a84c]'
                                : 'bg-transparent text-slate-400 border-slate-200 hover:bg-slate-50'
                            } focus:outline-none focus:ring-1 focus:ring-[#c9a84c]`}
                          />
                        </td>
                      );
                    })}

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
      <div className="mt-4 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-500 border-t border-slate-100 pt-3">
        <div>
          📌 <em>La calificación mínima de aprobación según normativa de MEDUCA es de <strong>3.0</strong> en escala de 1.0 a 5.0.</em>
        </div>
        <div className="font-medium text-slate-600">
          Trimestre {trimestreActual} · {estudiantesConNota} de {estudiantes.length} evaluados
        </div>
      </div>
    </div>
  );
};
