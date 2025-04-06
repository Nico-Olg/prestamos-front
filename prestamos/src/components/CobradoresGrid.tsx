import React, { useEffect, useState } from "react";
import DataTable, { TableColumn } from "react-data-table-component";
import { useNavigate } from "react-router-dom";
import { getCobradores } from "../apis/getApi"; // Asegúrate de agregar esta función en tu getApi
import "../styles/ClientesGrid.css"; // Reutilizamos el mismo archivo de estilos de ClientesGrid

interface Cobrador {
  id: number;
  nombreyApellido: string;
  dni: number;
  zona: number;
  tel: string;
}

const CobradoresGrid: React.FC = () => {
  const [cobradores, setCobradores] = useState<Cobrador[]>([]);
  const [filteredCobradores, setFilteredCobradores] = useState<Cobrador[]>([]);
  const [searchName, setSearchName] = useState<string>("");
  const [searchDNI, setSearchDNI] = useState<string>("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCobradores = async () => {
      try {
        const data = await getCobradores(); // Función que obtiene todos los cobradores
        setCobradores(data);
        setFilteredCobradores(data);
      } catch (error) {
        console.log("Error fetching cobradores: ", error);
      }
    };

    fetchCobradores();
  }, []);

  const handleRowClicked = (cobrador: Cobrador) => {
    navigate(`/cobradores/${cobrador.id}/clientes`, { state: { id: cobrador.id , nombreyApellido : cobrador.nombreyApellido} });
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
    const filteredData = cobradores.filter(
      (cobrador) =>
        cobrador.nombreyApellido.toLowerCase().includes(name.toLowerCase()) &&
        (dni === "" || (cobrador.dni && cobrador.dni.toString().startsWith(dni)))
    );
    setFilteredCobradores(filteredData);
  };

  const columns: TableColumn<Cobrador>[] = [
    {
      name: "Nombre",
      selector: (row) => row.nombreyApellido,
      sortable: true,
    },
    {
      name: "DNI",
      selector: (row) => row.dni.toString(),
      sortable: true,
    },
    {
      name: "Zona",
      selector: (row) => row.zona.toString(),
      sortable: true,
    },
    {
      name: "Teléfono",
      selector: (row) => row.tel,
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
          data={filteredCobradores}
          pagination
          highlightOnHover
          onRowClicked={handleRowClicked}
        />
        <div className="button-container">
          <button className="action-btn secondary" onClick={() => navigate("/alta-cobrador")}>
            Añadir Cobrador
          </button>
        </div>
      </div>
    </div>
  );
};

export default CobradoresGrid;
