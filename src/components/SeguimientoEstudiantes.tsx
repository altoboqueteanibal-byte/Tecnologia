import React, { useState, useMemo } from 'react';
import { Grupo, Estudiante, RegistroSeguimiento, CategoriaSeguimiento, AppConfig } from '../types';
import { 
  UserCheck, 
  AlertTriangle, 
  CheckCircle, 
  Search, 
  Plus, 
  FileText, 
  Printer, 
  MessageSquare, 
  Trash2, 
  Calendar, 
  Award, 
  BookOpen, 
  X
} from 'lucide-react';

interface SeguimientoEstudiantesProps {
  grupo: Grupo;
  config: AppConfig;
  onUpdateEstudiante: (estudianteId: string, updated: Partial<Estudiante>) => void;
  trimestreActual?: 1 | 2 | 3;
}

export const SeguimientoEstudiantes: React.FC<SeguimientoEstudiantesProps> = ({
  grupo,
  config,
  onUpdateEstudiante
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filtroCategoria, setFiltroCategoria] = useState<'todos' | 'riesgo' | 'observaciones' | 'sobresalientes'>('todos');
  const [estudianteSeleccionado, setEstudianteSeleccionado] = useState<Estudiante | null>(null);
  const [modalBitacoraOpen, setModalBitacoraOpen] = useState(false);

  // Form state for new observation
  const [nuevaCat, setNuevaCat] = useState<CategoriaSeguimiento>('Participación');
  const [nuevoDetalle, setNuevoDetalle] = useState('');
  const [nuevaFecha, setNuevaFecha] = useState(() => new Date().toISOString().split('T')[0]);

  const estudiantes = grupo.estudiantes || [];

  // Helper to calculate average for an individual student for a trimester
  const calcularPromedioEstudiante = (estIdx: number, trim: 1 | 2 | 3): number | null => {
    const notasTrim = grupo.notas[trim] || {};
    const actividades = grupo.actividades?.[trim] || [];
    let suma = 0;
    let count = 0;

    if (actividades.length > 0) {
      actividades.forEach(act => {
        const val = notasTrim[`${estIdx}_${act.id}`];
        if (val !== undefined && val !== null && !isNaN(val)) {
          suma += val;
          count++;
        }
      });
    } else {
      // Check legacy or direct keys
      Object.keys(notasTrim).forEach(k => {
        if (k.startsWith(`${estIdx}_`)) {
          const val = notasTrim[k];
          if (val !== undefined && val !== null && !isNaN(val)) {
            suma += val;
            count++;
          }
        }
      });
    }

    if (count === 0) return null;
    return parseFloat((suma / count).toFixed(1));
  };

  // Helper to calculate general average across trimesters
  const calcularPromedioGeneral = (estIdx: number): number | null => {
    const p1 = calcularPromedioEstudiante(estIdx, 1);
    const p2 = calcularPromedioEstudiante(estIdx, 2);
    const p3 = calcularPromedioEstudiante(estIdx, 3);
    const validos = [p1, p2, p3].filter((p): p is number => p !== null);
    if (validos.length === 0) return null;
    const sum = validos.reduce((a, b) => a + b, 0);
    return parseFloat((sum / validos.length).toFixed(1));
  };

  // Helper to calculate attendance stats
  const calcularAsistencia = (estIdx: number) => {
    const asistencia = grupo.asistencia || {};
    let p = 0, a = 0, t = 0, j = 0;

    Object.keys(asistencia).forEach(key => {
      // key format: `${trimestre}_semana_${semana}_${estudianteIdx}_${dia}`
      const parts = key.split('_');
      if (parts.length >= 5 && parseInt(parts[3], 10) === estIdx) {
        const val = asistencia[key];
        if (val === 'P') p++;
        else if (val === 'A') a++;
        else if (val === 'T') t++;
        else if (val === 'J') j++;
      }
    });

    const totalRegistros = p + a + t + j;
    const porcentaje = totalRegistros > 0 ? Math.round(((p + j + t * 0.5) / totalRegistros) * 100) : 100;
    return { p, a, t, j, totalRegistros, porcentaje };
  };

  // Computed students list with metrics
  const estudiantesProcesados = useMemo(() => {
    return estudiantes.map((est, idx) => {
      const prom1 = calcularPromedioEstudiante(idx, 1);
      const prom2 = calcularPromedioEstudiante(idx, 2);
      const prom3 = calcularPromedioEstudiante(idx, 3);
      const promGen = calcularPromedioGeneral(idx);
      const asistencia = calcularAsistencia(idx);
      const bitacora = est.bitacora || [];

      // Risk status determination:
      // Red: prom < 3.0 or attendance < 70%
      // Yellow: prom 3.0 - 3.7
      // Blue: prom 3.8 - 4.4
      // Green: prom >= 4.5
      let estadoRiesgo: 'rojo' | 'amarillo' | 'azul' | 'verde' | 'sin_evaluar' = 'sin_evaluar';
      const refProm = promGen !== null ? promGen : prom1;
      if (refProm !== null) {
        if (refProm < 3.0 || asistencia.porcentaje < 70) estadoRiesgo = 'rojo';
        else if (refProm < 3.8) estadoRiesgo = 'amarillo';
        else if (refProm < 4.5) estadoRiesgo = 'azul';
        else estadoRiesgo = 'verde';
      }

      return {
        ...est,
        originalIndex: idx,
        prom1,
        prom2,
        prom3,
        promGen,
        asistencia,
        bitacora,
        estadoRiesgo
      };
    });
  }, [estudiantes, grupo.notas, grupo.actividades, grupo.asistencia]);

  // Overall Group Stats
  const stats = useMemo(() => {
    const total = estudiantesProcesados.length;
    let enRiesgo = 0;
    let sobresalientes = 0;
    let conObservaciones = 0;

    estudiantesProcesados.forEach(e => {
      if (e.estadoRiesgo === 'rojo') enRiesgo++;
      if (e.estadoRiesgo === 'verde') sobresalientes++;
      if (e.bitacora.length > 0) conObservaciones++;
    });

    return { total, enRiesgo, sobresalientes, conObservaciones };
  }, [estudiantesProcesados]);

  // Filtered List
  const estudiantesFiltrados = useMemo(() => {
    return estudiantesProcesados.filter(e => {
      const matchSearch = e.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          e.cedula.toLowerCase().includes(searchTerm.toLowerCase());
      if (!matchSearch) return false;

      if (filtroCategoria === 'riesgo') return e.estadoRiesgo === 'rojo';
      if (filtroCategoria === 'sobresalientes') return e.estadoRiesgo === 'verde';
      if (filtroCategoria === 'observaciones') return e.bitacora.length > 0;
      return true;
    });
  }, [estudiantesProcesados, searchTerm, filtroCategoria]);

  // Handlers for Observations
  const handleGuardarObservacion = () => {
    if (!estudianteSeleccionado || !nuevoDetalle.trim()) return;

    const nuevaObs: RegistroSeguimiento = {
      id: `obs-${Date.now()}`,
      fecha: nuevaFecha,
      categoria: nuevaCat,
      descripcion: nuevoDetalle.trim(),
      docente: config.docente
    };

    const bitacoraActual = estudianteSeleccionado.bitacora || [];
    const bitacoraActualizada = [nuevaObs, ...bitacoraActual];

    onUpdateEstudiante(estudianteSeleccionado.id, {
      bitacora: bitacoraActualizada
    });

    // Update selected student local modal state
    setEstudianteSeleccionado({
      ...estudianteSeleccionado,
      bitacora: bitacoraActualizada
    });

    setNuevoDetalle('');
  };

  const handleEliminarObservacion = (obsId: string) => {
    if (!estudianteSeleccionado) return;
    const bitacoraActual = estudianteSeleccionado.bitacora || [];
    const bitacoraActualizada = bitacoraActual.filter(o => o.id !== obsId);

    onUpdateEstudiante(estudianteSeleccionado.id, {
      bitacora: bitacoraActualizada
    });

    setEstudianteSeleccionado({
      ...estudianteSeleccionado,
      bitacora: bitacoraActualizada
    });
  };

  const handleImprimirFicha = (est: Estudiante) => {
    setEstudianteSeleccionado(est);
    setTimeout(() => {
      window.print();
    }, 200);
  };

  // WhatsApp Link Builder for Citación / Notificación
  const generarEnlaceWhatsApp = (est: Estudiante) => {
    const telefono = est.telefono.replace(/[^0-9]/g, '');
    const numFinal = telefono.length === 8 ? `507${telefono}` : telefono;
    const msg = encodeURIComponent(
      `Estimado(a) ${est.acudiente || 'Acudiente'}, le saluda el Prof. ${config.docente} de ${config.escuela}. Le escribo respecto al seguimiento académico de ${est.nombre} en la asignatura de ${config.asignatura}. Quedo atento a su comunicación.`
    );
    return `https://wa.me/${numFinal}?text=${msg}`;
  };

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-black text-slate-800 flex items-center gap-2">
              <UserCheck className="w-5 h-5 text-[#c9a84c]" />
              SEGUIMIENTO Y BITÁCORA INTEGRAL DE ESTUDIANTES
            </h2>
            <p className="text-xs text-slate-500">
              Monitoreo continuo del rendimiento, alertas tempranas, asistencia acumulada y registro conductual para <strong className="text-slate-700">{grupo.nombre}</strong>.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-600 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200">
              Año Escolar {config.anio} • MEDUCA
            </span>
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5">
          <div className="bg-slate-50 rounded-lg p-3 border border-slate-200">
            <span className="text-[11px] font-bold text-slate-500 uppercase block">Total Matrícula</span>
            <span className="text-xl font-black text-slate-800">{stats.total}</span>
            <span className="text-[10px] text-slate-400 block">Estudiantes en lista</span>
          </div>

          <div className="bg-rose-50 rounded-lg p-3 border border-rose-200">
            <span className="text-[11px] font-bold text-rose-700 uppercase block flex items-center gap-1">
              <AlertTriangle className="w-3.5 h-3.5" /> En Riesgo (&lt; 3.0)
            </span>
            <span className="text-xl font-black text-rose-700">{stats.enRiesgo}</span>
            <span className="text-[10px] text-rose-500 block">Requieren apoyo prioritario</span>
          </div>

          <div className="bg-emerald-50 rounded-lg p-3 border border-emerald-200">
            <span className="text-[11px] font-bold text-emerald-700 uppercase block flex items-center gap-1">
              <Award className="w-3.5 h-3.5" /> Sobresalientes (≥ 4.5)
            </span>
            <span className="text-xl font-black text-emerald-700">{stats.sobresalientes}</span>
            <span className="text-[10px] text-emerald-600 block">Desempeño destacado</span>
          </div>

          <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
            <span className="text-[11px] font-bold text-blue-700 uppercase block flex items-center gap-1">
              <FileText className="w-3.5 h-3.5" /> Con Bitácora Activa
            </span>
            <span className="text-xl font-black text-blue-700">{stats.conObservaciones}</span>
            <span className="text-[10px] text-blue-500 block">Incidencias o acuerdos</span>
          </div>
        </div>
      </div>

      {/* Filters and Search Bar */}
      <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar por nombre o cédula..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-300 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          {/* Filter Buttons */}
          <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto">
            <button
              onClick={() => setFiltroCategoria('todos')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${
                filtroCategoria === 'todos'
                  ? 'bg-[#0a1628] text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Todos ({stats.total})
            </button>
            <button
              onClick={() => setFiltroCategoria('riesgo')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${
                filtroCategoria === 'riesgo'
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'bg-rose-50 text-rose-700 hover:bg-rose-100'
              }`}
            >
              En Riesgo ({stats.enRiesgo})
            </button>
            <button
              onClick={() => setFiltroCategoria('observaciones')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${
                filtroCategoria === 'observaciones'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-blue-50 text-blue-700 hover:bg-blue-100'
              }`}
            >
              Con Bitácora ({stats.conObservaciones})
            </button>
            <button
              onClick={() => setFiltroCategoria('sobresalientes')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${
                filtroCategoria === 'sobresalientes'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
              }`}
            >
              Sobresalientes ({stats.sobresalientes})
            </button>
          </div>
        </div>
      </div>

      {/* Main Students List */}
      <div className="bg-white rounded-xl shadow-xs border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-[#0a1628] text-white uppercase text-[11px] tracking-wider">
                <th className="py-3 px-4 font-bold w-12 text-center">N°</th>
                <th className="py-3 px-4 font-bold">Estudiante / Cédula</th>
                <th className="py-3 px-4 font-bold text-center">Trim. I</th>
                <th className="py-3 px-4 font-bold text-center">Trim. II</th>
                <th className="py-3 px-4 font-bold text-center">Trim. III</th>
                <th className="py-3 px-4 font-bold text-center">Prom. Gral</th>
                <th className="py-3 px-4 font-bold text-center">Asistencia</th>
                <th className="py-3 px-4 font-bold">Acudiente / Contacto</th>
                <th className="py-3 px-4 font-bold text-center">Bitácora</th>
                <th className="py-3 px-4 font-bold text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {estudiantesFiltrados.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-8 text-center text-slate-400">
                    No se encontraron estudiantes que coincidan con los criterios de búsqueda.
                  </td>
                </tr>
              ) : (
                estudiantesFiltrados.map((est, idx) => (
                  <tr key={est.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-4 text-center font-bold text-slate-500 font-mono">
                      {est.originalIndex + 1}
                    </td>

                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        {/* Risk Indicator Dot */}
                        <span 
                          className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                            est.estadoRiesgo === 'rojo'
                              ? 'bg-rose-500 ring-2 ring-rose-200'
                              : est.estadoRiesgo === 'amarillo'
                                ? 'bg-amber-400'
                                : est.estadoRiesgo === 'azul'
                                  ? 'bg-blue-400'
                                  : est.estadoRiesgo === 'verde'
                                    ? 'bg-emerald-500'
                                    : 'bg-slate-300'
                          }`}
                          title={`Estado: ${est.estadoRiesgo.toUpperCase()}`}
                        />
                        <div>
                          <span className="font-extrabold text-slate-800 block text-xs">
                            {est.nombre}
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono">
                            {est.cedula}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Trim 1 */}
                    <td className="py-3 px-4 text-center font-bold font-mono">
                      {est.prom1 !== null ? (
                        <span className={est.prom1 < 3.0 ? 'text-rose-600 font-black' : 'text-slate-800'}>
                          {est.prom1.toFixed(1)}
                        </span>
                      ) : (
                        <span className="text-slate-300">-</span>
                      )}
                    </td>

                    {/* Trim 2 */}
                    <td className="py-3 px-4 text-center font-bold font-mono">
                      {est.prom2 !== null ? (
                        <span className={est.prom2 < 3.0 ? 'text-rose-600 font-black' : 'text-slate-800'}>
                          {est.prom2.toFixed(1)}
                        </span>
                      ) : (
                        <span className="text-slate-300">-</span>
                      )}
                    </td>

                    {/* Trim 3 */}
                    <td className="py-3 px-4 text-center font-bold font-mono">
                      {est.prom3 !== null ? (
                        <span className={est.prom3 < 3.0 ? 'text-rose-600 font-black' : 'text-slate-800'}>
                          {est.prom3.toFixed(1)}
                        </span>
                      ) : (
                        <span className="text-slate-300">-</span>
                      )}
                    </td>

                    {/* Promedio General */}
                    <td className="py-3 px-4 text-center font-mono">
                      {est.promGen !== null ? (
                        <span className={`px-2 py-0.5 rounded font-black text-xs ${
                          est.promGen < 3.0
                            ? 'bg-rose-100 text-rose-800'
                            : est.promGen >= 4.5
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-slate-100 text-slate-800'
                        }`}>
                          {est.promGen.toFixed(1)}
                        </span>
                      ) : (
                        <span className="text-slate-300 text-[11px]">S/N</span>
                      )}
                    </td>

                    {/* Attendance */}
                    <td className="py-3 px-4 text-center font-mono">
                      <div className="inline-flex flex-col items-center">
                        <span className={`font-bold ${est.asistencia.porcentaje < 70 ? 'text-rose-600 font-black' : 'text-slate-700'}`}>
                          {est.asistencia.porcentaje}%
                        </span>
                        <span className="text-[10px] text-slate-400">
                          {est.asistencia.p}P / {est.asistencia.a}A
                        </span>
                      </div>
                    </td>

                    {/* Guardian and Contact */}
                    <td className="py-3 px-4 text-slate-600">
                      <div>
                        <span className="font-semibold text-slate-800 block text-xs">
                          {est.acudiente || 'Sin acudiente'}
                        </span>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-[10px] text-slate-400 font-mono">
                            {est.telefono || 'Sin teléfono'}
                          </span>
                          {est.telefono && (
                            <a
                              href={generarEnlaceWhatsApp(est)}
                              target="_blank"
                              rel="noreferrer"
                              className="text-emerald-600 hover:text-emerald-700 font-bold text-[10px] flex items-center gap-0.5"
                              title="Enviar mensaje de seguimiento por WhatsApp"
                            >
                              <MessageSquare className="w-3 h-3" /> WhatsApp
                            </a>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Bitácora Count */}
                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() => {
                          setEstudianteSeleccionado(est);
                          setModalBitacoraOpen(true);
                        }}
                        className={`px-2.5 py-1 rounded-full text-xs font-bold inline-flex items-center gap-1 transition-all ${
                          est.bitacora.length > 0
                            ? 'bg-blue-100 text-blue-800 hover:bg-blue-200'
                            : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                        }`}
                      >
                        <FileText className="w-3 h-3" />
                        {est.bitacora.length} {est.bitacora.length === 1 ? 'nota' : 'notas'}
                      </button>
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => {
                            setEstudianteSeleccionado(est);
                            setModalBitacoraOpen(true);
                          }}
                          className="px-2 py-1 rounded bg-[#0a1628] hover:bg-[#1a2d4b] text-white text-[11px] font-bold flex items-center gap-1 shadow-xs"
                          title="Abrir ficha y bitácora pedagógica"
                        >
                          <BookOpen className="w-3 h-3 text-[#c9a84c]" />
                          Ficha
                        </button>

                        <button
                          onClick={() => handleImprimirFicha(est)}
                          className="p-1 rounded text-slate-500 hover:bg-slate-100 transition-colors"
                          title="Imprimir informe individual del estudiante"
                        >
                          <Printer className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ========================================================= */}
      {/* MODAL FICHA DE SEGUIMIENTO Y BITÁCORA INDIVIDUAL */}
      {/* ========================================================= */}
      {modalBitacoraOpen && estudianteSeleccionado && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto no-print">
          <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in duration-150">
            {/* Modal Header */}
            <div className="bg-[#0a1628] text-white p-5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#c9a84c] text-[#0a1628] font-black text-base flex items-center justify-center">
                  {estudianteSeleccionado.nombre.charAt(0)}
                </div>
                <div>
                  <h3 className="text-base font-black tracking-tight">
                    {estudianteSeleccionado.nombre}
                  </h3>
                  <p className="text-xs text-slate-300 font-mono">
                    Cédula: {estudianteSeleccionado.cedula} • {grupo.nombre}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleImprimirFicha(estudianteSeleccionado)}
                  className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-bold flex items-center gap-1.5 transition-all"
                >
                  <Printer className="w-3.5 h-3.5" /> Imprimir Ficha
                </button>
                <button
                  onClick={() => setModalBitacoraOpen(false)}
                  className="p-1.5 rounded-lg hover:bg-white/10 text-slate-300 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-6">
              {/* Personal & Family Contact */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs">
                <div>
                  <span className="font-bold text-slate-500 uppercase text-[10px] block">Acudiente Principal:</span>
                  <span className="font-extrabold text-slate-800 text-sm">{estudianteSeleccionado.acudiente || 'No registrado'}</span>
                </div>
                <div>
                  <span className="font-bold text-slate-500 uppercase text-[10px] block">Teléfono / Contacto:</span>
                  <div className="flex items-center gap-3 mt-0.5">
                    <span className="font-mono font-bold text-slate-800">{estudianteSeleccionado.telefono || 'Sin teléfono'}</span>
                    {estudianteSeleccionado.telefono && (
                      <a
                        href={generarEnlaceWhatsApp(estudianteSeleccionado)}
                        target="_blank"
                        rel="noreferrer"
                        className="px-2 py-0.5 rounded bg-emerald-600 text-white font-bold text-[10px] flex items-center gap-1"
                      >
                        <MessageSquare className="w-3 h-3" /> WhatsApp
                      </a>
                    )}
                  </div>
                </div>
              </div>

              {/* Form to Add New Bitácora Observation */}
              <div className="bg-amber-50/50 rounded-xl border border-amber-200 p-4">
                <h4 className="text-xs font-black uppercase text-amber-900 tracking-wider mb-3 flex items-center gap-1.5">
                  <Plus className="w-4 h-4 text-amber-700" />
                  Registrar Nueva Observación o Incidencia
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                  <div>
                    <label className="text-[11px] font-bold text-slate-700 block mb-1">Categoría:</label>
                    <select
                      value={nuevaCat}
                      onChange={(e) => setNuevaCat(e.target.value as CategoriaSeguimiento)}
                      className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-semibold bg-white text-slate-800"
                    >
                      <option value="Participación">🌟 Participación Destacada</option>
                      <option value="Logro Destacado">🏆 Logro de Aprendizaje</option>
                      <option value="Tarea Pendiente">⚠️ Tarea / Taller Pendiente</option>
                      <option value="Conducta">🤝 Conducta / Convivencia</option>
                      <option value="Atención Requerida">💡 Apoyo / Refuerzo Requerido</option>
                      <option value="Citación Acudiente">📞 Citación / Llamada a Acudiente</option>
                      <option value="Adecuación Curricular">🧩 Adecuación Curricular</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-700 block mb-1">Fecha del Suceso:</label>
                    <input
                      type="date"
                      value={nuevaFecha}
                      onChange={(e) => setNuevaFecha(e.target.value)}
                      className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-mono bg-white text-slate-800"
                    />
                  </div>
                </div>

                <div className="mb-3">
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">
                    Descripción / Detalle del Hecho u Observación:
                  </label>
                  <textarea
                    rows={2}
                    value={nuevoDetalle}
                    onChange={(e) => setNuevoDetalle(e.target.value)}
                    placeholder="Ejemplo: Se destacó resolviendo los ejercicios de la lección; o se conversó con el acudiente sobre entregas pendientes..."
                    className="w-full p-2.5 rounded-lg border border-slate-300 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white"
                  />
                </div>

                <div className="flex justify-end">
                  <button
                    onClick={handleGuardarObservacion}
                    disabled={!nuevoDetalle.trim()}
                    className="px-4 py-2 rounded-lg bg-[#0a1628] hover:bg-[#1a2d4b] text-white text-xs font-black flex items-center gap-1.5 shadow-xs disabled:opacity-50"
                  >
                    <Plus className="w-3.5 h-3.5 text-[#c9a84c]" /> Guardar en Bitácora
                  </button>
                </div>
              </div>

              {/* Chronological Bitácora History */}
              <div>
                <h4 className="text-xs font-black uppercase text-slate-700 tracking-wider mb-3 flex items-center justify-between">
                  <span>Historial de Bitácora ({estudianteSeleccionado.bitacora?.length || 0})</span>
                  <span className="text-[11px] font-normal text-slate-400">Orden cronológico</span>
                </h4>

                {(!estudianteSeleccionado.bitacora || estudianteSeleccionado.bitacora.length === 0) ? (
                  <div className="py-8 text-center text-xs text-slate-400 border-2 border-dashed border-slate-200 rounded-xl">
                    No hay registros en la bitácora de este estudiante.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {estudianteSeleccionado.bitacora.map((obs) => (
                      <div
                        key={obs.id}
                        className="p-3.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 transition-colors flex items-start justify-between gap-3 text-xs"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                              obs.categoria === 'Logro Destacado' || obs.categoria === 'Participación'
                                ? 'bg-emerald-100 text-emerald-800'
                                : obs.categoria === 'Tarea Pendiente' || obs.categoria === 'Atención Requerida'
                                  ? 'bg-amber-100 text-amber-800'
                                  : obs.categoria === 'Citación Acudiente'
                                    ? 'bg-purple-100 text-purple-800'
                                    : 'bg-blue-100 text-blue-800'
                            }`}>
                              {obs.categoria}
                            </span>
                            <span className="text-slate-400 font-mono text-[10px] flex items-center gap-1">
                              <Calendar className="w-3 h-3" /> {obs.fecha}
                            </span>
                            {obs.docente && (
                              <span className="text-slate-400 text-[10px]">
                                • Registrado por: {obs.docente}
                              </span>
                            )}
                          </div>
                          <p className="text-slate-800 font-medium whitespace-pre-wrap leading-relaxed">
                            {obs.descripcion}
                          </p>
                        </div>

                        <button
                          onClick={() => handleEliminarObservacion(obs.id)}
                          className="p-1 rounded text-slate-400 hover:text-rose-600 transition-colors"
                          title="Eliminar este registro"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* VISTA IMPRIMIBLE: FICHA OFICIAL DE SEGUIMIENTO MEDUCA */}
      {/* ========================================================= */}
      {estudianteSeleccionado && (
        <div className="hidden print:block fixed inset-0 bg-white text-black p-8 font-sans">
          <div className="text-center pb-4 border-b-2 border-black mb-6">
            <h1 className="text-base font-black tracking-wider uppercase">{config.ministerio}</h1>
            <h2 className="text-sm font-bold uppercase">{config.regional}</h2>
            <h3 className="text-sm font-extrabold uppercase mt-1">{config.escuela}</h3>
            <h4 className="text-xs font-black uppercase tracking-widest mt-2 bg-slate-100 py-1">
              FICHA DE SEGUIMIENTO PEDAGÓGICO INDIVIDUAL DEL ESTUDIANTE • {config.anio}
            </h4>
          </div>

          <div className="grid grid-cols-2 gap-4 text-xs mb-6 border p-3 border-black">
            <div>
              <p><strong>Estudiante:</strong> {estudianteSeleccionado.nombre}</p>
              <p><strong>Cédula:</strong> {estudianteSeleccionado.cedula}</p>
              <p><strong>Grado y Grupo:</strong> {grupo.nombre}</p>
            </div>
            <div>
              <p><strong>Asignatura:</strong> {config.asignatura}</p>
              <p><strong>Docente:</strong> {config.docente}</p>
              <p><strong>Acudiente:</strong> {estudianteSeleccionado.acudiente || 'N/A'} (Tel: {estudianteSeleccionado.telefono || 'N/A'})</p>
            </div>
          </div>

          <h5 className="text-xs font-black uppercase mb-2">Historial de Observaciones y Bitácora:</h5>
          <table className="w-full text-xs border border-black mb-8">
            <thead>
              <tr className="bg-slate-200 border-b border-black">
                <th className="p-2 text-left border-r border-black w-24">Fecha</th>
                <th className="p-2 text-left border-r border-black w-36">Categoría</th>
                <th className="p-2 text-left">Detalle / Acuerdos</th>
              </tr>
            </thead>
            <tbody>
              {(!estudianteSeleccionado.bitacora || estudianteSeleccionado.bitacora.length === 0) ? (
                <tr>
                  <td colSpan={3} className="p-3 text-center italic">Sin observaciones registradas a la fecha.</td>
                </tr>
              ) : (
                estudianteSeleccionado.bitacora.map(b => (
                  <tr key={b.id} className="border-b border-black">
                    <td className="p-2 font-mono border-r border-black">{b.fecha}</td>
                    <td className="p-2 font-bold border-r border-black">{b.categoria}</td>
                    <td className="p-2">{b.descripcion}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

          {/* Signature Lines */}
          <div className="grid grid-cols-3 gap-8 pt-16 text-center text-xs">
            <div className="border-t border-black pt-2">
              <p className="font-bold">{config.docente}</p>
              <p className="text-[10px]">Docente de Asignatura</p>
            </div>
            <div className="border-t border-black pt-2">
              <p className="font-bold">Dirección del Plantel</p>
              <p className="text-[10px]">Firma y Sello</p>
            </div>
            <div className="border-t border-black pt-2">
              <p className="font-bold">{estudianteSeleccionado.acudiente || 'Firma del Acudiente'}</p>
              <p className="text-[10px]">Acudiente Responsable</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
