export interface RefinanciacionRequest {
  idsPrestamos: number[];
  fechaInicio: string; // ISO format (YYYY-MM-DD)
  fechaFin: string;    // ISO format (YYYY-MM-DD)
  montoCuota: number;     
  cuotas: number;
  clienteID: number;
  periodo_pago: string; // Ej: "Diario", "Semanal", etc.
}