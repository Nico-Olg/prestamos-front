import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Sidebar.css';

const Sidebar: React.FC = () => {
  const navigate = useNavigate();

  const handleNavigation = (path: string) => {
    navigate(path);
  };

  return (
    <aside className="sidebar">
      <button className="btn" onClick={() => handleNavigation('/crear-prestamo')}>Crear Prestamo</button>
      <button className="btn" onClick={() => handleNavigation('/clientes')}>Clientes</button>
      <button className="btn" onClick={() => handleNavigation('/')}>Cobranza</button>
      <button className="btn" onClick={() => handleNavigation('/prestamos')}>Button 4</button>
    </aside>
  );
};

export default Sidebar;
