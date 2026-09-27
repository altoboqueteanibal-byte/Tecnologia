import { Grupo, AppConfig, SecuenciaDidactica } from '../types';
import { getAccessToken } from './googleAuth';

export interface DriveFileItem {
  id: string;
  name: string;
  mimeType: string;
  webViewLink?: string;
  iconLink?: string;
  modifiedTime?: string;
  size?: string;
}

// Helper to make authenticated requests to Google APIs
async function googleFetch(url: string, options: RequestInit = {}): Promise<any> {
  const token = await getAccessToken();
  if (!token) {
    throw new Error('No has iniciado sesión con Google Workspace. Por favor inicia sesión primero.');
  }

  const headers = new Headers(options.headers || {});
  headers.set('Authorization', `Bearer ${token}`);
  if (!headers.has('Content-Type') && options.body && typeof options.body === 'string') {
    headers.set('Content-Type', 'application/json');
  }

  const res = await fetch(url, { ...options, headers });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    const message = errorData.error?.message || `Error en la solicitud (${res.status} ${res.statusText})`;
    throw new Error(message);
  }

  if (res.status === 204) return null;
  return res.json();
}

// ==========================================
// 1. GOOGLE SHEETS API
// ==========================================

export async function exportarGrupoAGoogleSheets(
  grupo: Grupo,
  config: AppConfig,
  trimestre: 1 | 2 | 3
): Promise<{ spreadsheetId: string; url: string }> {
  const title = `MEDUCA - ${grupo.nombre} - Calificaciones T${trimestre} (${config.anio})`;

  // Build matrix of values
  const rows: (string | number)[][] = [];

  // Header rows
  rows.push(['REPÚBLICA DE PANAMÁ - MINISTERIO DE EDUCACIÓN']);
  rows.push([config.regional || 'Dirección Regional de Educación', '', config.escuela || 'Centro Educativo']);
  rows.push([`REGISTRO OFICIAL DE CALIFICACIONES - TRIMESTRE ${trimestre} (${config.anio})`]);
  rows.push([`Docente: ${config.docente}`, '', `Grupo: ${grupo.nombre}`, '', `Asignatura: ${config.asignatura}`]);
  rows.push([]); // blank

  // Column table headers
  rows.push([
    'N°',
    'CÉDULA',
    'APELLIDOS Y NOMBRES',
    'N1', 'N2', 'N3', 'N4', 'N5', 'N6', 'N7', 'N8',
    'PROMEDIO',
    'ESTADO'
  ]);

  // Student rows
  const notasTrimestre = grupo.notas[trimestre] || {};
  grupo.estudiantes.forEach((est, idx) => {
    let suma = 0;
    let count = 0;
    const notasList: (number | string)[] = [];

    for (let n = 1; n <= 8; n++) {
      const val = notasTrimestre[`${idx}_${n}`];
      if (val !== undefined && val !== null && !isNaN(val)) {
        notasList.push(val);
        suma += val;
        count++;
      } else {
        notasList.push('');
      }
    }

    const promedio = count > 0 ? Number((suma / count).toFixed(2)) : '';
    const estado = typeof promedio === 'number' 
      ? (promedio >= 3.0 ? 'APROBADO' : 'REPROBADO')
      : 'SIN NOTAS';

    rows.push([
      idx + 1,
      est.cedula || '---',
      est.nombre,
      ...notasList,
      promedio,
      estado
    ]);
  });

  // Create spreadsheet with initial values
  const payload = {
    properties: {
      title,
    },
    sheets: [
      {
        properties: {
          title: `Trimestre ${trimestre}`,
          gridProperties: {
            frozenRowCount: 6,
          }
        },
        data: [
          {
            startRow: 0,
            startColumn: 0,
            rowData: rows.map(r => ({
              values: r.map(cell => {
                if (typeof cell === 'number') {
                  return { userEnteredValue: { numberValue: cell } };
                }
                return { userEnteredValue: { stringValue: String(cell) } };
              })
            }))
          }
        ]
      }
    ]
  };

  const created = await googleFetch('https://sheets.googleapis.com/v4/spreadsheets', {
    method: 'POST',
    body: JSON.stringify(payload)
  });

  const spreadsheetId = created.spreadsheetId;
  const url = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit`;

  return { spreadsheetId, url };
}

// ==========================================
// 2. GOOGLE DOCS API
// ==========================================

export async function exportarSecuenciaAGoogleDocs(
  secuencia: SecuenciaDidactica,
  config: AppConfig
): Promise<{ documentId: string; url: string }> {
  const title = `Secuencia Didáctica MEDUCA - ${secuencia.grado} - ${secuencia.area}`;

  // 1. Create empty document
  const created = await googleFetch('https://docs.googleapis.com/v1/documents', {
    method: 'POST',
    body: JSON.stringify({ title })
  });

  const documentId = created.documentId;

  // 2. Build structured document text
  const docText = 
`REPÚBLICA DE PANAMÁ - MINISTERIO DE EDUCACIÓN
${config.regional} · ${config.escuela}
SECUENCIA DIDÁCTICA SEMANAL O QUINCENAL

INFORMACIÓN GENERAL:
• ASIGNATURA: ${config.asignatura}
• GRADO: ${secuencia.grado}
• DOCENTE: ${config.docente}
• TRIMESTRE: ${secuencia.trimestre}
• SEMANAS: ${secuencia.semana} (Año lectivo ${config.anio})

--------------------------------------------------------------------------------
1. FUNDAMENTACIÓN CURRICULAR
--------------------------------------------------------------------------------
ÁREA:
${secuencia.area}

COMPETENCIA(S):
${secuencia.competencia}

OBJETIVO(S) DE APRENDIZAJE:
${secuencia.objetivo}

CONTENIDOS:
a) Conceptual:
${secuencia.conceptual}

