import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getCobradores } from "../apis/getApi";
import "bootstrap/dist/css/bootstrap.min.css";
import "../styles/CobradoresGrid.css";

interface Cobrador {
  id: number;
  nombreyApellido: string;
  dni: number;
  zona: number;
  tel: string;
  totalCobrado: number;
  montoEfectivo: number;
  montoTransferencia: number;
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
        const data = await getCobradores();
        setCobradores(data);
        setFilteredCobradores(data);
      } catch (error) {
        console.log("Error fetching cobradores: ", error);
      }
    };

    fetchCobradores();
  }, []);

  const handleRowClicked = (cobrador: Cobrador) => {
    navigate(`/cobradores/${cobrador.id}/clientes`, {
      state: {
        id: cobrador.id,
        nombreyApellido: cobrador.nombreyApellido,
      },
    });
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
        (dni === "" ||
          (cobrador.dni && cobrador.dni.toString().startsWith(dni)))
    );
    setFilteredCobradores(filteredData);
  };

  return (
    <div className="container mt-4">
      <h2 className="mb-4">Listado de Cobradores</h2>

      <div className="row mb-3">
        <div className="col-md-6">
          <input
            type="search"
            className="form-control"
            placeholder="Buscar por nombre"
            value={searchName}
            onChange={handleSearchName}
          />
        </div>
        <div className="col-md-6">
          <input
            type="search"
            className="form-control"
            placeholder="Buscar por DNI"
            value={searchDNI}
            onChange={handleSearchDNI}
          />
        </div>
      </div>

      <div className="table-container rounded-4 overflow-hidden  shadow">
        <table className="table table-bordered table-hover table-striped align-middle text-center m-0">
          <thead className="table-secondary">
            <tr>
              <th>Nombre</th>
              <th>DNI</th>
              <th>Zona</th>
              <th>Teléfono</th>
              <th>Total Cobrado</th>
              <th>Efectivo</th>
              <th>Transferencia</th>
            </tr>
          </thead>
          <tbody>
            {filteredCobradores.map((cobrador) => (
              <tr
                key={cobrador.id}
                style={{ cursor: "pointer" }}
                onClick={() => handleRowClicked(cobrador)}
              >
                <td>{cobrador.nombreyApellido}</td>
                <td>{cobrador.dni}</td>
                <td>{cobrador.zona}</td>
                <td>{cobrador.tel}</td>
                <td>
                  <strong>${cobrador.totalCobrado.toFixed(2)}</strong>
                </td>
                <td className="text-success fw-bold">
                  ${cobrador.montoEfectivo.toFixed(2)}
                </td>
                <td className="text-primary fw-bold">
                  ${cobrador.montoTransferencia.toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="text-end mt-3">
        <button
          className="btn btn-secondary"
          onClick={() => navigate("/alta-cobrador")}
        >
          Añadir Cobrador
        </button>
      </div>
    </div>
  );
};

export default CobradoresGrid;
