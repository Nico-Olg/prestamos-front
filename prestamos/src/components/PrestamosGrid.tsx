import React from "react";
import DataTable, {
  TableColumn,
  ConditionalStyles,
} from "react-data-table-component";
import { useNavigate } from "react-router-dom";
import { Cliente } from "../interfaces/Cliente"; // Importa las interfaces
import { Prestamo } from "../interfaces/Prestamo"; // Importa las interfaces
import { generarPDF } from "./carpetaPDF";
import { borrarCreditos } from "../apis/postApi"; // Importa el método borrarCreditos
import "../styles/PrestamosGrid.css";
import { IconButton } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete"; // Importa el ícono de tacho de basura
import Swal from "sweetalert2";
import { useClientContext } from "../provider/ClientContext";
import { getPagosPorPrestamo } from "../apis/postApi";
import { formatearNumero } from "../utils/formatters";

interface PrestamosGridProps {
  cliente: Cliente; // Datos del cliente que también provienen de PrestamosPage
  prestamos?: Prestamo[]; // Opcional, ya que los préstamos se obtienen del contexto
}

const PrestamosGrid: React.FC<PrestamosGridProps> = ({
  cliente,
  prestamos,
}) => {
  const { refreshClientes } = useClientContext(); // Incluye `clientes` para obtener actualizaciones
  const navigate = useNavigate();

  const handleRowClicked = async (prestamo: Prestamo) => {
    try {
      const pagos = await getPagosPorPrestamo(prestamo.idPrestamo);
      navigate(`/pagos`, { state: { cliente, prestamo, pagos } });
    } catch (error) {
      console.error("Error al cargar los pagos del préstamo:", error);
    }
  };

  const handleCarpetClicked = async (prestamo: Prestamo) => {
    const pagos = await getPagosPorPrestamo(prestamo.idPrestamo);
    generarPDF(cliente, prestamo, pagos); // Genera el PDF con los datos del cliente y el préstamo seleccionado
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
        // Si el usuario confirma, elimina el crédito
        await borrarCreditos(prestamoId);
        await refreshClientes(); // Actualiza los datos del cliente en el contexto
        Swal.fire({
          icon: "success",
          title: "Crédito eliminado",
          text: "El crédito se eliminó correctamente.",
        });
      } else {
        // Si cancela o cierra el diálogo
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
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString || !/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
      return "Fecha no válida";
    }
    const [year, month, day] = dateString.split("-");
    return `${day}/${month}/${year}`;
  };

  const columns: TableColumn<Prestamo>[] = [
    {
      name: "ID",
      selector: (row) => row.idPrestamo || 0, // Devuelve un número
      sortable: true,
      format: (row) => row.idPrestamo?.toString() || "N/A", // Para mostrarlo como string si querés
    },
    {
      name: "Monto Prestado",
      selector: (row) =>
        row.montoPrestamo ? `$ ${formatearNumero(row.valorProducto)}` : "N/A", // Validar `row.montoPrestamo`
      sortable: true,
      minWidth: "150px",
    },
    {
      name: "Plan",
      selector: (row) => row.tipoPlan || "N/A", // Validar `row.tipoPlan`
      sortable: true,
    },
    {
      name: "Monto a Devolver",
      selector: (row) =>
        row.montoPrestamo ? `$ ${formatearNumero(row.montoPrestamo)}` : "N/A", // Validar `row.total`
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
        ), // Validar `row.fechaInicio`
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
        ), // Validar `row.fechaFinalizacion`
      sortable: true,
      width: "180px",
    },
    {
      name: "Cantidad de Cuotas",
      selector: (row) =>
        row.cantidadPagos ? row.cantidadPagos.toString() : "0", // Validar `row.pagos`
      sortable: true,
      width: "180px",
    },
    {
      name: "Efectividad",
      sortable: true,
      cell: (row) => (
        <div style={{ width: "100%", padding: "4px 0" }}>
          <div
            className="progress position-relative"
            style={{ height: "18px" }}
          >
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
      cell: (row) => (
        <div>
          {row.activo ? (
            <button onClick={() => handleCarpetClicked(row)}>Carpeta</button>
          ) : (
            <span>Finalizado</span>
          )}
        </div>
      ),
      ignoreRowClick: true,
      allowOverflow: true,
      
    },
    {
      name: "Eliminar Créditos",
      cell: (row) => (
        <div>
          {row.activo ? (
            <IconButton
              aria-label="delete"
              color="error"
              onClick={() => handleDeleteClicked(row.idPrestamo)}
            >
              <DeleteIcon />
            </IconButton>
          ) : (
            <span>Finalizado</span>
          )}
        </div>
      ),
      ignoreRowClick: true,
      allowOverflow: true,
      
    },
  ];

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

  return (
    <div className="prestamos-grid">
      <DataTable
        columns={columns}
        data={prestamos || []}
        pagination
        highlightOnHover
        pointerOnHover
        onRowClicked={handleRowClicked}
        conditionalRowStyles={conditionalRowStyles}
      />
    </div>
  );
};

export default PrestamosGrid;
