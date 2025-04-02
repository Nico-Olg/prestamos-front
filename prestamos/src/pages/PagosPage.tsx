import React, { useState } from "react";
import { useLocation} from "react-router-dom";
import Header from "../components/Header.tsx";
import Sidebar from "../components/Sidebar.tsx";
import PagosGrid from "../components/PagosGrid.tsx";
import "../styles/PagosPage.css";
import Swal from "sweetalert2";
import { registrarPago } from "../apis/postApi";

interface PagosPageProps {
  isMobile?: boolean;
}

const PagosPage: React.FC<PagosPageProps> = ({ isMobile = false }) => {
  const location = useLocation();
  const { cliente, cobrador, pagos: pagosIniciales } = location.state || {}; 

  // Estado para manejar los pagos correctamente
  const [pagos, setPagos] = useState(pagosIniciales || []);

  // 🔹 Determinar si es un pago de préstamo o de cobrador
  const esPagoDeCobrador = !!cobrador;
  const tituloPagina = isMobile
    ? esPagoDeCobrador
      ? `Bienvenido ${cobrador?.nombreyApellido}`
      : `Pagos de ${cliente?.apellidoYnombre}`
    : esPagoDeCobrador
    ? `Pagos del día de ${cobrador?.nombreyApellido}`
    : `Pagos de ${cliente?.apellidoYnombre}`;
    

  // 🟢 Función de pago
  const handlePagoCuota = async (pagoId: number, monto: number) => {
    try {
      const result = await Swal.fire({
        icon: "warning",
        title: "Confirmación de Pago",
        text: `¿Desea abonar el total de la Cuota?  $${monto}?`,
        showCancelButton: true,
        confirmButtonText: "Sí",
        cancelButtonText: "No, cambiar monto",
        showCloseButton: true,
        allowOutsideClick: false,
        width: '85%',
              });

      if (result.dismiss === Swal.DismissReason.close) return;

      let montoFinal = monto;
      if (result.dismiss === Swal.DismissReason.cancel) {
        const { value: nuevoMonto, isDismissed } = await Swal.fire({
          title: "Ingrese el nuevo monto a pagar",
          input: "number",
          inputLabel: "Monto",
          inputValue: monto,
          showCancelButton: true,
          confirmButtonText: "Pagar",
          cancelButtonText: "Cancelar",
          allowOutsideClick: false,
          showCloseButton: true,
          inputValidator: (value) => {
            if (!value || parseFloat(value) <= 0) {
              return "Debe ingresar un monto válido";
            }
            return null;
          },
          width: '85%',
        });

        if (isDismissed) return;
        if (nuevoMonto) montoFinal = parseFloat(nuevoMonto);
      }

      await registrarPago(pagoId, montoFinal);

      // 🔄 Actualizar estado de pagos correctamente
      setPagos((prevPagos: any[]) =>
        prevPagos.map((p) =>
          p.id === pagoId
            ? { ...p, montoAbonado: (p.montoAbonado || 0) + montoFinal, fechaPago: new Date().toISOString() }
            : p
        )
      );

      Swal.fire({
        icon: "success",
        title: "Pago realizado",
        text: `El pago de $${montoFinal} se realizó con éxito.`,
        width: '85%',
      });
    } catch (error) {
      console.error("Error realizando el pago: ", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Hubo un problema al realizar el pago.",
        width: '85%',
      });
    }
  };


  return (
    <div className="pagos-page">
      {/* Si es mobile, el header solo muestra el título */}
      <Header title={tituloPagina} isMobile={isMobile} />

      <div className="content">
        {/* Si es desktop, mostramos el Sidebar */}
        {!isMobile && <Sidebar />}

       

        {/* Grilla de pagos */}
        <PagosGrid pagos={pagos} handlePagoCuota={handlePagoCuota} mostrarCliente={esPagoDeCobrador} />
      </div>
    </div>
  );
};

export default PagosPage;
