import React from "react";
import "../styles/PagoCard.css"; // 🔹 Estilos específicos para las tarjetas

interface Pago {
  id: number;
  nombreCliente: string;
  cuotaNro: number;
  producto: string;
  monto: number;
  montoAbonado?: number | null;
  fechaPago?: string | null;
  handlePagoCuota: (pagoId: number, monto: number) => void;
}

const PagoCard: React.FC<{ pago: Pago }> = ({ pago }) => {
  const diferencia = pago.monto - (pago.montoAbonado || 0);
  const isPagado = (pago.montoAbonado && diferencia <= 0) || pago.fechaPago !== null;


  return (
    <div className="pago-card"
      style={{ backgroundColor: isPagado ? "#C7C8CA" : "white" }}>
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
