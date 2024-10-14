import React from 'react';
import Header from '../components/Header.tsx';
import Sidebar from '../components/Sidebar.tsx';
import '../styles/ClientesPage.css';
import PagosHoyGrid from '../components/PagosHoyGrid.tsx';
// import Footer from '../components/Footer';



const PagosDelDiaPage: React.FC = () => {
  return (
    <div className="pagos-page">
      <Header title="Pagos del dia " />
      <div className="content">
        <Sidebar />
        <PagosHoyGrid />
      </div>
    </div>
  );
};

export default PagosDelDiaPage;