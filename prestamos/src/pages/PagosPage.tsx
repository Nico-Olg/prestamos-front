import React, { useState, useEffect, useMemo } from "react";
import { useLocation } from "react-router-dom";
import Header from "../components/Header.tsx";
import Sidebar from "../components/Sidebar.tsx";
import PagosGrid from "../components/PagosGrid.tsx";
import "../styles/PagosPage.css";
import Swal from "sweetalert2";
import {
  registrarPago,
  editarCuota,
  cobranzaDelDia,
  getPagosPorPrestamo,
  cancelarCuota,
} from "../apis/postApi";
import { Pago } from "../interfaces/Pagos";
import { getCajaCobrador } from "../apis/getApi";
import { formatearNumero } from "../utils/formatters";

interface PagosPageProps {
  isMobile?: boolean;
}

const PagosPage: React.FC<PagosPageProps> = ({ isMobile = false }) => {
  const location = useLocation();
  const { cliente, cobrador, pagos: pagosInicialesProp } = (location as any).state || {};

  // viene desde clientesPorCobrador en location.state
  const cantidadClientes: number = (location as any).state?.cantidadClientes ?? 0;

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
      ahora.toLocaleString("en-US", { timeZone: "America/Argentina/Buenos_Aires" })
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
        const cajaResponse = await getCajaCobrador(cobradorId, fechaHoy);
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
      if (!pagosPorCuota.has(key)) pagosPorCuota.set(key, []);
      pagosPorCuota.get(key)!.push(pago);
    });

    const resultado: Pago[] = [];

    pagosPorCuota.forEach((pagosDeLaCuota) => {
      if (pagosDeLaCuota.length === 1) {
        const base = pagosDeLaCuota[0];
        // Preservo el detalle si ya venía agrupado; si es un pago crudo, el detalle es él mismo.
        resultado.push({ ...base, detalle: base.detalle ?? [base] });
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

          if (pago.fechaPago && (!ultimaFecha || new Date(pago.fechaPago).getTime() > new Date(ultimaFecha).getTime())) {
            ultimaFecha = typeof pago.fechaPago === "string" ? pago.fechaPago : (pago.fechaPago as Date).toISOString();
          }
          if (pago.formaPago) formaPagoFinal = pago.formaPago;
        });

        pagoBase.montoAbonado = montoTotal;
        pagoBase.fechaPago = ultimaFecha ? new Date(ultimaFecha) : null;
        pagoBase.formaPago = formaPagoFinal;
        // Guardo los pagos individuales (aplanando por si ya venían agrupados) para editar cada medio.
        pagoBase.detalle = pagosDeLaCuota.flatMap((p) => p.detalle ?? [p]);
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

          const registrar = async (metodoPago: "EFECTIVO" | "TRANSFERENCIA") => {
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

            const { prestamo, montoRecibido } = await registrarPago(pagoId, montoFinal, metodoPago);
            metodoPago === "TRANSFERENCIA"
              ? setTransferencias((prev) => prev + montoRecibido)
              : setEfectivo((prev) => prev + montoRecibido);

            const prestamoId = prestamo.id;
            const cobradorId = parseInt(sessionStorage.getItem("cobradorId") || "0", 10);
            if (!prestamoId) return;

            if (esPagoDeCobrador && cobradorId) {
              const response = await cobranzaDelDia(cobradorId, new Date().toISOString());
              setPagos(agruparPagos(response.pagos));
            } else {
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

          popup.querySelector("#btn-efectivo")?.addEventListener("click", () => registrar("EFECTIVO"));
          popup.querySelector("#btn-transferencia")?.addEventListener("click", () => registrar("TRANSFERENCIA"));
        },
      });
      console.log("Resultado del pago:", result);
    } catch (error) {
      console.error("Error realizando el pago: ", error);
      Swal.fire({ icon: "error", title: "Error", text: "Hubo un problema al realizar el pago.", width: "85%" });
    }
  };

  // Editar una cuota mostrando SIEMPRE el desglose por medio de pago (efectivo y transferencia),
  // aunque se haya abonado con un solo medio (el otro arranca en 0). Permite mover montos entre
  // medios libremente; el backend crea/ajusta/des-cobra cada medio y recalcula la caja.
  const editarPagoDesglosado = async (pago: Pago, detalle: Pago[]) => {
    const montoPorMetodo = (metodo: string) =>
      detalle
        .filter((p) => (p.formaPago || "").trim().toUpperCase() === metodo)
        .reduce((acc, p) => acc + (p.montoAbonado || 0), 0);

    const efectivoInicial = montoPorMetodo("EFECTIVO");
    const transferenciaInicial = montoPorMetodo("TRANSFERENCIA");

    const result = await Swal.fire({
      title: `Editar pago · Cuota ${pago.nroCuota}`,
      html: `
        <div class="edm">
          <div class="edm-cuota">Monto de la cuota: <strong>$${formatearNumero(pago.monto)}</strong></div>
          <div class="edm-rows">
            <label class="edm-row">
              <span class="edm-metodo">💵 Efectivo</span>
              <input id="edm-efectivo" class="edm-input" type="number" inputmode="numeric" min="0" step="any" value="${efectivoInicial}" />
            </label>
            <label class="edm-row">
              <span class="edm-metodo">🏦 Transferencia</span>
              <input id="edm-transferencia" class="edm-input" type="number" inputmode="numeric" min="0" step="any" value="${transferenciaInicial}" />
            </label>
          </div>
          <div class="edm-total">
            Total abonado: <strong>$<span id="edm-total">0</span></strong>
            <span id="edm-pend" class="edm-pend"></span>
          </div>
        </div>`,
      width: "85%",
      showCancelButton: true,
      confirmButtonText: "Guardar",
      cancelButtonText: "Cancelar",
      focusConfirm: false,
      didOpen: () => {
        const efectivoEl = document.getElementById("edm-efectivo") as HTMLInputElement | null;
        const transferenciaEl = document.getElementById("edm-transferencia") as HTMLInputElement | null;
        const totalEl = document.getElementById("edm-total");
        const pendEl = document.getElementById("edm-pend");

        const recalcular = () => {
          const total =
            (parseFloat(efectivoEl?.value || "0") || 0) +
            (parseFloat(transferenciaEl?.value || "0") || 0);
          if (totalEl) totalEl.textContent = formatearNumero(total);
          if (pendEl) {
            const pend = pago.monto - total;
            if (pend > 0) {
              pendEl.textContent = `· faltan $${formatearNumero(pend)}`;
              pendEl.className = "edm-pend pendiente";
            } else if (pend < 0) {
              pendEl.textContent = `· excede $${formatearNumero(-pend)}`;
              pendEl.className = "edm-pend excede";
            } else {
              pendEl.textContent = "· cuota completa";
              pendEl.className = "edm-pend ok";
            }
          }
        };

        efectivoEl?.addEventListener("input", recalcular);
        transferenciaEl?.addEventListener("input", recalcular);
        recalcular();
      },
      preConfirm: () => {
        const efectivoEl = document.getElementById("edm-efectivo") as HTMLInputElement | null;
        const transferenciaEl = document.getElementById("edm-transferencia") as HTMLInputElement | null;
        const efectivo = parseFloat(efectivoEl?.value || "0") || 0;
        const transferencia = parseFloat(transferenciaEl?.value || "0") || 0;
        if (efectivo < 0 || transferencia < 0) {
          Swal.showValidationMessage("Los montos no pueden ser negativos.");
          return false;
        }
        if (efectivo + transferencia <= 0) {
          Swal.showValidationMessage("El total debe ser mayor a 0. Para anular la cuota usá Cancelar.");
          return false;
        }
        return { efectivo, transferencia };
      },
    });

    if (!result.isConfirmed || !result.value) return;
    const { efectivo, transferencia } = result.value as { efectivo: number; transferencia: number };

    // Si no cambió nada, evito el viaje al backend
    if (efectivo === efectivoInicial && transferencia === transferenciaInicial) {
      Swal.fire({ icon: "info", title: "Sin cambios", text: "No se modificó ningún monto.", width: "85%" });
      return;
    }

    try {
      // Un solo viaje al backend: fija el desglose completo de la cuota y recalcula la caja.
      await editarCuota(pago.prestamoId, pago.nroCuota, efectivo, transferencia);

      // Refrescar datos
      if (esPagoDeCobrador && cobrador?.id) {
        const pagosActualizados = await cobranzaDelDia(cobrador.id, new Date().toISOString());
        setPagos(agruparPagos(pagosActualizados.pagos));
      } else if (pago.prestamoId) {
        const pagosActualizados = await getPagosPorPrestamo(pago.prestamoId);
        setPagos(agruparPagos(pagosActualizados));
      }

      await actualizarCajaDelDia();

      Swal.fire({
        icon: "success",
        title: "Pago actualizado",
        text: `Se actualizaron los montos de la cuota ${pago.nroCuota}.`,
        width: "85%",
      });
    } catch (error) {
      console.error("Error al editar el pago desglosado:", error);
      Swal.fire({ icon: "error", title: "Error", text: "No se pudo actualizar el pago.", width: "85%" });
    }
  };

  const handleEditarPago = async (pago: Pago) => {
    // Siempre mostramos el desglose por medio de pago (1 o 2 pagos).
    const detalle = pago.detalle && pago.detalle.length > 0 ? pago.detalle : [pago];
    await editarPagoDesglosado(pago, detalle);
  };

  // ✅ NUEVO: cancelar pago
  const handleCancelarPago = async (pago: Pago) => {
    try {
      // Confirmación
      const confirmar = await Swal.fire({
        icon: "warning",
        title: "Cancelar pago",
        html: `
          <div style="text-align:left">
            <p>Esta seguro que desea cancelar el pago?</p>
          </div>
        `,
        showCancelButton: true,
        confirmButtonText: "Sí, cancelar",
        cancelButtonText: "No",
        confirmButtonColor: "#d33",
        width: "85%",
      });
      if (!confirmar.isConfirmed) return;

      // Cancela todos los pagos de la cuota (efectivo + transferencia si los hay)
      await cancelarCuota(pago.prestamoId, pago.nroCuota, cobrador?.id || 0);

      // Refrescar datos
      if (esPagoDeCobrador && cobrador?.id) {
        const pagosActualizados = await cobranzaDelDia(cobrador.id, new Date().toISOString());
        setPagos(agruparPagos(pagosActualizados.pagos));
      } else if (pago.prestamoId) {
        const pagosActualizados = await getPagosPorPrestamo(pago.prestamoId);
        setPagos(agruparPagos(pagosActualizados));
      }

      await actualizarCajaDelDia();

      Swal.fire({
        icon: "success",
        title: "Pago cancelado",
        text: `Se canceló la cuota ${pago.nroCuota} del préstamo #${pago.prestamoId}.`,
        width: "85%",
      });
    } catch (error: any) {
      console.error("Error al cancelar el pago:", error);
      Swal.fire({
        icon: "error",
        title: "No se pudo cancelar",
        text: error?.message || "Error desconocido al cancelar el pago",
        width: "85%",
      });
    }
  };

  const pagosAgrupados = agruparPagos(pagos);

  // Solo créditos únicos (clientes ya vienen de cantidadClientes)
  const { creditosUnicos } = useMemo(() => {
    const creditos = new Set<string | number>();
    (pagosAgrupados || []).forEach((p) => {
      if (p?.prestamoId !== undefined && p?.prestamoId !== null) {
        creditos.add(p.prestamoId);
      }
    });
    return { creditosUnicos: creditos.size };
  }, [pagosAgrupados]);

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
          handleCancelarPago={handleCancelarPago}   
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
