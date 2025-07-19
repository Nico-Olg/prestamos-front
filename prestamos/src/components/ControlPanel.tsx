import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/header/controlPanel.css";

const ControlPanel: React.FC = () => {
  const [showDropdown, setShowDropdown] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        showDropdown &&
        panelRef.current &&
        !panelRef.current.contains(event.target as Node)
      ) {
        setShowDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showDropdown]);

  const toggleDropdown = () => {
    setShowDropdown((prev) => !prev);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <div className="control_panel" ref={panelRef}>
      <button className="setting-btn" onClick={toggleDropdown}>
        <div className="bar bar1"></div>
        <div className="bar bar2"></div>
      </button>

      <div className={`custom-dropdown-menu ${showDropdown ? "show-dropdown" : ""}`}>
        <ul>
          <li>
            <button onClick={() => navigate('/editar-cliente')}>Editar Cliente</button>
          </li>
          <li>
            <button onClick={() => alert("Configuración")}>Configuración</button>
          </li>
          <li>
            <button onClick={handleLogout}>Cerrar sesión</button>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default ControlPanel;
