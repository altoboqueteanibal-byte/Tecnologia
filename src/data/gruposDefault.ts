import { Grupo } from '../types';

export const GRUPOS_INICIALES: Grupo[] = [
  {
    id: 'grp-1',
    nombre: '5° Grado A - Tecnología',
    grado: '5°',
    estudiantes: [
      { id: 'est-1', nombre: 'Abrego Miranda, Alexis', cedula: '4-812-1402', acudiente: 'María Miranda', telefono: '6741-2901' },
      { id: 'est-2', nombre: 'Bejerano Tugrí, Cristina', cedula: '12-701-382', acudiente: 'Roberto Tugrí', telefono: '6812-4490' },
      { id: 'est-3', nombre: 'Castillo Montezuma, Daniel', cedula: '4-819-2201', acudiente: 'Aníbal Castillo', telefono: '6923-1188' },
      { id: 'est-4', nombre: 'Jiménez Santos, Elena', cedula: '4-825-901', acudiente: 'Carmen Santos', telefono: '6610-9832' },
      { id: 'est-5', nombre: 'Montezuma Palacio, Fernando', cedula: '12-710-149', acudiente: 'Esteban Palacio', telefono: '6488-3012' },
      { id: 'est-6', nombre: 'Palacio Rodríguez, Gabriela', cedula: '4-830-412', acudiente: 'Rosa Rodríguez', telefono: '6571-0023' },
      { id: 'est-7', nombre: 'Rodríguez Cueva, Héctor', cedula: '4-833-119', acudiente: 'Héctor Rodríguez Sr.', telefono: '6712-8841' },
      { id: 'est-8', nombre: 'Santos Tugrí, Iris Sofía', cedula: '12-720-650', acudiente: 'Luzmila Tugrí', telefono: '6901-5522' }
    ],
    actividades: {
      1: [],
      2: [],
      3: []
    },
    notas: {
      1: {},
      2: {},
      3: {}
    },
    asistencia: {}
  },
  {
    id: 'grp-2',
    nombre: '4° Grado A - Informática',
    grado: '4°',
    estudiantes: [
      { id: 'est-201', nombre: 'Atencio González, Carlos', cedula: '4-840-102', acudiente: 'Marta González', telefono: '6811-2299' },
      { id: 'est-202', nombre: 'Cáceres Tugrí, Dayana', cedula: '12-730-890', acudiente: 'José Cáceres', telefono: '6733-1455' },
      { id: 'est-203', nombre: 'Gómez Palacio, Javier', cedula: '4-842-301', acudiente: 'Elena Palacio', telefono: '6944-5510' },
      { id: 'est-204', nombre: 'Miranda Jiménez, Lucía', cedula: '4-845-667', acudiente: 'Mario Miranda', telefono: '6520-3388' },
      { id: 'est-205', nombre: 'Sánchez Montezuma, Pablo', cedula: '12-735-412', acudiente: 'Juana Montezuma', telefono: '6618-9900' },
      { id: 'est-206', nombre: 'Villagra Abrego, Valeria', cedula: '4-849-219', acudiente: 'Teresa Abrego', telefono: '6890-4411' }
    ],
    actividades: {
      1: [],
      2: [],
      3: []
    },
    notas: {
      1: {},
      2: {},
      3: {}
    },
    asistencia: {}
  },
  {
    id: 'grp-3',
    nombre: '3° Grado A - Computación',
    grado: '3°',
    estudiantes: [
      { id: 'est-301', nombre: 'Barría Cueva, Andrés', cedula: '4-850-120', acudiente: 'Silvia Cueva', telefono: '6711-0012' },
      { id: 'est-302', nombre: 'Castillo Tugrí, Brenda', cedula: '12-740-551', acudiente: 'Jaime Castillo', telefono: '6822-3344' },
      { id: 'est-303', nombre: 'Jiménez Montezuma, Cristian', cedula: '4-852-881', acudiente: 'Maritza Montezuma', telefono: '6933-7722' },
      { id: 'est-304', nombre: 'Montezuma Santos, Diana', cedula: '12-745-902', acudiente: 'Pedro Santos', telefono: '6544-8899' },
      { id: 'est-305', nombre: 'Rodríguez Palacio, Emanuel', cedula: '4-855-401', acudiente: 'Beatriz Palacio', telefono: '6655-1177' }
    ],
    actividades: {
      1: [],
      2: [],
      3: []
    },
    notas: {
      1: {},
      2: {},
      3: {}
    },
    asistencia: {}
  }
];

export const CONFIG_INICIAL = {
  docente: 'Aníbal Castillo',
  escuela: 'C.E. CERRO IGLESIA',
  regional: 'Dirección Regional de Educación de Comarca Ngäbe Buglé',
  ministerio: 'Ministerio de Educación de Panamá (MEDUCA)',
  anio: '2026',
  asignatura: 'TECNOLOGÍA / INFORMÁTICA',
  diaInicio: 2,
  mesInicio: 3,
  anioInicio: 2026
};
