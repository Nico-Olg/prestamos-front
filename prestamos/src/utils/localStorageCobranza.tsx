const STORAGE_KEY = "totalCobradoHoy";

export const guardarTotalCobrado = (total: number) => {
  const hoy = new Date().toISOString().split("T")[0]; // "2025-04-15"
  const data = { total, fecha: hoy };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
};

export const obtenerTotalCobrado = (): number => {
  const data = localStorage.getItem(STORAGE_KEY);
  if (!data) return 0;

  try {
    const { total, fecha } = JSON.parse(data);
    const hoy = new Date().toISOString().split("T")[0];
    if (fecha === hoy) return total;
    else {
      localStorage.removeItem(STORAGE_KEY); // Limpia si es otro día
      return 0;
    }
  } catch {
    localStorage.removeItem(STORAGE_KEY); // Limpia si está roto el JSON
    return 0;
  }
};
