import React from "react";
import { useNavigate } from "react-router-dom";
import {
  FaUserPlus,
  FaUsers,
  FaCreditCard,
  FaBoxOpen,
  FaSignOutAlt,
  FaUserCog,
} from "react-icons/fa";
import { MdAutorenew } from "react-icons/md";

import "../styles/Sidebar.css";

const Sidebar: React.FC = () => {
  const navigate = useNavigate();

 const handleLogout = () => {
  localStorage.clear();     // Borra todo el localStorage
  sessionStorage.clear();   // Borra todo el sessionStorage
  navigate("/login");
};

  const handleNavigation = (path: string) => {
    navigate(path);
  };

  return (
    <aside className="sidebar">
      <div>
        <button
          className="btn"
          onClick={() => handleNavigation("/crear-prestamo")}
        >
          <FaUserPlus className="icon" />
          <span>Crear Préstamo</span>
        </button>

        <button className="btn" onClick={() => handleNavigation("/clientes")}>
          <FaUsers className="icon" />
          <span>Clientes</span>
        </button>

        <button className="btn" onClick={() => handleNavigation("/cobradores")}>
          <FaCreditCard className="icon" />
          <span>Cobranza</span>
        </button>

        <button className="btn" onClick={() => handleNavigation("/usuarios")}>
          <FaUserCog className="icon" />
          <span>Usuarios</span>
        </button>

        <button className="btn" onClick={() => handleNavigation("/productos")}>
          <FaBoxOpen className="icon" />
          <span>Productos</span>
        </button>
        <button className="btn" onClick={() => handleNavigation("/refinanciar")}>
          <MdAutorenew className="icon" />
          <span>Refinanciar Prestamos</span>
        </button>
      </div>
      <div>
        <button className="btn-logout" onClick={handleLogout}>
          <FaSignOutAlt className="icon" />
          <span>Cerrar Sesión</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
