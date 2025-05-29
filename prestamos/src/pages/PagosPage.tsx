import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import Header from "../components/Header.tsx";
import Sidebar from "../components/Sidebar.tsx";
import PagosGrid from "../components/PagosGrid.tsx";
import "../styles/PagosPage.css";
import Swal from "sweetalert2";
import {
  registrarPago,
  editarPago,
  cobranzaDelDia,
  getPagosPorPrestamo
} from "../apis/postApi";
import { Pago } from "../interfaces/Pagos";
import { getCajaCobrador } from "../apis/getApi";

interface PagosPageProps {
  isMobile?: boolean;
}

const PagosPage: React.FC<PagosPageProps> = ({ isMobile = false }) => {
  const location = useLocation();
  const { cliente, cobrador, pagos: pagosInicialesProp } = location.state || {};
  const [pagos, setPagos] = useState<Pago[]>(pagosInicialesProp || []);
  const [totalCobrado, setTotalCobrado] = useState<number>(0);

  const esPagoDeCobrador = !!cobrador;

  const tituloPagina = isMobile
    ? esPagoDeCobrador
      ? `Bienvenido ${cobrador?.nombreyApellido}`
      : `Pagos de ${cliente?.apellidoYnombre}`
    : esPagoDeCobrador
    ? `Pagos del día de ${cobrador?.nombreyApellido}`
    : `Pagos de ${cliente?.apellidoYnombre}`;

  useEffect(() => {
    if (pagosInicialesProp?.length > 0) {
      localStorage.setItem("prestamoId", pagosInicialesProp[0].prestamoId?.toString() || "");
    }
  }, [pagosInicialesProp]);

  useEffect(() => {
    actualizarCajaDelDia();
    return () => {
      localStorage.removeItem("prestamoId");
    };
  }, []);

  const obtenerFechaArgentina = (): string => {
  const ahora = new Date();
  const fechaArgentina = new Date(ahora.toLocaleString("en-US", { timeZone: "America/Argentina/Buenos_Aires" }));
  const año = fechaArgentina.getFullYear();
  const mes = String(fechaArgentina.getMonth() + 1).padStart(2, "0");
  const dia = String(fechaArgentina.getDate()).padStart(2, "0");
  return `${año}-${mes}-${dia}`;
};
  const actualizarCajaDelDia = async () => {
    const cobradorId = localStorage.getItem("cobradorId")
      ? parseInt(localStorage.getItem("cobradorId") || "")
      : null;

    if (cobradorId) {
      try {
        const fechaHoy = obtenerFechaArgentina(); 
        const cajaResponse = await getCajaCobrador(cobradorId, fechaHoy);
        setTotalCobrado(cajaResponse?.totalCobrado || 0);
      } catch (error) {
        console.error("Error al obtener la caja del día:", error);
      }
    }
  };

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

      const { prestamo, montoRecibido } = await registrarPago(pagoId, montoFinal);
      const prestamoId = prestamo.id;
      const cobradorId = localStorage.getItem("cobradorId")
        ? parseInt(localStorage.getItem("cobradorId") || "")
        : null;

      if (!prestamoId) return;

      if (esPagoDeCobrador && cobradorId) {
        const response = await cobranzaDelDia(cobradorId, new Date().toISOString());
        setPagos(response.pagos);
      } else {
        const response = await getPagosPorPrestamo(parseInt(prestamoId));
        setPagos(response);
      }

      await actualizarCajaDelDia();

      Swal.fire({
        icon: "success",
        title: "Pago realizado",
        text: `El pago de $${montoRecibido} fue registrado correctamente.`,
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
        const nuevoMontoParsed = parseFloat(nuevoMonto);
        const fechaPagoActual = pago.fechaPago
          ? new Date(pago.fechaPago).toISOString()
          : new Date().toISOString();

        const response = await editarPago(pago.id, nuevoMontoParsed, fechaPagoActual);
        const pagoEditado = response.pago;

        setPagos((prevPagos) =>
          prevPagos.map((p) => (p.id === pagoEditado.id ? pagoEditado : p))
        );

        await actualizarCajaDelDia();

        Swal.fire("Pago actualizado", `Nuevo monto: $${nuevoMontoParsed.toFixed(2)}`, "success");
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
          sobrantes={{}}
        />
      </div>
    </div>
  );
};

export default PagosPage;
