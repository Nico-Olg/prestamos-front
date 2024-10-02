import React from 'react';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import '../styles/ClientesPage.css';
import ProductosGrid from '../components/ProductosGrid.tsx';
// import Footer from '../components/Footer';



const ProductosPage: React.FC = () => {
  return (
    <div className="clientes-page">
      <Header title="Productos" />
      <div className="content">
        <Sidebar />
        <ProductosGrid />
      </div>
    </div>
  );
};

export default ProductosPage;