import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from '../apis/postApi';
import { useClientContext } from '../provider/ClientContext';
import { cobranzaDelDia } from "../apis/postApi";
import { PagosMapper } from '../interfaces/Pagos';

// import { usePagosHoyContext } from '../provider/PagosHoyContext';  
import loadingGIF from '../assets/loading.gif';
import '../styles/Login.css';

const Login: React.FC = () => {
  const [dni, setDni] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const navigate = useNavigate();

  const { refreshClientes } = useClientContext();
  // const { refreshPagosHoy } = usePagosHoyContext();  

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
  e.preventDefault();
  setIsLoading(true);

  try {
    // Limpieza al iniciar sesión
    localStorage.clear();
    sessionStorage.clear();

    const token = await login(dni, password);
    localStorage.setItem('token', token); // El token puede seguir en localStorage si necesitás persistencia
    const rol = localStorage.getItem('rol');
    const id = localStorage.getItem('id');

    if (rol === 'ADMIN') {
      await refreshClientes();
      navigate('/clientes');
    } else if (rol === 'COBRADOR') {
      try {
        const today = new Date().toISOString().split('T')[0];
        const response = await cobranzaDelDia(Number(id), today);
        const data = PagosMapper.fromJSON(response);

        if (!data || !data.pagos || !data.cobrador) {
          console.error("Error: Datos incompletos en la respuesta del backend.");
          return;
        }

        const { pagos, cobrador } = data;

        // ✅ Guardar el cobradorId en sessionStorage en lugar de localStorage
        sessionStorage.setItem("cobradorId", cobrador.id.toString());

        navigate(`/pagos`, { state: { pagos, cobrador } });
      } catch (error) {
        console.error("Error al navegar a pagos", error);
      }
    }
  } catch (error) {
    console.error('Error en la autenticación', error);
    setError('Credenciales incorrectas. Inténtalo de nuevo.');
  } finally {
    setIsLoading(false);
  }
};


  return (
    <div className="login-page">
      {isLoading && (
        <div className="loading-overlay">
          <img src={loadingGIF} alt="Cargando..." className="loading-gif" />
        </div>
      )}
      <div className="form-container">
        <p className="title">Bienvenido</p>
        <form className="form" onSubmit={handleLogin}>
          <input
            type="text"
            className="input"
            placeholder="DNI"
            value={dni}
            onChange={(e) => setDni(e.target.value)}
            required
            disabled={isLoading}
          />
          <input
            type="password"
            className="input"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={isLoading}
          />
          {error && <p className="error-message">{error}</p>}
          
          <button type="submit" className="form-btn" disabled={isLoading}>
            {isLoading ? 'Cargando...' : 'Log in'}
          </button>
        </form>
        <p className="sign-up-label">
          Don't have an account? <span className="sign-up-link">Sign up</span>
        </p>
      </div>
    </div>
  );
};

export default Login;
