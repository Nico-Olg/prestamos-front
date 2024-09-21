import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import PrestamosGrid from '../components/PrestamosGrid';
import { getPrestamosPorCliente } from '../apis/postApi'; // Asegúrate de que la ruta sea correcta
import '../styles/PrestamosPage.css';

const PrestamosPage: React.FC = () => {
  const location = useLocation();
  const dni = location.state?.dni;
  const [prestamos, setPrestamos] = useState([]);

  useEffect(() => {
    if (dni) {
      const fetchPrestamos = async () => {
        try {
          const prestamosData = await getPrestamosPorCliente(dni);
          setPrestamos(prestamosData);
        } catch (error) {
          console.log('Error fetching prestamos: ', error);
        }
      };

      fetchPrestamos();
    }
  }, [dni]);

  return (
    <div className="prestamos-page">
      <Header title="Préstamos por Cliente" />
      <div className="content">
        <Sidebar />
        <PrestamosGrid prestamos={prestamos} />
      </div>
    </div>
  );
};

export default PrestamosPage;
