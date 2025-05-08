// src/components/PagoCard.tsx
import React from "react";
import "../styles/PagoCard.css";
import { Pago } from "../interfaces/Pagos";

// Extender el tipo Pago para incluir las props adicionales usadas en el componente
type PagoConExtras = Pago & {
  handlePagoCuota: (pagoId: number, monto: number) => void;
  montoAbonado?: number | null;
  handleEditarPago: (pago: Pago) => void;
};

type PagoCardProps = {
  pago: PagoConExtras;
  totalCobrado: number;
  pagosCobrados: PagoConExtras[];
  onFinalizarCobranza: () => void;
  showResumen: boolean;
  onCloseResumen: () => void;
  sobrante: number; // 👈 nuevo
};

const PagoCard: React.FC<PagoCardProps> = ({
  pago,
  totalCobrado,
  pagosCobrados,
  // onFinalizarCobranza,
  showResumen,
  onCloseResumen,
  sobrante,
}) => {
  const diferencia =
    pago.montoAbonado != null && pago.montoAbonado > 0
      ? pago.monto - pago.montoAbonado
      : pago.monto;
  const isPagado = pago.montoAbonado;
  const seAdelantoParcial = () => {
    if (!pago.montoAbonado || pago.montoAbonado <= 0 || !pago.nroCuota)
      return false;

    const cuotaSiguiente = pagosCobrados.find(
      (p) =>
        p.nroCuota === pago.nroCuota + 1 &&
        (p.montoAbonado || 0) > 0 &&
        (p.montoAbonado || 0) < p.monto
    );

    return !!cuotaSiguiente;
  };

  return (
    <>
      {/* <div className="header-total-cobrado">
        <h3>Total Cobrado: ${totalCobrado.toFixed(2)}</h3>
      </div> */}

      <div
        className="pago-card"
        style={{ backgroundColor: isPagado ? "#C7C8CA" : "white" }}
      >
        <p>
          <strong>📌 Cliente:</strong> {pago.nombreCliente}
        </p>
        <p>
          <strong>💳 Producto:</strong> {pago.nombreProducto}
        </p>
        <p>
          <strong>💳 Cuotas Pagas:</strong>{" "}
          {pago.nroCuota && pago.cantCuotas
            ? `${pago.nroCuota - 1} / ${pago.cantCuotas}`
            : "Sin datos"}
        </p>

        <p>
          <strong>💰 Monto Cuota:</strong> ${pago.monto.toFixed(2)}
        </p>
        {seAdelantoParcial() && (
          <p>⚠ Se adelantó parcialmente la próxima cuota</p>
        )}
        {isPagado && pago.nroCuota ? (
          <p>
            <strong>💳 Se pagó la cuota nro:</strong> {pago.nroCuota}
          </p>
        ) : null}
       <p>
  <strong>💵 Monto Recibido:</strong> ${((pago.montoAbonado || 0) + sobrante).toFixed(2)}
</p>

        <p>
          <strong>⚠ Saldo:</strong> ${pago.saldo}
        </p>
        <p>
          <strong>📅 Fecha de Pago:</strong>{" "}
          {pago.fechaPago
            ? pago.fechaPago instanceof Date
              ? pago.fechaPago.toLocaleDateString()
              : pago.fechaPago
            : "No pagado"}
        </p>

        {isPagado ? (
          <span className="pagado">✅ Cuota Pagada</span>
        ) : (
          <button
            className="btn-pagar"
            onClick={() => {
              pago.handlePagoCuota(pago.id, diferencia);
            }}
          >
            Pagar
          </button>
        )}
        {isPagado && (
          <div style={{ marginTop: "10px" }}>
            <button
              className="btn-editar"
              onClick={() => pago.handleEditarPago(pago)}
            >
              ✏️ Editar Pago
            </button>
          </div>
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
            <p>
              <strong>Total Cobrado:</strong> ${totalCobrado.toFixed(2)}
            </p>
            <p>
              <strong>Cuotas cobradas:</strong> {pagosCobrados.length}
            </p>
            <button onClick={onCloseResumen}>Cerrar</button>
          </div>
        </div>
      )}
    </>
  );
};

export default PagoCard;
