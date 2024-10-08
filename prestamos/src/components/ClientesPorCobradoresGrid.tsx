import React, { useState, useEffect } from "react";
import DataTable, { TableColumn } from "react-data-table-component";
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
  const [filteredClientes, setFilteredClientes] = useState<Cliente[]>(clientes);
  const [searchName, setSearchName] = useState<string>("");
  const [searchDNI, setSearchDNI] = useState<string>("");

  const navigate = useNavigate();

  // Actualiza el estado de filteredClientes cuando cambian las props de clientes
  useEffect(() => {
    setFilteredClientes(clientes);
  }, [clientes]);

  // Filtrado de clientes por nombre y DNI
  const filterData = (name: string, dni: string) => {
    const filteredData = clientes.filter(
      (cliente) =>
        cliente.apellidoYnombre.toLowerCase().includes(name.toLowerCase()) &&
        (dni === "" || cliente.dni.toString().startsWith(dni))
    );
    setFilteredClientes(filteredData);
  };

  const handleSearchName = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value.replace(/[^A-Za-z\s]/g, ""); // Eliminar caracteres no válidos
    setSearchName(value);
    filterData(value, searchDNI);
  };

  const handleSearchDNI = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value.replace(/\D/g, ""); // Solo permitir números
    setSearchDNI(value);
    filterData(searchName, value);
  };

  // Método para manejar el reordenamiento
  const handleOnDragEnd = (result: any) => {
    if (!result.destination) return;

    const reorderedClientes = Array.from(filteredClientes);
    const [movedCliente] = reorderedClientes.splice(result.source.index, 1);
    reorderedClientes.splice(result.destination.index, 0, movedCliente);

    setFilteredClientes(reorderedClientes);
  };

  // Definir las columnas de la tabla
  const columns: TableColumn<Cliente>[] = [
    { name: "Nombre", selector: (row) => row.apellidoYnombre, sortable: true },
    { name: "DNI", selector: (row) => row.dni.toString(), sortable: true },
    { name: "Fecha de Nacimiento", selector: (row) => row.fechaNac, sortable: true },
    { name: "Dirección Comercial", selector: (row) => row.direccionComercial, sortable: true },
    { name: "Barrio Comercial", selector: (row) => row.barrioComercial, sortable: true },
    { name: "Dirección Particular", selector: (row) => row.direccionParticular, sortable: true },
    { name: "Barrio Particular", selector: (row) => row.barrioParticular, sortable: true },
    { name: "Teléfono", selector: (row) => row.tel, sortable: true },
    { name: "Fecha de Alta", selector: (row) => row.fechaAlta, sortable: true },
  ];

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
        <Droppable droppableId="clientes-table">
          {(provided) => (
            <div {...provided.droppableProps} ref={provided.innerRef}>
              <DataTable
                columns={columns}
                data={filteredClientes.map((cliente, index) => ({
                  ...cliente,
                  index: index, // Añadir índice para usar en Draggable
                }))}
                customStyles={{
                  rows: {
                    style: {
                      cursor: "grab", // Mostrar ícono de arrastre
                    },
                  },
                }}
                highlightOnHover
                pagination
                noDataComponent={<span>No hay datos para mostrar</span>}
              />
              {provided.placeholder}
            </div>
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
