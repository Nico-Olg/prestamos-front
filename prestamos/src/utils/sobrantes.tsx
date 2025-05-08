interface Sobrante {
  pagoId: number;
  monto: number;
  fecha: string; // formato YYYY-MM-DD
}

const STORAGE_KEY = "sobrantesPagos";

/**
 * Agrega un sobrante asociado a un pago específico.
 */
export function agregarSobrante(pagoId: number, monto: number): void {
  const hoy = new Date().toISOString().split("T")[0]; // YYYY-MM-DD
  const sobrantes = obtenerSobrantes();

  sobrantes.push({ pagoId, monto, fecha: hoy });

  localStorage.setItem(STORAGE_KEY, JSON.stringify(sobrantes));
}

/**
 * Devuelve todos los sobrantes guardados en localStorage.
 */
export function obtenerSobrantes(): Sobrante[] {
  const data = localStorage.getItem(STORAGE_KEY);
  if (!data) return [];
  try {
    return JSON.parse(data) as Sobrante[];
  } catch (e) {
    console.warn("Error al parsear sobrantes desde localStorage", e);
    return [];
  }
}

/**
 * Devuelve un mapa de pagoId -> monto del día actual.
 */
export const obtenerSobrantesComoMapa = (): Record<number, number> => {
  const hoy = new Date().toISOString().split("T")[0];
  return obtenerSobrantes()
    .filter((s) => s.fecha === hoy)
    .reduce((acc, item) => {
      acc[item.pagoId] = (acc[item.pagoId] || 0) + item.monto;
      return acc;
    }, {} as Record<number, number>);
};

/**
 * Limpia del localStorage todos los sobrantes que no sean del día actual.
 */
export function limpiarSobrantesViejos(): void {
  const hoy = new Date().toISOString().split("T")[0];
  const sobrantesActualizados = obtenerSobrantes().filter(
    (s) => s.fecha === hoy
  );
  localStorage.setItem(STORAGE_KEY, JSON.stringify(sobrantesActualizados));
}

/**
 * Devuelve la suma de los montos sobrantes del día actual.
 */
export function totalSobrantesDelDia(): number {
  const hoy = new Date().toISOString().split("T")[0];
  return obtenerSobrantes()
    .filter((s) => s.fecha === hoy)
    .reduce((acc, s) => acc + s.monto, 0);
}
