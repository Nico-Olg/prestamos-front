import React, { useEffect, useState } from "react";
import DataTable, { TableColumn } from "react-data-table-component";
import { useNavigate } from "react-router-dom";
import "../styles/PrestamosGrid.css";
import { generarPDF } from "./carpetaPDF";


// Definir la interfaz para los datos de los préstamos
interface Prestamo {
  id: number;
  apellidoYnombre: string;
  dni: number;
  tel: string;
  producto: string;
  cuotasPagadas: number;
  montoCuota: number;
  montoRestante: number;
  montoPrestamo: number;
  tipoPlan: string;
  fechaInicio: string;
  fechaFinalizacion: string;
  al_dia: boolean;
  periodo_pago: string;
  idPrestamo: number; 
  cobrador: string;
  codigo: string; 
  cuotas: number; 
}

interface PrestamosGridProps {
  prestamos: Prestamo[];
}

const PrestamosGrid: React.FC<PrestamosGridProps> = ({ prestamos }) => {
  const [filteredPrestamos, setFilteredPrestamos] = useState<Prestamo[]>(prestamos);
  const [searchName, setSearchName] = useState<string>("");
  const [searchDNI, setSearchDNI] = useState<string>("");
  const navigate = useNavigate();

  useEffect(() => {
    setFilteredPrestamos(prestamos); // Actualiza los préstamos filtrados cuando se reciben nuevos datos
  }, [prestamos]);

  const handleRowClicked = (prestamo: Prestamo) => {
    console.log("Prestamo seleccionado:", prestamo.idPrestamo);
    navigate(`/pagos`, { state: { prestamoId: prestamo.idPrestamo } }); // Redirige a PagosPage pasando el ID del préstamo
  };

  // Modificar esta función para generar el PDF
  const handleCarpetClicked = (prestamo: Prestamo) => {
    console.log("Carpeta seleccionada:", prestamo.idPrestamo);

    const cliente = {
      nombreCompleto: prestamo.apellidoYnombre,
      direccion: "Dirección ejemplo", // Actualiza esto con la dirección real del cliente
      barrio: "Barrio ejemplo", // Actualiza esto con el barrio real del cliente
    };

    // Llama a la función generarPDF con los datos del cliente y el préstamo
    generarPDF(cliente, prestamo);
  };

  const handleSearchName = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value.replace(/[^A-Za-z\s]/g, ""); // Eliminar cualquier carácter que no sea una letra o espacio
    setSearchName(value);
    filterData(value, searchDNI);
  };

  const handleSearchDNI = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value.replace(/\D/g, ""); // Eliminar cualquier carácter que no sea un número
    setSearchDNI(value);
    filterData(searchName, value);
  };

  const filterData = (name: string, dni: string) => {
    const filteredData = prestamos.filter(
      (prestamo) =>
        prestamo.apellidoYnombre.toLowerCase().includes(name.toLowerCase()) &&
        (dni === "" || (prestamo.dni && prestamo.dni.toString().startsWith(dni)))
    );

    setFilteredPrestamos(filteredData);
  };

  const ProgressBar: React.FC<{ percentage: number }> = ({ percentage }) => {
    return (
      <div className="progress-bar-container">
        <div className="progress-bar" style={{ width: `${percentage}%` }}>
          {percentage}%
        </div>
      </div>
    );
  };

  const columns: TableColumn<Prestamo>[] = [
    {
      name: "Nombre",
      selector: (row) => row.apellidoYnombre,
      sortable: true,
    },
    {
      name: "DNI",
      selector: (row) => row.dni.toString(),
      sortable: true,
    },
    {
      name: "Prestamo Nro",
      selector: (row) => row.idPrestamo,
      sortable: true,
    },
    {
      name: "Producto",
      selector: (row) => row.producto,
      sortable: true,
    },
    
    
    {
    name: "Cuota",
    selector: (row) => `$ ${row.montoCuota ? row.montoCuota.toFixed(2) : "0.00"}`,
    sortable: true,
  },
  {
    name: "Monto Restante",
    selector: (row) => `$ ${row.montoRestante ? row.montoRestante.toFixed(2) : "0.00"}`,
    sortable: true,
  },
  {
    name: "Monto Prestamo",
    selector: (row) => `$ ${row.montoPrestamo ? row.montoPrestamo.toFixed(2) : "0.00"}`,
    sortable: true,
  },
    {
      name: "Tipo de Plan",
      selector: (row) => row.tipoPlan,
      sortable: true,
    },
    {
      name: "Fecha de Inicio",
      selector: (row) => row.fechaInicio,
      sortable: true,
    },
    {
      name: "Fecha de Finalización",
      selector: (row) => row.fechaFinalizacion,
      sortable: true,
    },
    {
      name: "Al Día",
      selector: (row) => (row.al_dia ? "Sí" : "No"),
      sortable: true,
    },
    {
      name: "Periodo Pago",
      selector: (row) => row.periodo_pago,
      sortable: true,
    },
    {
      name: "Cobrador",
      selector: (row) => row.cobrador,
      sortable: true,
    },
    {
      name: "Avance",
      cell: (row) => {
        const percentage = Math.ceil(
          (row.cuotasPagadas * row.montoCuota * 100) / row.montoPrestamo
        );
        return <ProgressBar percentage={percentage} />;
      },
      sortable: true,
    },
    {
      name: "Acciones",
      cell: (row) => (
        <button
          onClick={() => handleCarpetClicked(row)}
          className="btn-carpeta"
        >
          Carpeta
        </button>
      ),
      button: true
    },
  ];

  return (
    <div className="prestamos-grid">
      <div className="group">
        <svg className="icon" aria-hidden="true" viewBox="0 0 24 24">
          <g>
            <path d="M21.53 20.47l-3.66-3.66C19.195 15.24 20 13.214 20 11c0-4.97-4.03-9-9-9s-9 4.03-9 9 4.03 9 9 9c2.215 0 4.24-.804 5.808-2.13l3.66 3.66c.147.146.34.22.53.22s.385-.073.53-.22c.295-.293.295-.767.002-1.06zM3.5 11c0-4.135 3.365-7.5 7.5-7.5s7.5 3.365 7.5 7.5-3.365 7.5-7.5 7.5-7.5-3.365-7.5-7.5z"></path>
          </g>
        </svg>
        <input
          type="search"
          placeholder="Buscar por nombre"
          value={searchName}
          onChange={handleSearchName}
          className="input"
        />
        <input
          type="search"
          placeholder="Buscar por DNI"
          value={searchDNI}
          onChange={handleSearchDNI}
          className="input"
        />
      </div>

      <DataTable
        columns={columns}
        data={filteredPrestamos}
        pagination
        highlightOnHover
        onRowClicked={handleRowClicked}
      />
    </div>
  );
};

export default PrestamosGrid;
