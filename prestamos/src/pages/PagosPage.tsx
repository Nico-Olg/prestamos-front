import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import PagosGrid from '../components/PagosGrid';
import '../styles/PagosPage.css';
// import IngresosEgresosChart from '../components/IngresosEgresosChartProps';
import { getPagosPorPrestamo } from '../apis/postApi';
import Swal from 'sweetalert2';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { IconButton } from '@mui/material';

const PagosPage: React.FC = () => {
  const location = useLocation();
  const prestamoId = location.state?.prestamoId;
  const navigate = useNavigate();
  const [pagos, setPagos] = useState([]);
  // const [ingresos, setIngresos] = useState(0);  // Definir el estado para ingresos
  // const [egresos, setEgresos] = useState(0);    // Definir el estado para egresos

  useEffect(() => {
    if (prestamoId) {
      const fetchPagos = async () => {
        try {
          const pagosData = await getPagosPorPrestamo(prestamoId);
           const pagosConCuotas = pagosData.map((pago: any, index: number) => ({
            ...pago,                // Mantener las propiedades originales
            nroCuota: index + 1,    // Agregar la propiedad nroCuota
          }));
          setPagos(pagosConCuotas);

          // Aquí puedes calcular ingresos y egresos si tienes esa lógica
          // const totalIngresos = pagosData.reduce((acc, pago) => acc + pago.ingreso, 0);  // Solo un ejemplo
          // const totalEgresos = pagosData.reduce((acc, pago) => acc + pago.egreso, 0);    // Solo un ejemplo
          // setIngresos(totalIngresos);
          // setEgresos(totalEgresos);
        } catch (error) {
          console.log('Error fetching pagos: ', error);
        }
      };
      fetchPagos();
    }
  }, [prestamoId]);

  const handlePagoCuota = async (pagoId: number, atrasado: boolean) => {
    if (atrasado) {
      const result = await Swal.fire({
        icon: 'warning',
        title: 'Pago Atrasado',
        text: 'Este pago está atrasado. ¿Desea continuar con el pago?',
        showCancelButton: true,
        confirmButtonText: 'Sí, continuar',
        cancelButtonText: 'Cancelar',
      });

      if (result.isConfirmed) {
        realizarPago(pagoId);
      }
    } else {
      realizarPago(pagoId);
    }
  };

  const realizarPago = async (_pagoId: number) => {
    try {
      Swal.fire({
        icon: 'success',
        title: 'Pago Realizado',
        text: 'El pago se realizó con éxito., {pagoId}',
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
      
      {/* Botón de volver flotante */}
      <IconButton component="button" onClick={() => navigate(-1)} className="back-button">
        <ArrowBackIcon />
      </IconButton>

      {/* <IngresosEgresosChart ingresos={ingresos} egresos={egresos} /> */}
    </div>
  </div>
);
};

export default PagosPage;
