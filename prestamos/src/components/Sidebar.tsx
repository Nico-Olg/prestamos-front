import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Sidebar.css';

const Sidebar: React.FC = () => {
  const navigate = useNavigate();

   const handleLogout = () => {
    // Elimina el token del localStorage
    localStorage.removeItem('token');
    
    // Redirige al usuario a la página de login
    navigate('/login');
  };

  const handleNavigation = (path: string) => {
    navigate(path);
  };

  return (
    <aside className="sidebar">
      <button className="btn" onClick={() => handleNavigation('/crear-prestamo')}>Crear Prestamo</button>
      <button className="btn" onClick={() => handleNavigation('/clientes')}>Clientes</button>
      <button className="btn" onClick={() => handleNavigation('/cobradores')}>Cobranza</button>
      <button className="btn" onClick={() => handleNavigation('/usuarios')}>Usuarios</button>
      <button className="btn-logout" onClick={handleLogout}>Cerrar Sesion</button>
    </aside>
  );
};

export default Sidebar;
