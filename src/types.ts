export type TipoAsistencia = 'P' | 'A' | 'T' | 'J';

export interface Estudiante {
  id: string;
  nombre: string;
  cedula: string;
  acudiente: string;
  telefono: string;
  observaciones?: string;
}

export interface NotasTrimestre {
  [key: string]: number; // key: `${estudianteIdx}_${notaNum}` (notaNum 1..8)
}

export interface AsistenciaData {
  [key: string]: TipoAsistencia; // key: `${trimestre}_semana_${semana}_${estudianteIdx}_${dia}`
}

export interface Grupo {
  id: string;
  nombre: string;
  grado: string; // e.g., '3°', '4°', '5°', '6°', or custom
  estudiantes: Estudiante[];
  notas: {
    1: NotasTrimestre;
    2: NotasTrimestre;
    3: NotasTrimestre;
  };
  asistencia: AsistenciaData;
}

export interface SecuenciaDidactica {
  id: string;
  grado: string; // '3°' | '4°' | '5°' | '6°' | 'Multigrado'
  trimestre: 'PRIMERO' | 'SEGUNDO' | 'TERCERO';
  semana: string; // e.g., '1 - 2'
  area: string;
  objetivo: string;
  competencia: string;
  conceptual: string;
  procedimental: string;
  actitudinal: string;
  indicador: string;
  act_inicio: string;
  act_desarrollo: string;
  act_cierre: string;
  evidencia: string;
  criterios: string;
  tipo_eval: string;
  observaciones?: string;
}

export interface AppConfig {
  docente: string;
  escuela: string;
  regional: string;
  ministerio: string;
  anio: string;
  asignatura: string;
  diaInicio: number;
  mesInicio: number;
  anioInicio: number;
}

export interface RespaldoItem {
  id: string;
  nombre: string;
  fecha: string;
  gruposCount: number;
  estudiantesCount: number;
  data: {
    grupos: Grupo[];
    grupoActualIndex: number;
    config: AppConfig;
    secuencias?: SecuenciaDidactica[];
  };
}
