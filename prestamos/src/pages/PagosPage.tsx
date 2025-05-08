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
  guardarTotalCobrado,
  obtenerTotalCobrado,
} from "../utils/localStorageCobranza";
import {
  agregarSobrante,
  totalSobrantesDelDia,
  limpiarSobrantesViejos,  
  obtenerSobrantesComoMapa,
} from "../utils/sobrantes.tsx";

interface PagosPageProps {
  isMobile?: boolean;
}

const PagosPage: React.FC<PagosPageProps> = ({ isMobile = false }) => {
  const location = useLocation();
  const { cliente, cobrador, pagos: pagosIniciales } = location.state || {};
  const [pagos, setPagos] = useState<Pago[]>(pagosIniciales || []);
  const [totalCobrado, setTotalCobrado] = useState<number>(
    obtenerTotalCobrado()
  );
  const [sobrantes, setSobrantes] = useState<Record<number, number>>({});

  useEffect(() => {
    if (pagosIniciales) {
      const totalYaCobrado = pagosIniciales
        .filter(
          (pago: Pago) => pago.montoAbonado != null && pago.montoAbonado > 0
        )
        .reduce((acc: number, pago: Pago) => acc + (pago.montoAbonado || 0), 0);
      setTotalCobrado(totalYaCobrado);
    }
  }, [pagosIniciales]);

  useEffect(() => {
    if (pagosIniciales?.length > 0) {
      localStorage.setItem(
        "prestamoId",
        pagosIniciales[0].prestamoId?.toString() || ""
      );
    }
  }, [pagosIniciales]);

  useEffect(() => {
    guardarTotalCobrado(totalCobrado);
  }, [totalCobrado]);

  useEffect(() => {
    limpiarSobrantesViejos();
    setSobrantes(obtenerSobrantesComoMapa());
  }, []);

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

      const prestamoId = localStorage.getItem("prestamoId");
      const cobradorId = localStorage.getItem("cobradorId")
        ? parseInt(localStorage.getItem("cobradorId") || "")
        : null;
      if (!prestamoId) return;

      const pagoOriginal = pagos.find((p) => p.id === pagoId);

      if (pagoOriginal && montoFinal > pagoOriginal.monto) {
        const sobrante = montoFinal - pagoOriginal.monto;
        agregarSobrante(pagoId, sobrante);
        setSobrantes(obtenerSobrantesComoMapa());
      }

      if (esPagoDeCobrador && cobradorId) {
        const response = await cobranzaDelDia(
          cobradorId,
          new Date().toISOString()
        );
        setPagos(response.pagos);
      } else if (pagoOriginal && montoFinal !== pagoOriginal.monto) {
        const response = await getPagosPorPrestamo(parseInt(prestamoId));
        setPagos(response);
      } else {
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
      }

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
          ? new Date(pago.fechaPago).toISOString()
          : new Date().toISOString();

        await editarPago(pago.id, parseFloat(nuevoMonto), fechaPagoActual);

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

        const diferencia = parseFloat(nuevoMonto) - (pago.montoAbonado || 0);
        setTotalCobrado((prev) => prev + diferencia);

        Swal.fire("Pago actualizado", `Nuevo monto: $${nuevoMonto}`, "success");
      } catch (error) {
        Swal.fire("Error", "No se pudo editar el pago", "error");
      }
    }
  };

  useEffect(() => {
    return () => {
      localStorage.removeItem("prestamoId");
    };
  }, []);

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
          totalCobrado={totalCobrado + totalSobrantesDelDia()}
          sobrantes={sobrantes} // 👈 nuevo prop
        />
      </div>
    </div>
  );
};

export default PagosPage;
