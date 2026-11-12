export function calcularPorcentajeProgreso(
  totalDias: number,
  duracionDias: number,
): number {
  if (duracionDias <= 0) return 0;

  const porcentaje = (totalDias / duracionDias) * 100;

  return Math.min(100, Math.max(0, Math.round(porcentaje)));
}
