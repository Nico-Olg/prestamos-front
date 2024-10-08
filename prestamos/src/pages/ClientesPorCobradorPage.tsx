import React, { useEffect, useState } from 'react';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import { getClientesPorCobrador } from '../apis/getApi';
import ClientesPorCobradoresGrid from '../components/ClientesPorCobradoresGrid';
import '../styles/ClientesPage.css';
import { useLocation } from 'react-router-dom';

const ClientesPorCobradorPage: React.FC = () => {
  const [clientes, setClientes] = useState([]);
  const [cobradorId, setCobradorId] = useState<number | null>(null);
  const [nombreCobrador, setNombreCobrador] = useState<string | null>(null);
  const location = useLocation();

  useEffect(() => {
    const fetchClientes = async () => {
      try {
        const id = location.state?.id; // Ejemplo de ID de cobrador
       const nombre = location.state?.nombreyApellido || ""; // Obtén el nombre del cobrador del estado
        setCobradorId(id);
        setNombreCobrador(nombre); // Asigna el nombre del cobrador
        const clientesData = await getClientesPorCobrador(id);
        setClientes(clientesData);
      } catch (error) {
        console.error('Error fetching clientes:', error);
      }
    };

    fetchClientes();
  }, [location]);

  return (
    <div className="clientes-page">
      <Header title={`Clientes del Cobrador: ${nombreCobrador  || ''}`}/>
      <div className="content">
        <Sidebar />
       
          {cobradorId && (
          <ClientesPorCobradoresGrid clientes={clientes} cobradorId={cobradorId} nombreCobrador={nombreCobrador || ''}/>
        )}
        
        
      </div>
    </div>
  );
};

export default ClientesPorCobradorPage;
