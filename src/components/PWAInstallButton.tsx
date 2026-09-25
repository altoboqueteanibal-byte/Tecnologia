import React, { useState } from 'react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { Download, Smartphone, X, CheckCircle, Share, PlusSquare } from 'lucide-react';

export const PWAInstallButton: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);
  const [showGeneralGuide, setShowGeneralGuide] = useState(false);

  // If already running in standalone mode (already installed), hide the install button
  if (isInstalled) {
    return (
      <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-900/40 border border-emerald-500/30 text-emerald-300 rounded-lg text-xs font-semibold">
        <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
        <span>App Instalada</span>
      </div>
    );
  }

  // Chromium / Android / Desktop flow
  if (isInstallable) {
    return (
      <button
        onClick={install}
        className="px-3.5 py-1.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all shadow-md active:scale-95 animate-pulse"
        title="Instalar como aplicación nativa en tu dispositivo (funciona sin conexión)"
      >
        <Download className="w-3.5 h-3.5" />
        <span>Instalar App</span>
      </button>
    );
  }

  // iOS Safari flow (iPad / iPhone)
  if (isIOS) {
    return (
      <>
        <button
          onClick={() => setShowIOSGuide(true)}
          className="px-3 py-1.5 bg-[#1a2a4a] hover:bg-[#253966] text-[#e8d5a3] border border-[#c9a84c]/40 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs"
          title="Instalar en iPad o iPhone"
        >
          <Smartphone className="w-3.5 h-3.5 text-[#c9a84c]" />
          <span>Instalar en iPad/iPhone</span>
        </button>

        {showIOSGuide && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-sm w-full p-6 text-slate-800 space-y-4 animate-in fade-in zoom-in-95">
              <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-[#0a1628] text-[#c9a84c] flex items-center justify-center font-bold">
                    📱
                  </div>
                  <h3 className="text-sm font-bold text-[#0a1628]">Instalar en iPad / iPhone</h3>
                </div>
                <button
                  onClick={() => setShowIOSGuide(false)}
                  className="p-1 text-slate-400 hover:text-slate-700 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed">
                Para instalar esta aplicación oficial de MEDUCA en tu iPad o iPhone y usarla sin conexión:
              </p>

              <div className="space-y-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-xs">
                <div className="flex items-start gap-2.5">
                  <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center shrink-0 font-bold">
                    1
                  </div>
                  <div>
                    Toca el botón <strong className="inline-flex items-center gap-1 text-blue-700"><Share className="w-3.5 h-3.5 inline" /> Compartir</strong> en la barra de Safari.
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center shrink-0 font-bold">
                    2
                  </div>
                  <div>
                    Desplázate hacia abajo y selecciona <strong className="inline-flex items-center gap-1 text-slate-900"><PlusSquare className="w-3.5 h-3.5 inline" /> Agregar a pantalla de inicio</strong>.
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 font-bold">
                    3
                  </div>
                  <div>
                    Presiona <strong className="text-emerald-700">Agregar</strong>. ¡Listo! Se abrirá a pantalla completa como una app nativa.
                  </div>
                </div>
              </div>

              <button
                onClick={() => setShowIOSGuide(false)}
                className="w-full py-2 bg-[#0a1628] hover:bg-[#1a2a4a] text-white rounded-xl text-xs font-bold transition-colors"
              >
                Entendido
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  // Fallback if browser hasn't fired beforeinstallprompt yet or for other desktop browsers
  return (
    <>
      <button
        onClick={() => setShowGeneralGuide(true)}
        className="px-3 py-1.5 bg-[#1a2a4a] hover:bg-[#253966] text-[#e8d5a3] border border-[#c9a84c]/30 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs"
        title="Instalar esta aplicación en tu computadora o tableta"
      >
        <Download className="w-3.5 h-3.5 text-[#c9a84c]" />
        <span>Instalar PWA</span>
      </button>

      {showGeneralGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-sm w-full p-6 text-slate-800 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-[#0a1628] text-[#c9a84c] flex items-center justify-center font-bold">
                  ⚡
                </div>
                <h3 className="text-sm font-bold text-[#0a1628]">Instalación de Aplicación PWA</h3>
              </div>
              <button
                onClick={() => setShowGeneralGuide(false)}
                className="p-1 text-slate-400 hover:text-slate-700 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Esta app es una <strong>Progressive Web App (PWA)</strong> completa. Puedes instalarla directamente en tu sistema operativo:
            </p>

            <ul className="text-xs space-y-2 text-slate-700 list-disc list-inside bg-slate-50 p-3 rounded-xl border border-slate-200">
              <li>En <strong>Chrome o Edge</strong>: haz clic en el icono de instalación <Download className="w-3.5 h-3.5 inline text-blue-600" /> en la barra de direcciones o menú del navegador (tres puntos) &gt; "Instalar Sistema MEDUCA".</li>
              <li>En <strong>Android</strong>: toca los tres puntos &gt; "Instalar aplicación" o "Agregar a pantalla principal".</li>
              <li>En <strong>iPad / iPhone</strong>: toca Compartir &gt; "Agregar al inicio".</li>
            </ul>

            <button
              onClick={() => setShowGeneralGuide(false)}
              className="w-full py-2 bg-[#0a1628] hover:bg-[#1a2a4a] text-white rounded-xl text-xs font-bold transition-colors"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}
    </>
  );
};
