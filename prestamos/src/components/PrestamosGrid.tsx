import React, { useEffect, useState } from "react";
import DataTable, { TableColumn } from "react-data-table-component";
import { useNavigate } from "react-router-dom";
import "../styles/PrestamosGrid.css";
import { generarPDF } from "./carpetaPDF";
import { Cliente, Prestamo } from "../interfaces/Cliente";  // Importa las interfaces

interface PrestamosGridProps {
  prestamos: Prestamo[];  // Lista de préstamos que proviene de PrestamosPage
  cliente: Cliente;       // Datos del cliente que también provienen de PrestamosPage
}

const PrestamosGrid: React.FC<PrestamosGridProps> = ({ prestamos, cliente }) => {
  const [filteredPrestamos, setFilteredPrestamos] = useState<Prestamo[]>([]);
  const [searchName, setSearchName] = useState<string>(cliente.apellidoYnombre || "");
  const [searchDNI, setSearchDNI] = useState<string>(cliente.dni.toString() || "");
  const navigate = useNavigate();

  useEffect(() => {
    if (prestamos.length > 0) {
      setFilteredPrestamos(prestamos);
    } else {
      setFilteredPrestamos([]);
    }
  }, [prestamos]);

  const handleRowClicked = (prestamo: Prestamo) => {
    navigate(`/pagos`, { state: { prestamoId: prestamo.id } });
  };

  const handleCarpetClicked = (prestamo: Prestamo) => {
    // Generamos el PDF con los datos del cliente y del préstamo específico
    const clienteConPrestamo = {
      nombreCompleto: cliente.apellidoYnombre,
      direccion: cliente.direccionComercial,
      barrio: cliente.barrioComercial,
    };
    generarPDF(cliente, prestamo); // Pasamos el préstamo seleccionado
  };

  const handleSearchName = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value.replace(/[^A-Za-z\s]/g, "");
    setSearchName(value);
    filterData(value, searchDNI);
  };

  const handleSearchDNI = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value.replace(/\D/g, "");
    setSearchDNI(value);
    filterData(searchName, value);
  };

  const filterData = (name: string, dni: string) => {
    const filteredData = prestamos.filter(
      (prestamo) =>
        cliente.apellidoYnombre.toLowerCase().includes(name.toLowerCase()) &&
        (dni === "" || cliente.dni.toString().startsWith(dni))
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
      selector: () => cliente.apellidoYnombre,
      sortable: true,
    },
    {
      name: "DNI",
      selector: () => cliente.dni.toString(),
      sortable: true,
    },
    {
      name: "Prestamo Nro",
      selector: (row) => row.id,
      sortable: true,
    },
    {
      name: "Producto",
      selector: (row) => row.nombreProducto,
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
      selector: (row) => `$ ${row.total ? row.total.toFixed(2) : "0.00"}`,
      sortable: true,
    },
    {
      name: "Tipo de Plan",
      selector: (row) => row.tipoPlan,
      sortable: true,
    },
    {
      name: "Fecha de Inicio",
      selector: (row) => row.fechaInicio.toString(),
      sortable: true,
    },
    {
      name: "Fecha de Finalización",
      selector: (row) => row.fechaFinalizacion.toString(),
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
      name: "Avance",
      cell: (row) => {
        const percentage = Math.ceil((row.cuotasPagadas * row.montoCuota * 100) / row.total);
        return <ProgressBar percentage={percentage} />;
      },
      sortable: true,
    },
    {
      name: "Acciones",
      cell: (row) => (
        <button onClick={() => handleCarpetClicked(row)} className="btn-carpeta">
          Carpeta
        </button>
      ),
      button: true,
    },
  ];

  return (
    <div className="prestamos-grid">
      <div className="group">
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
