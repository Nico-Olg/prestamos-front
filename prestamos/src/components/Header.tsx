import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/header/Header.css';
import '../styles/header/hamburgerMenu.css';
import '../styles/header/dateTimeCard.css';
import '../styles/header/controlPanel.css';

import logo from '../assets/logo_plan_cor.png';
import ControlPanel from '../components/ControlPanel'; // ✅ Nuevo import

interface HeaderProps {
  title: string;
  subtitle?: string; // ✅ Nuevo prop opcional
  isMobile?: boolean;
}

const Header: React.FC<HeaderProps> = ({ title, subtitle, isMobile }) => {
  const navigate = useNavigate();
  const [currentTime, setCurrentTime] = useState<Date>(new Date());
  const [menuAbierto, setMenuAbierto] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  const handleLogoClick = () => {
    navigate('/clientes');
  };

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  if (isMobile) {
    return (
      <header className="header-mobile">
        <button
          className="menu-btn"
          onClick={() => setMenuAbierto(!menuAbierto)}
        >
          ☰
        </button>
        <div className="header__text">
          <h1 className="header__title">{title}</h1>
          {subtitle && <p className="header__subtitle">{subtitle}</p>}
        </div>

        {menuAbierto && (
          <div className="menu-dropdown">
            <button onClick={handleLogout}>Cerrar Sesión</button>
          </div>
        )}
      </header>
    );
  } else {
    return (
      <header className="header">
        <div className="header__logo" onClick={handleLogoClick}>
          <img src={logo} alt="Logo" />
        </div>

        <div className="header__text">
          <h1 className="header__title">{title}</h1>
          {subtitle && <p className="header__subtitle">{subtitle}</p>}
        </div>

        <ControlPanel /> {/* ✅ Usamos el nuevo componente aquí */}

        <div className="header__datetime">
          <div
            className={`card ${
              currentTime.getHours() >= 6 && currentTime.getHours() < 18
                ? 'day-card'
                : 'night-card'
            }`}
          >
            <p className="time-text">
              {currentTime.toLocaleTimeString('es-ES', {
                hour: '2-digit',
                minute: '2-digit',
                hour12: true,
              })}
            </p>
            <p className="day-text">
              {currentTime.toLocaleDateString('es-ES', {
                weekday: 'long',
                month: 'long',
                day: 'numeric',
                year: 'numeric',
              })}
            </p>
          </div>
        </div>
      </header>
    );
  }
};

export default Header;