import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import PagosGrid from '../components/PagosGrid';
import '../styles/PagosPage.css';
import IngresosEgresosChart from '../components/IngresosEgresosChartProps';
import { getPagosPorPrestamo } from '../apis/postApi';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { IconButton } from '@mui/material';

const PagosPage: React.FC = () => {
  const location = useLocation();
  console.log('Location:', location.state);
  const prestamoId = location.state?.prestamoId;
  const navigate = useNavigate();
  const [pagos, setPagos] = useState([]);
  const [ingresos, setTotalIngresos] = useState<number>(0);
  const [egresos, setTotalEgresos] = useState<number>(0);

  useEffect(() => {
    if (prestamoId) {
      const fetchPagos = async () => {
        try {
           const pagosData = await getPagosPorPrestamo(prestamoId);
          
          setPagos(pagosData);
        } catch (error) {
          console.log('Error fetching pagos: ', error);
        }
      };

      fetchPagos();
    }
  }, [prestamoId]);

  return (
    <div className="pagos-page">
      <Header title="Gestión de Pagos" />
      <div className="content">
        <Sidebar />
        <PagosGrid
          setTotalIngresos={setTotalIngresos}
          setTotalEgresos={setTotalEgresos}
          pagos={pagos} // Pasa los pagos obtenidos a PagosGrid
        />
        <IconButton component="button" onClick={() => navigate(-1)} className="btn back">
          <ArrowBackIcon />
          </IconButton>
        <IngresosEgresosChart ingresos={ingresos} egresos={egresos} />
      </div>
    </div>
  );
};

export default PagosPage;
