const TOTAL_KEY = "totalCobradoDelDia";

interface TotalCobradoData {
  fecha: string; // formato 'YYYY-MM-DD'
  total: number;
}

export const guardarTotalCobrado = (monto: number) => {
  const hoy = new Date().toLocaleDateString("sv-SE"); // 'YYYY-MM-DD'
  const data: TotalCobradoData = { fecha: hoy, total: monto };
  localStorage.setItem(TOTAL_KEY, JSON.stringify(data));
};

export const obtenerTotalCobrado = (): number => {
  const raw = localStorage.getItem(TOTAL_KEY);
  if (!raw) return 0;

  try {
    const { fecha, total } = JSON.parse(raw) as TotalCobradoData;
    const hoy = new Date().toLocaleDateString("sv-SE"); // 'YYYY-MM-DD'
    return fecha === hoy ? total : 0;
  } catch (e) {
    return 0;
  }
};