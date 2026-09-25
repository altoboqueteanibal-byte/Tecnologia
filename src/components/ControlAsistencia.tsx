import React from 'react';
import { Grupo, TipoAsistencia } from '../types';
import { ChevronLeft, ChevronRight, CheckSquare, Calendar, Users, Info } from 'lucide-react';
import { obtenerRangoSemana } from '../utils/dateUtils';

interface ControlAsistenciaProps {
  grupo: Grupo;
  trimestreActual: 1 | 2 | 3;
  semanaActual: number;
  onSelectTrimestre: (t: 1 | 2 | 3) => void;
  onChangeSemana: (delta: number) => void;
  onResetSemana: () => void;
  onUpdateAsistencia: (estudianteIdx: number, dia: number, valor: TipoAsistencia) => void;
  onMarcarTodosPresentes: () => void;
  diaInicio?: number;
  mesInicio?: number;
  anioInicio?: number;
}

const DIAS_SEMANA = ['LUNES', 'MARTES', 'MIÉRCOLES', 'JUEVES', 'VIERNES'];

export const ControlAsistencia: React.FC<ControlAsistenciaProps> = ({
  grupo,
  trimestreActual,
  semanaActual,
  onSelectTrimestre,
  onChangeSemana,
  onResetSemana,
  onUpdateAsistencia,
  onMarcarTodosPresentes,
  diaInicio = 2,
  mesInicio = 3,
  anioInicio = 2026
}) => {
  const estudiantes = grupo.estudiantes || [];
  const asistenciaData = grupo.asistencia || {};

  const rango = obtenerRangoSemana(semanaActual, anioInicio, mesInicio, diaInicio);

  // Helper to get attendance value for this specific student, week, day
  const getAsistencia = (estIdx: number, dia: number): TipoAsistencia => {
    const key = `${trimestreActual}_semana_${semanaActual}_${estIdx}_${dia}`;
    return asistenciaData[key] || 'P';
  };

  // Helper to compute overall stats for a student in this trimester across all weeks
  const calcularEstadisticasEstudiante = (estIdx: number) => {
    let ausencias = 0;
    let tardanzas = 0;
    let justificados = 0;
    let presentes = 0;

    // Scan across reasonable span of weeks (-10 to 30)
    for (let s = -5; s <= 30; s++) {
      for (let d = 0; d < 5; d++) {
        const key = `${trimestreActual}_semana_${s}_${estIdx}_${d}`;
        const val = asistenciaData[key];
        if (val) {
          if (val === 'A') ausencias++;
          else if (val === 'T') tardanzas++;
          else if (val === 'J') justificados++;
          else if (val === 'P') presentes++;
        }
      }
    }

    const totalRegistrado = presentes + ausencias + tardanzas + justificados;
    const porcentaje = totalRegistrado > 0 
      ? (((totalRegistrado - ausencias) / totalRegistrado) * 100).toFixed(1) 
      : '100.0';

    return { ausencias, tardanzas, justificados, porcentaje };
  };

  return (
    <div className="bg-white border border-[#d4c8b0] rounded-xl p-4 md:p-6 shadow-sm">
      {/* Header and Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4 pb-3 border-b border-slate-200">
        <div>
          <h2 className="text-base font-bold text-[#0a1628] flex items-center gap-2">
            <span>REGISTRO DE ASISTENCIA DIARIA</span>
            <span className="text-xs px-2 py-0.5 bg-[#c9a84c]/20 text-[#a8893a] font-semibold rounded">
              Lunes a Viernes
            </span>
          </h2>
          <p className="text-xs text-slate-500">
            Grupo: <strong className="text-slate-700">{grupo.nombre}</strong> · Control acumulado de faltas y tardanzas
          </p>
        </div>

        {/* Trimestre Selector */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl shrink-0">
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

      {/* Week Navigator and Fast Actions */}
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 mb-5 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => onChangeSemana(-1)}
            className="p-1.5 rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 transition-colors shadow-xs active:scale-95"
            title="Semana anterior"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          
          <div className="px-4 py-1.5 bg-[#0a1628] text-white rounded-lg text-xs font-bold flex items-center gap-2 border border-[#c9a84c]/40 shadow-xs">
            <Calendar className="w-3.5 h-3.5 text-[#c9a84c]" />
            <span>Semana {semanaActual + 1}</span>
            <span className="text-[#e8d5a3] font-normal">({rango.lunes} al {rango.viernes})</span>
          </div>

          <button
            onClick={() => onChangeSemana(1)}
            className="p-1.5 rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 transition-colors shadow-xs active:scale-95"
            title="Semana siguiente"
          >
            <ChevronRight className="w-4 h-4" />
          </button>

          <button
            onClick={onResetSemana}
            className="text-[11px] text-slate-500 hover:text-slate-800 underline ml-1"
          >
            Semana 1
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onMarcarTodosPresentes}
            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs active:scale-95"
            title="Marcar 'P' en toda la semana para todos los alumnos"
          >
            <CheckSquare className="w-3.5 h-3.5" />
            <span>Marcar Todos Presentes</span>
          </button>
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-2 sm:gap-4 mb-4 text-xs font-medium text-slate-700 bg-slate-50/50 p-2.5 rounded-lg border border-slate-200/80">
        <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Convención:</span>
        <span className="inline-flex items-center gap-1.5">
          <span className="w-5 h-5 rounded bg-emerald-500 text-white text-[11px] font-bold flex items-center justify-center">P</span>
          <span>Presente</span>
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="w-5 h-5 rounded bg-red-500 text-white text-[11px] font-bold flex items-center justify-center">A</span>
          <span>Ausente (Falta)</span>
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="w-5 h-5 rounded bg-amber-500 text-white text-[11px] font-bold flex items-center justify-center">T</span>
          <span>Tardanza</span>
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="w-5 h-5 rounded bg-[#c9a84c] text-[#0a1628] text-[11px] font-bold flex items-center justify-center">J</span>
          <span>Justificado</span>
        </span>
      </div>

      {/* Table */}
      {estudiantes.length === 0 ? (
        <div className="text-center py-10 border-2 border-dashed border-slate-200 rounded-xl">
          <Users className="w-10 h-10 text-slate-300 mx-auto mb-2" />
          <p className="text-xs text-slate-500">No hay estudiantes cargados en este grupo.</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-slate-200">
          <table className="w-full text-xs text-center border-collapse">
            <thead>
              <tr className="bg-[#0a1628] text-white">
                <th className="py-2.5 px-2 font-bold w-10 sticky left-0 z-20 bg-[#0a1628] border-r border-slate-700">N°</th>
                <th className="py-2.5 px-3 font-bold text-left min-w-[200px] sticky left-10 z-20 bg-[#0a1628] border-r border-slate-700 text-[#e8d5a3]">
                  ESTUDIANTE
                </th>
                {DIAS_SEMANA.map((dia) => (
                  <th key={dia} className="py-2.5 px-2 font-bold w-16 border-r border-slate-700 text-slate-200">
                    {dia}
                  </th>
                ))}
                <th className="py-2.5 px-2 font-bold w-20 bg-[#1a2a4a] border-r border-slate-700 text-red-300">
                  AUSENCIAS
                </th>
                <th className="py-2.5 px-2 font-bold w-20 bg-[#1a2a4a] border-r border-slate-700 text-amber-300">
                  TARDANZAS
                </th>
                <th className="py-2.5 px-2 font-bold w-24 bg-[#1a2a4a] text-emerald-300">
                  % ASISTENCIA
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 bg-white">
              {estudiantes.map((est, idx) => {
                const stats = calcularEstadisticasEstudiante(idx);

                return (
                  <tr key={est.id || idx} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-2 px-2 font-mono font-bold text-slate-500 sticky left-0 bg-white z-10 border-r border-slate-200">
                      {idx + 1}
                    </td>
                    <td className="py-2 px-3 text-left font-medium text-slate-800 sticky left-10 bg-white z-10 border-r border-slate-200">
                      <div>{est.nombre}</div>
                    </td>

                    {[0, 1, 2, 3, 4].map((d) => {
                      const valor = getAsistencia(idx, d);
                      const bgClass =
                        valor === 'P'
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                          : valor === 'A'
                          ? 'bg-red-50 text-red-800 border-red-300'
                          : valor === 'T'
                          ? 'bg-amber-50 text-amber-800 border-amber-300'
                          : 'bg-[#c9a84c]/20 text-[#a8893a] border-[#c9a84c]/40';

                      return (
                        <td key={d} className="p-1 border-r border-slate-200">
                          <select
                            value={valor}
                            onChange={(e) => onUpdateAsistencia(idx, d, e.target.value as TipoAsistencia)}
                            className={`w-12 py-1 px-0.5 rounded text-xs font-bold border text-center cursor-pointer transition-colors focus:outline-none focus:ring-1 focus:ring-[#c9a84c] ${bgClass}`}
                          >
                            <option value="P">P</option>
                            <option value="A">A</option>
                            <option value="T">T</option>
                            <option value="J">J</option>
                          </select>
                        </td>
                      );
                    })}

                    <td className="py-2 px-2 font-mono font-bold text-red-600 border-r border-slate-200 tabular-nums">
                      {stats.ausencias}
                    </td>
                    <td className="py-2 px-2 font-mono font-bold text-amber-600 border-r border-slate-200 tabular-nums">
                      {stats.tardanzas}
                    </td>
                    <td className="py-2 px-2 font-mono font-bold border-slate-200">
                      <span className="inline-block px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-xs">
                        {stats.porcentaje}%
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <div className="mt-4 flex items-center gap-1.5 text-xs text-slate-500">
        <Info className="w-3.5 h-3.5 text-slate-400" />
        <span>Los totales de Ausencias y Tardanzas se acumulan para el cálculo oficial del Boletín Trimestral.</span>
      </div>
    </div>
  );
};
