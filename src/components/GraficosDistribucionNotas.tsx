import React, { useState, useMemo } from 'react';
import { Grupo, ActividadEvaluacion } from '../types';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Cell, 
  ReferenceLine,
  PieChart,
  Pie,
  Legend
} from 'recharts';
import { 
  BarChart3, 
  PieChart as PieIcon, 
  TrendingUp, 
  Award, 
  AlertTriangle, 
  CheckCircle2, 
  HelpCircle,
  Activity,
  Layers,
  Sparkles
} from 'lucide-react';

interface GraficosDistribucionNotasProps {
  grupo: Grupo;
  trimestreActual: 1 | 2 | 3;
  actividadesTrimestre: ActividadEvaluacion[];
}

interface BracketData {
  rango: string;
  etiqueta: string;
  cantidad: number;
  porcentaje: number;
  color: string;
  alumnos: string[];
}

export const GraficosDistribucionNotas: React.FC<GraficosDistribucionNotasProps> = ({
  grupo,
  trimestreActual,
  actividadesTrimestre
}) => {
  const [vistaGrafico, setVistaGrafico] = useState<'histograma' | 'torta' | 'actividades'>('histograma');
  const [rangoSeleccionado, setRangoSeleccionado] = useState<string | null>(null);

  const estudiantes = grupo.estudiantes || [];
  const notasTrimestre = grupo.notas[trimestreActual] || {};

  // Process data for each student
  const { 
    promediosEstudiantes, 
    distribucionHistograma, 
    datosAprobacion, 
    promediosPorActividad, 
    estadisticas 
  } = useMemo(() => {
    const listadoPromedios: { id: string; nombre: string; promedio: number }[] = [];

    // Brackets according to MEDUCA evaluation scale
    const brackets: Record<string, { label: string; min: number; max: number; color: string; alumnos: string[] }> = {
      deficiente: { label: '1.0 - 2.9 (Reprobado)', min: 1.0, max: 2.999, color: '#ef4444', alumnos: [] },
      regular: { label: '3.0 - 3.5 (Básico)', min: 3.0, max: 3.599, color: '#f59e0b', alumnos: [] },
      bueno: { label: '3.6 - 4.0 (Bueno)', min: 3.6, max: 4.099, color: '#3b82f6', alumnos: [] },
      muyBueno: { label: '4.1 - 4.5 (Muy Bueno)', min: 4.1, max: 4.599, color: '#10b981', alumnos: [] },
      excelente: { label: '4.6 - 5.0 (Excelente)', min: 4.6, max: 5.0, color: '#c9a84c', alumnos: [] }
    };

    let totalSumaPromedios = 0;
    let notaMaxima = -Infinity;
    let notaMinima = Infinity;
    let mejorEstudiante = '';
    let estudianteBajo = '';
    let aprobados = 0;
    let reprobados = 0;

    estudiantes.forEach((est, idx) => {
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
        const prom = Math.round((suma / count) * 10) / 10;
        listadoPromedios.push({ id: est.id, nombre: est.nombre, promedio: prom });
        totalSumaPromedios += prom;

        if (prom > notaMaxima) {
          notaMaxima = prom;
          mejorEstudiante = est.nombre;
        }
        if (prom < notaMinima) {
          notaMinima = prom;
          estudianteBajo = est.nombre;
        }

        if (prom >= 3.0) {
          aprobados++;
        } else {
          reprobados++;
        }

        // Assign to histogram bracket
        if (prom < 3.0) {
          brackets.deficiente.alumnos.push(`${est.nombre} (${prom.toFixed(1)})`);
        } else if (prom <= 3.5) {
          brackets.regular.alumnos.push(`${est.nombre} (${prom.toFixed(1)})`);
        } else if (prom <= 4.0) {
          brackets.bueno.alumnos.push(`${est.nombre} (${prom.toFixed(1)})`);
        } else if (prom <= 4.5) {
          brackets.muyBueno.alumnos.push(`${est.nombre} (${prom.toFixed(1)})`);
        } else {
          brackets.excelente.alumnos.push(`${est.nombre} (${prom.toFixed(1)})`);
        }
      }
    });

    const totalEvaluados = listadoPromedios.length;
    const sinEvaluar = estudiantes.length - totalEvaluados;

    // Build histogram array
    const histogramData: BracketData[] = Object.keys(brackets).map((key) => {
      const b = brackets[key];
      const count = b.alumnos.length;
      return {
        rango: key,
        etiqueta: b.label,
        cantidad: count,
        porcentaje: totalEvaluados > 0 ? Math.round((count / totalEvaluados) * 100) : 0,
        color: b.color,
        alumnos: b.alumnos
      };
    });

    // Build pie chart data for approval condition
    const pieData = [
      { name: 'Aprobados (≥ 3.0)', value: aprobados, color: '#10b981' },
      { name: 'Reprobados (< 3.0)', value: reprobados, color: '#ef4444' }
    ];
    if (sinEvaluar > 0) {
      pieData.push({ name: 'Sin Notas', value: sinEvaluar, color: '#94a3b8' });
    }

    // Build average per activity
    const activityData = actividadesTrimestre.map((act) => {
      let suma = 0;
      let count = 0;
      estudiantes.forEach((_, idx) => {
        const val = notasTrimestre[`${idx}_${act.id}`];
        if (val !== undefined && val !== null && !isNaN(val)) {
          suma += val;
          count++;
        }
      });
      const prom = count > 0 ? parseFloat((suma / count).toFixed(2)) : 0;
      return {
        id: act.id,
        nombre: act.nombre.length > 20 ? act.nombre.slice(0, 18) + '...' : act.nombre,
        nombreCompleto: act.nombre,
        tipo: act.tipo,
        promedio: prom,
        evaluados: count,
        color: prom >= 3.0 ? '#3b82f6' : '#ef4444'
      };
    });

    return {
      promediosEstudiantes: listadoPromedios,
      distribucionHistograma: histogramData,
      datosAprobacion: pieData,
      promediosPorActividad: activityData,
      estadisticas: {
        totalEvaluados,
        sinEvaluar,
        promedioGeneral: totalEvaluados > 0 ? (totalSumaPromedios / totalEvaluados).toFixed(2) : '0.0',
        notaMaxima: notaMaxima !== -Infinity ? notaMaxima.toFixed(1) : '-',
        notaMinima: notaMinima !== Infinity ? notaMinima.toFixed(1) : '-',
        mejorEstudiante,
        estudianteBajo,
        tasaAprobacion: totalEvaluados > 0 ? Math.round((aprobados / totalEvaluados) * 100) : 0
      }
    };
  }, [estudiantes, notasTrimestre, actividadesTrimestre, trimestreActual]);

  const activeBracket = distribucionHistograma.find((b) => b.rango === rangoSeleccionado);

  return (
    <div className="bg-slate-50/80 border border-slate-200 rounded-2xl p-4 md:p-6 mb-6 shadow-xs animate-in fade-in duration-200">
      {/* Header and View Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200 mb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-[#0a1628] text-[#c9a84c] flex items-center justify-center shadow-xs">
            <BarChart3 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-extrabold text-[#0a1628] flex items-center gap-2">
              <span>Distribución y Análisis de Calificaciones</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#c9a84c]/20 text-[#96762f] font-mono font-bold">
                Trimestre {trimestreActual}
              </span>
            </h3>
            <p className="text-[11px] text-slate-500">
              Histograma de rendimiento y métricas oficiales del grupo <strong>{grupo.nombre}</strong>
            </p>
          </div>
        </div>

        {/* View Switcher Buttons */}
        <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-slate-200 shadow-2xs self-start sm:self-auto">
          <button
            onClick={() => setVistaGrafico('histograma')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
              vistaGrafico === 'histograma'
                ? 'bg-[#0a1628] text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5 text-[#c9a84c]" />
            <span>Histograma</span>
          </button>

          <button
            onClick={() => setVistaGrafico('torta')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
              vistaGrafico === 'torta'
                ? 'bg-[#0a1628] text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <PieIcon className="w-3.5 h-3.5 text-emerald-400" />
            <span>Aprobación</span>
          </button>

          {actividadesTrimestre.length > 0 && (
            <button
              onClick={() => setVistaGrafico('actividades')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
                vistaGrafico === 'actividades'
                  ? 'bg-[#0a1628] text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Activity className="w-3.5 h-3.5 text-blue-400" />
              <span>Por Actividad</span>
            </button>
          )}
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-5">
        <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center font-bold text-xs shrink-0">
            <TrendingUp className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <span className="text-[10px] uppercase font-bold text-slate-400 block truncate">Promedio General</span>
            <span className="text-base font-extrabold text-slate-800 font-mono">
              {estadisticas.promedioGeneral}
            </span>
          </div>
        </div>

        <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-xs shrink-0">
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <span className="text-[10px] uppercase font-bold text-slate-400 block truncate">Tasa Aprobación</span>
            <span className="text-base font-extrabold text-emerald-600 font-mono">
              {estadisticas.tasaAprobacion}%
            </span>
          </div>
        </div>

        <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#c9a84c]/20 text-[#a8893a] flex items-center justify-center font-bold text-xs shrink-0">
            <Award className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <span className="text-[10px] uppercase font-bold text-slate-400 block truncate">Nota Máxima</span>
            <span className="text-base font-extrabold text-slate-800 font-mono">
              {estadisticas.notaMaxima}
            </span>
          </div>
        </div>

        <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-red-50 text-red-600 flex items-center justify-center font-bold text-xs shrink-0">
            <AlertTriangle className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <span className="text-[10px] uppercase font-bold text-slate-400 block truncate">Nota Mínima</span>
            <span className="text-base font-extrabold text-red-600 font-mono">
              {estadisticas.notaMinima}
            </span>
          </div>
        </div>
      </div>

      {/* Main Charts Area */}
      {estadisticas.totalEvaluados === 0 ? (
        <div className="bg-white border border-dashed border-slate-300 rounded-xl p-8 text-center">
          <HelpCircle className="w-10 h-10 text-slate-300 mx-auto mb-2" />
          <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Aún no hay calificaciones en este trimestre</h4>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
            Ingresa las notas de los estudiantes en la tabla inferior para generar automáticamente el histograma y las estadísticas visuales.
          </p>
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs">
          {/* 1. HISTOGRAM VIEW */}
          {vistaGrafico === 'histograma' && (
            <div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                <span className="text-xs font-bold text-slate-700">
                  Histograma de Frecuencia por Rango de Rendimiento (Escala MEDUCA 1.0 - 5.0)
                </span>
                <span className="text-[11px] text-slate-500">
                  Total Evaluados: <strong>{estadisticas.totalEvaluados}</strong> de {estudiantes.length}
                </span>
              </div>

              <div className="h-64 sm:h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart 
                    data={distribucionHistograma} 
                    margin={{ top: 15, right: 15, left: -10, bottom: 25 }}
                    onClick={(state: any) => {
                      if (state && state.activePayload && state.activePayload[0]) {
                        const payload = state.activePayload[0].payload as BracketData;
                        setRangoSeleccionado((prev) => prev === payload.rango ? null : payload.rango);
                      }
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis 
                      dataKey="etiqueta" 
                      tick={{ fontSize: 11, fill: '#64748b' }} 
                      interval={0}
                      angle={-10}
                      textAnchor="end"
                    />
                    <YAxis 
                      allowDecimals={false} 
                      tick={{ fontSize: 11, fill: '#64748b' }}
                      label={{ value: 'N° Alumnos', angle: -90, position: 'insideLeft', fontSize: 10, fill: '#94a3b8' }}
                    />
                    <Tooltip 
                      cursor={{ fill: 'rgba(201, 168, 76, 0.08)' }}
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0].payload as BracketData;
                          return (
                            <div className="bg-slate-900 text-white p-3 rounded-xl shadow-xl text-xs border border-slate-700 max-w-xs">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: data.color }} />
                                <span className="font-extrabold text-sm">{data.etiqueta}</span>
                              </div>
                              <div className="text-slate-300 mb-2">
                                Cantidad: <strong>{data.cantidad}</strong> alumnos ({data.porcentaje}%)
                              </div>
                              {data.alumnos.length > 0 && (
                                <div className="border-t border-slate-800 pt-1.5 mt-1">
                                  <span className="text-[10px] text-slate-400 uppercase font-bold block mb-1">
                                    Estudiantes en este rango:
                                  </span>
                                  <div className="max-h-28 overflow-y-auto space-y-0.5 text-[11px] text-slate-200">
                                    {data.alumnos.map((a, i) => (
                                      <div key={i} className="truncate">• {a}</div>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Bar dataKey="cantidad" radius={[6, 6, 0, 0]} cursor="pointer">
                      {distribucionHistograma.map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={entry.color} 
                          opacity={rangoSeleccionado && rangoSeleccionado !== entry.rango ? 0.35 : 1}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Interactive Inspector of students in selected bracket */}
              {activeBracket && (
                <div className="mt-3 p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs animate-in fade-in">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-slate-800 flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: activeBracket.color }} />
                      Detalle: {activeBracket.etiqueta} ({activeBracket.cantidad} alumnos)
                    </span>
                    <button
                      onClick={() => setRangoSeleccionado(null)}
                      className="text-[11px] text-slate-400 hover:text-slate-700 underline font-medium"
                    >
                      Cerrar detalle
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {activeBracket.alumnos.map((nom, i) => (
                      <span key={i} className="px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-700 text-[11px] font-medium shadow-2xs">
                        {nom}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 2. PIE CHART VIEW */}
          {vistaGrafico === 'torta' && (
            <div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                <span className="text-xs font-bold text-slate-700">
                  Proporción de Aprobados vs Reprobados (Mínimo aprobatorio: 3.0)
                </span>
                <span className="text-[11px] text-slate-500">
                  Total Estudiantes: <strong>{estudiantes.length}</strong>
                </span>
              </div>

              <div className="h-64 sm:h-72 w-full flex flex-col sm:flex-row items-center justify-center">
                <div className="w-full sm:w-1/2 h-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={datosAprobacion}
                        cx="50%"
                        cy="50%"
                        innerRadius={55}
                        outerRadius={85}
                        paddingAngle={3}
                        dataKey="value"
                      >
                        {datosAprobacion.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip 
                        content={({ active, payload }) => {
                          if (active && payload && payload.length) {
                            const data = payload[0];
                            const pct = estudiantes.length > 0 ? Math.round(((data.value as number) / estudiantes.length) * 100) : 0;
                            return (
                              <div className="bg-slate-900 text-white p-2.5 rounded-xl shadow-lg text-xs border border-slate-700">
                                <div className="font-bold">{data.name}</div>
                                <div className="text-slate-300">
                                  {data.value} alumnos ({pct}%)
                                </div>
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                <div className="w-full sm:w-1/2 space-y-2 px-4 py-2">
                  {datosAprobacion.map((item, idx) => {
                    const pct = estudiantes.length > 0 ? Math.round((item.value / estudiantes.length) * 100) : 0;
                    return (
                      <div key={idx} className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-100 text-xs">
                        <div className="flex items-center gap-2">
                          <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                          <span className="font-semibold text-slate-700">{item.name}</span>
                        </div>
                        <div className="font-mono font-extrabold text-slate-800">
                          {item.value} <span className="text-[10px] text-slate-400 font-normal">({pct}%)</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* 3. ACTIVITY AVERAGE VIEW */}
          {vistaGrafico === 'actividades' && (
            <div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                <span className="text-xs font-bold text-slate-700">
                  Promedio Grupal Obtenido por Columna de Evaluación
                </span>
                <span className="text-[11px] text-slate-500">
                  Línea roja discontinua = Mínimo de Aprobación (3.0)
                </span>
              </div>

              <div className="h-64 sm:h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={promediosPorActividad} margin={{ top: 15, right: 15, left: -10, bottom: 25 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis 
                      dataKey="nombre" 
                      tick={{ fontSize: 11, fill: '#64748b' }} 
                      interval={0}
                      angle={-10}
                      textAnchor="end"
                    />
                    <YAxis 
                      domain={[1.0, 5.0]} 
                      ticks={[1.0, 2.0, 3.0, 4.0, 5.0]}
                      tick={{ fontSize: 11, fill: '#64748b' }}
                      label={{ value: 'Nota Promedio', angle: -90, position: 'insideLeft', fontSize: 10, fill: '#94a3b8' }}
                    />
                    <ReferenceLine y={3.0} stroke="#ef4444" strokeDasharray="4 4" label={{ value: 'Aprobación (3.0)', fill: '#ef4444', fontSize: 10, position: 'top' }} />
                    <Tooltip 
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0].payload;
                          return (
                            <div className="bg-slate-900 text-white p-3 rounded-xl shadow-xl text-xs border border-slate-700">
                              <div className="font-extrabold text-sm text-[#e8d5a3]">{data.nombreCompleto}</div>
                              <div className="text-[11px] text-slate-400 mb-1">Tipo: {data.tipo}</div>
                              <div className="text-slate-200">
                                Promedio Grupal: <strong className="font-mono text-[#c9a84c] text-sm">{data.promedio}</strong>
                              </div>
                              <div className="text-[10px] text-slate-400 mt-1">
                                Estudiantes calificados: {data.evaluados} de {estudiantes.length}
                              </div>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Bar dataKey="promedio" radius={[6, 6, 0, 0]}>
                      {promediosPorActividad.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.promedio >= 3.0 ? '#3b82f6' : '#ef4444'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
