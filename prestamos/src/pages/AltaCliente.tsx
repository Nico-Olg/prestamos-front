import React, { useEffect, useState } from "react";
import Header from "../components/Header";
import Sidebar from "../components/Sidebar";
import Barrios from "../utils/Barrios_Rubros";
import "../styles/AltaCliente.css";
import { altaCliente } from "../apis/postApi";
import { getAllClients, getCobradores } from "../apis/getApi";
import { useLocation, useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import { Cliente, Cobrador } from "../interfaces/Cliente";
import "react-toastify/dist/ReactToastify.css";



const AltaCliente: React.FC = () => {
  const location = useLocation();
  const isEditMode = location.state?.isEditMode || false;
  const [barrios, setBarrios] = useState<string[]>([]);
  const [rubros, setRubros] = useState<string[]>([]);
  const [clientesList, setClientesList] = useState<Cliente[]>([]);
  const [cobradores, setCobradores] = useState<Cobrador[]>([]);
  const [selectedCliente, setSelectedCliente] = useState<Cliente | null>(
    null
  );
  const [filteredClientes, setFilteredClientes] = useState<Cliente[]>([]);
  const [nombreBusqueda, setNombreBusqueda] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const barriosInstance = new Barrios();
    setBarrios(barriosInstance.getBarrios());
    setRubros(barriosInstance.getRubros());

    // Obtener cobradores desde la API
    const fetchCobradores = async () => {
      try {
        const cobradoresData = await getCobradores();
        setCobradores(cobradoresData);
      } catch (error) {
        console.error("Error fetching cobradores:", error);
      }
    };

    fetchCobradores();

    // Si está en modo edición, obtener la lista de clientes
    if (isEditMode) {
      const fetchClientes = async () => {
        try {
          const clientesData = await getAllClients(); // Llamada al endpoint para obtener clientes
          setClientesList(clientesData);
        } catch (error) {
          console.error("Error fetching clientes:", error);
        }
      };

      fetchClientes();
    }
  }, [isEditMode]);

  // Filtrar clientes basados en lo que escribe el usuario en el campo "Nombre"
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
    setNombreBusqueda(cliente.apellidoYnombre); // Asignar el nombre seleccionado al campo de búsqueda
    setFilteredClientes([]); // Ocultar las sugerencias
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const clienteData: Cliente = {
      id: formData.get("id") ? Number(formData.get("id")) : 0,
      apellidoYnombre: formData.get("nombre") as string,
      barrioComercial: formData.get("barrio_comercial") as string,
      
      dni: Number(formData.get("dni")),
      barrioParticular: formData.get("barrio_particular") as string,
      tel: formData.get("tel") as string,
      direccionComercial: formData.get("direccion_comercial") as string,
      direccionParticular: formData.get("direccion_particular") as string,
      fechaNac: new Date(formData.get("fecha_nac") as string),
      rubro: formData.get("rubro") as string,
      tel2: formData.get("tel2") ? (formData.get("tel2") as string) : undefined,
      socio_conyugue: formData.get("socio") as string,
      fechaAlta: new Date(),  

      cobrador: {
        id: Number(formData.get("id")),
        nombreyApellido: formData.get("nombrey_apellido") as string,
        dni: Number(formData.get("dni")),
        zona: Number(formData.get("zona")),
        tel: formData.get("tel") as string,
      },
      prestamo: []
    };

    try {
      if (isEditMode) {
        toast.success("Datos del cliente actualizados con éxito!");
      } else {
        await altaCliente({
          ...clienteData,
          tel2: clienteData.tel2 || undefined
        });
        toast.success("Cliente creado con éxito!");
      }
      setTimeout(() => {
        navigate("/clientes");
      }, 3000);
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  return (
    <div className="alta-cliente-page">
      <Header title={isEditMode ? "Editar Cliente" : "Alta Cliente"} />
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
        <li key={cliente.dni} onClick={() => handleClienteSelect(cliente)}>
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
                value={selectedCliente?.fechaNac.toString() || ""}
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
                type="number"
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
                type="number"
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
                value={selectedCliente?.cobrador?.id || ""} // Manejar caso cuando no hay cobrador
                onChange={(e) =>
                  setSelectedCliente({
                    ...selectedCliente!,
                    cobrador: {
                      id: Number(e.target.value),
                      nombreyApellido: e.target.value,
                      dni: Number(e.target.value),
                      zona: Number(e.target.value),
                      tel: e.target.value,
                    },
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

            <button type="submit" className="btn">
              {isEditMode ? "Guardar Cambios" : "Guardar"}
            </button>
          </form>
        </div>
      </div>
      <ToastContainer /> {/* Componente para mostrar notificaciones */}
    </div>
  );
};

export default AltaCliente;
