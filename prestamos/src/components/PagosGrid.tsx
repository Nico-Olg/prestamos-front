// src/components/PagosGrid.tsx
import React, { useState, useEffect } from "react";
import DataTable, { TableColumn } from "react-data-table-component";
import PagoCard from "./PagoCard";
import ResumenCobranza from "../components/ResumenCobranza";
import "../styles/PagosGrid.css";
import { Pago } from "../interfaces/Pagos";
import { cobranzaDelDia } from "../apis/postApi";
import { formatearNumero } from "../utils/formatters";

interface PagoExtendido extends Pago {}

interface PagosGridProps {
  pagos: PagoExtendido[];
  handlePagoCuota: (pagoId: number, monto: number) => void;
  handleEditarPago: (pago: Pago) => void;
  handleCancelarPago?: (pago: Pago) => void;
  mostrarCliente?: boolean;
  totalCobrado: number;
  transferencias: number;
  efectivo: number;
  sobrantes?: Record<number, number>;
}

const formatearFechaLocal = (fechaInput: string | Date | null): string => {
  if (!fechaInput) return "No pagado";

  let fecha: Date;

  if (fechaInput instanceof Date) {
    fecha = fechaInput;
  } else if (typeof fechaInput === "string") {
    const isoPart = fechaInput.split("T")[0];
    const partes = isoPart.split("-");
    if (partes.length === 3) {
      const [anio, mes, dia] = partes;
      fecha = new Date(Number(anio), Number(mes) - 1, Number(dia));
    } else {
      const tentativa = new Date(fechaInput);
      if (isNaN(tentativa.getTime())) return "Fecha inválida";
      fecha = tentativa;
    }
  } else {
    return "Fecha inválida";
  }

  if (isNaN(fecha.getTime())) return "Fecha inválida";

  return fecha.toLocaleDateString("es-AR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
};

const PagosGrid: React.FC<PagosGridProps> = ({
  pagos,
  handlePagoCuota,
  handleEditarPago,
  handleCancelarPago,
  mostrarCliente = false,
  totalCobrado,
  transferencias,
  efectivo,
  sobrantes,
}) => {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [pagosCobrados, setPagosCobrados] = useState<Pago[]>([]);
  const [showResumen, setShowResumen] = useState(false);
  const [animarTotal, setAnimarTotal] = useState(false);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (pagosCobrados.length > 0) {
      setAnimarTotal(true);
      const timeout = setTimeout(() => setAnimarTotal(false), 800);
      return () => clearTimeout(timeout);
    }
  }, [totalCobrado]);

  const handlePagoMobile = async (pagoId: number, monto: number) => {
    await handlePagoCuota(pagoId, monto);

    const prestamoId = localStorage.getItem("prestamoId");
    if (!prestamoId) return;
    const cobradorId = localStorage.getItem("cobradorId")
      ? parseInt(localStorage.getItem("cobradorId") || "")
      : null;
    if (!cobradorId) return;
    try {
      const pagosActualizados = await cobranzaDelDia(
        cobradorId,
        new Date().toISOString()
      );
      setPagosCobrados(pagosActualizados.pagos);
    } catch (error) {
      console.error("Error al actualizar pagos en móvil:", error);
    }
  };

  const pagosParciales = pagosCobrados.filter(
    (p) => (p.montoAbonado || 0) > 0 && (p.montoAbonado || 0) < p.monto
  );

  if (isMobile) {
    return (
      <div className="pagos-list">
        <div className={`total-cobrado ${animarTotal ? "animado" : ""}`}>
          💵 Total cobrado: ${formatearNumero(totalCobrado)}
          <div className="detalle-cobros">
            <div className="detalle-item">
              🏦 Transferencia: ${formatearNumero(transferencias)}
            </div>
            <div className="detalle-item">
              💵 Efectivo: ${formatearNumero(efectivo)}
            </div>
          </div>
        </div>

        {pagos.map((pago) => (
          <PagoCard
            key={pago.id}
            pago={{
              ...pago,
              handlePagoCuota: handlePagoMobile,
              handleEditarPago,
              handleCancelarPago,
            } as any}
            totalCobrado={totalCobrado}
            transferencias={transferencias}
            efectivo={efectivo}
            pagosCobrados={pagosCobrados.map((p) => ({
              ...p,
              handlePagoCuota: handlePagoMobile,
              handleEditarPago,
              handleCancelarPago,
            })) as any}
            onFinalizarCobranza={() => setShowResumen(true)}
            showResumen={showResumen}
            onCloseResumen={() => setShowResumen(false)}
            sobrante={sobrantes?.[pago.id] || 0}
          />
        ))}

        {showResumen && (
          <ResumenCobranza
            totalCobrado={totalCobrado}
            pagosParciales={pagosParciales}
            onClose={() => setShowResumen(false)}
          />
        )}
      </div>
    );
  }

  let columns: TableColumn<PagoExtendido>[] = [
    { name: "Nro. Cuota", selector: (row) => row.nroCuota || "Sin dato" },
    {
      name: "Producto",
      selector: (row) => row.nombreProducto || "Sin producto",
      sortable: true,
    },
    { name: "Monto Cuota", selector: (row) => `$${formatearNumero(row.monto)}` },
    {
      name: "Monto Abonado",
      selector: (row) =>
        row.montoAbonado ? `$${formatearNumero(row.montoAbonado)}` : "No pagado",
    },
    {
      name: "Diferencia",
      selector: (row) =>
        row.montoAbonado
          ? `$${formatearNumero(row.monto - row.montoAbonado)}`
          : "No pagado",
    },
    { name: "Saldo", selector: (row) => `$${formatearNumero(row.saldo)}` },
    {
      name: "Fecha de Pago",
      selector: (row) => formatearFechaLocal(row.fechaPago?.toString() || null),
    },
    {
      name: "Fecha de Vencimiento",
      selector: (row) => formatearFechaLocal(row.fechaVencimiento || null),
    },
    {
      name: "Acciones",
      cell: (row) => {
        const abonado = row.montoAbonado ?? 0;
        const sinAbono = abonado === 0 || row.montoAbonado == null;
        const cuotaCompleta = abonado >= row.monto;
        const diferencia = row.monto - abonado;
        const hayAbonoParcial = abonado > 0 && abonado < row.monto;
        const tieneAbono = abonado > 0;

        return (
          <div className="action-toolbar" role="group" aria-label="Acciones de pago">
            {/* Primario: Pagar (sin abono) */}
            {sinAbono && !cuotaCompleta && (
              <button
                className="btn-action primary"
                onClick={() => handlePagoCuota(row.id, row.monto)}
                title="Pagar cuota"
              >
                💸 <span className="label">Pagar</span>
              </button>
            )}

            {/* Primario: Completar (abono parcial) */}
            {hayAbonoParcial && (
              <button
                className="btn-action primary"
                onClick={() => handlePagoCuota(row.id, Math.max(diferencia, 0))}
                title="Completar cuota"
              >
                💸 <span className="label">Completar</span>
              </button>
            )}

            {/* Secundario: Editar (si hay algo abonado) */}
            {tieneAbono && (
              <button
                className="btn-action"
                onClick={() => handleEditarPago(row)}
                title="Editar pago"
              >
                ✏️ <span className="label">Editar</span>
              </button>
            )}

            {/* Peligro: Cancelar (si hay algo abonado y existe handler) */}
            {tieneAbono && handleCancelarPago && (
              <button
                className="btn-action danger"
                onClick={() => handleCancelarPago(row)}
                title="Cancelar pago"
              >
                ❌ <span className="label">Cancelar</span>
              </button>
            )}

            {/* Ghost: Adelantar (solo si ya hubo algún pago) */}
            {tieneAbono && (
              <button
                className="btn-action"
                onClick={() => handlePagoCuota(row.id, row.monto)}
                title="Adelantar cuota"
              >
                ⏩ <span className="label">Adelantar</span>
              </button>
            )}
          </div>
        );
      },
      ignoreRowClick: true,
      grow: 2,
    },
  ];

  if (mostrarCliente) {
    columns = [
      {
        name: "Cliente",
        selector: (row) => row.nombreCliente || "Sin nombre",
        sortable: true,
        minWidth: "250px",
      },
      ...columns,
    ];
  }

  return (
    <div className="pagos-grid">
      <DataTable
        columns={columns}
        data={pagos}
        pagination
        highlightOnHover
        paginationPerPage={10}
        paginationComponentOptions={{
          rowsPerPageText: "Filas por página:",
          rangeSeparatorText: "de",
        }}
        conditionalRowStyles={[
          {
            when: (row) => (row.montoAbonado || 0) >= row.monto,
            style: { backgroundColor: "#C7C8CA" },
          },
          {
            when: (row) =>
              row.montoAbonado != null &&
              row.montoAbonado > 0 &&
              row.montoAbonado < row.monto,
            style: { backgroundColor: "#fff3cd" },
          },
        ]}
      />
    </div>
  );
};

export default PagosGrid;
