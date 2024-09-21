import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Login.css'; // Asegúrate de que este archivo CSS tenga el estilo que proporcionaste

const Login: React.FC = () => {
  const [email, setEmail] = useState<string>('');
   const [dni, setDni] = useState<string>(''); // Cambiado a DNI
  const [password, setPassword] = useState<string>('');
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      // Implementar lógica de autenticación aquí, por ejemplo:
      // const response = await axios.post('/api/login', { email, password });
      navigate('/');
    } catch (error) {
      console.error('Error en la autenticación', error);
    }
  };

  return (
    <div className="login-page">
      <div className="form-container">
        <p className="title">Bienvenido</p>
        <form className="form" onSubmit={handleLogin}>
          <input
               type="text" // Cambiado a tipo texto
            className="input"
            placeholder="DNI" // Cambiado el placeholder a DNI
            value={dni}
            onChange={(e) => setDni(e.target.value)} // Actualiza el valor de DNI
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
          <p className="page-link">
            <span className="page-link-label">Forgot Password?</span>
          </p>
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
