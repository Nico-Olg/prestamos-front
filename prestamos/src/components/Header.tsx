import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Header.css';
import logo from '../assets/logo_plan_cor.png'; 


// Definir los tipos de las props
interface HeaderProps {
  title: string;
}

const Header: React.FC<HeaderProps> = ({ title }) => {
  const navigate = useNavigate();
  const [currentTime, setCurrentTime] = useState<Date>(new Date());
  const [showDropdown, setShowDropdown] = useState<boolean>(false); // Estado para manejar el menú desplegable

  const handleLogoClick = () => {
    navigate('/clientes');
  };

  const handlePanelClick = () => {
    setShowDropdown(!showDropdown); // Alternar entre mostrar u ocultar el menú
  };

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer); // Limpiar el intervalo cuando el componente se desmonta
  }, []);

  useEffect(() => {
  const handleClickOutside = (event: MouseEvent) => {
    const target = event.target as HTMLElement;
    if (!target.closest('.control_panel')) {
      setShowDropdown(false);
    }
  };
  document.addEventListener('mousedown', handleClickOutside);
  return () => {
    document.removeEventListener('mousedown', handleClickOutside);
  };
}, []);


  const formatTime = (date: Date): string => {
    return date.toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const formatDay = (date: Date): string => {
    const options: Intl.DateTimeFormatOptions = {
      weekday: 'long',  // 'long' es un valor específico que espera TypeScript
      month: 'long',    // 'long' es un valor específico que espera TypeScript
      day: 'numeric',   // 'numeric' es un valor específico que espera TypeScript
      year: 'numeric',  // 'numeric' es un valor específico que espera TypeScript
    };
    return date.toLocaleDateString('es-ES', options);
  };

  const isDayTime = (date: Date): boolean => {
    const hour = date.getHours();
    return hour >= 6 && hour < 18; // Considera día de 6 AM a 6 PM
  };

  return (
    <header className="header">
      <div className="header__logo" onClick={handleLogoClick}>
        <img src={logo} alt="Logo" />
      </div>
      <h1 className="header__title">{title}</h1>
      <div className='control_panel'>
        <button className="setting-btn" onClick={handlePanelClick}>
          <span className="bar bar1"></span>
          <span className="bar bar2"></span>
          <span className="bar bar1"></span>
        </button>
        {showDropdown && (
          <div className="dropdown-menu">
            <ul>
              <button  onClick={() => navigate('/alta-cliente', { state: { isEditMode: true } })} >Editar Datos de Cliente</button>
              <li>Opción 2</li>
              <li>Opción 3</li>
            </ul>
          </div>
        )}
      </div>
      <div className="header__datetime">
        <div className={`card ${isDayTime(currentTime) ? 'day-card' : 'night-card'}`}>
          <p className="time-text">
            {formatTime(currentTime)}
          </p>
          <p className="day-text">{formatDay(currentTime)}</p>
          {isDayTime(currentTime) ? (
            <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 16 16" strokeWidth="0" fill="currentColor" stroke="currentColor" className="sun">
              <path d="M8 4.373a3.625 3.625 0 1 1 0 7.25 3.625 3.625 0 0 1 0-7.25zm0-3.123a.75.75 0 0 1 .75.75v1.75a.75.75 0 0 1-1.5 0V2a.75.75 0 0 1 .75-.75zm0 12.5a.75.75 0 0 1 .75.75v1.75a.75.75 0 0 1-1.5 0V14.5a.75.75 0 0 1 .75-.75zm-7-6.25a.75.75 0 0 1 .75-.75h1.75a.75.75 0 0 1 0 1.5H1.75A.75.75 0 0 1 1 7.5zm12.5 0a.75.75 0 0 1 .75-.75h1.75a.75.75 0 0 1 0 1.5h-1.75a.75.75 0 0 1-.75-.75zm-9.94-4.11a.75.75 0 0 1 1.06 0l1.238 1.238a.75.75 0 0 1-1.06 1.06L2.56 4.56a.75.75 0 0 1 0-1.06zm9.439 9.439a.75.75 0 0 1 0 1.06l-1.238 1.238a.75.75 0 1 1-1.06-1.06l1.238-1.238a.75.75 0 0 1 1.06 0zM2.56 11.44a.75.75 0 0 1 1.06 0l1.238 1.238a.75.75 0 0 1-1.06 1.06L2.56 12.5a.75.75 0 0 1 0-1.06zm9.44-7.88a.75.75 0 0 1 1.06 1.06l-1.238 1.238a.75.75 0 0 1-1.06-1.06L12.44 3.56z"></path>
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 16 16" strokeWidth="0" fill="currentColor" stroke="currentColor" className="moon">
              <path d="M6 .278a.768.768 0 0 1 .08.858 7.208 7.208 0 0 0-.878 3.46c0 4.021 3.278 7.277 7.318 7.277.527 0 1.04-.055 1.533-.16a.787.787 0 0 1 .81.316.733.733 0 0 1-.031.893A8.349 8.349 0 0 1 8.344 16C3.734 16 0 12.286 0 7.71 0 4.266 2.114 1.312 5.124.06A.752.752 0 0 1 6 .278z"></path>
              <path d="M10.794 3.148a.217.217 0 0 1 .412 0l.387 1.162c.173.518.579.924 1.097 1.097l1.162.387a.217.217 0 0 1 0 .412l-1.162.387a1.734 1.734 0 0 0-1.097 1.097l-.387 1.162a.217.217 0 0 1-.412 0l-.387-1.162A1.734 1.734 0 0 0 9.31 6.593l-1.162-.387a.217.217 0 0 1 0-.412l1.162-.387a1.734 1.734 0 0 0 1.097-1.097l.387-1.162zM13.863.099a.145.145 0 0 1 .274 0l.258.774c.115.346.386.617.732.732l.774.258a.145.145 0 0 1 0 .274l-.774.258a1.156 1.156 0 0 0-.732.732l-.258.774a.145.145 0 0 1-.274 0l-.258-.774a1.156 1.156 0 0 0-.732-.732l-.774-.258a.145.145 0 0 1 0-.274l.774-.258c.346-.115.617-.386.732-.732L13.863.1z"></path>
            </svg>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;