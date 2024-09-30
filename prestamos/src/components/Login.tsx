import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from '../apis/postApi'; // Importa la función login
import '../styles/Login.css';

const Login: React.FC = () => {
  const [dni, setDni] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [error, setError] = useState<string | null>(null); // Para manejar errores
  const navigate = useNavigate();

 const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
  e.preventDefault();
  try {
    const token = await login(dni, password); // Llamada a la API
    localStorage.setItem('token', token); // Guarda el token en localStorage
    navigate('/'); // Redirige al usuario a la página principal
  } catch (error) {
    console.error('Error en la autenticación', error);
    setError('Credenciales incorrectas. Inténtalo de nuevo.'); // Muestra el error al usuario
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
