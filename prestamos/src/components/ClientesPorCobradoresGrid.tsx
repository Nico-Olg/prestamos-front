import React, { useState, useEffect, useCallback } from "react";
import { DndProvider, useDrag, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { cobranzaDelDia, guardarOrdenClientes } from "../apis/postApi";
import jsPDF from "jspdf";
import "jspdf-autotable";
import { useNavigate } from "react-router-dom";
import { Cliente } from "../interfaces/Cliente";
import "../styles/ClientesPorCobradoresGrid.css";
import { PagosMapper } from "../interfaces/Pagos";
import Swal from "sweetalert2"; // <--- Importación de SweetAlert2

interface ClientesPorCobradorGridProps {
  clientes: Cliente[];
  cobradorId: number;
  nombreCobrador: string;
}

const ItemType = "CLIENTE";

const ClienteRow: React.FC<{
  cliente: Cliente;
  index: number;
  moveCliente: (dragIndex: number, hoverIndex: number) => void;
}> = ({ cliente, index, moveCliente }) => {
  const ref = React.useRef<HTMLTableRowElement>(null);

  const [, drop] = useDrop({
    accept: ItemType,
    hover(item: { index: number }, monitor) {
      if (!ref.current) return;
      const dragIndex = item.index;
      const hoverIndex = index;
      if (dragIndex === hoverIndex) return;

      const hoverBoundingRect = ref.current?.getBoundingClientRect();
      const hoverMiddleY =
        (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;
      const clientOffset = monitor.getClientOffset();
      const hoverClientY = clientOffset?.y! - hoverBoundingRect.top;

      if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) return;
      if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) return;

      moveCliente(dragIndex, hoverIndex);
      item.index = hoverIndex;
    },
  });

  const [{ isDragging }, drag] = useDrag({
    type: ItemType,
    item: { index },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  drag(drop(ref));

  return (
    <tr
      ref={ref}
      style={{
        opacity: isDragging ? 0.5 : 1,
        cursor: isDragging ? "grabbing" : "grab",
      }}
    >
      <td>{cliente.apellidoYnombre}</td>
      <td>{cliente.dni}</td>
      <td>{cliente.fechaNac ? new Date(cliente.fechaNac).toLocaleDateString() : ""}</td>
      <td>{cliente.direccionComercial}</td>
      <td>{cliente.barrioComercial}</td>
      <td>{cliente.direccionParticular}</td>
      <td>{cliente.barrioParticular}</td>
      <td>{cliente.tel}</td>
      <td>{cliente.fechaAlta ? new Date(cliente.fechaAlta).toLocaleDateString() : ""}</td>
    </tr>
  );
};

const ClientesPorCobradoresGrid: React.FC<ClientesPorCobradorGridProps> = ({
  clientes,
  cobradorId,
  nombreCobrador,
}) => {
  const [orderedClientes, setOrderedClientes] = useState<Cliente[]>(clientes);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(30);
  const navigate = useNavigate();

  useEffect(() => {
    const savedClientes = sessionStorage.getItem(`ordenClientes_${cobradorId}`);
    if (savedClientes) {
      setOrderedClientes(JSON.parse(savedClientes));
    } else {
      setOrderedClientes(clientes);
    }
  }, [clientes, cobradorId]);

  const saveToSession = (clientes: Cliente[]) => {
    sessionStorage.setItem(
      `ordenClientes_${cobradorId}`,
      JSON.stringify(clientes)
    );
  };

  const moveCliente = useCallback(
    (dragIndex: number, hoverIndex: number) => {
      const updatedClientes = [...orderedClientes];
      const [draggedCliente] = updatedClientes.splice(dragIndex, 1);
      updatedClientes.splice(hoverIndex, 0, draggedCliente);
      setOrderedClientes(updatedClientes);
      saveToSession(updatedClientes);
    },
    [orderedClientes, cobradorId]
  );

  const prepareClientesForSave = (clientes: Cliente[]) => {
    return clientes.map((cliente, index) => ({
      id: cliente.id,
      apellidoYnombre: cliente.apellidoYnombre,
      dni: cliente.dni,
      fechaNac: cliente.fechaNac,
      direccionComercial: cliente.direccionComercial,
      barrioComercial: cliente.barrioComercial,
      direccionParticular: cliente.direccionParticular,
      barrioParticular: cliente.barrioParticular,
      tel: cliente.tel,
      tel2: cliente.tel2,
      socio_conyugue: cliente.socio_conyugue,
      fechaAlta: cliente.fechaAlta,
      rubro: cliente.rubro,
      orden: index + 1,
      cobrador_id: cobradorId,
      cobrador: {
        id: cobradorId,
        nombreyApellido: nombreCobrador,
        zona: 0,
        dni: 0,
        tel: ""
      },
      prestamo: [],
    }));
  };

  const handleGuardarOrden = async () => {
    try {
      const clientesConOrden = orderedClientes.map((cliente, index) => ({
        ...cliente,
        orden: index + 1,
      }));
      await guardarOrdenClientes(
        cobradorId,
        prepareClientesForSave(clientesConOrden)
      );
      Swal.fire({
        icon: 'success',
        title: 'Orden guardado',
        text: 'El nuevo orden de clientes fue guardado correctamente.',
        confirmButtonText: 'Aceptar'
      });
    } catch (error) {
      console.error("Error al guardar el orden", error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Hubo un problema al guardar el orden de clientes. Intente nuevamente.',
        confirmButtonText: 'Cerrar'
      });
    }
  };

  const handleGeneratePDF = () => {
    const doc = new jsPDF();
    doc.text(`Clientes de: ${nombreCobrador}`, 10, 10);
    doc.autoTable({
      head: [
        [
          "Nombre",
          "DNI",
          "Fecha de Nacimiento",
          "Dirección Comercial",
          "Barrio Comercial",
          "Dirección Particular",
          "Barrio Particular",
          "Teléfono",
          "Fecha de Alta",
        ],
      ],
      body: orderedClientes.map((cliente) => [
        cliente.apellidoYnombre,
        cliente.dni.toString(),
        cliente.fechaNac,
        cliente.direccionComercial,
        cliente.barrioComercial,
        cliente.direccionParticular,
        cliente.barrioParticular,
        cliente.tel,
        cliente.fechaAlta,
      ]),
    });
    doc.save(`clientes_${nombreCobrador}.pdf`);
  };

  const handleVerCobranza = async () => {
    try {
      const today = new Date().toISOString().split("T")[0];
      const response = await cobranzaDelDia(cobradorId, today);
      const data = PagosMapper.fromJSON(response);

      if (!data || !data.pagos || !data.cobrador) {
        console.error("Error: Datos incompletos en la respuesta del backend.");
        return;
      }

      const { pagos, cobrador } = data;
      navigate(`/pagos`, { state: { pagos, cobrador } });
    } catch (error) {
      console.error("Error obteniendo la cobranza del día:", error);
    }
  };

  const currentClientes = orderedClientes.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalPages = Math.ceil(orderedClientes.length / itemsPerPage);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleItemsPerPageChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setItemsPerPage(Number(event.target.value));
    setCurrentPage(1);
  };

  return (
    <>
      <DndProvider backend={HTML5Backend}>
        <div>
          <div className="rows-per-page-selector">
            <label htmlFor="rows-per-page">Filas por página:</label>
            <select id="rows-per-page" value={itemsPerPage} onChange={handleItemsPerPageChange}>
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={30}>30</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </div>

          <table className="table">
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
              {currentClientes.map((cliente, index) => (
                <ClienteRow
                  key={cliente.id}
                  cliente={cliente}
                  index={index + (currentPage - 1) * itemsPerPage}
                  moveCliente={moveCliente}
                />
              ))}
            </tbody>
          </table>

          <div className="pagination-container">
            <ul className="pagination">
              {Array.from({ length: totalPages }).map((_, pageIndex) => (
                <li
                  key={pageIndex}
                  className={pageIndex + 1 === currentPage ? "active" : ""}
                >
                  <button onClick={() => handlePageChange(pageIndex + 1)}>
                    {pageIndex + 1}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div className="button-container">
            <button className="action-btn" onClick={handleGuardarOrden}>
              Guardar orden
            </button>
            <button className="action-btn" onClick={handleGeneratePDF}>
              Imprimir Clientes
            </button>
            <button className="action-btn" onClick={handleVerCobranza}>
              Cobranza del día
            </button>
          </div>
        </div>
      </DndProvider>
    </>
  );
};

export default ClientesPorCobradoresGrid;
