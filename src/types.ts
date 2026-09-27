export type TipoAsistencia = 'P' | 'A' | 'T' | 'J';

export type CategoriaSeguimiento = 
  | 'Logro Destacado' 
  | 'Participación' 
  | 'Tarea Pendiente' 
  | 'Conducta' 
  | 'Atención Requerida' 
  | 'Citación Acudiente' 
  | 'Adecuación Curricular';

export interface RegistroSeguimiento {
  id: string;
  fecha: string;
  categoria: CategoriaSeguimiento;
  descripcion: string;
  docente?: string;
}

export interface Estudiante {
  id: string;
  nombre: string;
  cedula: string;
  acudiente: string;
  telefono: string;
  observaciones?: string;
  bitacora?: RegistroSeguimiento[];
  intereses?: string;
  condicionSalud?: string;
}

export type TipoActividadEvaluacion = 
  | 'Taller' 
  | 'Laboratorio' 
  | 'Tarea' 
  | 'Investigación' 
  | 'Parcial' 
  | 'Proyecto' 
  | 'Apreciación';

export interface ActividadEvaluacion {
  id: string;
  nombre: string;
  tipo: TipoActividadEvaluacion;
  fecha?: string;
  descripcion?: string;
}

export interface NotasTrimestre {
  [key: string]: number; // key: `${estudianteIdx}_${actividadId}`
}

export interface AsistenciaData {
  [key: string]: TipoAsistencia; // key: `${trimestre}_semana_${semana}_${estudianteIdx}_${dia}`
}

export interface Grupo {
  id: string;
  nombre: string;
  grado: string; // e.g., '3°', '4°', '5°', '6°', or custom
  estudiantes: Estudiante[];
  actividades?: {
    1?: ActividadEvaluacion[];
    2?: ActividadEvaluacion[];
    3?: ActividadEvaluacion[];
  };
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
  tema?: string; // Tema curricular específico
  subtema?: string; // Subtema curricular específico
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

export interface TemaCurricularItem {
  id: string;
  area: string;
  tema: string;
  subtema: string;
  gradoSugerido: string; // '3°' | '4°' | '5°' | '6°' | 'Multigrado' | 'Todos'
  trimestreSugerido: 'PRIMERO' | 'SEGUNDO' | 'TERCERO' | 'Todos';
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
