import React, { useState } from "react";
import DataTable, { TableColumn } from "react-data-table-component";
import Modal from "react-modal"; // O el modal que prefieras usar
import { registrarPago } from "../apis/postApi";
import { usePagosHoyContext } from "../provider/PagosHoyContext"; // Importar el contexto de PagosHoy
import "../styles/ClientesGrid.css";
import { PagosHoy } from "../interfaces/PagosHoy"; // Importar la interfaz PagosHoy
import jsPDF from "jspdf";
import { ClientProvider } from "../provider/ClientContext";


interface CobradorProp {
  
  cobradorId: number;
  nombreCobrador: string;
}

const PagosHoyGrid: React.FC<CobradorProp> = ({ cobradorId, nombreCobrador }) => {
  const { pagosHoy } = usePagosHoyContext(); // Usar el contexto de pagos del día
  const [selectedPago, setSelectedPago] = useState<PagosHoy | null>(null);
  const [modalIsOpen, setModalIsOpen] = useState(false);

  const handleRowClicked = (pago: PagosHoy) => {
    setSelectedPago(pago);
    setModalIsOpen(true);
  };
   const handleGeneratePDF = () => {
    const doc = new jsPDF();
    doc.text(`Pagos del dia : ${new Date().toLocaleDateString()} del Cobrador: ${nombreCobrador} `, 10, 10);
    doc.autoTable({
      head: [
        [
          "Nombre",
          "DNI",          
          "Dirección Comercial",
          "Barrio Comercial",
          "Prestamo Nro",
          "Producto",
          "Monto Cuota",    
                    
        ],
      ],
      body: pagosHoy.map((pago) => [
        pago.cliente.apellidoYnombre,
        pago.cliente.dni.toString(),
        pago.cliente.direccionComercial,
        pago.cliente.barrioComercial,
        pago.prestamo.id.toString(),
        pago.prestamo.id,
        pago.prestamo.montoCuota,
        
      ]),
    });
    doc.save(`pagos del dia.pdf`); // Descargar el archivo PDF
  };

  const handleRegistrarPago = async () => {
    if (selectedPago) {
      try {
        // Aquí harías la llamada para registrar el pago
        await registrarPago(selectedPago.id, selectedPago.monto);
        alert("Pago registrado con éxito");
        setModalIsOpen(false);
      } catch (error) {
        console.error("Error registrando el pago: ", error);
      }
    }
  };

  // Definir las columnas para la tabla usando la interfaz PagosHoy
  const columns: TableColumn<PagosHoy>[] = [
    { 
      name: "Nombre Cliente", 
      selector: (row) => row.cliente.apellidoYnombre, 
      sortable: true, 
      minWidth: "250px"  // Aumenta el ancho mínimo de esta columna
    },
    { 
      name: "DNI", 
      selector: (row) => row.cliente.dni?.toString() || "Sin DNI", 
      sortable: true 
    },
    { 
      name: "Dirección", 
      selector: (row) => row.cliente.direccionComercial, 
      sortable: true, 
      minWidth: "300px"  // Aumenta el ancho mínimo de esta columna
    },
    { 
      name: "Barrio", 
      selector: (row) => row.cliente.barrioComercial? row.cliente.barrioComercial : "Sin Barrio", 
      sortable: true, 
      minWidth: "300px"  // Aumenta el ancho mínimo de esta columna
    },
    { 
      name: "Prestamo Nro", 
      selector: (row) => row.prestamo.id? row.prestamo.id : "Sin Id", 
      sortable: true, 
     
    },
    { 
      name: "Producto", 
      selector: (row) => row.producto, 
      sortable: true 
    },
    { 
      name: "Monto Cuota", 
      selector: (row) => `$ ${row.monto.toFixed(2)}`, 
      sortable: true 
    },
    { 
      name: "Forma de Pago", 
      selector: (row) => row.formaPago, 
      sortable: true 
    },
    { 
      name: "Pago en Efectivo", 
      selector: (row) => row.formaPago ? "Sí" : "No", 
      sortable: true 
    },
  ];

  return (
    <div className="pagos-hoy-grid">
      <DataTable
        columns={columns}
        data={pagosHoy}  // Usamos los pagos obtenidos del contexto
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
