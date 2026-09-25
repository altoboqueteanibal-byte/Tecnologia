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
    notas: {
      1: {
        '0_1': 4.5, '0_2': 4.2, '0_3': 4.8, '0_4': 4.0, '0_5': 4.6, '0_6': 4.3, '0_7': 4.7, '0_8': 4.5,
        '1_1': 4.8, '1_2': 5.0, '1_3': 4.7, '1_4': 4.9, '1_5': 5.0, '1_6': 4.8, '1_7': 4.9, '1_8': 5.0,
        '2_1': 3.8, '2_2': 4.0, '2_3': 3.5, '2_4': 4.2, '2_5': 3.9, '2_6': 4.1, '2_7': 3.7, '2_8': 4.0,
        '3_1': 4.0, '3_2': 4.3, '3_3': 4.1, '3_4': 4.5, '3_5': 4.2, '3_6': 4.0, '3_7': 4.4, '3_8': 4.2,
        '4_1': 3.2, '4_2': 3.0, '4_3': 2.8, '4_4': 3.5, '4_5': 3.1, '4_6': 3.4, '4_7': 3.0, '4_8': 3.2,
        '5_1': 4.6, '5_2': 4.8, '5_3': 4.5, '5_4': 4.7, '5_5': 4.9, '5_6': 4.6, '5_7': 4.8, '5_8': 4.7,
        '6_1': 2.7, '6_2': 2.9, '6_3': 3.0, '6_4': 2.8, '6_5': 3.1, '6_6': 2.6, '6_7': 2.9, '6_8': 3.0,
        '7_1': 4.2, '7_2': 4.5, '7_3': 4.0, '7_4': 4.3, '7_5': 4.6, '7_6': 4.1, '7_7': 4.4, '7_8': 4.3
      },
      2: {
        '0_1': 4.6, '0_2': 4.4, '0_3': 4.7, '0_4': 4.3,
        '1_1': 5.0, '1_2': 4.9, '1_3': 4.8, '1_4': 5.0,
        '2_1': 4.0, '2_2': 4.1, '2_3': 3.8, '2_4': 4.2,
        '3_1': 4.2, '3_2': 4.4, '3_3': 4.3, '3_4': 4.5,
        '4_1': 3.4, '4_2': 3.5, '4_3': 3.2, '4_4': 3.6,
        '5_1': 4.8, '5_2': 4.7, '5_3': 4.9, '5_4': 4.8,
        '6_1': 3.0, '6_2': 3.2, '6_3': 3.1, '6_4': 3.3,
        '7_1': 4.4, '7_2': 4.6, '7_3': 4.3, '7_4': 4.5
      },
      3: {
        '0_1': 4.7, '0_2': 4.5,
        '1_1': 5.0, '1_2': 5.0,
        '2_1': 4.2, '2_2': 4.3,
        '3_1': 4.5, '3_2': 4.6,
        '4_1': 3.5, '4_2': 3.6,
        '5_1': 4.9, '5_2': 5.0,
        '6_1': 3.2, '6_2': 3.4,
        '7_1': 4.5, '7_2': 4.7
      }
    },
    asistencia: {
      '1_semana_0_0_0': 'P', '1_semana_0_0_1': 'P', '1_semana_0_0_2': 'P', '1_semana_0_0_3': 'P', '1_semana_0_0_4': 'P',
      '1_semana_0_1_0': 'P', '1_semana_0_1_1': 'P', '1_semana_0_1_2': 'P', '1_semana_0_1_3': 'P', '1_semana_0_1_4': 'P',
      '1_semana_0_2_0': 'P', '1_semana_0_2_1': 'T', '1_semana_0_2_2': 'P', '1_semana_0_2_3': 'P', '1_semana_0_2_4': 'P',
      '1_semana_0_3_0': 'P', '1_semana_0_3_1': 'P', '1_semana_0_3_2': 'P', '1_semana_0_3_3': 'P', '1_semana_0_3_4': 'P',
      '1_semana_0_4_0': 'P', '1_semana_0_4_1': 'A', '1_semana_0_4_2': 'J', '1_semana_0_4_3': 'P', '1_semana_0_4_4': 'P',
      '1_semana_0_5_0': 'P', '1_semana_0_5_1': 'P', '1_semana_0_5_2': 'P', '1_semana_0_5_3': 'P', '1_semana_0_5_4': 'P',
      '1_semana_0_6_0': 'P', '1_semana_0_6_1': 'A', '1_semana_0_6_2': 'A', '1_semana_0_6_3': 'P', '1_semana_0_6_4': 'T',
      '1_semana_0_7_0': 'P', '1_semana_0_7_1': 'P', '1_semana_0_7_2': 'P', '1_semana_0_7_3': 'P', '1_semana_0_7_4': 'P',

      '1_semana_1_0_0': 'P', '1_semana_1_0_1': 'P', '1_semana_1_0_2': 'P', '1_semana_1_0_3': 'P', '1_semana_1_0_4': 'P',
      '1_semana_1_1_0': 'P', '1_semana_1_1_1': 'P', '1_semana_1_1_2': 'P', '1_semana_1_1_3': 'P', '1_semana_1_1_4': 'P',
      '1_semana_1_2_0': 'P', '1_semana_1_2_1': 'P', '1_semana_1_2_2': 'P', '1_semana_1_2_3': 'P', '1_semana_1_2_4': 'P',
      '1_semana_1_3_0': 'P', '1_semana_1_3_1': 'P', '1_semana_1_3_2': 'P', '1_semana_1_3_3': 'P', '1_semana_1_3_4': 'P',
      '1_semana_1_4_0': 'P', '1_semana_1_4_1': 'P', '1_semana_1_4_2': 'P', '1_semana_1_4_3': 'T', '1_semana_1_4_4': 'P',
      '1_semana_1_5_0': 'P', '1_semana_1_5_1': 'P', '1_semana_1_5_2': 'P', '1_semana_1_5_3': 'P', '1_semana_1_5_4': 'P',
      '1_semana_1_6_0': 'P', '1_semana_1_6_1': 'P', '1_semana_1_6_2': 'A', '1_semana_1_6_3': 'P', '1_semana_1_6_4': 'P',
      '1_semana_1_7_0': 'P', '1_semana_1_7_1': 'P', '1_semana_1_7_2': 'P', '1_semana_1_7_3': 'P', '1_semana_1_7_4': 'P'
    }
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
    notas: {
      1: {
        '0_1': 4.0, '0_2': 4.2, '0_3': 3.9, '0_4': 4.1, '0_5': 4.3, '0_6': 4.0, '0_7': 4.4, '0_8': 4.2,
        '1_1': 4.5, '1_2': 4.7, '1_3': 4.6, '1_4': 4.8, '1_5': 4.7, '1_6': 4.9, '1_7': 4.8, '1_8': 4.7,
        '2_1': 3.5, '2_2': 3.7, '2_3': 3.6, '2_4': 3.8, '2_5': 3.4, '2_6': 3.6, '2_7': 3.5, '2_8': 3.7,
        '3_1': 4.8, '3_2': 4.9, '3_3': 5.0, '3_4': 4.7, '3_5': 4.9, '3_6': 4.8, '3_7': 5.0, '3_8': 4.9,
        '4_1': 3.0, '4_2': 3.2, '4_3': 3.1, '4_4': 2.9, '4_5': 3.3, '4_6': 3.0, '4_7': 3.1, '4_8': 3.2,
        '5_1': 4.2, '5_2': 4.4, '5_3': 4.1, '5_4': 4.5, '5_5': 4.3, '5_6': 4.4, '5_7': 4.2, '5_8': 4.3
      },
      2: {
        '0_1': 4.2, '0_2': 4.3, '0_3': 4.1,
        '1_1': 4.8, '1_2': 4.9, '1_3': 4.7,
        '2_1': 3.8, '2_2': 3.9, '2_3': 3.7,
        '3_1': 5.0, '3_2': 4.9, '3_3': 5.0,
        '4_1': 3.2, '4_2': 3.4, '4_3': 3.1,
        '5_1': 4.4, '5_2': 4.5, '5_3': 4.3
      },
      3: {
        '0_1': 4.4,
        '1_1': 5.0,
        '2_1': 4.0,
        '3_1': 5.0,
        '4_1': 3.5,
        '5_1': 4.5
      }
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
    notas: {
      1: {
        '0_1': 4.3, '0_2': 4.5, '0_3': 4.2, '0_4': 4.6, '0_5': 4.4,
        '1_1': 4.7, '1_2': 4.9, '1_3': 4.8, '1_4': 5.0, '1_5': 4.8,
        '2_1': 3.8, '2_2': 4.0, '2_3': 3.9, '2_4': 4.1, '2_5': 3.7,
        '3_1': 4.5, '3_2': 4.7, '3_3': 4.6, '3_4': 4.8, '3_5': 4.5,
        '4_1': 3.4, '4_2': 3.6, '4_3': 3.5, '4_4': 3.8, '4_5': 3.3
      },
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
