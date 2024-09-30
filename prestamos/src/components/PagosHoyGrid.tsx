import React, { useEffect, useState } from "react";
import DataTable, { TableColumn } from "react-data-table-component";
import { getPagosDeHoy } from "../apis/getApi"; // Agrega esta función a tu API
import Modal from "react-modal"; // O el modal que prefieras usar
import "../styles/ClientesGrid.css";
import { registrarPago } from "../apis/postApi";

interface Pago {
  id: number;
  clienteNombre: string;
  clienteDNI: number;
  direccion: string;
  producto: string;
  montoCuota: number;
  periodoPago: string;
  formaPago: string;
  pagoEnEfectivo: boolean;
}

const PagosHoyGrid: React.FC = () => {
  const [pagos, setPagos] = useState<Pago[]>([]);
  const [selectedPago, setSelectedPago] = useState<Pago | null>(null);
  const [modalIsOpen, setModalIsOpen] = useState(false);

  useEffect(() => {
    const fetchPagosDeHoy = async () => {
      try {
        const data = await getPagosDeHoy();
        setPagos(data);
      } catch (error) {
        console.error("Error fetching pagos de hoy: ", error);
      }
    };

    fetchPagosDeHoy();
  }, []);

  const handleRowClicked = (pago: Pago) => {
    setSelectedPago(pago);
    setModalIsOpen(true);
  };

  const handleRegistrarPago = async () => {
    if (selectedPago) {
      try {
        // Aquí harías la llamada para registrar el pago
        await registrarPago(selectedPago.id);
        alert("Pago registrado con éxito");
        setModalIsOpen(false);
      } catch (error) {
        console.error("Error registrando el pago: ", error);
      }
    }
  };

  const columns: TableColumn<Pago>[] = [
    { name: "Nombre Cliente", selector: (row) => row.clienteNombre, sortable: true },
    { name: "DNI", selector: (row) => row.clienteDNI.toString(), sortable: true },
    { name: "Dirección", selector: (row) => row.direccion, sortable: true },
    { name: "Producto", selector: (row) => row.producto, sortable: true },
    { name: "Monto Cuota", selector: (row) => `$ ${row.montoCuota}`, sortable: true },
    { name: "Periodo de Pago", selector: (row) => row.periodoPago, sortable: true },
    { name: "Forma de Pago", selector: (row) => row.formaPago, sortable: true },
    { name: "Pago en Efectivo", selector: (row) => row.pagoEnEfectivo ? "Sí" : "No", sortable: true },
  ];

  return (
    <div className="pagos-hoy-grid">
      <DataTable
        columns={columns}
        data={pagos}
        pagination
        highlightOnHover
        onRowClicked={handleRowClicked}
      />

      <Modal isOpen={modalIsOpen} onRequestClose={() => setModalIsOpen(false)}>
        <h2>Registrar Pago</h2>
        {selectedPago && (
          <>
            <p>Cliente: {selectedPago.clienteNombre}</p>
            <p>Producto: {selectedPago.producto}</p>
            <p>Monto Cuota: $ {selectedPago.montoCuota}</p>
            <button onClick={handleRegistrarPago}>Registrar Pago</button>
          </>
        )}
      </Modal>
    </div>
  );
};

export default PagosHoyGrid;
