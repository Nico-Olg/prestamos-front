
const DEBUG_MODE = true; // Cambiar a false en producción

const LOG_KEY = "debugCobranza";

export const logPagoRecibido = (cliente: string, monto: number) => {
  if (!DEBUG_MODE) return;

  const hoy = new Date().toISOString().split("T")[0];
  const entrada = { cliente, monto, fecha: hoy, timestamp: new Date().toISOString() };

  const prev = localStorage.getItem(LOG_KEY);
  const data = prev ? JSON.parse(prev) : [];

  data.push(entrada);
  localStorage.setItem(LOG_KEY, JSON.stringify(data));
};

export const obtenerLogCobranza = (): any[] => {
  const prev = localStorage.getItem(LOG_KEY);
  return prev ? JSON.parse(prev) : [];
};

export const limpiarLogCobranza = () => {
  localStorage.removeItem(LOG_KEY);
};
