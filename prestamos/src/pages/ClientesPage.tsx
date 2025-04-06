import React from 'react';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import ClientesGrid from '../components/ClientesGrid';
import '../styles/ClientesPage.css';
// import Footer from '../components/Footer';

const ClientesPage: React.FC = () => {
  return (
    <div className="clientes-page">
      <Header title="Todos los Clientes" />
      <div className="content">
        <Sidebar />
        <ClientesGrid />        
      </div>
    </div>
  );
};

export default ClientesPage;
