import React from 'react';
import { Grupo, AppConfig } from '../types';
import { Printer, CheckCircle, AlertCircle, FileText } from 'lucide-react';

interface BoletinOficialProps {
  grupo: Grupo;
  config: AppConfig;
  onImprimir: () => void;
}

export const BoletinOficial: React.FC<BoletinOficialProps> = ({
  grupo,
  config,
  onImprimir
}) => {
  const estudiantes = grupo.estudiantes || [];

  // Helper to compute average for a specific trimester
  const getPromedioTrimestre = (estIdx: number, trimestre: 1 | 2 | 3): number | null => {
    const notas = grupo.notas[trimestre] || {};
    let suma = 0;
    let count = 0;
    for (let n = 1; n <= 8; n++) {
      const val = notas[`${estIdx}_${n}`];
      if (val !== undefined && val !== null && !isNaN(val)) {
        suma += val;
        count++;
      }
    }
    return count > 0 ? suma / count : null;
  };

  // Helper to compute attendance stats for a specific trimester
  const getAsistenciaTrimestre = (estIdx: number, trimestre: 1 | 2 | 3) => {
    let aus = 0;
    let tard = 0;
    const asistencia = grupo.asistencia || {};

    for (let s = -5; s <= 30; s++) {
      for (let d = 0; d < 5; d++) {
        const val = asistencia[`${trimestre}_semana_${s}_${estIdx}_${d}`];
        if (val === 'A') aus++;
        if (val === 'T') tard++;
      }
    }
    return { aus, tard };
  };

  return (
    <div className="bg-white border border-[#d4c8b0] rounded-xl p-4 md:p-8 shadow-sm container-print">
      {/* Action Toolbar (no-print) */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6 pb-4 border-b border-slate-200 no-print">
        <div>
          <h2 className="text-base font-bold text-[#0a1628] flex items-center gap-2">
            <FileText className="w-5 h-5 text-[#c9a84c]" />
            <span>BOLETÍN CONSOLIDADO DE CALIFICACIONES Y ASISTENCIA</span>
          </h2>
          <p className="text-xs text-slate-500">
            Resumen anual oficial para actas escolares y entrega a acudientes
          </p>
        </div>

        <button
          onClick={onImprimir}
          className="px-4 py-2 bg-[#0a1628] hover:bg-[#1a2a4a] text-white rounded-lg text-xs font-bold flex items-center gap-2 transition-colors shadow-sm"
        >
          <Printer className="w-4 h-4 text-[#c9a84c]" />
          <span>Imprimir Boletín Oficial</span>
        </button>
      </div>

      {/* Official Print Header */}
      <div className="text-center mb-6 border-b-2 border-slate-800 pb-4">
        <div className="text-xs font-bold tracking-widest uppercase text-slate-700">
          {config.ministerio || 'REPÚBLICA DE PANAMÁ · MINISTERIO DE EDUCACIÓN'}
        </div>
        <div className="text-xs text-slate-600 font-medium">
          {config.regional}
        </div>
        <div className="text-lg font-black text-[#0a1628] tracking-tight mt-1">
          {config.escuela}
        </div>
        <div className="text-xs font-bold uppercase tracking-wider text-[#a8893a] mt-0.5">
          BOLETÍN ANUAL DE CALIFICACIONES Y ASISTENCIA · ASIGNATURA: {config.asignatura}
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs font-medium text-slate-700 mt-4 bg-slate-50 p-2.5 rounded-lg border border-slate-200">
          <div><strong className="text-slate-900">GRUPO:</strong> {grupo.nombre}</div>
          <div><strong className="text-slate-900">DOCENTE:</strong> {config.docente}</div>
          <div><strong className="text-slate-900">AÑO LECTIVO:</strong> {config.anio}</div>
          <div><strong className="text-slate-900">MATRÍCULA:</strong> {estudiantes.length} alumnos</div>
        </div>
      </div>

      {/* Consolidated Table */}
      {estudiantes.length === 0 ? (
        <div className="text-center py-10 text-xs text-slate-500">
          No hay estudiantes registrados en este grupo.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-center border-collapse">
            <thead>
              <tr className="bg-[#0a1628] text-white">
                <th rowSpan={2} className="py-2 px-2 font-bold w-10 border border-slate-700">N°</th>
                <th rowSpan={2} className="py-2 px-3 font-bold text-left min-w-[180px] border border-slate-700 text-[#e8d5a3]">
                  APELLIDOS Y NOMBRES
                </th>
                <th colSpan={3} className="py-1 px-2 font-bold bg-[#1a2a4a] border border-slate-700">
                  TRIMESTRE I
                </th>
                <th colSpan={3} className="py-1 px-2 font-bold bg-[#0a1628] border border-slate-700">
                  TRIMESTRE II
                </th>
                <th colSpan={3} className="py-1 px-2 font-bold bg-[#1a2a4a] border border-slate-700">
                  TRIMESTRE III
                </th>
                <th colSpan={3} className="py-1 px-2 font-bold bg-[#253966] border border-slate-700 text-[#c9a84c]">
                  TOTALES ANUALES
                </th>
                <th rowSpan={2} className="py-2 px-2 font-bold w-24 bg-[#1a2a4a] border border-slate-700">
                  ESTADO
                </th>
              </tr>
              <tr className="bg-slate-100 text-slate-800 font-bold text-[10px]">
                <th className="py-1 px-1 border border-slate-300">NOTA</th>
                <th className="py-1 px-1 border border-slate-300 text-red-700">AUS</th>
                <th className="py-1 px-1 border border-slate-300 text-amber-700">TARD</th>

                <th className="py-1 px-1 border border-slate-300">NOTA</th>
                <th className="py-1 px-1 border border-slate-300 text-red-700">AUS</th>
                <th className="py-1 px-1 border border-slate-300 text-amber-700">TARD</th>

                <th className="py-1 px-1 border border-slate-300">NOTA</th>
                <th className="py-1 px-1 border border-slate-300 text-red-700">AUS</th>
                <th className="py-1 px-1 border border-slate-300 text-amber-700">TARD</th>

                <th className="py-1 px-1 border border-slate-300 text-[#a8893a]">PROM</th>
                <th className="py-1 px-1 border border-slate-300 text-red-700">AUS</th>
                <th className="py-1 px-1 border border-slate-300 text-amber-700">TARD</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {estudiantes.map((est, idx) => {
                const t1 = getPromedioTrimestre(idx, 1);
                const t2 = getPromedioTrimestre(idx, 2);
                const t3 = getPromedioTrimestre(idx, 3);

                const ast1 = getAsistenciaTrimestre(idx, 1);
                const ast2 = getAsistenciaTrimestre(idx, 2);
                const ast3 = getAsistenciaTrimestre(idx, 3);

                let sumaPromedios = 0;
                let countTrimestres = 0;

                [t1, t2, t3].forEach((t) => {
                  if (t !== null) {
                    sumaPromedios += t;
                    countTrimestres++;
                  }
                });

                const promFinal = countTrimestres > 0 ? (sumaPromedios / countTrimestres).toFixed(2) : '-';
                const promFinalNum = countTrimestres > 0 ? sumaPromedios / countTrimestres : 0;
                const totalAusencias = ast1.aus + ast2.aus + ast3.aus;
                const totalTardanzas = ast1.tard + ast2.tard + ast3.tard;

                const aprobado = countTrimestres > 0 && promFinalNum >= 3.0;
                const reprobado = countTrimestres > 0 && promFinalNum < 3.0;

                return (
                  <tr key={est.id || idx} className="hover:bg-slate-50 transition-colors">
                    <td className="py-2 px-2 font-mono font-bold text-slate-500 border border-slate-200">
                      {idx + 1}
                    </td>
                    <td className="py-2 px-3 text-left font-medium text-slate-900 border border-slate-200">
                      <div>{est.nombre}</div>
                      {est.cedula && (
                        <div className="text-[10px] text-slate-400 font-mono">{est.cedula}</div>
                      )}
                    </td>

                    {/* T1 */}
                    <td className="py-2 px-1 font-mono font-bold border border-slate-200">
                      {t1 !== null ? t1.toFixed(2) : '-'}
                    </td>
                    <td className="py-2 px-1 font-mono text-red-600 border border-slate-200">
                      {ast1.aus}
                    </td>
                    <td className="py-2 px-1 font-mono text-amber-600 border border-slate-200">
                      {ast1.tard}
                    </td>

                    {/* T2 */}
                    <td className="py-2 px-1 font-mono font-bold border border-slate-200">
                      {t2 !== null ? t2.toFixed(2) : '-'}
                    </td>
                    <td className="py-2 px-1 font-mono text-red-600 border border-slate-200">
                      {ast2.aus}
                    </td>
                    <td className="py-2 px-1 font-mono text-amber-600 border border-slate-200">
                      {ast2.tard}
                    </td>

                    {/* T3 */}
                    <td className="py-2 px-1 font-mono font-bold border border-slate-200">
                      {t3 !== null ? t3.toFixed(2) : '-'}
                    </td>
                    <td className="py-2 px-1 font-mono text-red-600 border border-slate-200">
                      {ast3.aus}
                    </td>
                    <td className="py-2 px-1 font-mono text-amber-600 border border-slate-200">
                      {ast3.tard}
                    </td>

                    {/* Final Totals */}
                    <td className="py-2 px-1 font-mono font-extrabold text-[#a8893a] bg-amber-50/50 border border-slate-200 text-sm">
                      {promFinal}
                    </td>
                    <td className="py-2 px-1 font-mono font-bold text-red-600 bg-red-50/30 border border-slate-200">
                      {totalAusencias}
                    </td>
                    <td className="py-2 px-1 font-mono font-bold text-amber-600 bg-amber-50/30 border border-slate-200">
                      {totalTardanzas}
                    </td>

                    {/* Status */}
                    <td className="py-2 px-2 font-bold text-[11px] border border-slate-200">
                      {countTrimestres === 0 ? (
                        <span className="text-slate-400">Sin notas</span>
                      ) : aprobado ? (
                        <span className="text-emerald-700 flex items-center justify-center gap-1 font-bold">
                          <CheckCircle className="w-3.5 h-3.5" /> Aprobado
                        </span>
                      ) : (
                        <span className="text-red-600 flex items-center justify-center gap-1 font-bold">
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

      {/* Official Signatures for Printing */}
      <div className="grid grid-cols-2 gap-12 mt-12 pt-8 border-t border-slate-300 page-break-inside-avoid">
        <div className="text-center">
          <div className="border-b border-slate-800 pb-1 font-bold text-slate-800 text-xs">
            {config.docente}
          </div>
          <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mt-1">
            Firma del Docente de la Asignatura
          </div>
        </div>

        <div className="text-center">
          <div className="border-b border-slate-800 pb-1 font-bold text-slate-800 text-xs">
            _____________________________________________
          </div>
          <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mt-1">
            Firma de Dirección / Sello del Plantel
          </div>
        </div>
      </div>
    </div>
  );
};
