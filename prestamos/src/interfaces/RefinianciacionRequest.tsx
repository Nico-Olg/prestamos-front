export interface RefinanciacionRequest {
  idsPrestamos: number[];
  fechaInicio: string; // ISO format (YYYY-MM-DD)
  fechaFin: string;    // ISO format (YYYY-MM-DD)
  interes: number;     // Ej: 1.2 para 20% de interés
  cuotas: number;
  clienteID: number;
  periodo_pago: string; // Ej: "Diario", "Semanal", etc.
}