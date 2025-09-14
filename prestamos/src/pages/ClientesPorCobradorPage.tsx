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
  const [loading, setLoading] = useState<boolean>(false);
  const location = useLocation();
 

  useEffect(() => {
    const fetchClientes = async () => {
      try {
        setLoading(true); // ⏳ Mostrar loading
        const id = location.state?.id;
        const nombre = location.state?.nombreyApellido || "";
        setCobradorId(id);
        setNombreCobrador(nombre);
        const clientesData = await getClientesPorCobrador(id);
        setClientes(clientesData);
      } catch (error) {
        console.error('Error fetching clientes:', error);
      } finally {
        setLoading(false); // ✅ Ocultar loading
      }
    };

    fetchClientes();
  }, [location]);

  return (
    <div className="clientes-page">
      <Header title={`Clientes del Cobrador: ${nombreCobrador || ''}`}
      subtitle={`Total de clientes: ${clientes.length}`} />
      <div className="content">
        <Sidebar />

        {loading ? (
          <div className="loading-container">
            <div className="spinner" />
            <p>Cargando clientes...</p>
          </div>
        ) : (
          cobradorId && (
            <ClientesPorCobradoresGrid
              clientes={clientes}
              cobradorId={cobradorId}
              nombreCobrador={nombreCobrador || ''}
            />
          )
        )}
      </div>
    </div>
  );
};

export default ClientesPorCobradorPage;
