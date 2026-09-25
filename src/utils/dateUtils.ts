export function sumarDias(fechaBase: Date, dias: number): Date {
  const f = new Date(fechaBase);
  f.setDate(f.getDate() + dias);
  return f;
}

export function formatearFechaEspanol(fecha: Date): string {
  const dias = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
  const meses = [
    'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
    'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'
  ];
  return `${dias[fecha.getDay()]} ${fecha.getDate()} de ${meses[fecha.getMonth()]} de ${fecha.getFullYear()}`;
}

export function obtenerRangoFechasQuincenal(
  semanaIndex: number,
  anioInicio: number = 2026,
  mesInicio: number = 3,
  diaInicio: number = 2
): { inicio: string; fin: string } {
  const diasInicio = semanaIndex * 14;
  const fechaBase = new Date(anioInicio, mesInicio - 1, diaInicio);
  const fechaInicio = sumarDias(fechaBase, diasInicio);
  const fechaFin = sumarDias(fechaInicio, 11); // 2 weeks school period (Monday to Friday of week 2)

  return {
    inicio: formatearFechaEspanol(fechaInicio),
    fin: formatearFechaEspanol(fechaFin)
  };
}

export function obtenerRangoSemana(
  semanaNum: number,
  anioInicio: number = 2026,
  mesInicio: number = 3,
  diaInicio: number = 2
): { lunes: string; viernes: string } {
  const fechaBase = new Date(anioInicio, mesInicio - 1, diaInicio);
  const fechaLunes = sumarDias(fechaBase, semanaNum * 7);
  const fechaViernes = sumarDias(fechaLunes, 4);

  const meses = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
  const formatoCorto = (d: Date) => `${d.getDate()} de ${meses[d.getMonth()]}`;

  return {
    lunes: formatoCorto(fechaLunes),
    viernes: formatoCorto(fechaViernes)
  };
}
