import React, { useState, useEffect, useMemo } from "react";
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
  getPagosPorPrestamo,
} from "../apis/postApi";
import { Pago } from "../interfaces/Pagos";
import { getCajaCobrador } from "../apis/getApi";

interface PagosPageProps {
  isMobile?: boolean;
}

const PagosPage: React.FC<PagosPageProps> = ({ isMobile = false }) => {
  const location = useLocation();
  const { cliente, cobrador, pagos: pagosInicialesProp } = (location as any).state || {};

  // ✅ cantidadClientes viene como número en location.state (propagado por clientesPorCobrador)
  const cantidadClientes: number =
    (location as any).state?.cantidadClientes ?? 0;

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
      localStorage.setItem(
        "prestamoId",
        pagosInicialesProp[0].prestamoId?.toString() || ""
      );
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
      ahora.toLocaleString("en-US", {
        timeZone: "America/Argentina/Buenos_Aires",
      })
    );
    const año = fechaArgentina.getFullYear();
    const mes = String(fechaArgentina.getMonth() + 1).padStart(2, "0");
    const dia = String(fechaArgentina.getDate()).padStart(2, "0");
    return `${año}-${mes}-${dia}`;
  };

  const actualizarCajaDelDia = async () => {
    let cobradorId: number | null = null;

    if (cobrador?.id) {
      cobradorId = cobrador.id;
      sessionStorage.setItem("cobradorId", cobradorId!.toString());
    } else {
      const idGuardado = sessionStorage.getItem("cobradorId");
      if (idGuardado) {
        cobradorId = parseInt(idGuardado, 10);
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

  const agruparPagos = (pagosOriginales: Pago[]): Pago[] => {
    const pagosPorCuota = new Map<string, Pago[]>();

    pagosOriginales.forEach((pago) => {
      const key = `${pago.prestamoId}-${pago.nroCuota}`;
      if (!pagosPorCuota.has(key)) {
        pagosPorCuota.set(key, []);
      }
      pagosPorCuota.get(key)!.push(pago);
    });

    const resultado: Pago[] = [];

    pagosPorCuota.forEach((pagosDeLaCuota) => {
      if (pagosDeLaCuota.length === 1) {
        resultado.push(pagosDeLaCuota[0]);
      } else {
        const pagoBase = { ...pagosDeLaCuota[0] };
        let montoTotal = 0;
        let ultimaFecha: string | null = pagoBase.fechaPago
          ? typeof pagoBase.fechaPago === "string"
            ? pagoBase.fechaPago
            : (pagoBase.fechaPago as Date).toISOString()
          : null;
        let formaPagoFinal = pagoBase.formaPago;

        pagosDeLaCuota.forEach((pago) => {
          montoTotal += pago.montoAbonado ?? 0;

          if (
            pago.fechaPago &&
            (!ultimaFecha ||
              new Date(pago.fechaPago).getTime() >
                new Date(ultimaFecha).getTime())
          ) {
            ultimaFecha =
              typeof pago.fechaPago === "string"
                ? pago.fechaPago
                : (pago.fechaPago as Date).toISOString();
          }

          if (pago.formaPago) {
            formaPagoFinal = pago.formaPago;
          }
        });

        pagoBase.montoAbonado = montoTotal;
        pagoBase.fechaPago = ultimaFecha ? new Date(ultimaFecha) : null;
        pagoBase.formaPago = formaPagoFinal;

        resultado.push(pagoBase);
      }
    });

    return resultado;
  };

  const handlePagoCuota = async (pagoId: number, monto: number) => {
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

          const registrar = async (
            metodoPago: "EFECTIVO" | "TRANSFERENCIA"
          ) => {
            Swal.close();

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

            const { prestamo, montoRecibido } = await registrarPago(
              pagoId,
              montoFinal,
              metodoPago
            );
            metodoPago === "TRANSFERENCIA"
              ? setTransferencias((prev) => prev + montoRecibido)
              : setEfectivo((prev) => prev + montoRecibido);
            const prestamoId = prestamo.id;
            const cobradorId = parseInt(
              sessionStorage.getItem("cobradorId") || "0",
              10
            );

            if (!prestamoId) return;

            if (esPagoDeCobrador && cobradorId) {
              const response = await cobranzaDelDia(
                cobradorId,
                new Date().toISOString()
              );
              setPagos(agruparPagos(response.pagos));
            } else if (prestamoId) {
              const response = await getPagosPorPrestamo(prestamoId);
              setPagos(agruparPagos(response));
            }

            await actualizarCajaDelDia();

            Swal.fire({
              icon: "success",
              title: "Pago registrado",
              text: `El pago de $${montoRecibido} fue registrado correctamente como ${metodoPago.toLowerCase()}.`,
              width: "85%",
            });
          };

          popup
            .querySelector("#btn-efectivo")
            ?.addEventListener("click", () => registrar("EFECTIVO"));
          popup
            .querySelector("#btn-transferencia")
            ?.addEventListener("click", () => registrar("TRANSFERENCIA"));
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

          const manejarMetodo = async (
            metodoPago: "EFECTIVO" | "TRANSFERENCIA"
          ) => {
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

              const response = await editarPago(
                pago.id,
                nuevoMontoParsed,
                fechaPagoActual,
                metodoPago
              );
              const pagoEditado = response.pago;
              const prestamoId = pagoEditado.prestamoId;

              if (esPagoDeCobrador && cobrador?.id) {
                const pagosActualizados = await cobranzaDelDia(
                  cobrador.id,
                  new Date().toISOString()
                );
                setPagos(agruparPagos(pagosActualizados.pagos));
              } else if (prestamoId) {
                const pagosActualizados = await getPagosPorPrestamo(prestamoId);
                setPagos(agruparPagos(pagosActualizados));
              }

              await actualizarCajaDelDia();

              Swal.fire(
                "Pago actualizado",
                `Nuevo monto: $${nuevoMontoParsed.toFixed(
                  2
                )} registrado como ${metodoPago.toLowerCase()}`,
                "success"
              );
            } catch (error) {
              console.error("Error editando el pago:", error);
              Swal.fire("Error", "No se pudo editar el pago", "error");
            }
          };

          popup
            .querySelector("#btn-efectivo")
            ?.addEventListener("click", () => manejarMetodo("EFECTIVO"));
          popup
            .querySelector("#btn-transferencia")
            ?.addEventListener("click", () => manejarMetodo("TRANSFERENCIA"));
        },
      });
      console.log("Resultado de la edición:", result);
    } catch (error) {
      console.error("Error al iniciar edición de pago:", error);
      Swal.fire("Error", "No se pudo iniciar la edición del pago", "error");
    }
  };

  const pagosAgrupados = agruparPagos(pagos);

  // ====== Solo créditos únicos (clientes vienen del prop cantidadClientes) ======
  const { creditosUnicos } = useMemo(() => {
    const creditos = new Set<string | number>();
    (pagosAgrupados || []).forEach((p) => {
      if (p?.prestamoId !== undefined && p?.prestamoId !== null) {
        creditos.add(p.prestamoId);
      }
    });
    return { creditosUnicos: creditos.size };
  }, [pagosAgrupados]);
  // ==============================================================================

  return (
    <div className="pagos-page">
      <Header
        title={tituloPagina}
        isMobile={isMobile}
        subtitle={
          esPagoDeCobrador
            ? `${cantidadClientes} ${cantidadClientes === 1 ? "cliente" : "clientes"} · ${creditosUnicos} ${creditosUnicos === 1 ? "crédito" : "créditos"} a cobrar`
            : undefined
        }
      />

      <div className="content">
        {!isMobile && <Sidebar />}

        <PagosGrid
          pagos={pagosAgrupados}
          handlePagoCuota={handlePagoCuota}
          handleEditarPago={handleEditarPago}
          mostrarCliente={esPagoDeCobrador}
          totalCobrado={totalCobrado}
          transferencias={transferencias}
          efectivo={efectivo}
          sobrantes={{}}
        />
      </div>
    </div>
  );
};

export default PagosPage;
