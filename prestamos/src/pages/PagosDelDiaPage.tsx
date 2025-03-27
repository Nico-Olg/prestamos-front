import React, { useEffect, useState } from 'react';
import Header from '../components/Header.tsx';
import Sidebar from '../components/Sidebar.tsx';
import '../styles/PagosPage.css';
import PagosGrid from '../components/PagosGrid.tsx';
import { cobranzaDelDia, registrarPago } from "../apis/postApi";
import Swal from "sweetalert2";

interface Pago {
  id: number;
  fechaPago: string | null;
  nombreProducto: string;
  descripcion: string | null;
  monto: number;
  formaPago: string;
  montoAbonado: number | null;
  nroCuota: number;
}

const PagosDelDiaPage: React.FC = () => {
  const [pagosHoy, setPagosHoy] = useState<Pago[]>([]);

  useEffect(() => {
    const fetchPagosHoy = async () => {
      try {
        const cobradorId = 1; // 🚀 Obtener este ID correctamente
        const today = new Date().toISOString().split('T')[0];
        const data: Pago[] = await cobranzaDelDia(cobradorId, today);
        setPagosHoy(data);
      } catch (error) {
        console.error("Error al obtener la cobranza del día:", error);
      }
    };

    fetchPagosHoy();
  }, []);

  /** 🟢 Función para manejar el pago de una cuota **/
  const handlePagoCuota = async (pagoId: number, monto: number) => {
    try {
      const result = await Swal.fire({
        icon: 'warning',
        title: 'Confirmación de Pago',
        text: `¿Desea abonar el total de la Cuota?  $${monto}?`,
        showCancelButton: true,
        confirmButtonText: 'Sí',
        cancelButtonText: 'No, cambiar monto',
        showCloseButton: true,
        allowOutsideClick: false,
      });

      if (result.dismiss === Swal.DismissReason.close) return;

      let montoFinal = monto;
      if (result.dismiss === Swal.DismissReason.cancel) {
        const { value: nuevoMonto, isDismissed } = await Swal.fire({
          title: 'Ingrese el nuevo monto a pagar',
          input: 'number',
          inputLabel: 'Monto',
          inputValue: monto,
          showCancelButton: true,
          confirmButtonText: 'Pagar',
          cancelButtonText: 'Cancelar',
          allowOutsideClick: false,
          showCloseButton: true,
          inputValidator: (value) => {
            if (!value || parseFloat(value) <= 0) {
              return 'Debe ingresar un monto válido';
            }
            return null;
          },
        });

        if (isDismissed) return;
        if (nuevoMonto) montoFinal = parseFloat(nuevoMonto);
      }

      await registrarPago(pagoId, montoFinal);

      // 🔄 Actualizar estado después del pago
      setPagosHoy((prevPagos) =>
        prevPagos.map((p) =>
          p.id === pagoId
            ? {
                ...p,
                montoAbonado: (p.montoAbonado || 0) + montoFinal,
                fechaPago: new Date().toISOString(),
              }
            : p
        )
      );

      Swal.fire({
        icon: 'success',
        title: 'Pago realizado',
        text: `El pago de $${montoFinal} se realizó con éxito.`,
      });

    } catch (error) {
      console.error('Error realizando el pago: ', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Hubo un problema al realizar el pago.',
      });
    }
  };

  return (
    <div className="pagos-page">
      <Header title="Pagos del día" />
      <div className="content">
        <Sidebar />
        <PagosGrid pagos={pagosHoy} handlePagoCuota={handlePagoCuota} mostrarCliente={true} />
      </div>
    </div>
  );
};

export default PagosDelDiaPage;
