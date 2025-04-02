import React from "react";
import "../styles/PagoCard.css";
import { Pago } from "../interfaces/Pagos"; // Asegúrate de que la ruta sea correcta

// Extender el tipo Pago para incluir las props adicionales usadas en el componente
type PagoConExtras = Pago & {
  handlePagoCuota: (pagoId: number, monto: number) => void;
  montoAbonado?: number | null;
};

const PagoCard: React.FC<{ pago: PagoConExtras }> = ({ pago }) => {
  const diferencia = pago.monto - (pago.montoAbonado || 0);
  const isPagado = (pago.montoAbonado && diferencia <= 0) || pago.fechaPago !== null;

  return (
    <div className="pago-card" style={{ backgroundColor: isPagado ? "#C7C8CA" : "white" }}>
      <p><strong>📌 Cliente:</strong> {pago.nombreCliente}</p>
      <p><strong>💳 Producto:</strong> {pago.producto}</p>
      <p><strong>💳 Cuota nro:</strong> {pago.cuotaNro}</p>
      <p><strong>💰 Monto Cuota:</strong> ${pago.monto.toFixed(2)}</p>
      <p><strong>💵 Monto Abonado:</strong> ${pago.montoAbonado || 0}</p>
      <p><strong>⚠ Diferencia:</strong> ${diferencia}</p>
      <p><strong>📅 Fecha de Pago:</strong> {pago.fechaPago || "No pagado"}</p>

      {isPagado ? (
        <span className="pagado">✅ Cuota Pagada</span>
      ) : (
        <button className="btn-pagar" onClick={() => pago.handlePagoCuota(pago.id, diferencia)}>
          Pagar
        </button>
      )}
    </div>
  );
};

export default PagoCard;
