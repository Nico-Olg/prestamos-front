import React from 'react';
import { useLocation } from 'react-router-dom';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import PrestamosGrid from '../components/PrestamosGrid';

import '../styles/PrestamosPage.css';

const PrestamosPage: React.FC = () => {
  const location = useLocation();
  const { cliente, prestamos } = location.state;
  console.log("Cliente en prestamos page:", cliente);

  if (!cliente) {
    console.error("Cliente no encontrado en la navegación");
    return <div>Error: Cliente no encontrado.</div>;
  }

  return (
    <div className="prestamos-page">
      <Header title={`${cliente.apellidoYnombre}`} />
      <div className="content">
        <Sidebar />
        {cliente ? (
          <PrestamosGrid cliente={cliente} prestamos = {prestamos}/> // Pasamos el cliente a PrestamosGrid
        ) : (
          <p>No se encontró el cliente.</p>
        )}
      </div>
    </div>
  );
};

export default PrestamosPage;
