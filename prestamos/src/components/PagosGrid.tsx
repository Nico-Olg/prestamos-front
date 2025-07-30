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
  mostrarCliente?: boolean;
  totalCobrado: number;
  transferencias: number; 
  efectivo: number; 
  sobrantes?: Record<number, number>; 
}

// const formatearFechaLocal = (fechaISO: string | null): string => {
//   if (!fechaISO) return "No pagado";
//   const fecha = new Date(fechaISO);
//   return fecha.toLocaleDateString("es-AR", {
//     year: "numeric",
//     month: "2-digit",
//     day: "2-digit",
//   });
// };
const formatearFechaLocal = (fechaInput: string | Date | null): string => {
  if (!fechaInput) return "No pagado";

  let fecha: Date;

  if (fechaInput instanceof Date) {
    fecha = fechaInput;
  } else if (typeof fechaInput === "string") {
    const isoPart = fechaInput.split("T")[0]; // Extraemos "2025-07-28"
    const partes = isoPart.split("-");

    // Si es formato "yyyy-MM-dd"
    if (partes.length === 3) {
      const [anio, mes, dia] = partes;
      fecha = new Date(Number(anio), Number(mes) - 1, Number(dia)); // FORZA LOCAL
    } else {
      // Intentamos parsear con Date por si viene como "Wed May 21 2025 21:00:00 GMT-0300"
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


      {
      pagos.map((pago) => (
        <PagoCard
          key={pago.id}
          pago={{
            ...pago,
            handlePagoCuota: handlePagoMobile,
            handleEditarPago,
          }}
          totalCobrado={totalCobrado}
          transferencias={transferencias}
          efectivo={efectivo}
          pagosCobrados={pagosCobrados.map((p) => ({
            ...p,
            handlePagoCuota: handlePagoMobile,
            handleEditarPago,
          }))}
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
    {
      name: "Saldo",
      selector: (row) => `$${formatearNumero(row.saldo)}`,
    },
    {
      name: "Fecha de Pago",
      selector: (row) => formatearFechaLocal(row.fechaPago?.toString() || null),
    },
    {
      name: "Fecha de Vencimiento",
      selector: (row) => formatearFechaLocal(row.fechaVencimiento || null),
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
    {
       cell: (row) => {
        return (
            <button
            className="btn-icon adelantar"
            onClick={() => handlePagoCuota(row.id, row.monto)}
            title="Adelantar Pago"
            >
            ⏩
            </button>
        );
       }
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
