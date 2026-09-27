import React, { useState, useEffect } from 'react';
import { User } from 'firebase/auth';
import { Grupo, AppConfig, SecuenciaDidactica } from '../types';
import { 
  googleSignIn, 
  logoutGoogle, 
  initAuth, 
  getAccessToken 
} from '../services/googleAuth';
import { 
  exportarGrupoAGoogleSheets, 
  exportarSecuenciaAGoogleDocs, 
  guardarRespaldoEnDrive, 
  listarArchivosDrive, 
  eliminarArchivoDrive,
  DriveFileItem 
} from '../services/googleWorkspace';
import { 
  FileSpreadsheet, 
  FileText, 
  HardDrive, 
  ExternalLink, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  RefreshCw, 
  Trash2, 
  Download, 
  LogOut,
  Layers,
  BookOpen
} from 'lucide-react';

interface GoogleWorkspacePanelProps {
  grupo: Grupo;
  config: AppConfig;
  secuencias: SecuenciaDidactica[];
  allGrupos: Grupo[];
  onRestaurarDesdeDrive?: (backupData: any) => void;
}

export const GoogleWorkspacePanel: React.FC<GoogleWorkspacePanelProps> = ({
  grupo,
  config,
  secuencias,
  allGrupos,
  onRestaurarDesdeDrive
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoadingAuth, setIsLoadingAuth] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ text: string; type: 'success' | 'error' | 'info'; url?: string } | null>(null);

  // Sheets state
  const [trimestreSheet, setTrimestreSheet] = useState<1 | 2 | 3>(1);
  const [isExportingSheet, setIsExportingSheet] = useState(false);

  // Docs state
  const [selectedSecuenciaId, setSelectedSecuenciaId] = useState<string>(secuencias[0]?.id || '');
  const [isExportingDoc, setIsExportingDoc] = useState(false);

  // Drive state
  const [isUploadingDrive, setIsUploadingDrive] = useState(false);
  const [driveFiles, setDriveFiles] = useState<DriveFileItem[]>([]);
  const [isLoadingFiles, setIsLoadingFiles] = useState(false);

  // Delete confirmation modal state (MANDATORY per Workspace skill!)
  const [fileToDelete, setFileToDelete] = useState<DriveFileItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    initAuth(
      (currentUser, currentToken) => {
        setUser(currentUser);
        setToken(currentToken);
        fetchDriveFiles();
      },
      () => {
        setUser(null);
        setToken(null);
        setDriveFiles([]);
      }
    );
  }, []);

  const handleLogin = async () => {
    setIsLoadingAuth(true);
    setStatusMessage(null);
    try {
      const res = await googleSignIn();
      if (res) {
        setUser(res.user);
        setToken(res.accessToken);
        setStatusMessage({ text: `Conectado como ${res.user.email}`, type: 'success' });
        await fetchDriveFiles();
      }
    } catch (err: any) {
      console.error(err);
      setStatusMessage({ text: err.message || 'Error al iniciar sesión con Google', type: 'error' });
    } finally {
      setIsLoadingAuth(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logoutGoogle();
      setUser(null);
      setToken(null);
      setDriveFiles([]);
      setStatusMessage({ text: 'Sesión de Google Workspace cerrada', type: 'info' });
    } catch (err: any) {
      console.error(err);
    }
  };

  const fetchDriveFiles = async () => {
    setIsLoadingFiles(true);
    try {
      const files = await listarArchivosDrive(
        "name contains 'MEDUCA' or mimeType = 'application/vnd.google-apps.spreadsheet' or mimeType = 'application/vnd.google-apps.document' and trashed = false"
      );
      setDriveFiles(files);
    } catch (err) {
      console.error('Error fetching drive files:', err);
    } finally {
      setIsLoadingFiles(false);
    }
  };

  const handleExportSheet = async () => {
    setIsExportingSheet(true);
    setStatusMessage(null);
    try {
      const { url } = await exportarGrupoAGoogleSheets(grupo, config, trimestreSheet);
      setStatusMessage({
        text: `¡Calificaciones de ${grupo.nombre} exportadas exitosamente a Google Sheets!`,
        type: 'success',
        url
      });
      await fetchDriveFiles();
    } catch (err: any) {
      setStatusMessage({ text: `Error en Google Sheets: ${err.message}`, type: 'error' });
    } finally {
      setIsExportingSheet(false);
    }
  };

  const handleExportDoc = async () => {
    const sec = secuencias.find(s => s.id === selectedSecuenciaId) || secuencias[0];
    if (!sec) return;

    setIsExportingDoc(true);
    setStatusMessage(null);
    try {
      const { url } = await exportarSecuenciaAGoogleDocs(sec, config);
      setStatusMessage({
        text: `¡Secuencia de ${sec.grado} (${sec.area}) exportada a Google Docs!`,
        type: 'success',
        url
      });
      await fetchDriveFiles();
    } catch (err: any) {
      setStatusMessage({ text: `Error en Google Docs: ${err.message}`, type: 'error' });
    } finally {
      setIsExportingDoc(false);
    }
  };

  const handleUploadDriveBackup = async () => {
    setIsUploadingDrive(true);
    setStatusMessage(null);
    try {
      const backupData = {
        version: '3.0',
        fechaExportacion: new Date().toISOString(),
        config,
        grupos: allGrupos,
        secuencias
      };
      const { url } = await guardarRespaldoEnDrive(
        backupData,
        `Respaldo_MEDUCA_${config.escuela.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.json`
      );
      setStatusMessage({
        text: '¡Copia de seguridad guardada en tu Google Drive correctamente!',
        type: 'success',
        url
      });
      await fetchDriveFiles();
    } catch (err: any) {
      setStatusMessage({ text: `Error en Google Drive: ${err.message}`, type: 'error' });
    } finally {
      setIsUploadingDrive(false);
    }
  };

  const confirmDeleteFile = async () => {
    if (!fileToDelete) return;
    setIsDeleting(true);
    try {
      await eliminarArchivoDrive(fileToDelete.id, fileToDelete.name);
      setStatusMessage({ text: `Archivo "${fileToDelete.name}" eliminado de Google Drive`, type: 'info' });
      setFileToDelete(null);
      await fetchDriveFiles();
    } catch (err: any) {
      setStatusMessage({ text: `Error al eliminar archivo: ${err.message}`, type: 'error' });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="bg-white border border-[#d4c8b0] rounded-xl p-4 md:p-6 shadow-sm space-y-6">
      {/* Banner Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xl">📁 📊 📄</span>
            <h2 className="text-base font-extrabold text-[#0a1628] tracking-tight">
              INTEGRACIÓN GOOGLE WORKSPACE
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Sincroniza tus registros con <strong>Google Sheets</strong>, exporta planificaciones a <strong>Google Docs</strong> y guarda respaldos en <strong>Google Drive</strong>.
          </p>
        </div>

        {/* User Auth Section */}
        <div>
          {!user ? (
            <button
              onClick={handleLogin}
              disabled={isLoadingAuth}
              className="inline-flex items-center gap-3 px-4 py-2 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-lg border border-slate-300 shadow-sm transition-all active:scale-95 disabled:opacity-50"
            >
              {isLoadingAuth ? (
                <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
              ) : (
                <svg className="w-4 h-4" viewBox="0 0 48 48">
                  <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
                  <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
                  <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
                  <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
                </svg>
              )}
              <span>Conectar con Google</span>
            </button>
          ) : (
            <div className="flex items-center gap-3 bg-slate-50 p-1.5 pr-3 rounded-xl border border-slate-200">
              {user.photoURL ? (
                <img src={user.photoURL} alt={user.displayName || ''} className="w-8 h-8 rounded-full border border-slate-300" />
              ) : (
                <div className="w-8 h-8 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center">
                  {user.email?.charAt(0).toUpperCase()}
                </div>
              )}
              <div className="text-left">
                <div className="text-xs font-bold text-slate-800 truncate max-w-[150px]">
                  {user.displayName || user.email}
                </div>
                <div className="text-[10px] text-emerald-600 font-semibold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Conectado a Workspace
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-white transition-colors"
                title="Cerrar sesión de Google"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Status Alert */}
      {statusMessage && (
        <div className={`p-3.5 rounded-xl text-xs flex items-start justify-between gap-3 ${
          statusMessage.type === 'success' 
            ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' 
            : statusMessage.type === 'error'
            ? 'bg-red-50 text-red-800 border border-red-200'
            : 'bg-blue-50 text-blue-800 border border-blue-200'
        }`}>
          <div className="flex items-start gap-2">
            {statusMessage.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            ) : statusMessage.type === 'error' ? (
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
            ) : (
              <ExternalLink className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
            )}
            <div>
              <p className="font-semibold">{statusMessage.text}</p>
              {statusMessage.url && (
                <a
                  href={statusMessage.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-bold underline text-blue-700 hover:text-blue-900 mt-1 inline-flex items-center gap-1"
                >
                  <span>Abrir en Google</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>
          </div>
          <button
            onClick={() => setStatusMessage(null)}
            className="text-slate-400 hover:text-slate-600 text-xs font-bold"
          >
            ✕
          </button>
        </div>
      )}

      {/* Services Grid (3 Columns) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* 1. GOOGLE SHEETS CARD */}
        <div className="bg-slate-50/70 border border-slate-200 rounded-xl p-4 flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                <FileSpreadsheet className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-800">Google Sheets</h3>
                <span className="text-[10px] text-slate-500">Hojas de cálculo en la nube</span>
              </div>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed mb-3">
              Exporta la planilla de calificaciones del grupo activo <strong>{grupo.nombre}</strong> con promedios y condicionales automáticas.
            </p>

            <div className="space-y-2">
              <label className="text-[11px] font-bold text-slate-600 block">
                Selecciona Trimestre:
              </label>
              <div className="flex gap-1">
                {([1, 2, 3] as const).map(t => (
                  <button
                    key={t}
                    onClick={() => setTrimestreSheet(t)}
                    className={`flex-1 py-1.5 text-xs font-bold rounded-lg border transition-all ${
                      trimestreSheet === t
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    Trimestre {t}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <button
            onClick={handleExportSheet}
            disabled={!user || isExportingSheet}
            className="w-full py-2 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-colors disabled:opacity-50 shadow-xs"
          >
            {isExportingSheet ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <FileSpreadsheet className="w-4 h-4" />
            )}
            <span>Exportar a Google Sheets</span>
          </button>
        </div>

        {/* 2. GOOGLE DOCS CARD */}
        <div className="bg-slate-50/70 border border-slate-200 rounded-xl p-4 flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-800">Google Docs</h3>
                <span className="text-[10px] text-slate-500">Documentos oficiales MEDUCA</span>
              </div>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed mb-3">
              Genera un documento editable en Google Docs con el formato oficial de Secuencia Didáctica para imprimir o compartir.
            </p>

            <div className="space-y-2">
              <label className="text-[11px] font-bold text-slate-600 block">
                Selecciona Secuencia:
              </label>
              <select
                value={selectedSecuenciaId}
                onChange={(e) => setSelectedSecuenciaId(e.target.value)}
                className="w-full text-xs p-2 rounded-lg border border-slate-200 bg-white font-medium text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#c9a84c]"
              >
                {secuencias.map((sec, idx) => (
                  <option key={sec.id} value={sec.id}>
                    {sec.grado} - {sec.trimestre} - {sec.area.slice(0, 32)}...
                  </option>
                ))}
              </select>
            </div>
          </div>

          <button
            onClick={handleExportDoc}
            disabled={!user || isExportingDoc}
            className="w-full py-2 px-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-colors disabled:opacity-50 shadow-xs"
          >
            {isExportingDoc ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <FileText className="w-4 h-4" />
            )}
            <span>Exportar a Google Docs</span>
          </button>
        </div>

        {/* 3. GOOGLE DRIVE BACKUP CARD */}
        <div className="bg-slate-50/70 border border-slate-200 rounded-xl p-4 flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
                <HardDrive className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-800">Google Drive</h3>
                <span className="text-[10px] text-slate-500">Resguardo en la nube</span>
              </div>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed mb-3">
              Guarda una copia íntegra de tu base de datos (grupos, alumnos, calificaciones y secuencias) en tu Google Drive personal.
            </p>

            <div className="bg-white p-2.5 rounded-lg border border-slate-200 text-[11px] text-slate-600 space-y-1">
              <div>📦 <strong>{allGrupos.length}</strong> grupos incluidos</div>
              <div>👥 <strong>{allGrupos.reduce((acc, g) => acc + g.estudiantes.length, 0)}</strong> alumnos registrados</div>
              <div>📚 <strong>{secuencias.length}</strong> secuencias didácticas</div>
            </div>
          </div>

          <button
            onClick={handleUploadDriveBackup}
            disabled={!user || isUploadingDrive}
            className="w-full py-2 px-3 bg-[#0a1628] hover:bg-[#1a2a4a] text-[#e8d5a3] rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-colors disabled:opacity-50 shadow-xs"
          >
            {isUploadingDrive ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <HardDrive className="w-4 h-4 text-[#c9a84c]" />
            )}
            <span>Guardar Respaldo en Drive</span>
          </button>
        </div>
      </div>

      {/* Drive Files Explorer */}
      {user && (
        <div className="pt-4 border-t border-slate-200 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <HardDrive className="w-4 h-4 text-[#c9a84c]" />
              <span>Archivos Recientes en Google Drive ({driveFiles.length})</span>
            </h3>
            <button
              onClick={fetchDriveFiles}
              disabled={isLoadingFiles}
              className="px-2.5 py-1 text-[11px] text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-md font-semibold flex items-center gap-1 transition-colors"
            >
              <RefreshCw className={`w-3 h-3 ${isLoadingFiles ? 'animate-spin' : ''}`} />
              <span>Actualizar</span>
            </button>
          </div>

          {isLoadingFiles ? (
            <div className="text-center py-6 text-xs text-slate-400">
              <Loader2 className="w-5 h-5 animate-spin mx-auto mb-1 text-slate-400" />
              Cargando archivos de Drive...
            </div>
          ) : driveFiles.length === 0 ? (
            <div className="text-center py-6 border border-dashed border-slate-200 rounded-xl text-xs text-slate-500">
              No hay archivos de MEDUCA en tu Google Drive aún. Prueba exportar a Sheets o Docs.
            </div>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-slate-200">
              <table className="w-full text-xs text-left border-collapse">
                <thead>
                  <tr className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                    <th className="py-2 px-3">NOMBRE</th>
                    <th className="py-2 px-3">TIPO</th>
                    <th className="py-2 px-3">FECHA MODIFICACIÓN</th>
                    <th className="py-2 px-3 text-center">ACCIONES</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 bg-white">
                  {driveFiles.map((file) => {
                    const isSheet = file.mimeType.includes('spreadsheet');
                    const isDoc = file.mimeType.includes('document');
                    const isJson = file.mimeType.includes('json');

                    return (
                      <tr key={file.id} className="hover:bg-slate-50">
                        <td className="py-2 px-3 font-semibold text-slate-800 flex items-center gap-2">
                          <span>{isSheet ? '📊' : isDoc ? '📄' : '📦'}</span>
                          <span className="truncate max-w-xs">{file.name}</span>
                        </td>
                        <td className="py-2 px-3 text-[11px] text-slate-500">
                          {isSheet ? 'Google Sheets' : isDoc ? 'Google Docs' : isJson ? 'Respaldo JSON' : 'Archivo'}
                        </td>
                        <td className="py-2 px-3 text-[11px] text-slate-500">
                          {file.modifiedTime ? new Date(file.modifiedTime).toLocaleDateString('es-PA') : '---'}
                        </td>
                        <td className="py-2 px-3 text-center space-x-1">
                          {file.webViewLink && (
                            <a
                              href={file.webViewLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-blue-700 font-bold rounded text-[11px]"
                            >
                              <span>Abrir</span>
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          )}
                          <button
                            onClick={() => setFileToDelete(file)}
                            className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded"
                            title="Eliminar de Google Drive"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* User Confirmation Modal for Destructive Delete (MANDATORY per Workspace Skill!) */}
      {fileToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-sm w-full p-6 space-y-4">
            <div className="flex items-center gap-3 text-red-600">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center shrink-0">
                <AlertCircle className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900">¿Eliminar archivo de Drive?</h3>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              ¿Estás seguro de que deseas eliminar <strong>"{fileToDelete.name}"</strong> de tu cuenta de Google Drive? Esta acción moverá el archivo a la papelera.
            </p>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setFileToDelete(null)}
                disabled={isDeleting}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg text-xs"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={confirmDeleteFile}
                disabled={isDeleting}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg text-xs flex items-center gap-1.5"
              >
                {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                <span>Confirmar y Eliminar</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
