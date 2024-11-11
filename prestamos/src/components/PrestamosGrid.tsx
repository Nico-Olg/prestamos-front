import React, { useState, useEffect } from "react";
import DataTable, { TableColumn, ConditionalStyles } from "react-data-table-component";
import { useNavigate } from "react-router-dom";
import { Cliente, Prestamo } from "../interfaces/Cliente";  // Importa las interfaces
import { generarPDF } from "./carpetaPDF";
import "../styles/PrestamosGrid.css";

interface PrestamosGridProps {
  cliente: Cliente;  // Datos del cliente que también provienen de PrestamosPage
}

const PrestamosGrid: React.FC<PrestamosGridProps> = ({ cliente }) => {
  const prestamos = cliente.prestamo || []; 
  
  const [filteredPrestamos, setFilteredPrestamos] = useState<Prestamo[]>(prestamos); // Inicializa con prestamos

  const navigate = useNavigate();

  // useEffect para actualizar los préstamos solo si el cliente cambia
  useEffect(() => {
    if (prestamos.length > 0) {
      setFilteredPrestamos(prestamos);
    }
  }, [prestamos]);

  const handleRowClicked = (prestamo: Prestamo) => {
    navigate(`/pagos`, { state: { prestamoId: prestamo.id } });
  };

  const handleCarpetClicked = (prestamo: Prestamo) => {
    // Generamos el PDF con los datos del cliente y del préstamo específico
    generarPDF(cliente, prestamo); // Pasamos el préstamo seleccionado
  };

  function formatDate(dateString: string) {
    // Verifica si el string tiene el formato esperado "yyyy-mm-dd"
    if (!dateString || !/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
      return "Fecha no válida";
    }

    const [year, month, day] = dateString.split("-"); // Divide el string en año, mes y día
    return `${day}/${month}/${year}`; // Retorna en formato dd/mm/yyyy
  }

  const columns: TableColumn<Prestamo>[] = [
    {
      name: "ID",
      selector: (row) => row.id.toString(),
      sortable: true,
    },
    {
      name: "Plan",
      selector: (row) => row.tipoPlan,
      sortable: true,
    },
    {
      name: "Monto",
      selector: (row) => `$ ${row.total.toString()}`,
      sortable: true,
    },
    {
      name: "Fecha de Inicio",
      selector: (row) => formatDate(row.fechaInicio),
      sortable: true,
      width: "150px",
    },
    {
      name: "Fecha de Finalizacion",
      selector: (row) => formatDate(row.fechaFinalizacion),
      sortable: true,
      width: "180px",
    },
    {
      name: "Cantidad de Cuotas",
      selector: (row) => row.pagos.length.toString(),
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
      ignoreRowClick: true,  // Para evitar que el clic dentro del botón dispare la acción de clic en fila
      allowOverflow: true,   // Asegura que las acciones no causen desbordamiento de la celda
      button: true,
    },
  ];

  const conditionalRowStyles: ConditionalStyles<Prestamo>[] = [
    {
      when: (row) => !row.activo,
      style: {
        backgroundColor: 'lightgreen',
        color: 'black',
        '&:hover': {
          cursor: 'not-allowed',
        },
      },
    },
  ];

  return (
    <div className="prestamos-grid">
      <DataTable
        columns={columns}
        data={filteredPrestamos}
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