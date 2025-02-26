import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from '../apis/postApi';
import { useClientContext } from '../provider/ClientContext';
import { usePagosHoyContext } from '../provider/PagosHoyContext';  
import loadingGIF from '../assets/loading.gif';
import '../styles/Login.css';

const Login: React.FC = () => {
  const [dni, setDni] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const navigate = useNavigate();

  const { refreshClientes } = useClientContext();
  const { refreshPagosHoy } = usePagosHoyContext();  

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const token = await login(dni, password);
      localStorage.setItem('token', token);

      await refreshClientes();
      await refreshPagosHoy();
      
      const rol = localStorage.getItem('rol');
      
      navigate('/clientes');
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
