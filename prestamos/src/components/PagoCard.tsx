import React from "react";
import "../styles/PagoCardModern.css";
import { Pago } from "../interfaces/Pagos";
import { formatearNumero } from "../utils/formatters";

type PagoConExtras = Pago & {
  handlePagoCuota: (pagoId: number, monto: number) => void;
  handleEditarPago: (pago: Pago) => void;
  handleCancelarPago?: (pago: Pago) => void;
  montoAbonado?: number | null;
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
  efectivo,
  pagosCobrados,
  showResumen,
  onCloseResumen,
  sobrante,
}) => {
  // Para mostrar info al usuario (incluye sobrantes)
  const montoTotalAbonado = (pago.montoAbonado || 0) + sobrante;
  const cuotaCompletaUI = montoTotalAbonado >= pago.monto;
  const diferenciaUI = Math.max(pago.monto - montoTotalAbonado, 0);

  // Para calcular acciones (no considera "sobrante", igual que en la grilla)
  const abonadoReal = pago.montoAbonado ?? 0;
  const sinAbono = abonadoReal <= 0;
  const hayParcial = abonadoReal > 0 && abonadoReal < pago.monto;
  const cuotaCompleta = abonadoReal >= pago.monto;
  const diferenciaAccion = Math.max(pago.monto - abonadoReal, 0);
  const tieneAbono = abonadoReal > 0;

  const seAdelantoParcial = () => {
    if (!pago.montoAbonado || pago.montoAbonado <= 0 || !pago.nroCuota) return false;
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
      <div className={`pago-card-modern ${cuotaCompletaUI ? "completado" : ""}`}>
        <h2>{pago.nombreCliente}</h2>
        <p className="producto">{pago.nombreProducto}</p>

        <div className="info-linea">
          <span>📊 Cuotas Pagas</span>
          <span>{pago.nroCuota ? `${pago.nroCuota - 1} / ${pago.cantCuotas}` : "-"}</span>
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
          <div className="alerta-info">⚠ Se adelantó parcialmente la próxima cuota</div>
        )}

        {!cuotaCompletaUI && montoTotalAbonado > 0 && (
          <div className="alerta">
            ⚠ Cuota parcialmente abonada - faltan ${diferenciaUI.toFixed(2)}
          </div>
        )}

        {cuotaCompletaUI && (
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
          {/* Primario: Pagar (si no hay abono) */}
          {sinAbono && !cuotaCompleta && (
            <button
              className="btn btn-pagar"
              onClick={() => pago.handlePagoCuota(pago.id, pago.monto)}
              title="Pagar cuota"
            >
              💸 Pagar
            </button>
          )}

          {/* Primario: Completar (si hay abono parcial) */}
          {hayParcial && (
            <button
              className="btn btn-pagar"
              onClick={() => pago.handlePagoCuota(pago.id, diferenciaAccion)}
              title="Completar cuota"
            >
              💸 Completar
            </button>
          )}

          {/* Secundarios: Editar / Cancelar (si hay algo abonado) */}
          {tieneAbono && (
            <>
              <button
                className="btn btn-editar"
                onClick={() => pago.handleEditarPago(pago)}
                title="Editar pago"
              >
                ✏️ Editar
              </button>

              {pago.handleCancelarPago && (
                <button
                  className="btn btn-cancelar"
                  onClick={() => pago.handleCancelarPago!(pago)}
                  title="Cancelar pago"
                >
                  ❌ Cancelar
                </button>
              )}
            </>
          )}

          {/* Adelantar: solo si ya hubo algún abono */}
          {tieneAbono && (
            <button
              className="btn btn-adelantar"
              onClick={() => pago.handlePagoCuota(pago.id, pago.monto)}
              title="Adelantar cuota"
            >
              ⏩ Adelantar
            </button>
          )}
        </div>

        <p className="fecha">
          📅 Fecha de Pago:{" "}
          {pago.fechaPago
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
