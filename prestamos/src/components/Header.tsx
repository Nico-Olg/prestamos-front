import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/header/Header.css';
import '../styles/header/hamburgerMenu.css';
import '../styles/header/dateTimeCard.css';

import logo from '../assets/logo_plan_cor.png';

// Definir los tipos de las props
interface HeaderProps {
  title: string;
  isMobile?: boolean;
}

const Header: React.FC<HeaderProps> = ({ title, isMobile }) => {
  const navigate = useNavigate();
  const [currentTime, setCurrentTime] = useState<Date>(new Date());
  const [showDropdown, setShowDropdown] = useState<boolean>(false);
  const [menuAbierto, setMenuAbierto] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };
  
  const handleLogoClick = () => {
    navigate('/clientes');
  };

  const handlePanelClick = () => {
    setShowDropdown(!showDropdown);
  };

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (showDropdown && !target.closest('.control_panel')) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showDropdown]);

  if (isMobile) {
    return (
      <header className="header-mobile">
          <button className="menu-btn" onClick={() => setMenuAbierto(!menuAbierto)}>
          ☰
        </button>
        <h1 className="header__title">{title}</h1>

         {menuAbierto && (
          <div className="menu-dropdown">
            <button onClick={handleLogout}>Cerrar Sesión</button>
          </div>
        )}
      </header>
    );
  }else {
      return (
        <header className="header">
          <div className="header__logo" onClick={handleLogoClick}>
            <img src={logo} alt="Logo" />
          </div>
          <h1 className="header__title">{title}</h1>
          <div className="control_panel">
            <button className="setting-btn" onClick={handlePanelClick}>
              <span className="bar bar1"></span>
              <span className="bar bar2"></span>
              <span className="bar bar1"></span>
            </button>
            {showDropdown && (
              <div
                className={`dropdown-menu ${
                  showDropdown ? 'show-dropdown' : 'hide-dropdown'
                }`}
              >
                <ul>
                  <li>
                    <button onClick={() => navigate('/editar-cliente')}>
                      Editar Datos de Cliente
                    </button>
                  </li>
                  <li>Opción 2</li>
                  <li>Opción 3</li>
                </ul>
              </div>
            )}
          </div>
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
    };
  }


export default Header;
