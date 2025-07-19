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
  const [transferencias, setTransferencias] = useState<number>(0);
  const [efectivo, setEfectivo] = useState<number>(0);

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
    setTotalCobrado(0); 
    setTransferencias(0);
    setEfectivo(0);
    actualizarCajaDelDia();
    return () => {
      localStorage.removeItem("prestamoId");
    };
  }, [cobrador]);

  const obtenerFechaArgentina = (): string => {
    const ahora = new Date();
    const fechaArgentina = new Date(
      ahora.toLocaleString("en-US", { timeZone: "America/Argentina/Buenos_Aires" })
    );
    const año = fechaArgentina.getFullYear();
    const mes = String(fechaArgentina.getMonth() + 1).padStart(2, "0");
    const dia = String(fechaArgentina.getDate()).padStart(2, "0");
    return `${año}-${mes}-${dia}`;
  };

  const actualizarCajaDelDia = async () => {
    let cobradorId = localStorage.getItem("cobradorId")
      ? parseInt(localStorage.getItem("cobradorId") || "")
      : null;

    if (!cobradorId && cobrador?.id) {
      cobradorId = cobrador.id;
      if (cobradorId !== null && cobradorId !== undefined) {
        localStorage.setItem("cobradorId", cobradorId.toString());
      }
    }

  if (cobradorId) {
    try {
      const fechaHoy = obtenerFechaArgentina();
      console.log("🔁 Ejecutando actualizarCajaDelDia() para cobrador", cobradorId);
      const cajaResponse = await getCajaCobrador(cobradorId, fechaHoy);
      console.log("📦 totalCobrado recibido:", cajaResponse?.totalCobrado);
      console.log("📦 efectivo:", cajaResponse?.montoEfectivo);
      console.log("📦 transferencia:", cajaResponse?.montoTransferencia);

      setTotalCobrado(cajaResponse?.totalCobrado || 0);
      setTransferencias(cajaResponse?.montoTransferencia || 0);
      setEfectivo(cajaResponse?.montoEfectivo || 0);
    } catch (error) {
      console.error("Error al obtener la caja del día:", error);
    }
  } else {
    console.warn("❌ No se pudo determinar el ID del cobrador");
  }
};

  const agruparPagosPorCuota = (pagosOriginales: Pago[]): Pago[] => {
    const agrupados = new Map<number, Pago>();

    pagosOriginales.forEach((pago) => {
      const key = pago.nroCuota ?? pago.id;
      const existente = agrupados.get(key);

      if (existente) {
        existente.montoAbonado =
          (existente.montoAbonado || 0) + (pago.montoAbonado || 0);
        if (!existente.fechaPago && pago.fechaPago) {
          existente.fechaPago = pago.fechaPago;
        }
      } else {
        agrupados.set(key, { ...pago });
      }
    });

    return Array.from(agrupados.values());
  };

  const handlePagoCuota = async (
  pagoId: number,
  monto: number
) => {
  try {
    const result = await Swal.fire({
      title: "Seleccione el método de pago",
      html: `
        <div class="d-flex flex-column gap-3">
          <button id="btn-efectivo" class="btn btn-success btn-lg">
            <i class="bi bi-cash-coin"></i> Pago en Efectivo
          </button>
          <button id="btn-transferencia" class="btn btn-primary btn-lg">
            <i class="bi bi-bank"></i> Pago por Transferencia
          </button>
        </div>
      `,
      showConfirmButton: false,
      showCancelButton: true,
      cancelButtonText: "Cancelar",
      allowOutsideClick: false,
      width: "85%",
      didOpen: () => {
        const popup = Swal.getPopup();
        if (!popup) return;

        const registrar = async (metodoPago: "EFECTIVO" | "TRANSFERENCIA") => {
          Swal.close();

          // Confirmar si se quiere abonar el monto completo o editar
          const confirmacion = await Swal.fire({
            icon: "warning",
            title: `¿Registrar pago ${metodoPago.toLowerCase()}?`,
            text: `¿Desea abonar el total de la cuota por $${monto}?`,
            showCancelButton: true,
            confirmButtonText: "Sí",
            cancelButtonText: "No, cambiar monto",
            showCloseButton: true,
            allowOutsideClick: false,
            width: "85%",
          });

          if (confirmacion.dismiss === Swal.DismissReason.close) return;

          let montoFinal = monto;
          if (confirmacion.dismiss === Swal.DismissReason.cancel) {
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
      const cobradorId = parseInt(localStorage.getItem("cobradorId") || "0");

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
            title: "Pago registrado",
            text: `El pago de $${montoRecibido} fue registrado correctamente como ${metodoPago.toLowerCase()}.`,
            width: "85%",
          });
        };

        popup.querySelector("#btn-efectivo")?.addEventListener("click", () => registrar("EFECTIVO"));
        popup.querySelector("#btn-transferencia")?.addEventListener("click", () => registrar("TRANSFERENCIA"));
      },
    });
    console.log("Resultado del pago:", result);

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
  try {
    const result = await Swal.fire({
      title: "Seleccione el nuevo método de pago",
      html: `
        <div class="d-flex flex-column gap-3">
          <button id="btn-efectivo" class="btn btn-success btn-lg">
            <i class="bi bi-cash-coin"></i> Efectivo
          </button>
          <button id="btn-transferencia" class="btn btn-primary btn-lg">
            <i class="bi bi-bank"></i> Transferencia
          </button>
        </div>
      `,
      showConfirmButton: false,
      showCancelButton: true,
      cancelButtonText: "Cancelar",
      allowOutsideClick: false,
      width: "85%",
      didOpen: () => {
        const popup = Swal.getPopup();
        if (!popup) return;

        const manejarMetodo = async (metodoPago: "EFECTIVO" | "TRANSFERENCIA") => {
          Swal.close();

          const { value: nuevoMonto, isDismissed } = await Swal.fire({
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

          if (isDismissed || nuevoMonto === undefined) return;

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
          pagos={pagosAgrupados}
          handlePagoCuota={handlePagoCuota}
          handleEditarPago={handleEditarPago}
          mostrarCliente={esPagoDeCobrador}
          totalCobrado={totalCobrado}
          transferencias={transferencias} // Placeholder, update as needed
          efectivo={efectivo} // Placeholder, update as needed
          sobrantes={{}}
        />
      </div>
    </div>
  );
};

export default PagosPage;
