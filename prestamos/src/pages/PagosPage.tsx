import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import PagosGrid from '../components/PagosGrid';
import '../styles/PagosPage.css';
import { getPagosPorPrestamo, registrarPago } from '../apis/postApi';
import { Cliente } from '../interfaces/Cliente';
import Swal from 'sweetalert2';

interface Pago {
  id: number;
  fechaPago: string | null;
  nombreProducto: string;
  descripcion: string | null;
  monto: number;
  formaPago: string;
  montoAbonado: number | null;
  nroCuota: number;
  diferencia: number;
}

const PagosPage: React.FC = () => {
  const location = useLocation();
  const prestamoId = location.state?.prestamoId;
  const navigate = useNavigate();
  const [pagos, setPagos] = useState<Pago[]>([]);
  const cliente: Cliente = location.state?.cliente as Cliente;

  useEffect(() => {
    if (prestamoId) {
      const fetchPagos = async () => {
        try {
          const pagosData: Pago[] = await getPagosPorPrestamo(prestamoId);
          setPagos(pagosData);
        } catch (error) {
          console.log('Error fetching pagos: ', error);
        }
      };
      fetchPagos();
    }
  }, [prestamoId]);

 const handlePagoCuota = async (pagoId: number, montoRestante: number) => {
  try {
    const result = await Swal.fire({
      icon: 'warning',
      title: 'Confirmación de Pago',
      text: `¿Desea abonar el total de la Cuota?  $${montoRestante}?`,
      showCancelButton: true,
      confirmButtonText: 'Sí',
      cancelButtonText: 'No, cambiar monto',
      showCloseButton: true,
      allowOutsideClick: false,
    });

    if (result.dismiss === Swal.DismissReason.close) {
      return;
    }
    let montoFinal = montoRestante;

    if (result.dismiss === Swal.DismissReason.cancel) {
      const { value: nuevoMonto, isDismissed } = await Swal.fire({
        title: 'Ingrese el nuevo monto a pagar',
        input: 'number',
        inputLabel: 'Monto',
        inputValue: montoRestante,
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

      if (isDismissed) {
        return;
      }

      if (nuevoMonto) {
        montoFinal = parseFloat(nuevoMonto);
      }
    }

    // Realizar la solicitud al backend para registrar el pago
    const updatedPrestamo = await registrarPago(pagoId, montoFinal);
    const formatearFechaLocal = (fechaISO: string) => {
  const fecha = new Date(fechaISO);
  // Puedes personalizar la configuración, por ejemplo:
  return fecha.toLocaleDateString('es-AR', {
    year: 'numeric',
    day: '2-digit',
    month: '2-digit',   
  });
};

    // Actualizar el estado de los pagos con la información actualizada del backend
    setPagos((prevPagos) =>
      prevPagos.map((pago) => {
        if (pago.id === pagoId) {
          const updatedPago = updatedPrestamo.pagos.find((p: { id: number }) => p.id === pagoId);
          const montoAbonado = updatedPago?.montoAbonado || pago.montoAbonado;

          return {
            ...pago,
            montoAbonado: montoAbonado,
            monto: updatedPago?.monto || pago.monto,
            fechaPago: montoAbonado >= pago.monto ? formatearFechaLocal(new Date().toISOString()) : pago.fechaPago            
          };
        }
        return pago;
      })
    );

    Swal.fire({
      icon: 'success',
      title: 'Pago realizado',
      text: `El pago de $${montoFinal} se realizó con éxito.`,
    });
  } catch (error) {
    console.log('Error realizando el pago: ', error);
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: 'Hubo un problema al realizar el pago.',
    });
  }
};




  return (
    <div className="pagos-page">
      <Header title={`${cliente?.apellidoYnombre }`}  />
      <div className="content">
        <Sidebar />
        <PagosGrid pagos={pagos} handlePagoCuota={handlePagoCuota} />
        <button onClick={() => navigate(-1)} className="back-button">
          <svg
            height="16"
            width="16"
            xmlns="http://www.w3.org/2000/svg"
            version="1.1"
            viewBox="0 0 1024 1024"
          >
            <path d="M874.690416 495.52477c0 11.2973-9.168824 20.466124-20.466124 20.466124l-604.773963 0 188.083679 188.083679c7.992021 7.992021 7.992021 20.947078 0 28.939099-4.001127 3.990894-9.240455 5.996574-14.46955 5.996574-5.239328 0-10.478655-1.995447-14.479783-5.996574l-223.00912-223.00912c-3.837398-3.837398-5.996574-9.046027-5.996574-14.46955 0-5.433756 2.159176-10.632151 5.996574-14.46955l223.019353-223.029586c7.992021-7.992021 20.957311-7.992021 28.949332 0 7.992021 8.002254 7.992021 20.957311 0 28.949332l-188.073446 188.073446 604.753497 0C865.521592 475.058646 874.690416 484.217237 874.690416 495.52477z"></path>
          </svg>
          <span>Back</span>
        </button>
      </div>
    </div>
  );
};

export default PagosPage;
