import React from "react";
import "../styles/PagoCard.css";
import { Pago } from "../interfaces/Pagos";

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
  sobrante: number;
};

const PagoCard: React.FC<PagoCardProps> = ({
  pago,
  totalCobrado,
  pagosCobrados,
  //onFinalizarCobranza,
  showResumen,
  onCloseResumen,
  sobrante,
}) => {
  const montoTotalAbonado = (pago.montoAbonado || 0) + sobrante;
  const diferencia = pago.monto - montoTotalAbonado;
  const cuotaCompleta = montoTotalAbonado >= pago.monto;

  const fueAdelantado = () => {
    if (!pago.fechaPago) return false;
    const hoy = new Date().toISOString().split("T")[0];
    const fechaPago =
      pago.fechaPago instanceof Date
        ? pago.fechaPago.toISOString().split("T")[0]
        : (pago.fechaPago as string).split("T")[0];
    return fechaPago !== hoy;
  };

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
      <div className={`pago-card ${cuotaCompleta ? "completado" : ""}`}>

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

        {pago.nroCuota && pago.montoAbonado ? (
          <p>
            <strong>💳 Se pagó la cuota nro:</strong> {pago.nroCuota}
          </p>
        ) : null}

        {fueAdelantado() && (
          <p style={{ color: "#555", fontStyle: "italic" }}>
            🕓 Este pago fue adelantado días atrás
          </p>
        )}

        <p>
          <strong>💵 Monto Recibido:</strong> ${montoTotalAbonado.toFixed(2)}
        </p>

        <p>
          <strong>⚠ Saldo:</strong>{" "}
          {diferencia > 0 ? `$${diferencia.toFixed(2)}` : "Sin deuda"}
        </p>

        <p>
          <strong>📅 Fecha de Pago:</strong>{" "}
          {pago.fechaPago
            ? pago.fechaPago instanceof Date
              ? pago.fechaPago.toLocaleDateString()
              : pago.fechaPago
            : "No pagado"}
        </p>

        {/* Mensaje si la cuota fue completada */}
        {cuotaCompleta && (
          <div>
            <span className="pagado">✅ Cuota completada</span>
            {fueAdelantado() && (
              <p className="alerta-completado">
                Completada con pagos anteriores
              </p>
            )}
          </div>
        )}

        {/* Alerta si está parcialmente abonada */}
        {montoTotalAbonado > 0 && montoTotalAbonado < pago.monto && (
          <p className="alerta-parcial">
            ⚠ Cuota parcialmente abonada - faltan ${diferencia.toFixed(2)}
          </p>
        )}

        {/* Botón para pagar solo si falta */}
        {!cuotaCompleta && (
          <button
            className="btn-pagar"
            onClick={() => pago.handlePagoCuota(pago.id, diferencia)}
          >
            Pagar
          </button>
        )}

        {pago.montoAbonado && (
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
