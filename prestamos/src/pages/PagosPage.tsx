import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import PagosGrid from '../components/PagosGrid';
import '../styles/PagosPage.css';
import { getPagosPorPrestamo, registrarPago } from '../apis/postApi';
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
}

const PagosPage: React.FC = () => {
  const location = useLocation();
  const prestamoId = location.state?.prestamoId;
  const navigate = useNavigate();
  const [pagos, setPagos] = useState<Pago[]>([]);

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

  const handlePagoCuota = async (pagoId: number, monto: number) => {
  try {
    // Primera alerta: Pregunta si desea cambiar el monto
    const result = await Swal.fire({
      icon: 'warning',
      title: 'Confirmación de Pago',
      text: `¿Desea abonar el total de la Cuota?  $${monto}?`,
      showCancelButton: true,
      confirmButtonText: 'Sí',
      cancelButtonText: 'No, cambiar monto',
    });

    let montoFinal = monto; // Inicialmente, el monto es el de la cuota

    // Si el usuario desea cambiar el monto
    if (result.dismiss === Swal.DismissReason.cancel) {
      // Segunda alerta: Ingreso del nuevo monto
      const { value: nuevoMonto, isDismissed } = await Swal.fire({
        title: 'Ingrese el nuevo monto a pagar',
        input: 'number',
        inputLabel: 'Monto',
        inputValue: monto,
        showCancelButton: true,
        confirmButtonText: 'Pagar',
        cancelButtonText: 'Cancelar',
        inputValidator: (value) => {
          if (!value || parseFloat(value) <= 0) {
            return 'Debe ingresar un monto válido';
          }
          return null;
        },
      });

      // Si el usuario cancela la segunda alerta, simplemente retornar sin hacer nada
      if (isDismissed) {
        return;
      }

      // Si el usuario ingresó un nuevo monto
      if (nuevoMonto) {
        montoFinal = parseFloat(nuevoMonto); // Actualizamos el monto con el nuevo valor
      }
    }

    // Realizamos el pago con el monto final (ya sea el original o el modificado)
    await registrarPago(pagoId, montoFinal);
    setPagos((prevPagos) =>
      prevPagos.map((pago) =>
        pago.id === pagoId ? { ...pago, montoAbonado: montoFinal, fechaPago: new Date().toISOString() } : pago
      )
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
      <Header title="Gestión de Pagos" />
      <div className="content">
        <Sidebar />
        <PagosGrid pagos={pagos} handlePagoCuota={handlePagoCuota} />
        <button onClick={() => navigate(-1)} className="back-button">
          <svg height="16" width="16" xmlns="http://www.w3.org/2000/svg" version="1.1" viewBox="0 0 1024 1024"><path d="M874.690416 495.52477c0 11.2973-9.168824 20.466124-20.466124 20.466124l-604.773963 0 188.083679 188.083679c7.992021 7.992021 7.992021 20.947078 0 28.939099-4.001127 3.990894-9.240455 5.996574-14.46955 5.996574-5.239328 0-10.478655-1.995447-14.479783-5.996574l-223.00912-223.00912c-3.837398-3.837398-5.996574-9.046027-5.996574-14.46955 0-5.433756 2.159176-10.632151 5.996574-14.46955l223.019353-223.029586c7.992021-7.992021 20.957311-7.992021 28.949332 0 7.992021 8.002254 7.992021 20.957311 0 28.949332l-188.073446 188.073446 604.753497 0C865.521592 475.058646 874.690416 484.217237 874.690416 495.52477z"></path></svg>
          <span>Back</span>
        </button>
      </div>
    </div>
  );
};

export default PagosPage;
