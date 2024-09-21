import React, { useEffect, useState } from "react";
import DataTable, { TableColumn } from "react-data-table-component";
import { useNavigate } from "react-router-dom";
import { getAllClients } from "../apis/getApi"; 
import { getPrestamosPorCliente } from "../apis/postApi"; 
import "../styles/ClientesGrid.css";
import PrestamosPage from "../pages/PrestamosPage";

// Definir la interfaz para los datos de los clientes
interface Cliente {
  apellidoYnombre: string;
  dni: number;
  fechaNac: string;
  direccionComercial: string;
  barrioComercial: string;
  direccionParticular: string;
  barrioParticular: string;
  tel: string;
  fechaAlta: string;
}

const ClientesGrid: React.FC = () => {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [filteredClientes, setFilteredClientes] = useState<Cliente[]>([]);
  const [searchName, setSearchName] = useState<string>("");
  const [searchDNI, setSearchDNI] = useState<string>("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchClientes = async () => {
      try {
        const clients = await getAllClients();
        setClientes(clients);
        setFilteredClientes(clients);
      } catch (error) {
        console.log("Error fetching clientes: ", error);
      }
    };

    fetchClientes();
  }, []);

  const handleRowClicked = async (cliente: Cliente) => {
  console.log("Cliente seleccionado:", cliente);
  try {
    const prestamos = await getPrestamosPorCliente(cliente.dni);
    navigate("/prestamos", { state: { dni: cliente.dni } }); // Navegar a PrestamosPage pasando el DNI del cliente
  } catch (error) {
    console.log("Error fetching prestamos del cliente: ", error);
  }
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
    const filteredData = clientes.filter(
      (cliente) =>
        cliente.apellidoYnombre.toLowerCase().includes(name.toLowerCase()) &&
        (dni === "" || (cliente.dni && cliente.dni.toString().startsWith(dni)))
    );

    setFilteredClientes(filteredData);
  };

  const columns: TableColumn<Cliente>[] = [
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
      name: "Fecha de Nacimiento",
      selector: (row) => row.fechaNac,
      sortable: true,
    },
    {
      name: "Dirección Comercial",
      selector: (row) => row.direccionComercial,
      sortable: true,
    },
    {
      name: "Barrio Comercial",
      selector: (row) => row.barrioComercial,
      sortable: true,
    },
    {
      name: "Dirección Particular",
      selector: (row) => row.direccionParticular,
      sortable: true,
    },
    {
      name: "Barrio Particular",
      selector: (row) => row.barrioParticular,
      sortable: true,
    },
    {
      name: "Teléfono",
      selector: (row) => row.tel,
      sortable: true,
    },
    {
      name: "Fecha de Alta",
      selector: (row) => row.fechaAlta,
      sortable: true,
    },
  ];

  return (
    <div className="clientes-grid">
      <div>
        <div className="group">
          <div className="buscarPornombre">
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
          </div>
          <div className="buscarPorDNI">
            <svg className="icon" aria-hidden="true" viewBox="0 0 24 24">
              <g>
                <path d="M21.53 20.47l-3.66-3.66C19.195 15.24 20 13.214 20 11c0-4.97-4.03-9-9-9s-9 4.03-9 9 4.03 9 9 9c2.215 0 4.24-.804 5.808-2.13l3.66 3.66c.147.146.34.22.53.22s.385-.073.53-.22c.295-.293.295-.767.002-1.06zM3.5 11c0-4.135 3.365-7.5 7.5-7.5s7.5 3.365 7.5 7.5-3.365 7.5-7.5 7.5-7.5-3.365-7.5-7.5z"></path>
              </g>
            </svg>
            <input
              type="search"
              placeholder="Buscar por DNI"
              value={searchDNI}
              onChange={handleSearchDNI}
              className="input"
            />
          </div>
        </div>

        <DataTable
          columns={columns}
          data={filteredClientes}
          pagination
          highlightOnHover
          onRowClicked={handleRowClicked}
        />
        <div className="button-container">
          <button className="btn" onClick={() => navigate("/alta-cliente")}>
            Añadir Cliente
          </button>
        </div>
      </div>
    </div>
  );
};

export default ClientesGrid;
