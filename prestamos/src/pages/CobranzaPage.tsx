import React from 'react';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import '../styles/ClientesPage.css';
import CobradoresGrid from '../components/CobradoresGrid';
// import Footer from '../components/Footer';

const CobranzaPage: React.FC = () => {
  return (
    <div className="clientes-page">
      <Header title="Cobradores" />
      <div className="content">
        <Sidebar />
        <CobradoresGrid />
      </div>
    </div>
  );
};

export default CobranzaPage;
