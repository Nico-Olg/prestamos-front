import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import "../styles/ClientesPorCobradoresGrid.css";

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

interface ClientesPorCobradorGridProps {
  clientes: Cliente[];
}

const ClientesPorCobradoresGrid: React.FC<ClientesPorCobradorGridProps> = ({ clientes }) => {
  const [filteredClientes, setFilteredClientes] = useState<Cliente[]>([]); // Inicializar como array vacío
  const [searchName, setSearchName] = useState<string>("");
  const [searchDNI, setSearchDNI] = useState<string>("");

  const navigate = useNavigate();

  // Cargar clientes del localStorage al recargar la página
  useEffect(() => {
    const savedClientes = localStorage.getItem("clientes");
    if (savedClientes) {
      setFilteredClientes(JSON.parse(savedClientes));
    } else {
      setFilteredClientes(clientes); // Si no hay nada en localStorage, usar los props de clientes
    }
  }, [clientes]);

  // Guardar clientes reordenados en localStorage
  useEffect(() => {
    if (filteredClientes.length > 0) {
      localStorage.setItem("clientes", JSON.stringify(filteredClientes));
    }
  }, [filteredClientes]);

  const filterData = (name: string, dni: string) => {
    const filteredData = clientes.filter(
      (cliente) =>
        cliente.apellidoYnombre.toLowerCase().includes(name.toLowerCase()) &&
        (dni === "" || cliente.dni.toString().startsWith(dni))
    );
    setFilteredClientes(filteredData);
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

  const handleOnDragEnd = (result: any) => {
    if (!result.destination) return;

    const reorderedClientes = Array.from(filteredClientes);
    const [movedCliente] = reorderedClientes.splice(result.source.index, 1);
    reorderedClientes.splice(result.destination.index, 0, movedCliente);

    setFilteredClientes(reorderedClientes); // Actualiza el estado y guarda en localStorage
  };

  return (
    <div className="clientes-grid">
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

      <DragDropContext onDragEnd={handleOnDragEnd}>
        <Droppable droppableId="clientes-droppable">
          {(provided) => (
            <table
              className="table"
              {...provided.droppableProps}
              ref={provided.innerRef}
            >
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>DNI</th>
                  <th>Fecha de Nacimiento</th>
                  <th>Dirección Comercial</th>
                  <th>Barrio Comercial</th>
                  <th>Dirección Particular</th>
                  <th>Barrio Particular</th>
                  <th>Teléfono</th>
                  <th>Fecha de Alta</th>
                </tr>
              </thead>
              <tbody>
                {filteredClientes.map((cliente, index) => (
                  <Draggable
                    key={cliente.dni.toString()}
                    draggableId={cliente.dni.toString()}
                    index={index}
                  >
                    {(provided) => (
                      <tr
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        style={{
                          ...provided.draggableProps.style,
                          cursor: "grab",
                        }}
                      >
                        <td>{cliente.apellidoYnombre}</td>
                        <td>{cliente.dni}</td>
                        <td>{cliente.fechaNac}</td>
                        <td>{cliente.direccionComercial}</td>
                        <td>{cliente.barrioComercial}</td>
                        <td>{cliente.direccionParticular}</td>
                        <td>{cliente.barrioParticular}</td>
                        <td>{cliente.tel}</td>
                        <td>{cliente.fechaAlta}</td>
                      </tr>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </tbody>
            </table>
          )}
        </Droppable>
      </DragDropContext>

      <div className="button-container">
        <button className="btn" onClick={() => navigate("/clientes")}>
          Añadir Cliente
        </button>
      </div>
    </div>
  );
};

export default ClientesPorCobradoresGrid;
