import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from '../apis/postApi';
import { useClientContext } from '../provider/ClientContext';
import { usePagosHoyContext } from '../provider/PagosHoyContext';  // Importa el contexto de pagos
import '../styles/Login.css';

const Login: React.FC = () => {
  const [dni, setDni] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const { refreshClientes } = useClientContext();
  const { refreshPagosHoy } = usePagosHoyContext();  // Hook para refrescar los pagos del día

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const token = await login(dni, password);  // Llamada a la API de login
      localStorage.setItem('token', token);

      // Refrescar clientes y pagos del día después del login exitoso
      await refreshClientes();
      await refreshPagosHoy();

      // Redirige al usuario a la página de clientes
      navigate('/clientes');
    } catch (error) {
      console.error('Error en la autenticación', error);
      setError('Credenciales incorrectas. Inténtalo de nuevo.');
    }
  };

  return (
    <div className="login-page">
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
          />
          <input
            type="password"
            className="input"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          {error && <p className="error-message">{error}</p>}
          <button type="submit" className="form-btn">
            Log in
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
