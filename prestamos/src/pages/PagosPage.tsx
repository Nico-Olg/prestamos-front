import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import Header from "../components/Header.tsx";
import Sidebar from "../components/Sidebar.tsx";
import PagosGrid from "../components/PagosGrid.tsx";
import "../styles/PagosPage.css";
import Swal from "sweetalert2";
import { registrarPago, editarPago, cobranzaDelDia } from "../apis/postApi";
import { Pago } from "../interfaces/Pagos";
import { getPagosPorPrestamo } from "../apis/postApi";
import {
  logPagoRecibido,
  obtenerLogCobranza,
  limpiarLogCobranza,
} from "../utils/debugLogger";
import {
  guardarTotalCobrado,
  obtenerTotalCobrado,
} from "../utils/localStorageCobranza.tsx";

interface PagosPageProps {
  isMobile?: boolean;
}

const PagosPage: React.FC<PagosPageProps> = ({ isMobile = false }) => {
  const location = useLocation();
  const { cliente, cobrador, pagos: pagosInicialesProp } = location.state || {};
  const [pagos, setPagos] = useState<Pago[]>(pagosInicialesProp || []);
  const [totalCobrado, setTotalCobrado] = useState<number>(() =>
    obtenerTotalCobrado()
  );

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
      localStorage.setItem(
        "prestamoId",
        pagosInicialesProp[0].prestamoId?.toString() || ""
      );
    }
  }, [pagosInicialesProp]);

  useEffect(() => {
    return () => {
      localStorage.removeItem("prestamoId");
    };
  }, []);

  useEffect(() => {
    (window as any).verLogCobranza = obtenerLogCobranza;
    (window as any).limpiarLogCobranza = limpiarLogCobranza;
  }, []);

  useEffect(() => {
    // Siempre recalcula al cargar
    recalcularTotalCobrado(pagosInicialesProp || []);
  }, [pagosInicialesProp]);

  const recalcularTotalCobrado = (pagosRecalculados: Pago[]) => {
    const hoy = new Date().toLocaleDateString("sv-SE"); // 'YYYY-MM-DD'

    const total = pagosRecalculados.reduce((acum, pago) => {
      if (!pago.fechaPago) return acum;

      const fechaPago = new Date(pago.fechaPago).toLocaleDateString("sv-SE");
      const monto = pago.montoAbonado || 0;

      if (fechaPago === hoy) {
        console.log(`✔️ Sumando pago del día: $${monto}`);
        return acum + monto;
      } else {
        console.log(`⏭️ Ignorando pago fuera de hoy: ${fechaPago}`);
        return acum;
      }
    }, 0);

    setTotalCobrado(total);
    guardarTotalCobrado(total);
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

      const { prestamo, montoRecibido } = await registrarPago(
        pagoId,
        montoFinal
      );

      const prestamoId = prestamo.id;
      const cobradorId = localStorage.getItem("cobradorId")
        ? parseInt(localStorage.getItem("cobradorId") || "")
        : null;
      if (!prestamoId) return;

      if (esPagoDeCobrador && cobradorId) {
        const response = await cobranzaDelDia(
          cobradorId,
          new Date().toISOString()
        );
        setPagos(response.pagos);
        recalcularTotalCobrado(response.pagos);
      } else {
        const response = await getPagosPorPrestamo(parseInt(prestamoId));
        setPagos(response);
        recalcularTotalCobrado(response);
      }

      const pagoOriginal = pagos.find((p) => p.id === pagoId);
      const clienteLog = pagoOriginal?.nombreCliente || "Cliente desconocido";
      logPagoRecibido(clienteLog, montoRecibido);

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

        await editarPago(pago.id, nuevoMontoParsed, fechaPagoActual);

        setPagos((prevPagos) => {
          const nuevosPagos = prevPagos.map((p) =>
            p.id === pago.id
              ? {
                  ...p,
                  montoAbonado: nuevoMontoParsed,
                  fechaPago: new Date(fechaPagoActual),
                  saldo: p.monto - nuevoMontoParsed,
                }
              : p
          );
          recalcularTotalCobrado(nuevosPagos);
          return nuevosPagos;
        });

        Swal.fire(
          "Pago actualizado",
          `Nuevo monto: $${nuevoMontoParsed.toFixed(2)}`,
          "success"
        );
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
          sobrantes={{}} // sobrantes desactivado
        />
      </div>
    </div>
  );
};

export default PagosPage;
