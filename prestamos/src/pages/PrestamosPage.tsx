import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import PrestamosGrid from '../components/PrestamosGrid';
import { useClientContext } from '../provider/ClientContext'; // Para acceder a los clientes
import { Cliente } from '../interfaces/Cliente'; // Importar la interfaz Cliente
import '../styles/PrestamosPage.css';

const PrestamosPage: React.FC = () => {
  const location = useLocation();
  const dni = location.state?.dni;
  // const [prestamos, setPrestamos] = useState([]);
  const [cliente, setCliente] = useState<Cliente | null>(null); // Agrega el estado para el cliente
  const { clientes } = useClientContext(); // Accede a los clientes desde el contexto
  const clienteEncontrado = useClientContext().clientes.find((c: Cliente) => c.dni === dni);
  const prestamos = clienteEncontrado ? clienteEncontrado.prestamos : []; // Accede a los préstamos desde el contexto

  useEffect(() => {
    if (dni && clientes.length > 0) {
      // Encuentra el cliente por su DNI
      const clienteEncontrado = clientes.find((c: Cliente) => c.dni === dni);
      if (clienteEncontrado) {
        setCliente(clienteEncontrado); // Guarda los datos del cliente
        // Luego busca los préstamos de ese cliente
        const fetchPrestamos = async () => {
          try {
           
          } catch (error) {
            console.log('Error fetching prestamos: ', error);
          }
        };
        fetchPrestamos();
      }
    }
  }, [dni, clientes]);

  return (
    <div className="prestamos-page">
      <Header title="Préstamos por Cliente" />
      <div className="content">
        <Sidebar />
        {cliente && (
          <PrestamosGrid prestamos={prestamos} cliente={cliente} /> // Pasamos tanto los préstamos como los datos del cliente
        )}
      </div>
    </div>
  );
};

export default PrestamosPage;
