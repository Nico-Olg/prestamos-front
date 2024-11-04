import React, { useState, useEffect } from "react";
import DataTable, { TableColumn } from "react-data-table-component";
import Modal from "react-modal"; // O el modal que prefieras usar
import { useLocation } from "react-router-dom"; // Importa useLocation para obtener el estado de navegación
import { cobranzaDelDia, registrarPago } from "../apis/postApi"; // Importa el endpoint
import "../styles/ClientesGrid.css";
import { PagosHoy } from "../interfaces/PagosHoy"; // Importa la interfaz PagosHoy
import jsPDF from "jspdf";
import "jspdf-autotable";

const PagosHoyGrid: React.FC<{ handlePagoCuota: (pagoId: number, monto: number) => void }> = ({  }) => {
  const location = useLocation();
  const [pagosHoy, setPagosHoy] = useState<PagosHoy[]>([]);
  const [selectedPago, setSelectedPago] = useState<PagosHoy | null>(null);
  const [modalIsOpen, setModalIsOpen] = useState(false);

  // Obtén el id del cobrador desde el estado pasado en navigate
  const cobradorId = location.state?.id;
  const nombreCobrador = location.state?.nombreyApellido || "Cobrador";

  // Obtiene la fecha de hoy en formato 'YYYY-MM-DD'
  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    // Llama al endpoint cobranzaDelDia al cargar el componente
    if (cobradorId) {
      const fetchPagosHoy = async () => {
        try {
          const data = await cobranzaDelDia(cobradorId, today);
          setPagosHoy(data);
        } catch (error) {
          console.error("Error al obtener la cobranza del día:", error);
        }
      };

      fetchPagosHoy();
    } else {
      console.error("ID de cobrador no disponible");
    }
  }, [cobradorId, today]);

  const handleRowClicked = (pago: PagosHoy) => {
    setSelectedPago(pago);
    setModalIsOpen(true);
  };

  const handleGeneratePDF = () => {
    const doc = new jsPDF();
    doc.text(`Pagos del día: ${new Date().toLocaleDateString()} del Cobrador: ${nombreCobrador}`, 10, 10);
    doc.autoTable({
      head: [
        ["Nombre", "DNI", "Dirección Comercial", "Barrio Comercial", "Préstamo Nro","Cuota Nro", "Producto", "Monto Cuota"],
      ],
      body: pagosHoy.map((pago) => [
        pago.cliente.apellidoYnombre,
        pago.cliente.dni.toString(),
        pago.cliente.direccionComercial,
        pago.cliente.barrioComercial,
        pago.prestamo.id.toString(),
        pago.cuotaNro,
        pago.producto,
        `$${pago.monto.toFixed(2)}`,
      ]),
    });
    doc.save(`pagos_del_dia_${nombreCobrador}.pdf`);
  };

  const handleRegistrarPago = async () => {
    if (selectedPago) {
      try {
        await registrarPago(selectedPago.id, selectedPago.monto);
        alert("Pago registrado con éxito");
        setModalIsOpen(false);
      } catch (error) {
        console.error("Error registrando el pago:", error);
      }
    }
  };

  const columns: TableColumn<PagosHoy>[] = [
    { name: "Nombre Cliente", selector: (row) => row.cliente.apellidoYnombre, sortable: true, minWidth: "250px" },
    { name: "DNI", selector: (row) => row.cliente.dni?.toString() || "Sin DNI", sortable: true },
    { name: "Dirección Comercial", selector: (row) => row.cliente.direccionComercial, sortable: true, minWidth: "300px" },
    { name: "Barrio Comercial", selector: (row) => row.cliente.barrioComercial || "Sin Barrio", sortable: true, minWidth: "300px" },
    { name: "Préstamo Nro", selector: (row) => row.prestamo.id ? row.prestamo.id.toString() : "Sin Id", sortable: true },
    { name: "Cuota Nro", selector: (row) => row.cuotaNro },
    { name: "Producto", selector: (row) => row.producto || " ", sortable: true },
    { name: "Monto Cuota", selector: (row) => `$${row.monto.toFixed(2)}`, sortable: true },
 
  ];

  return (
    <div className="pagos-hoy-grid">
      <DataTable
        columns={columns}
        data={pagosHoy}
        pagination
        highlightOnHover
        onRowClicked={handleRowClicked}
      />
      <div className="button-container">
        <button className="btn btn-primary" onClick={handleGeneratePDF}>
          Imprimir Pagos
        </button>
      </div>

      <Modal isOpen={modalIsOpen} onRequestClose={() => setModalIsOpen(false)}>
        <h2>Registrar Pago</h2>
        {selectedPago && (
          <>
            <p>Cliente: {selectedPago.cliente.apellidoYnombre}</p>
            <p>Producto: {selectedPago.producto}</p>
            <p>Monto Cuota: $ {selectedPago.monto.toFixed(2)}</p>
            <button onClick={handleRegistrarPago}>Registrar Pago</button>
          </>
        )}
      </Modal>
    </div>
  );
};

export default PagosHoyGrid;
