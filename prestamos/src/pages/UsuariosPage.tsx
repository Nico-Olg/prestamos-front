import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import '../styles/PrestamosPage.css';
import { getUsuarios } from '../apis/getApi';
import UsuariosGrid from '../components/UsuariosGrid';

const UsuariosPage: React.FC = () => {
  const [usuarios, setUsuarios] = useState([]);

  useEffect(() => {
    const fetchUsuarios = async () => {
      try {
        const usuariosData = await getUsuarios();
        setUsuarios(usuariosData);
      } catch (error) {
        console.log('Error fetching usuarios: ', error);
      }
    };

    fetchUsuarios(); // Llama a la función fetchUsuarios al cargar la página
  }, []);

  return (
    <div className="prestamos-page">
      <Header title="Usuarios del Sistema" />
      <div className="content">
        <Sidebar />
        <UsuariosGrid usuarios={usuarios} />
      </div>
    </div>
  );
};

export default UsuariosPage;
