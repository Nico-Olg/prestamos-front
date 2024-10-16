import React, { useState, useEffect } from "react";
import DataTable, { TableColumn } from "react-data-table-component";
import { useNavigate } from "react-router-dom";
import { Cliente, Prestamo } from "../interfaces/Cliente";  // Importa las interfaces
import { generarPDF } from "./carpetaPDF";
import "../styles/PrestamosGrid.css";

interface PrestamosGridProps {
  cliente: Cliente;  // Datos del cliente que también provienen de PrestamosPage
}

const PrestamosGrid: React.FC<PrestamosGridProps> = ({ cliente }) => {
  const prestamos = cliente.prestamo || []; // Asegúrate de que prestamos no sea undefined
  
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

 

  const columns: TableColumn<Prestamo>[] = [
    {
      name: "ID",
      selector: (row) => row.id.toString(),
      sortable: true,
    },
    {
      name: "Monto",
      selector: (row) => row.total.toString(),
      sortable: true,
    },
    {
      name: "Fecha de Inicio",
      selector: (row) => new Date(row.fechaInicio).toLocaleDateString(),
      sortable: true,
    },
    {
      name: "Fecha de Fin",
      selector: (row) => new Date(row.fechaFinalizacion).toLocaleDateString(),
      sortable: true,
    },
     {
      name: "Cantidad de Cuotas",
      selector: (row) => row.pagos.length.toString(),
      sortable: true,
    },
    {
      name: "Acciones",
      cell: (row) => (
        <div>         
          <button onClick={() => handleCarpetClicked(row)}>Carpeta</button>
        </div>
      ),
      ignoreRowClick: true,  // Para evitar que el clic dentro del botón dispare la acción de clic en fila
    allowOverflow: true,   // Asegura que las acciones no causen desbordamiento de la celda
    button: true,
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
      />
    </div>
  );
};

export default PrestamosGrid;