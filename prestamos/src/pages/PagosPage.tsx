import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import Header from "../components/Header.tsx";
import Sidebar from "../components/Sidebar.tsx";
import PagosGrid from "../components/PagosGrid.tsx";
import "../styles/PagosPage.css";
import Swal from "sweetalert2";
import { registrarPago,editarPago } from "../apis/postApi";
import { Pago } from "../interfaces/Pagos";
import { guardarTotalCobrado, obtenerTotalCobrado } from "../utils/localStorageCobranza";


interface PagosPageProps {
  isMobile?: boolean;
}

const PagosPage: React.FC<PagosPageProps> = ({ isMobile = false }) => {
  const location = useLocation();
  const { cliente, cobrador, pagos: pagosIniciales } = location.state || {};
  const [pagos, setPagos] = useState<Pago[]>(pagosIniciales || []);
  const [totalCobrado, setTotalCobrado] = useState<number>(obtenerTotalCobrado());
   useEffect(() => {
     guardarTotalCobrado(totalCobrado);
   }, [totalCobrado]);


  const esPagoDeCobrador = !!cobrador;
  const tituloPagina = isMobile
    ? esPagoDeCobrador
      ? `Bienvenido ${cobrador?.nombreyApellido}`
      : `Pagos de ${cliente?.apellidoYnombre}`
    : esPagoDeCobrador
    ? `Pagos del día de ${cobrador?.nombreyApellido}`
    : `Pagos de ${cliente?.apellidoYnombre}`;

  const handlePagoCuota = async (pagoId: number, monto: number) => {
    try {
      const result = await Swal.fire({
        icon: "warning",
        title: "Confirmación de Pago",
        text: `¿Desea abonar el total de la Cuota? $${monto}?`,
        showCancelButton: true,
        confirmButtonText: "Sí",
        cancelButtonText: "No, cambiar monto",
        showCloseButton: true,
        allowOutsideClick: false,
        width: "85%",
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
          width: "85%",
          inputValidator: (value) => {
            if (!value || parseFloat(value) <= 0) {
              return "Debe ingresar un monto válido";
            }
            return null;
          },
        });

        if (isDismissed) return;
        if (nuevoMonto) montoFinal = parseFloat(nuevoMonto);
      }

      await registrarPago(pagoId, montoFinal);

      setPagos((prevPagos) =>
        prevPagos.map((p) =>
          p.id === pagoId
            ? {
                ...p,
               montoAbonado: montoFinal,
                fechaPago: new Date(),
                saldo: p.monto - montoFinal,
              }
            : p
        )
      );

      setTotalCobrado((prev) => prev + montoFinal);

      Swal.fire({
        icon: "success",
        title: "Pago realizado",
        text: `El pago de $${montoFinal} se realizó con éxito.`,
        width: "85%",
      });
    } catch (error) {
      console.error("Error realizando el pago: ", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Hubo un problema al realizar el pago.",
        width: "85%",
      });
    }
  };
  const handleEditarPago = async (pago: Pago) => {
  const { value: nuevoMonto } = await Swal.fire({
    title: "Editar Monto Pagado",
    input: "number",
    inputLabel: "Nuevo Monto Abonado",
    inputValue: pago.montoAbonado || 0,
    showCancelButton: true,
    confirmButtonText: "Guardar",
    cancelButtonText: "Cancelar",
    inputValidator: (value) => {
      if (!value || parseFloat(value) < 0) {
        return "Debe ingresar un monto válido";
      }
      return null;
    },
    width: "85%",
  });

  if (nuevoMonto !== undefined) {
    try {
      const fechaPagoActual = pago.fechaPago
        ? new Date(pago.fechaPago).toISOString().split("T")[0]
        : new Date().toISOString().split("T")[0];

      await editarPago(pago.id, parseFloat(nuevoMonto), fechaPagoActual);

      // 🔁 Actualizar el pago en el estado local de pagos:
      setPagos((prevPagos) =>
        prevPagos.map((p) =>
          p.id === pago.id
            ? {
                ...p,
                montoAbonado: parseFloat(nuevoMonto),
                fechaPago: new Date(fechaPagoActual),
                saldo: p.monto - parseFloat(nuevoMonto),
              }
            : p
        )
      );

      // 🔁 Actualizar el total cobrado
      const diferencia = parseFloat(nuevoMonto) - (pago.montoAbonado || 0);
      setTotalCobrado((prev) => prev + diferencia);

      Swal.fire("Pago actualizado", `Nuevo monto: $${nuevoMonto}`, "success");
    } catch (error) {
      Swal.fire("Error", "No se pudo editar el pago", "error");
    }
  }
};



  return (
    <div className="pagos-page">
      <Header title={tituloPagina} isMobile={isMobile} />
      <div className="content">
        {!isMobile && <Sidebar />}
        <PagosGrid
          pagos={pagos}
          handlePagoCuota={handlePagoCuota}
          handleEditarPago={handleEditarPago}
          mostrarCliente={esPagoDeCobrador}
          totalCobrado={totalCobrado}
          
        />
      </div>
    </div>
  );
};

export default PagosPage;
