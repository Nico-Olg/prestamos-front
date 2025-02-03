import React from "react";
import DataTable, { TableColumn, ConditionalStyles } from "react-data-table-component";
import { useNavigate } from "react-router-dom";
import { Cliente, Prestamo } from "../interfaces/Cliente"; // Importa las interfaces
import { generarPDF } from "./carpetaPDF";
import { borrarCreditos } from "../apis/postApi"; // Importa el método borrarCreditos
import "../styles/PrestamosGrid.css";
import { IconButton } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete"; // Importa el ícono de tacho de basura
import Swal from "sweetalert2";
import { useClientContext } from "../provider/ClientContext";

interface PrestamosGridProps {
  cliente: Cliente; // Datos del cliente que también provienen de PrestamosPage
}

const PrestamosGrid: React.FC<PrestamosGridProps> = ({ cliente }) => {
  const { refreshClientes, clientes } = useClientContext(); // Incluye `clientes` para obtener actualizaciones
  const navigate = useNavigate();

  // Obtener los préstamos del cliente desde el contexto
  const clienteActualizado = clientes.find((c) => c.dni === cliente.dni);
  const prestamos = clienteActualizado?.prestamo || [];

  const handleRowClicked = (prestamo: Prestamo) => {
    navigate(`/pagos`, { state: { prestamoId: prestamo.id, cliente: cliente } });
  };

  const handleCarpetClicked = (prestamo: Prestamo) => {
    generarPDF(cliente, prestamo); // Genera el PDF con los datos del cliente y el préstamo seleccionado
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
      selector: (row) => (row.id ? row.id.toString() : "N/A"), // Validar `row.id`
      sortable: true,
    },
    {
      name: "Plan",
      selector: (row) => row.tipoPlan || "N/A", // Validar `row.tipoPlan`
      sortable: true,
    },
    {
      name: "Monto",
      selector: (row) => (row.total ? `$ ${row.total.toString()}` : "N/A"), // Validar `row.total`
      sortable: true,
    },
    {
      name: "Fecha de Inicio",
      selector: (row) => formatDate(row.fechaInicio || ""), // Validar `row.fechaInicio`
      sortable: true,
      width: "150px",
    },
    {
      name: "Fecha de Finalizacion",
      selector: (row) => formatDate(row.fechaFinalizacion || ""), // Validar `row.fechaFinalizacion`
      sortable: true,
      width: "180px",
    },
    {
      name: "Cantidad de Cuotas",
      selector: (row) => (row.pagos ? row.pagos.length.toString() : "0"), // Validar `row.pagos`
      sortable: true,
      width: "180px",
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
      button: true,
    },
    {
      name: "Eliminar Créditos",
      cell: (row) => (
        <div>
          {row.activo ? (
            <IconButton
              aria-label="delete"
              color="error"
              onClick={() => handleDeleteClicked(row.id)}
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
      button: true,
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
        data={prestamos}
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
