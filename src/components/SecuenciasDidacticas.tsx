import React, { useState } from 'react';
import { SecuenciaDidactica, AppConfig } from '../types';
import { 
  Printer, 
  Search, 
  Plus, 
  Calendar, 
  FileText, 
  Check, 
  RotateCcw,
  Sparkles,
  BookOpen
} from 'lucide-react';
import { obtenerRangoFechasQuincenal } from '../utils/dateUtils';

interface SecuenciasDidacticasProps {
  secuencias: SecuenciaDidactica[];
  config: AppConfig;
  onUpdateSecuencia: (id: string, updated: Partial<SecuenciaDidactica>) => void;
  onCrearSecuencia: (nueva: SecuenciaDidactica) => void;
  onImprimir: () => void;
}

export const SecuenciasDidacticas: React.FC<SecuenciasDidacticasProps> = ({
  secuencias,
  config,
  onUpdateSecuencia,
  onCrearSecuencia,
  onImprimir
}) => {
  const [gradoFiltro, setGradoFiltro] = useState<string>('5°');
  const [trimestreFiltro, setTrimestreFiltro] = useState<string>('Todos');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [secuenciaSeleccionadaId, setSecuenciaSeleccionadaId] = useState<string | null>(null);

  // Filtered sequences
  const secuenciasFiltradas = secuencias.filter((sec) => {
    if (gradoFiltro !== 'Todos' && sec.grado !== gradoFiltro) return false;
    if (trimestreFiltro !== 'Todos' && sec.trimestre !== trimestreFiltro) return false;
    if (searchTerm.trim() !== '') {
      const q = searchTerm.toLowerCase();
      const match =
        sec.area.toLowerCase().includes(q) ||
        sec.conceptual.toLowerCase().includes(q) ||
        sec.objetivo.toLowerCase().includes(q) ||
        sec.indicador.toLowerCase().includes(q);
      if (!match) return false;
    }
    return true;
  });

  const handleCrearNueva = () => {
    const nuevaId = `sec-custom-${Date.now()}`;
    const nueva: SecuenciaDidactica = {
      id: nuevaId,
      grado: gradoFiltro === 'Todos' ? '5°' : gradoFiltro,
      trimestre: trimestreFiltro === 'Todos' ? 'PRIMERO' : (trimestreFiltro as any),
      semana: `${(secuenciasFiltradas.length * 2) + 1} - ${(secuenciasFiltradas.length * 2) + 2}`,
      area: 'Manejo de Programas y Pensamiento Computacional',
      objetivo: 'Describir los componentes y aplicaciones prácticas de las herramientas informáticas escolares.',
      competencia: 'Aplica de manera reflexiva y autónoma las tecnologías en proyectos de aprendizaje.',
      conceptual: 'Contenidos conceptuales clave y vocabulario técnico elemental.',
      procedimental: 'Práctica guiada en el laboratorio y elaboración de productos digitales.',
      actitudinal: 'Responsabilidad y colaboración en el uso de los equipos informáticos.',
      indicador: 'Demuestra el dominio procedimental y conceptual en las actividades asignadas.',
      act_inicio: 'Lluvia de ideas y exploración de conocimientos previos con preguntas guía.',
      act_desarrollo: 'Taller práctico individual o en parejas desarrollando la actividad central.',
      act_cierre: 'Puesta en común, socialización de hallazgos y conclusiones grupales.',
      evidencia: 'Producto digital o informe técnico estructurado.',
      criterios: 'Precisión técnica, creatividad, puntualidad y trabajo colaborativo.',
      tipo_eval: 'Formativa (observación y retroalimentación) y Sumativa (rúbrica del producto final).'
    };
    onCrearSecuencia(nueva);
    setSecuenciaSeleccionadaId(nuevaId);
  };

  return (
    <div className="space-y-6">
      {/* Controls Bar (no-print) */}
      <div className="bg-white border border-[#d4c8b0] rounded-xl p-4 md:p-6 shadow-sm no-print">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-4 pb-4 border-b border-slate-200">
          <div>
            <h2 className="text-base font-bold text-[#0a1628] flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-[#c9a84c]" />
              <span>PLANIFICADOR DE SECUENCIAS DIDÁCTICAS · MEDUCA</span>
            </h2>
            <p className="text-xs text-slate-500">
              Formato oficial semanal / quincenal para Educación Básica General (3°, 4°, 5° y 6° Grado)
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={handleCrearNueva}
              className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>Nueva Secuencia</span>
            </button>
            <button
              onClick={onImprimir}
              className="px-4 py-1.5 bg-gradient-to-r from-[#c9a84c] to-[#a8893a] hover:from-[#d5b65a] hover:to-[#b89844] text-[#0a1628] rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all shadow-md active:scale-95"
            >
              <Printer className="w-4 h-4" />
              <span>Imprimir Secuencias</span>
            </button>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Grado Selector */}
          <div>
            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
              Grado Curricular
            </label>
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg">
              {['Todos', '3°', '4°', '5°', '6°'].map((gr) => (
                <button
                  key={gr}
                  onClick={() => setGradoFiltro(gr)}
                  className={`flex-1 py-1 px-1.5 rounded text-xs font-bold transition-all ${
                    gradoFiltro === gr
                      ? 'bg-[#c9a84c] text-[#0a1628] shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {gr}
                </button>
              ))}
            </div>
          </div>

          {/* Trimestre Selector */}
          <div>
            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
              Trimestre
            </label>
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg">
              {['Todos', 'PRIMERO', 'SEGUNDO', 'TERCERO'].map((tr) => (
                <button
                  key={tr}
                  onClick={() => setTrimestreFiltro(tr)}
                  className={`flex-1 py-1 px-1 rounded text-[11px] font-bold transition-all ${
                    trimestreFiltro === tr
                      ? 'bg-[#0a1628] text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {tr === 'Todos' ? 'Todos' : tr === 'PRIMERO' ? 'T1' : tr === 'SEGUNDO' ? 'T2' : 'T3'}
                </button>
              ))}
            </div>
          </div>

          {/* Search Input */}
          <div className="lg:col-span-2">
            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
              Buscar por Tema o Contenido
            </label>
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar (ej. Scratch, hardware, teclado, internet, hoja de cálculo)..."
                className="w-full text-xs pl-8 pr-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#c9a84c]"
              />
            </div>
          </div>
        </div>

        <div className="mt-3 flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
          <div>
            Mostrando <strong>{secuenciasFiltradas.length}</strong> de {secuencias.length} secuencias didácticas disponibles.
          </div>
          <div className="text-[11px] text-slate-400 italic">
            💡 Puedes hacer clic y editar directamente cualquier texto en las tablas oficiales abajo.
          </div>
        </div>
      </div>

      {/* Render All Filtered Sequences (Official MEDUCA Format) */}
      <div id="secuenciasPrintArea" className="space-y-8">
        {secuenciasFiltradas.length === 0 ? (
          <div className="bg-white p-12 text-center rounded-xl border border-slate-200 text-slate-500">
            <FileText className="w-12 h-12 text-slate-300 mx-auto mb-2" />
            <h3 className="text-base font-bold text-slate-700">No se encontraron secuencias</h3>
            <p className="text-xs text-slate-500 mt-1">Prueba seleccionando otro grado o limpiando la búsqueda.</p>
          </div>
        ) : (
          secuenciasFiltradas.map((sec, idx) => {
            const rango = obtenerRangoFechasQuincenal(
              idx,
              config.anioInicio || 2026,
              config.mesInicio || 3,
              config.diaInicio || 2
            );

            return (
              <div
                key={sec.id}
                className="bg-white border-2 border-slate-300 rounded-xl p-4 md:p-6 shadow-sm page-break-after relative"
                style={{ fontFamily: "'Times New Roman', Times, serif" }}
              >
                {/* Trimestre Badge */}
                <div className="mb-2 flex items-center justify-between">
                  <span className="inline-block bg-[#1a3d5c] text-white px-3 py-0.5 rounded-full text-xs font-bold tracking-wide">
                    TRIMESTRE {sec.trimestre} · GRADO {sec.grado}
                  </span>
                  <span className="text-[11px] text-slate-500 no-print">
                    Secuencia #{idx + 1}
                  </span>
                </div>

                {/* Header Ministerio */}
                <div className="text-center font-bold text-sm border-b-2 border-[#1a3d5c] pb-1 mb-2 tracking-wide uppercase text-[#1a3d5c]">
                  MINISTERIO DE EDUCACIÓN
                  <span className="block text-xs font-normal normal-case text-slate-700 tracking-normal mt-0.5">
                    {config.regional} · {config.escuela}
                  </span>
                </div>

                <div className="text-center font-bold text-xs underline mb-2 text-slate-900 uppercase">
                  SECUENCIA DIDÁCTICA SEMANAL O QUINCENAL
                </div>

                {/* Top Info Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5 font-bold text-[11px] border border-slate-900 p-2 mb-2 bg-slate-50/70 text-slate-900">
                  <div>ASIGNATURA: <span className="font-normal">{config.asignatura}</span></div>
                  <div>GRADO: <span className="font-normal">{sec.grado}</span></div>
                  <div>DOCENTE: <span className="font-normal">{config.docente}</span></div>
                  <div>TRIMESTRE: <span className="font-normal">{sec.trimestre}</span></div>
                  <div>SEMANA: <span className="font-normal">{sec.semana}</span></div>
                </div>

                {/* Date range row */}
                <div className="font-bold text-[11px] border-b border-slate-300 pb-1 mb-2 text-slate-800">
                  SEMANA: del {rango.inicio} al {rango.fin}
                </div>

                {/* Main 2-Column Table */}
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse border border-slate-900 text-[11px] mb-3">
                    <tbody>
                      <tr>
                        {/* Columna Izquierda: Fundamentos Curriculares */}
                        <td className="w-1/2 p-0 align-top border-r border-slate-900">
                          <table className="w-full border-collapse">
                            <tbody>
                              <tr>
                                <td colSpan={2} className="bg-slate-200 text-slate-900 font-bold p-1 text-center border-b border-slate-900">
                                  ÁREA:
                                </td>
                              </tr>
                              <tr>
                                <td colSpan={2} className="p-1.5 border-b border-slate-400">
                                  <input
                                    type="text"
                                    value={sec.area}
                                    onChange={(e) => onUpdateSecuencia(sec.id, { area: e.target.value })}
                                    className="w-full bg-transparent focus:bg-amber-50 focus:outline-none font-semibold text-slate-900"
                                  />
                                </td>
                              </tr>

                              <tr>
                                <td colSpan={2} className="bg-slate-200 text-slate-900 font-bold p-1 text-center border-y border-slate-900">
                                  COMPETENCIA(S):
                                </td>
                              </tr>
                              <tr>
                                <td colSpan={2} className="p-1.5 border-b border-slate-400">
                                  <textarea
                                    value={sec.competencia}
                                    onChange={(e) => onUpdateSecuencia(sec.id, { competencia: e.target.value })}
                                    rows={2}
                                    className="w-full bg-transparent focus:bg-amber-50 focus:outline-none resize-none text-slate-800"
                                  />
                                </td>
                              </tr>

                              <tr>
                                <td colSpan={2} className="bg-slate-200 text-slate-900 font-bold p-1 text-center border-y border-slate-900">
                                  OBJETIVO(S) DE APRENDIZAJE:
                                </td>
                              </tr>
                              <tr>
                                <td colSpan={2} className="p-1.5 border-b border-slate-400">
                                  <textarea
                                    value={sec.objetivo}
                                    onChange={(e) => onUpdateSecuencia(sec.id, { objetivo: e.target.value })}
                                    rows={2}
                                    className="w-full bg-transparent focus:bg-amber-50 focus:outline-none resize-none text-slate-800"
                                  />
                                </td>
                              </tr>

                              <tr>
                                <td colSpan={2} className="bg-slate-200 text-slate-900 font-bold p-1 text-center border-y border-slate-900">
                                  CONTENIDOS:
                                </td>
                              </tr>
                              <tr className="border-b border-slate-300">
                                <td className="p-1 font-bold w-24 align-top text-slate-900">Conceptual:</td>
                                <td className="p-1">
                                  <textarea
                                    value={sec.conceptual}
                                    onChange={(e) => onUpdateSecuencia(sec.id, { conceptual: e.target.value })}
                                    rows={2}
                                    className="w-full bg-transparent focus:bg-amber-50 focus:outline-none resize-none text-slate-800"
                                  />
                                </td>
                              </tr>
                              <tr className="border-b border-slate-300">
                                <td className="p-1 font-bold w-24 align-top text-slate-900">Procedimental:</td>
                                <td className="p-1">
                                  <textarea
                                    value={sec.procedimental}
                                    onChange={(e) => onUpdateSecuencia(sec.id, { procedimental: e.target.value })}
                                    rows={2}
                                    className="w-full bg-transparent focus:bg-amber-50 focus:outline-none resize-none text-slate-800"
                                  />
                                </td>
                              </tr>
                              <tr className="border-b border-slate-900">
                                <td className="p-1 font-bold w-24 align-top text-slate-900">Actitudinal:</td>
                                <td className="p-1">
                                  <textarea
                                    value={sec.actitudinal}
                                    onChange={(e) => onUpdateSecuencia(sec.id, { actitudinal: e.target.value })}
                                    rows={2}
                                    className="w-full bg-transparent focus:bg-amber-50 focus:outline-none resize-none text-slate-800"
                                  />
                                </td>
                              </tr>

                              <tr>
                                <td colSpan={2} className="bg-slate-200 text-slate-900 font-bold p-1 text-center border-b border-slate-900">
                                  INDICADOR(ES) DE LOGRO:
                                </td>
                              </tr>
                              <tr>
                                <td colSpan={2} className="p-1.5">
                                  <textarea
                                    value={sec.indicador}
                                    onChange={(e) => onUpdateSecuencia(sec.id, { indicador: e.target.value })}
                                    rows={2}
                                    className="w-full bg-transparent focus:bg-amber-50 focus:outline-none resize-none text-slate-800"
                                  />
                                </td>
                              </tr>
                            </tbody>
                          </table>
                        </td>

                        {/* Columna Derecha: Actividades y Evaluación */}
                        <td className="w-1/2 p-0 align-top">
                          <table className="w-full border-collapse">
                            <tbody>
                              <tr>
                                <td colSpan={3} className="bg-slate-200 text-slate-900 font-bold p-1 text-center border-b border-slate-900">
                                  ACTIVIDADES
                                </td>
                              </tr>
                              <tr>
                                <td colSpan={3} className="p-2 border-b border-slate-900 text-[11px] space-y-1.5">
                                  <div>
                                    <strong className="text-slate-900">• Actividad(es) de inicio:</strong>
                                    <textarea
                                      value={sec.act_inicio}
                                      onChange={(e) => onUpdateSecuencia(sec.id, { act_inicio: e.target.value })}
                                      rows={2}
                                      className="w-full bg-transparent focus:bg-amber-50 focus:outline-none resize-none mt-0.5 text-slate-800"
                                    />
                                  </div>
                                  <div>
                                    <strong className="text-slate-900">• Actividad(es) de desarrollo:</strong>
                                    <textarea
                                      value={sec.act_desarrollo}
                                      onChange={(e) => onUpdateSecuencia(sec.id, { act_desarrollo: e.target.value })}
                                      rows={2}
                                      className="w-full bg-transparent focus:bg-amber-50 focus:outline-none resize-none mt-0.5 text-slate-800"
                                    />
                                  </div>
                                  <div>
                                    <strong className="text-slate-900">• Actividad(es) de cierre:</strong>
                                    <textarea
                                      value={sec.act_cierre}
                                      onChange={(e) => onUpdateSecuencia(sec.id, { act_cierre: e.target.value })}
                                      rows={2}
                                      className="w-full bg-transparent focus:bg-amber-50 focus:outline-none resize-none mt-0.5 text-slate-800"
                                    />
                                  </div>
                                </td>
                              </tr>

                              <tr>
                                <td colSpan={3} className="bg-slate-200 text-slate-900 font-bold p-1 text-center border-b border-slate-900">
                                  EVALUACIÓN
                                </td>
                              </tr>
                              <tr className="bg-slate-100 text-slate-900 font-bold text-center border-b border-slate-900">
                                <td className="w-1/3 p-1 border-r border-slate-900">EVIDENCIAS</td>
                                <td className="w-1/3 p-1 border-r border-slate-900">CRITERIOS</td>
                                <td className="w-1/3 p-1">TIPO DE EVALUACIÓN / INSTRUMENTOS</td>
                              </tr>
                              <tr>
                                <td className="p-1.5 align-top border-r border-slate-900">
                                  <textarea
                                    value={sec.evidencia}
                                    onChange={(e) => onUpdateSecuencia(sec.id, { evidencia: e.target.value })}
                                    rows={4}
                                    className="w-full bg-transparent focus:bg-amber-50 focus:outline-none resize-none text-slate-800"
                                  />
                                </td>
                                <td className="p-1.5 align-top border-r border-slate-900">
                                  <textarea
                                    value={sec.criterios}
                                    onChange={(e) => onUpdateSecuencia(sec.id, { criterios: e.target.value })}
                                    rows={4}
                                    className="w-full bg-transparent focus:bg-amber-50 focus:outline-none resize-none text-slate-800"
                                  />
                                </td>
                                <td className="p-1.5 align-top">
                                  <textarea
                                    value={sec.tipo_eval}
                                    onChange={(e) => onUpdateSecuencia(sec.id, { tipo_eval: e.target.value })}
                                    rows={4}
                                    className="w-full bg-transparent focus:bg-amber-50 focus:outline-none resize-none text-slate-800"
                                  />
                                </td>
                              </tr>
                            </tbody>
                          </table>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Observaciones */}
                <div className="mt-2 text-[11px]">
                  <strong className="text-slate-900">Observaciones del docente:</strong>
                  <textarea
                    value={sec.observaciones || ''}
                    onChange={(e) => onUpdateSecuencia(sec.id, { observaciones: e.target.value })}
                    rows={1}
                    placeholder="Escribe aquí observaciones pedagógicas sobre adaptaciones curriculares, necesidades especiales o imprevistos..."
                    className="w-full bg-transparent border border-slate-300 p-1.5 rounded focus:bg-amber-50 focus:outline-none resize-none mt-1 text-slate-800 text-[11px]"
                  />
                </div>

                {/* Signatures */}
                <div className="grid grid-cols-2 gap-12 mt-6 pt-4 border-t border-slate-400 page-break-inside-avoid">
                  <div>
                    <div className="font-bold text-[11px] text-slate-900 mb-1">Firma del docente:</div>
                    <div className="border-b border-slate-900 pb-1 text-slate-700 text-xs font-semibold">
                      {config.docente}
                    </div>
                  </div>
                  <div>
                    <div className="font-bold text-[11px] text-slate-900 mb-1">Firma del Técnico docente / Director:</div>
                    <div className="border-b border-slate-900 pb-1 text-slate-700 text-xs">
                      __________________________________________
                    </div>
                  </div>
                </div>

                {/* Footer text */}
                <div className="text-[10px] text-center text-slate-500 mt-4 pt-2 border-t border-slate-200">
                  {config.escuela} · {config.regional} · Año lectivo {config.anio}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
