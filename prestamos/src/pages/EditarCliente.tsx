// src/pages/EditarCliente.tsx
import React, { useEffect, useState } from "react";
import Header from "../components/Header";
import Sidebar from "../components/Sidebar";
import Barrios from "../utils/Barrios_Rubros";
import "../styles/AltaCliente.css";
import { getAllClients, getCobradores } from "../apis/getApi";
import { toast, ToastContainer } from "react-toastify";
import { Cliente } from "../interfaces/Cliente";
import { Cobrador } from "../interfaces/Pagos";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate } from "react-router-dom";
import { editarCliente } from "../apis/postApi";

const EditarCliente: React.FC = () => {
  const [barrios, setBarrios] = useState<string[]>([]);
  const [rubros, setRubros] = useState<string[]>([]);
  const [clientesList, setClientesList] = useState<Cliente[]>([]);
  const [cobradores, setCobradores] = useState<Cobrador[]>([]);
  const [selectedCliente, setSelectedCliente] = useState<Cliente | null>(null);
  const [filteredClientes, setFilteredClientes] = useState<Cliente[]>([]);
  const [nombreBusqueda, setNombreBusqueda] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const barriosInstance = new Barrios();
    setBarrios(barriosInstance.getBarrios());
    setRubros(barriosInstance.getRubros());

    const fetchCobradores = async () => {
      try {
        const data = await getCobradores();
        setCobradores(data);
      } catch (error) {
        console.error("Error fetching cobradores:", error);
      }
    };

    const fetchClientes = async () => {
      try {
        const data = await getAllClients();
        setClientesList(data);
      } catch (error) {
        console.error("Error fetching clientes:", error);
      }
    };

    fetchCobradores();
    fetchClientes();
  }, []);

  const handleNombreChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setNombreBusqueda(value);

    if (value) {
      const filtered = clientesList.filter((cliente) =>
        cliente.apellidoYnombre.toLowerCase().includes(value.toLowerCase())
      );
      setFilteredClientes(filtered);
    } else {
      setFilteredClientes([]);
    }
  };

  const handleClienteSelect = (cliente: Cliente) => {
    setSelectedCliente(cliente);
    setNombreBusqueda(cliente.apellidoYnombre);
    setFilteredClientes([]);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selectedCliente) return;

    try {
      await editarCliente(selectedCliente);
      toast.success("Datos del cliente actualizados con éxito!");
      setTimeout(() => navigate("/clientes"), 3000);
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  return (
    <div className="alta-cliente-page">
      <Header title="Editar Cliente" />
      <div className="content">
        <Sidebar />
        <div className="form-container">
          <form onSubmit={handleSubmit}>
            <div className="form-group nombre" style={{ position: "relative" }}>
              <label htmlFor="nombre">Apellido y Nombre</label>
              <input
                type="text"
                id="nombre"
                name="nombre"
                required
                value={nombreBusqueda}
                onChange={handleNombreChange}
              />
              {filteredClientes.length > 0 && (
                <ul className="suggestions-list">
                  {filteredClientes.map((cliente) => (
                    <li
                      key={cliente.dni}
                      onClick={() => handleClienteSelect(cliente)}
                    >
                      {cliente.apellidoYnombre} - {cliente.dni}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="form-group dni">
              <label htmlFor="dni">DNI</label>
              <input
                type="number"
                id="dni"
                name="dni"
                required
                value={selectedCliente?.dni || ""}
                onChange={(e) =>
                  setSelectedCliente({
                    ...selectedCliente!,
                    dni: Number(e.target.value),
                  })
                }
              />
            </div>

            <div className="form-group fecha">
              <label htmlFor="fecha_nac">Fecha de Nacimiento</label>
              <input
                type="date"
                id="fecha_nac"
                name="fecha_nac"
                required
                value={
                  selectedCliente?.fechaNac
                    ? new Date(selectedCliente.fechaNac)
                        .toISOString()
                        .split("T")[0]
                    : ""
                }
                onChange={(e) =>
                  setSelectedCliente({
                    ...selectedCliente!,
                    fechaNac: new Date(e.target.value),
                  })
                }
              />
            </div>

            <div className="form-group domcom">
              <label htmlFor="direccion_comercial">Domicilio Comercial</label>
              <input
                type="text"
                id="direccion_comercial"
                name="direccion_comercial"
                required
                value={selectedCliente?.direccionComercial || ""}
                onChange={(e) =>
                  setSelectedCliente({
                    ...selectedCliente!,
                    direccionComercial: e.target.value,
                  })
                }
              />
            </div>

            <div className="form-group barrio">
              <label htmlFor="barrio_comercial">Barrio Comercial</label>
              <select
                id="barrio_comercial"
                name="barrio_comercial"
                required
                value={selectedCliente?.barrioComercial || ""}
                onChange={(e) =>
                  setSelectedCliente({
                    ...selectedCliente!,
                    barrioComercial: e.target.value,
                  })
                }
              >
                <option value="">Seleccione Barrio</option>
                {barrios.map((barrio, index) => (
                  <option key={index} value={barrio}>
                    {barrio}
                  </option>
                ))}
              </select>
            </div>

            {/* DOMICILIO PARTICULAR - columna 1 */}
            <div className="form-group dompart">
              <label htmlFor="direccion_particular">Domicilio Particular</label>
              <input
                type="text"
                id="direccion_particular"
                name="direccion_particular"
                required
                value={selectedCliente?.direccionParticular || ""}
                onChange={(e) =>
                  setSelectedCliente({
                    ...selectedCliente!,
                    direccionParticular: e.target.value,
                  })
                }
              />
            </div>

            {/* BARRIO PARTICULAR - columna 2 */}
            <div className="form-group barrio-particular">
              <label htmlFor="barrio_particular">Barrio Particular</label>
              <select
                id="barrio_particular"
                name="barrio_particular"
                value={selectedCliente?.barrioParticular || ""}
                onChange={(e) =>
                  setSelectedCliente({
                    ...selectedCliente!,
                    barrioParticular: e.target.value,
                  })
                }
              >
                <option value="">Seleccione Barrio</option>
                {barrios.map((barrio, index) => (
                  <option key={index} value={barrio}>
                    {barrio}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group rubro">
              <label htmlFor="rubro">Rubro</label>
              <select
                id="rubro"
                name="rubro"
                required
                value={selectedCliente?.rubro || ""}
                onChange={(e) =>
                  setSelectedCliente({
                    ...selectedCliente!,
                    rubro: e.target.value,
                  })
                }
              >
                <option value="">Seleccione Rubro</option>
                {rubros.map((rubro, index) => (
                  <option key={index} value={rubro}>
                    {rubro}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group celular">
              <label htmlFor="tel">Teléfono</label>
              <input
                type="text"
                id="tel"
                name="tel"
                required
                value={selectedCliente?.tel || ""}
                onChange={(e) =>
                  setSelectedCliente({
                    ...selectedCliente!,
                    tel: e.target.value,
                  })
                }
              />
            </div>

            <div className="form-group celular2">
              <label htmlFor="tel2">Teléfono 2</label>
              <input
                type="text"
                id="tel2"
                name="tel2"
                value={selectedCliente?.tel2 || ""}
                onChange={(e) =>
                  setSelectedCliente({
                    ...selectedCliente!,
                    tel2: e.target.value,
                  })
                }
              />
            </div>

            <div className="form-group socio">
              <label htmlFor="socio">Socio / Conyugue</label>
              <input
                type="text"
                id="socio"
                name="socio"
                value={selectedCliente?.socio_conyugue || ""}
                onChange={(e) =>
                  setSelectedCliente({
                    ...selectedCliente!,
                    socio_conyugue: e.target.value,
                  })
                }
              />
            </div>

            <div className="form-group cobrador">
              <label htmlFor="cobrador">Cobrador</label>
              <select
                id="cobrador"
                name="cobrador"
                required
                value={selectedCliente?.cobrador_id || ""}
                onChange={(e) =>
                  setSelectedCliente({
                    ...selectedCliente!,
                    cobrador_id: Number(e.target.value),
                  })
                }
              >
                <option value="">Seleccione Cobrador</option>
                {cobradores.map((cobrador) => (
                  <option key={cobrador.id} value={cobrador.id}>
                    {cobrador.nombreyApellido}
                  </option>
                ))}
              </select>
            </div>

            <div className="btn">
              <button type="submit" className="action-btn">
                Guardar Cambios
              </button>
            </div>
          </form>
        </div>
      </div>
      <ToastContainer />
    </div>
  );
};

export default EditarCliente;
