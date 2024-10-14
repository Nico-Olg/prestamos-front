import React, { useState, useEffect, useCallback } from "react";
import { DndProvider, useDrag, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { guardarOrdenClientes } from "../apis/postApi";
import jsPDF from "jspdf"; // Import jsPDF
import "jspdf-autotable"; // Import AutoTable for jsPDF
import { useNavigate } from "react-router-dom"; // Import useNavigate
// Extend jsPDF to include autoTable
declare module "jspdf" {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
  }
}
import "../styles/ClientesPorCobradoresGrid.css";

interface Cliente {
  id: number;
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
      <td>{cliente.fechaNac}</td>
      <td>{cliente.direccionComercial}</td>
      <td>{cliente.barrioComercial}</td>
      <td>{cliente.direccionParticular}</td>
      <td>{cliente.barrioParticular}</td>
      <td>{cliente.tel}</td>
      <td>{cliente.fechaAlta}</td>
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
  const itemsPerPage = 10;
  const navigate = useNavigate(); // Use navigate to redirect

  useEffect(() => {
    // Cargar el orden guardado en sessionStorage si existe
    const savedClientes = sessionStorage.getItem(`ordenClientes_${cobradorId}`);
    if (savedClientes) {
      setOrderedClientes(JSON.parse(savedClientes));
    } else {
      setOrderedClientes(clientes);
    }
  }, [clientes, cobradorId]);

  // Guardar el orden en la sesión
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
      saveToSession(updatedClientes); // Guardar en sesión
    },
    [orderedClientes, cobradorId]
  );

  // Manejar el guardado al cerrar la ventana o sesión
  useEffect(() => {
    const handleBeforeUnload = async () => {
      const savedClientes = sessionStorage.getItem(
        `ordenClientes_${cobradorId}`
      );
      if (savedClientes) {
        try {
          // Guardar en la base de datos antes de cerrar
          await guardarOrdenClientes(cobradorId, JSON.parse(savedClientes));
        } catch (error) {
          console.error("Error al guardar el orden de clientes", error);
        }
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () =>
      window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [cobradorId]);

  // Obtener los clientes de la página actual
  const currentClientes = orderedClientes.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalPages = Math.ceil(orderedClientes.length / itemsPerPage);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // Función para generar el PDF
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
    doc.save(`clientes_${nombreCobrador}.pdf`); // Descargar el archivo PDF
  };

  // Función para redirigir a pagosHoyGrid
  const handleVerCobranza = () => {
    navigate("/pagosHoyGrid",  { state: { id: cobradorId , nombreyApellido : nombreCobrador}}); // Redirige a pagosHoyGrid
  };

  return (
    <>
      <DndProvider backend={HTML5Backend}>
        <div>
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

          {/* Botones para generar PDF y Ver Cobranza del Día */}
          <div className="button-container">
            <button className="btn btn-primary" onClick={handleGeneratePDF}>
              Generar PDF
            </button>
            <button className="btn btn-secondary" onClick={handleVerCobranza}>
              Ver Cobranza del día
            </button>
          </div>
        </div>
      </DndProvider>
    </>
  );
};

export default ClientesPorCobradoresGrid;
