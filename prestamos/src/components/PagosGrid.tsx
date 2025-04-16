import React, { useState, useEffect } from "react";
import DataTable, { TableColumn } from "react-data-table-component";
import PagoCard from "./PagoCard";
import ResumenCobranza from "../components/ResumenCobranza";
import "../styles/PagosGrid.css";
import { Pago } from "../interfaces/Pagos";

interface PagoExtendido extends Pago {}

interface PagosGridProps {
  pagos: PagoExtendido[];
  handlePagoCuota: (pagoId: number, monto: number) => void;
  mostrarCliente?: boolean;
  totalCobrado: number;
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
  mostrarCliente = false,
  totalCobrado,
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

  const handlePagoMobile = (pagoId: number, monto: number) => {
    handlePagoCuota(pagoId, monto);
    const pagoOriginal = pagos.find((p) => p.id === pagoId);
    if (!pagoOriginal) return;

    const pagoActualizado: Pago = {
      ...pagoOriginal,
      montoAbonado: (pagoOriginal.montoAbonado || 0) + monto,
    };

    setPagosCobrados((prev) => {
      const existe = prev.find((p) => p.id === pagoId);
      if (existe) {
        return prev.map((p) => (p.id === pagoId ? pagoActualizado : p));
      } else {
        return [...prev, pagoActualizado];
      }
    });
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
            pago={{ ...pago, handlePagoCuota: handlePagoMobile }}
            totalCobrado={totalCobrado}
            pagosCobrados={pagosCobrados.map((p) => ({
              ...p,
              handlePagoCuota: handlePagoMobile,
            }))}
            onFinalizarCobranza={() => setShowResumen(true)}
            showResumen={showResumen}
            onCloseResumen={() => setShowResumen(false)}
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
        const diferencia = row.montoAbonado
          ? row.monto - row.montoAbonado
          : row.monto;
        if (row.montoAbonado != null && row.fechaPago !== null) {
          return <span className="text-success">Cuota Pagada</span>;
        } else if (row.montoAbonado && diferencia > 0) {
          return (
            <button
              className="btn btn-warning"
              onClick={() => handlePagoCuota(row.id, diferencia)}
            >
              Completar Cuota
            </button>
          );
        } else {
          return (
            <button
              className="btn btn-primary"
              onClick={() => handlePagoCuota(row.id, row.monto)}
            >
              Pagar
            </button>
          );
        }
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
          {
            when: (row) =>
              row.montoAbonado !== null &&
              row.montoAbonado !== undefined &&
              row.monto > row.montoAbonado,
            style: { backgroundColor: "#ffeb99" },
          },
        ]}
      />
    </div>
  );
};

export default PagosGrid;
