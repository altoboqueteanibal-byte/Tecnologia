import React, { useRef } from 'react';
import { RespaldoItem } from '../types';
import { X, Save, RotateCcw, Trash2, Download, Upload, ShieldCheck, Clock } from 'lucide-react';

interface ModalRespaldosProps {
  respaldos: RespaldoItem[];
  onClose: () => void;
  onCrearRespaldo: (etiqueta?: string) => void;
  onRestaurarRespaldo: (id: string) => void;
  onEliminarRespaldo: (id: string) => void;
  onExportarJSON: () => void;
  onImportarJSONFile: (file: File) => void;
}

export const ModalRespaldos: React.FC<ModalRespaldosProps> = ({
  respaldos,
  onClose,
  onCrearRespaldo,
  onRestaurarRespaldo,
  onEliminarRespaldo,
  onExportarJSON,
  onImportarJSONFile
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onImportarJSONFile(file);
      e.target.value = '';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-2xl w-full max-h-[85vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between p-4 md:p-5 border-b border-slate-200 bg-[#0a1628] text-white">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold">COPIAS DE SEGURIDAD Y RESPALDOS</h2>
              <div className="text-xs text-slate-300">
                Almacenamiento local protegido y exportación segura
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 md:p-6 overflow-y-auto flex-1 space-y-5">
          {/* Quick Actions Card */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="text-xs font-bold text-slate-800">Crear Nueva Copia Instantánea</div>
              <div className="text-[11px] text-slate-500">
                Guarda una instantánea de todas las notas, asistencias y secuencias.
              </div>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={() => onCrearRespaldo()}
                className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors shadow-xs"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Respaldar Ahora</span>
              </button>
              <button
                onClick={onExportarJSON}
                className="px-3.5 py-1.5 bg-[#0a1628] hover:bg-[#1a2a4a] text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors"
                title="Descargar archivo en disco duro o memoria USB"
              >
                <Download className="w-3.5 h-3.5 text-[#c9a84c]" />
                <span>Descargar JSON</span>
              </button>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="px-3 py-1.5 bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Cargar JSON</span>
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                className="hidden"
                onChange={handleFileChange}
              />
            </div>
          </div>

          {/* List of Backups */}
          <div>
            <div className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              <span>Instantáneas Guardadas en este Dispositivo ({respaldos.length})</span>
            </div>

            {respaldos.length === 0 ? (
              <div className="text-center py-8 border border-dashed border-slate-200 rounded-xl text-xs text-slate-500">
                No hay respaldos guardados todavía. Haz clic en "Respaldar Ahora".
              </div>
            ) : (
              <div className="space-y-2">
                {respaldos.map((respaldo) => (
                  <div
                    key={respaldo.id}
                    className="p-3 bg-white border border-slate-200 rounded-xl hover:border-slate-300 flex items-center justify-between gap-3 shadow-xs"
                  >
                    <div>
                      <div className="text-xs font-bold text-slate-800 flex items-center gap-2">
                        <span>{respaldo.nombre}</span>
                      </div>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        {new Date(respaldo.fecha).toLocaleString('es-PA')} · {respaldo.gruposCount} grupos · {respaldo.estudiantesCount} alumnos
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => {
                          if (confirm(`¿Restaurar la copia "${respaldo.nombre}"? Se sobreescribirán los datos actuales.`)) {
                            onRestaurarRespaldo(respaldo.id);
                          }
                        }}
                        className="px-3 py-1 bg-[#0a1628] hover:bg-[#1a2a4a] text-[#e8d5a3] rounded text-xs font-semibold flex items-center gap-1"
                        title="Restaurar este respaldo"
                      >
                        <RotateCcw className="w-3 h-3 text-[#c9a84c]" />
                        <span>Restaurar</span>
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`¿Eliminar definitivamente este respaldo?`)) {
                            onEliminarRespaldo(respaldo.id);
                          }
                        }}
                        className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded"
                        title="Eliminar este respaldo"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="text-[11px] text-slate-500">
            💾 Todos los datos se almacenan de forma local en tu navegador (compatible con laptops e iPads sin conexión permanente).
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
