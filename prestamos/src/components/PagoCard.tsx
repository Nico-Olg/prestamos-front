// src/components/PagoCard.tsx
import React from "react";
import "../styles/PagoCard.css";
import { Pago } from "../interfaces/Pagos";

// Extender el tipo Pago para incluir las props adicionales usadas en el componente
type PagoConExtras = Pago & {
  handlePagoCuota: (pagoId: number, monto: number) => void;
  montoAbonado?: number | null;
};

type PagoCardProps = {
  pago: PagoConExtras;
  totalCobrado: number;
  pagosCobrados: PagoConExtras[];
  onFinalizarCobranza: () => void;
  showResumen: boolean;
  onCloseResumen: () => void;
};

const PagoCard: React.FC<PagoCardProps> = ({
  pago,
  totalCobrado,
  pagosCobrados,
  // onFinalizarCobranza,
  showResumen,
  onCloseResumen
}) => {
  const diferencia = pago.montoAbonado ? pago.monto - (pago.montoAbonado || 0) : 0;
  const isPagado = pago.montoAbonado;

  return (
    <>
      {/* <div className="header-total-cobrado">
        <h3>Total Cobrado: ${totalCobrado.toFixed(2)}</h3>
      </div> */}

      <div className="pago-card" style={{ backgroundColor: isPagado ? "#C7C8CA" : "white" }}>
        <p><strong>📌 Cliente:</strong> {pago.nombreCliente}</p>
        <p><strong>💳 Producto:</strong> {pago.nombreProducto}</p>
        <p><strong>💳 Cuota nro:</strong> {pago.nroCuota + " / "+ pago.cantCuotas}</p>
        <p><strong>💰 Monto Cuota:</strong> ${pago.monto.toFixed(2)}</p>
        <p><strong>💵 Monto Abonado:</strong> ${pago.montoAbonado || 0}</p>
        <p><strong>⚠ Diferencia:</strong> ${diferencia}</p>
        <p><strong>📅 Fecha de Pago:</strong> {pago.fechaPago ? (pago.fechaPago instanceof Date ? pago.fechaPago.toLocaleDateString() : pago.fechaPago) : "No pagado"}</p>

        {isPagado ? (
          <span className="pagado">✅ Cuota Pagada</span>
        ) : (
          <button className="btn-pagar" onClick={() => pago.handlePagoCuota(pago.id, diferencia)}>
            Pagar
          </button>
        )}
      </div>

      {/* <div className="footer-finalizar">
        <button className="btn-finalizar" onClick={onFinalizarCobranza}>
          Finalizar Cobranza
        </button>
      </div> */}

      {showResumen && (
        <div className="modal-resumen">
          <div className="modal-content">
            <h2>Resumen de Cobranza</h2>
            <p><strong>Total Cobrado:</strong> ${totalCobrado.toFixed(2)}</p>
            <p><strong>Cuotas cobradas:</strong> {pagosCobrados.length}</p>
            <button onClick={onCloseResumen}>Cerrar</button>
          </div>
        </div>
      )}
    </>
  );
};

export default PagoCard;
