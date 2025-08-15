import React, { useMemo, useState } from "react";
import DataTable, {
  TableColumn,
  ConditionalStyles,
} from "react-data-table-component";
import { useNavigate } from "react-router-dom";
import { Cliente } from "../interfaces/Cliente";
import { Prestamo } from "../interfaces/Prestamo";
import { generarPDF } from "./carpetaPDF";
import { borrarCreditos, getPagosPorPrestamo, deshabilitarPrestamo, habilitarPrestamo } from "../apis/postApi";
import { getCarpetaPrestamo } from "../apis/getApi";
import { formatearNumero } from "../utils/formatters";
import "../styles/PrestamosGrid.css";
import { IconButton, Button, Stack, CircularProgress, Box } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import SettingsIcon from "@mui/icons-material/Settings";
import Swal from "sweetalert2";
import { useClientContext } from "../provider/ClientContext";

interface PrestamosGridProps {
  cliente: Cliente;
  prestamos?: Prestamo[];
}

const PrestamosGrid: React.FC<PrestamosGridProps> = ({ cliente, prestamos }) => {
  const { refreshClientes } = useClientContext();
  const navigate = useNavigate();

  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(false);

  const toggleExpand = (idPrestamo?: number) => {
    if (idPrestamo == null) return;
    setExpandedRows((prev) => {
      const next = new Set(prev);
      if (next.has(idPrestamo)) next.delete(idPrestamo);
      else next.add(idPrestamo);
      return next;
    });
  };

  const handleRowClicked = async (prestamo: Prestamo) => {
    try {
      const pagos = await getPagosPorPrestamo(prestamo.idPrestamo);
      navigate(`/pagos`, { state: { cliente, prestamo, pagos } });
    } catch (error) {
      console.error("Error al cargar los pagos del préstamo:", error);
    }
  };

  const handleCarpetClicked = async (prestamo: Prestamo) => {
    const pagos = await getCarpetaPrestamo(prestamo.idPrestamo);
    generarPDF(cliente, prestamo, pagos);
  };

  const handleDeleteClicked = async (prestamoId: number) => {
    try {
      const result = await Swal.fire({
        icon: "warning",
        title: "Eliminar Crédito",
        text: "¿Estás seguro de que deseas eliminar este crédito?",
        showCancelButton: true,
        confirmButtonText: "Sí, eliminar",
        cancelButtonText: "Cancelar",
        showCloseButton: true,
        allowOutsideClick: false,
      });

      if (result.isConfirmed) {
        setLoading(true);
        await borrarCreditos(prestamoId);
        await refreshClientes();
        Swal.fire({
          icon: "success",
          title: "Crédito eliminado",
          text: "El crédito se eliminó correctamente.",
        });
      } else {
        Swal.fire({
          icon: "info",
          title: "Acción cancelada",
          text: "El crédito no se eliminó.",
        });
      }
    } catch (error) {
      console.error("Error al borrar el crédito:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Hubo un problema al eliminar el crédito.",
      });
    } finally {
      setLoading(false);
    }
  };

  // Actualización optimista + recarga desde backend
  const actualizarPrestamoEnLista = (idPrestamo: number, activo: boolean) => {
    if (!prestamos) return;
    const index = prestamos.findIndex((p) => p.idPrestamo === idPrestamo);
    if (index !== -1) {
      prestamos[index].activo = activo;
    }
  };

  const handleHabilitar = async (row: Prestamo) => {
    try {
      setLoading(true);
      // Optimista
      actualizarPrestamoEnLista(row.idPrestamo, true);
      toggleExpand(row.idPrestamo);
      // Backend
      await habilitarPrestamo(row.idPrestamo);
      await refreshClientes();
      Swal.fire({
        icon: "success",
        title: "Habilitado",
        text: `Crédito ${row.idPrestamo} habilitado.`,
      });
    } catch {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "No se pudo habilitar el crédito.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeshabilitar = async (row: Prestamo) => {
    try {
      setLoading(true);
      // Optimista
      actualizarPrestamoEnLista(row.idPrestamo, false);
      toggleExpand(row.idPrestamo);
      // Backend
      await deshabilitarPrestamo(row.idPrestamo);
      await refreshClientes();
      Swal.fire({
        icon: "success",
        title: "Deshabilitado",
        text: `Crédito ${row.idPrestamo} deshabilitado.`,
      });
    } catch {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "No se pudo deshabilitar el crédito.",
      });
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString || !/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
      return "Fecha no válida";
    }
    const [year, month, day] = dateString.split("-");
    return `${day}/${month}/${year}`;
  };

  const columns: TableColumn<Prestamo>[] = useMemo(
    () => [
      {
        name: "ID",
        selector: (row) => row.idPrestamo || 0,
        sortable: true,
        format: (row) => row.idPrestamo?.toString() || "N/A",
      },
      {
        name: "Monto Prestado",
        selector: (row) =>
          row.montoPrestado ? `$ ${formatearNumero(row.montoPrestado)}` : "N/A",
        sortable: true,
        minWidth: "150px",
      },
      {
        name: "Plan",
        selector: (row) => row.tipoPlan || "N/A",
        sortable: true,
      },
      {
        name: "Monto a Devolver",
        selector: (row) =>
          row.montoPrestamo ? `$ ${formatearNumero(row.montoPrestamo)}` : "N/A",
        sortable: true,
        minWidth: "150px",
      },
      {
        name: "Fecha de Inicio",
        selector: (row) =>
          formatDate(
            typeof row.fechaInicio === "string"
              ? row.fechaInicio
              : row.fechaInicio?.toISOString().split("T")[0] || ""
          ),
        sortable: true,
        width: "150px",
      },
      {
        name: "Fecha de Finalizacion",
        selector: (row) =>
          formatDate(
            typeof row.fechaFinalizacion === "string"
              ? row.fechaFinalizacion
              : row.fechaFinalizacion?.toISOString().split("T")[0] || ""
          ),
        sortable: true,
        width: "180px",
      },
      {
        name: "Cantidad de Cuotas",
        selector: (row) =>
          row.cantidadPagos ? row.cantidadPagos.toString() : "0",
        sortable: true,
        width: "180px",
      },
      {
        name: "Efectividad",
        sortable: true,
        cell: (row) => (
          <div style={{ width: "100%", padding: "4px 0" }}>
            <div className="progress position-relative" style={{ height: "18px" }}>
              <div
                className={`progress-bar ${
                  row.efectividad >= 80
                    ? "bg-success"
                    : row.efectividad >= 50
                    ? "bg-warning"
                    : "bg-danger"
                }`}
                role="progressbar"
                style={{
                  width: `${row.efectividad || 0}%`,
                  transition: "width 0.6s ease",
                }}
                aria-valuenow={row.efectividad}
                aria-valuemin={0}
                aria-valuemax={100}
              ></div>
              <span
                className="position-absolute top-50 start-50 translate-middle text-dark fw-semibold"
                style={{ fontSize: "0.8rem" }}
              >
                {row.efectividad ? `${row.efectividad.toFixed(0)}%` : "0%"}
              </span>
            </div>
          </div>
        ),
      },
      {
        name: "Acciones",
        cell: (row) =>
          row.activo ? (
            <button onClick={() => handleCarpetClicked(row)}>Carpeta</button>
          ) : (
            <span>Finalizado</span>
          ),
        ignoreRowClick: true,
        allowOverflow: true,
      },
      {
        name: "Eliminar Créditos",
        cell: (row) =>
          row.activo ? (
            <IconButton
              aria-label="delete"
              color="error"
              onClick={() => handleDeleteClicked(row.idPrestamo)}
            >
              <DeleteIcon />
            </IconButton>
          ) : (
            <span>Finalizado</span>
          ),
        ignoreRowClick: true,
        allowOverflow: true,
      },
      {
        name: "Configuración",
        cell: (row) => (
          <IconButton
            aria-label="config"
            onClick={(e) => {
              e.stopPropagation();
              toggleExpand(row.idPrestamo);
            }}
          >
            <SettingsIcon />
          </IconButton>
        ),
        ignoreRowClick: true,
        allowOverflow: true,
      },
    ],
    [] // eslint-disable-line react-hooks/exhaustive-deps
  );

  const conditionalRowStyles: ConditionalStyles<Prestamo>[] = [
    {
      when: (row) => !row.activo,
      style: {
        backgroundColor: "lightgreen",
        color: "black",
        "&:hover": {
          cursor: "not-allowed",
        },
      },
    },
  ];

  const ExpandContent: React.FC<{ data: Prestamo }> = ({ data }) => (
    <div className="expand-wrapper">
      <div className="expand-content">
        <Stack direction="row" spacing={2}>
          <Button
            variant="contained"
            color="success"
            onClick={(e) => {
              e.stopPropagation();
              handleHabilitar(data);
            }}
          >
            Habilitar
          </Button>
          <Button
            variant="outlined"
            color="warning"
            onClick={(e) => {
              e.stopPropagation();
              handleDeshabilitar(data);
            }}
          >
            Deshabilitar
          </Button>
        </Stack>
      </div>
    </div>
  );

  return (
    <div className="prestamos-grid">
      {loading && (
        <Box display="flex" justifyContent="center" my={2}>
          <CircularProgress />
        </Box>
      )}
      <DataTable
        columns={columns}
        data={prestamos || []}
        pagination
        highlightOnHover
        pointerOnHover
        onRowClicked={handleRowClicked}
        conditionalRowStyles={conditionalRowStyles}
        expandableRows
        expandableRowsHideExpander
        expandableRowsComponent={ExpandContent}
        expandableRowExpanded={(row) => expandedRows.has(row.idPrestamo)}
      />
    </div>
  );
};

export default PrestamosGrid;
