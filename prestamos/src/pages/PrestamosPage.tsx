import React from 'react';
import { useLocation } from 'react-router-dom';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import PrestamosGrid from '../components/PrestamosGrid';
import { Cliente } from '../interfaces/Cliente'; // Importar la interfaz Cliente
import '../styles/PrestamosPage.css';

const PrestamosPage: React.FC = () => {
  const location = useLocation();
  const cliente: Cliente = location.state?.cliente as Cliente; // Cliente completo pasado desde ClientesGrid
  console.log("Cliente en prestamos page:", cliente);

  if (!cliente) {
    console.error("Cliente no encontrado en la navegación");
    return <div>Error: Cliente no encontrado.</div>;
  }

  return (
    <div className="prestamos-page">
      <Header title="Préstamos por Cliente" />
      <div className="content">
        <Sidebar />
        {cliente ? (
          <PrestamosGrid cliente={cliente} /> // Pasamos el cliente a PrestamosGrid
        ) : (
          <p>No se encontró el cliente.</p>
        )}
      </div>
    </div>
  );
};

export default PrestamosPage;
