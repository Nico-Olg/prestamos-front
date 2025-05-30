// src/components/PagosGrid.tsx
import React, { useState, useEffect } from "react";
import DataTable, { TableColumn } from "react-data-table-component";
import PagoCard from "./PagoCard";
import ResumenCobranza from "../components/ResumenCobranza";
import "../styles/PagosGrid.css";
import { Pago } from "../interfaces/Pagos";
import { cobranzaDelDia } from "../apis/postApi";

interface PagoExtendido extends Pago {}

interface PagosGridProps {
  pagos: PagoExtendido[];
  handlePagoCuota: (pagoId: number, monto: number) => void;
  handleEditarPago: (pago: Pago) => void;
  mostrarCliente?: boolean;
  totalCobrado: number;
  sobrantes?: Record<number, number>; // 👈 nuevo
}

const formatearFechaLocal = (fechaISO: string | null): string => {
  if (!fechaISO) return "No pagado";
  const fecha = new Date(fechaISO);
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
  mostrarCliente = false,
  totalCobrado,
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
          💵 Total cobrado: ${totalCobrado.toFixed(2)}
        </div>

        {pagos.map((pago) => (
          <PagoCard
            key={pago.id}
            pago={{
              ...pago,
              handlePagoCuota: handlePagoMobile,
              handleEditarPago,
            }}
            totalCobrado={totalCobrado}
            pagosCobrados={pagosCobrados.map((p) => ({
              ...p,
              handlePagoCuota: handlePagoMobile,
              handleEditarPago,
            }))}
            onFinalizarCobranza={() => setShowResumen(true)}
            showResumen={showResumen}
            onCloseResumen={() => setShowResumen(false)}
            sobrante={sobrantes?.[pago.id] || 0} // 👈 nuevo
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
    { name: "Monto Cuota", selector: (row) => `$${row.monto.toFixed(2)}` },
    {
      name: "Monto Abonado",
      selector: (row) =>
        row.montoAbonado ? `$${row.montoAbonado.toFixed(2)}` : "No pagado",
    },
    {
      name: "Diferencia",
      selector: (row) =>
        row.montoAbonado
          ? `$${(row.monto - row.montoAbonado).toFixed(2)}`
          : "No pagado",
    },
    {
      name: "Saldo",
      selector: (row) => `$${row.saldo}`,
    },
    {
      name: "Fecha de Pago",
      selector: (row) => formatearFechaLocal(row.fechaPago?.toString() || null),
    },
    {
      name: "Acción",
      cell: (row) => {
        const diferencia = row.monto - (row.montoAbonado || 0);

        return (
          <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
            {/* Cuota completa */}
            {row.montoAbonado != null && row.montoAbonado >= row.monto && (
              <>
                <span className="text-success">✅</span>
                <button
                  className="btn-icon edit"
                  onClick={() => handleEditarPago(row)}
                  title="Editar Pago"
                >
                  ✏️
                </button>
              </>
            )}

            {/* Cuota parcial */}
            {row.montoAbonado != null &&
              row.montoAbonado > 0 &&
              row.montoAbonado < row.monto && (
                <>
                  <button
                    className="btn-icon completar"
                    onClick={() => handlePagoCuota(row.id, diferencia)}
                    title="Completar Cuota"
                  >
                    💰
                  </button>
                  <button
                    className="btn-icon edit"
                    onClick={() => handleEditarPago(row)}
                    title="Editar Pago"
                  >
                    ✏️
                  </button>
                </>
              )}

            {/* Cuota sin pagar */}
            {(row.montoAbonado == null || row.montoAbonado === 0) && (
              <button
                className="btn btn-primary"
                onClick={() => handlePagoCuota(row.id, row.monto)}
              >
                Pagar
              </button>
            )}
          </div>
        );
      },
      ignoreRowClick: true,
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
          // 👉 Fila completada (gris claro)
          {
            when: (row) => (row.montoAbonado || 0) >= row.monto,
            style: {
              backgroundColor: "#C7C8CA",
            },
          },
          // 👉 Fila parcialmente abonada (amarillo claro)
          {
            when: (row) =>
              row.montoAbonado != null &&
              row.montoAbonado > 0 &&
              row.montoAbonado < row.monto,
            style: {
              backgroundColor: "#fff3cd",
            },
          },
        ]}
      />
    </div>
  );
};

export default PagosGrid;
