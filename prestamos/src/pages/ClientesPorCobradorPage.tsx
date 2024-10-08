import React, { useEffect, useState } from 'react';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import '../styles/ClientesPage.css';
import ClientesPorCobradoresGrid from '../components/ClientesPorCobradoresGrid';
import { useLocation } from 'react-router-dom';
import { getClientesPorCobrador } from '../apis/getApi';
// import Footer from '../components/Footer';

const ClientesPorCobradorPage: React.FC = () => {
  const location = useLocation();
  const id = location.state?.id;
  const [clientes, setClientes] = useState([]);

  useEffect(() => {
    console.log('id: ', id);
    if (id) {
      const fetchClientes = async () => {
        try {
          const clientesData = await getClientesPorCobrador(id);
          setClientes(clientesData);
        } catch (error) {
          console.log('Error fetching prestamos: ', error);
        }
      };

      fetchClientes();
    }
  }, [id]);
  return (
    <div className="clientes-page">
      <Header title="Clientes de Cobrador" />
      <div className="content">
        <Sidebar />
        <ClientesPorCobradoresGrid clientes = {clientes} />
      </div>
    </div>
  );
};

export default ClientesPorCobradorPage;
