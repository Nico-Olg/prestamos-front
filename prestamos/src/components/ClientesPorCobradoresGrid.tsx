import React, { useState, useEffect } from "react";
import { getPagosDeHoy } from "../apis/getApi"; // Asegúrate de tener este endpoint que filtre pagos por fecha
import DataTable, { TableColumn } from "react-data-table-component";
import "../styles/ClientesGrid.css"; // Puedes reutilizar los estilos
import Modal from "react-modal"; // Para ventana emergente
import { registrarPago } from "../apis/postApi";

interface Pago {
  id: number;
  clienteNombre: string;
  dni: string;
  direccion: string;
  articulo: string;
  montoPrestamo: number;
  montoCuota: number;
  formaPago: string;
  efectivo: boolean;
}

const PagosDelDiaGrid: React.FC = () => {
  const [pagos, setPagos] = useState<Pago[]>([]);
  const [selectedPago, setSelectedPago] = useState<Pago | null>(null);
  const [modalIsOpen, setModalIsOpen] = useState(false);

  useEffect(() => {
    const fetchPagos = async () => {
      try {
        const data = await getPagosDeHoy(); // Endpoint que obtenga pagos que vencen hoy
        setPagos(data);
      } catch (error) {
        console.log("Error fetching pagos: ", error);
      }
    };
    fetchPagos();
  }, []);

  const handleRowClicked = (pago: Pago) => {
    setSelectedPago(pago);
    setModalIsOpen(true);
  };

  const handlePago = async () => {
    if (selectedPago) {
      try {
        // Llama al API para registrar el pago
        await registrarPago(selectedPago.id);
        setModalIsOpen(false);
        // Refresca la lista de pagos
        const data = await getPagosDeHoy();
        setPagos(data);
      } catch (error) {
        console.log("Error processing pago: ", error);
      }
    }
  };

  const columns: TableColumn<Pago>[] = [
    { name: "Nombre", selector: (row) => row.clienteNombre, sortable: true },
    { name: "DNI", selector: (row) => row.dni, sortable: true },
    { name: "Dirección", selector: (row) => row.direccion, sortable: true },
    { name: "Artículo", selector: (row) => row.articulo, sortable: true },
    { name: "Monto Préstamo", selector: (row) => `$${row.montoPrestamo}`, sortable: true },
    { name: "Monto Cuota", selector: (row) => `$${row.montoCuota}`, sortable: true },
    { name: "Forma de Pago", selector: (row) => row.formaPago, sortable: true },
    { name: "Efectivo", selector: (row) => (row.efectivo ? "Sí" : "No"), sortable: true }
  ];

  return (
    <div className="pagos-grid">
      <h2>Pagos del Día</h2>
      <DataTable
        columns={columns}
        data={pagos}
        pagination
        highlightOnHover
        onRowClicked={handleRowClicked}
      />

      {/* Modal para confirmar pago */}
      <Modal isOpen={modalIsOpen} onRequestClose={() => setModalIsOpen(false)}>
        {selectedPago && (
          <div>
            <h3>Confirmar Pago</h3>
            <p>Cliente: {selectedPago.clienteNombre}</p>
            <p>Artículo: {selectedPago.articulo}</p>
            <p>Monto Cuota: ${selectedPago.montoCuota}</p>
            <button onClick={handlePago}>Confirmar</button>
            <button onClick={() => setModalIsOpen(false)}>Cancelar</button>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default PagosDelDiaGrid;