b) Procedimental:
${secuencia.procedimental}

c) Actitudinal:
${secuencia.actitudinal}

INDICADOR(ES) DE LOGRO:
${secuencia.indicador}

--------------------------------------------------------------------------------
2. ACTIVIDADES DE APRENDIZAJE
--------------------------------------------------------------------------------
• Actividad(es) de Inicio:
${secuencia.act_inicio}

• Actividad(es) de Desarrollo:
${secuencia.act_desarrollo}

• Actividad(es) de Cierre:
${secuencia.act_cierre}

--------------------------------------------------------------------------------
3. EVALUACIÓN DE LOS APRENDIZAJES
--------------------------------------------------------------------------------
• EVIDENCIAS:
${secuencia.evidencia}

• CRITERIOS DE EVALUACIÓN:
${secuencia.criterios}

• TIPO DE EVALUACIÓN / INSTRUMENTOS:
${secuencia.tipo_eval}

--------------------------------------------------------------------------------
4. OBSERVACIONES PEDAGÓGICAS
--------------------------------------------------------------------------------
${secuencia.observaciones || 'Sin observaciones registradas.'}

--------------------------------------------------------------------------------
FIRMAS DE RESPONSABILIDAD:

Docente Responsable:
${config.docente}
__________________________________________

Técnico Docente / Dirección:
__________________________________________
`;

  // Insert text into document
  await googleFetch(`https://docs.googleapis.com/v1/documents/${documentId}:batchUpdate`, {
    method: 'POST',
    body: JSON.stringify({
      requests: [
        {
          insertText: {
            location: { index: 1 },
            text: docText
          }
        }
      ]
    })
  });

  const url = `https://docs.google.com/document/d/${documentId}/edit`;
  return { documentId, url };
}

// ==========================================
// 3. GOOGLE DRIVE API
// ==========================================

export async function listarArchivosDrive(query: string = "trashed = false"): Promise<DriveFileItem[]> {
  const fields = 'files(id, name, mimeType, webViewLink, iconLink, modifiedTime, size)';
  const encodedQuery = encodeURIComponent(query);
  const data = await googleFetch(
    `https://www.googleapis.com/drive/v3/files?q=${encodedQuery}&orderBy=modifiedTime desc&pageSize=25&fields=${fields}`
  );
  return data.files || [];
}

export async function guardarRespaldoEnDrive(
  backupData: any,
  fileName?: string
): Promise<{ fileId: string; url: string }> {
  const name = fileName || `Respaldo_MEDUCA_${new Date().toISOString().replace(/[:.]/g, '-')}.json`;
  const fileContent = JSON.stringify(backupData, null, 2);

  const metadata = {
    name,
    mimeType: 'application/json',
    description: 'Respaldo completo del Sistema de Registro y Secuencias MEDUCA Tech'
  };

  // Multipart upload to Google Drive
  const boundary = '-------314159265358979323846';
  const delimiter = `\r\n--${boundary}\r\n`;
  const closeDelimiter = `\r\n--${boundary}--`;

  const multipartRequestBody =
    delimiter +
    'Content-Type: application/json; charset=UTF-8\r\n\r\n' +
    JSON.stringify(metadata) +
    delimiter +
    'Content-Type: application/json\r\n\r\n' +
    fileContent +
    closeDelimiter;

  const token = await getAccessToken();
  const res = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,webViewLink', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': `multipart/related; boundary=${boundary}`,
    },
    body: multipartRequestBody
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error?.message || 'Error al subir el archivo a Google Drive');
  }

  const data = await res.json();
  return { fileId: data.id, url: data.webViewLink || `https://drive.google.com/file/d/${data.id}/view` };
}

export async function descargarRespaldoDeDrive(fileId: string): Promise<any> {
  const data = await googleFetch(`https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`);
  return data;
}

export async function eliminarArchivoDrive(fileId: string, fileName: string): Promise<void> {
  // CRITICAL per workspace skill: Must be explicitly confirmed before calling mutating/destructive delete
  await googleFetch(`https://www.googleapis.com/drive/v3/files/${fileId}`, {
    method: 'DELETE'
  });
}
