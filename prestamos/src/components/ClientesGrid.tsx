import React, { useState, useEffect } from "react";
import DataTable, { TableColumn } from "react-data-table-component";
import { useNavigate } from "react-router-dom";
import { useClientContext } from "../provider/ClientContext";
import { Cliente } from "../interfaces/Cliente"; // Importa la interfaz desde el archivo correspondiente
import "../styles/ClientesGrid.css";

const ClientesGrid: React.FC = () => {
  const { clientes, refreshPrestamos } = useClientContext(); // Obtener clientes y función para refrescar préstamos desde el contexto
  const [filteredClientes, setFilteredClientes] = useState<Cliente[]>(clientes);
  const [searchName, setSearchName] = useState<string>("");
  const [searchDNI, setSearchDNI] = useState<string>("");
  const navigate = useNavigate();

  useEffect(() => {
    setFilteredClientes(clientes); // Actualiza la lista filtrada cuando los clientes cambian
  }, [clientes]);

  const handleRowClicked = (cliente: Cliente) => {
    console.log("Cliente seleccionado:", cliente);
    refreshPrestamos(cliente.dni); // Refresca los préstamos del cliente seleccionado
    console.log("Cliente seleccionado:", cliente);
    navigate("/prestamos", { state: { cliente } }); // Navegar a PrestamosPage pasando el DNI del cliente
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
        (cliente.apellidoYnombre && cliente.apellidoYnombre.toLowerCase().includes(name.toLowerCase())) &&
        (dni === "" || cliente.dni.toString().startsWith(dni))
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
      selector: (row) => row.fechaNac.toString(),
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
      selector: (row) => row.fechaAlta.toString(),
      sortable: true,
    },
  ];

  return (
    <div className="clientes-grid">
      <div>
        <div className="group">
          <div className="buscarPornombre">
            <input
              type="search"
              placeholder="Buscar por nombre"
              value={searchName}
              onChange={handleSearchName}
              className="input"
            />
          </div>
          <div className="buscarPorDNI">
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
