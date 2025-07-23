import React from "react";
import "../styles/PagoCardModern.css";
import { Pago } from "../interfaces/Pagos";
import { formatearNumero } from "../utils/formatters";

type PagoConExtras = Pago & {
  handlePagoCuota: (pagoId: number, monto: number) => void;
  montoAbonado?: number | null;
  handleEditarPago: (pago: Pago) => void;
};

type PagoCardProps = {
  pago: PagoConExtras;
  totalCobrado: number;
  transferencias: number;
  efectivo: number;
  pagosCobrados: PagoConExtras[];
  onFinalizarCobranza: () => void;
  showResumen: boolean;
  onCloseResumen: () => void;
  sobrante: number;
};

const PagoCard: React.FC<PagoCardProps> = ({
  pago,
  totalCobrado,
  transferencias,
  pagosCobrados,
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
  console.log("Cuota Completada:", fueAdelantado(), cuotaCompleta, pago.nroCuota, pago.montoAbonado);  //TODO: Remove this log
  return (
    <>
      <div className={`pago-card-modern ${cuotaCompleta ? "completado" : ""}`}>
        <h2>{pago.nombreCliente}</h2>
        <p className="producto">{pago.nombreProducto}</p>

        <div className="info-linea">
          <span>📊 Cuotas Pagas</span>
          <span>
            {pago.nroCuota ? `${pago.nroCuota - 1} / ${pago.cantCuotas}` : "-"}
          </span>
        </div>

        <div className="info-linea">
          <span>💰 Monto Cuota</span>
          <span>${formatearNumero(pago.monto)}</span>
        </div>

        <div className="info-linea">
          <span>🧾 Monto Recibido</span>
          <span>${formatearNumero(montoTotalAbonado)}</span>
        </div>
        
        {seAdelantoParcial() && (
          <div className="alerta-info">
            ⚠ Se adelantó parcialmente la próxima cuota
          </div>
        )}

        {!cuotaCompleta && montoTotalAbonado > 0 && (
          <div className="alerta">
            ⚠ Cuota parcialmente abonada - faltan ${diferencia.toFixed(2)}
          </div>
        )}

        {cuotaCompleta && (
  <>
    <div className="pagado">✅ Cuota completada</div>
    {pago.nroCuota && pago.montoAbonado ? (
      <p className="cuota-pagada">
        <strong>💳 Se pagó la cuota nro:</strong> {pago.nroCuota}
      </p>
    ) : null}
  </>
)}


        <div className="acciones-pago">
          {!cuotaCompleta && (
            <button
              className="btn btn-pagar"
              onClick={() => pago.handlePagoCuota(pago.id, diferencia)}
            >
              💸 Pagar
            </button>
          )}

          {(pago.montoAbonado ?? 0) > 0 && (
            <button
              className="btn btn-editar"
              onClick={() => pago.handleEditarPago(pago)}
            >
              ✏️ Editar
            </button>
          )}

          <button
            className="btn btn-adelantar"
            onClick={() => pago.handlePagoCuota(pago.id, pago.monto)}
          >
            ⏩ Adelantar
          </button>
        </div>

        <p className="fecha">
          📅 Fecha de Pago: {pago.fechaPago
            ? new Date(pago.fechaPago).toLocaleDateString("es-AR", {
                day: "2-digit",
                month: "short",
                year: "numeric",
              })
            : "No pagado"}
        </p>
      </div>

      {showResumen && (
        <div className="modal-resumen">
          <div className="modal-content">
            <h2>Resumen de Cobranza</h2>
            <p>
              <strong>Total Cobrado:</strong> ${totalCobrado.toFixed(2)}
            </p>
            <p>
              <strong>Transferencias:</strong> ${transferencias.toFixed(2)}
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
