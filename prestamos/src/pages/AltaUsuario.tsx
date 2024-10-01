import React, { useState } from 'react';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import '../styles/AltaUsuario.css';
import { useNavigate } from 'react-router-dom';
import { nuevoUsuario } from '../apis/postApi';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const AltaUsuario: React.FC = () => {
  const [nombre, setNombre] = useState('');
  const [dni, setDni] = useState<number | ''>('');
  const [rol, setRol] = useState('');
  const [password, setPassword] = useState('');
  const [password2, setPassword2] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    // Validar si las contraseñas coinciden
    if (password !== password2) {
      toast.error('Las contraseñas no coinciden'); // Mostrar mensaje de error
      return;
    }

    // Crear el objeto de datos para enviar al backend
    const usuarioData = {
      nombre,
      dni: Number(dni),
      rol,
      password, // Solo enviamos la contraseña una vez
    };

    try {
      // Llamada al endpoint para crear el usuario
      await nuevoUsuario(usuarioData);
      toast.success('Usuario creado con éxito!');
      setTimeout(() => {
        navigate('/clientes'); // Redirigir después de 3 segundos
      }, 3000);
    } catch (error: any) {
      toast.error(error.message); // Mostrar error si la creación falla
    }
  };

  return (
    <div className="alta-usuario-page">
      <Header title="Alta Usuario" />
      <div className="content">
        <Sidebar />
        <div className="form-container">
          <form onSubmit={handleSubmit}>
            <div className="form-group nombre">
              <label htmlFor="nombre">Nombre Completo</label>
              <input 
                type="text" 
                id="nombre" 
                name="nombre" 
                value={nombre} 
                onChange={(e) => setNombre(e.target.value)} 
                required 
              />
            </div>
            <div className="form-group dni">
              <label htmlFor="dni">DNI</label>
              <input 
                type="number" 
                id="dni" 
                name="dni" 
                value={dni} 
                onChange={(e) => setDni(Number(e.target.value))} 
                required 
              />
            </div>
            <div className="form-group rol">
              <label htmlFor="rol">Rol</label>
              <select 
                id="rol" 
                name="rol" 
                value={rol} 
                onChange={(e) => setRol(e.target.value)} 
                required
              >
                <option value="">Seleccione un rol</option>
                <option value="ADMIN">Administrador</option>
                <option value="COBRADOR">Cobrador</option>
                {/* Agregar más roles si es necesario */}
              </select>
            </div>
            <div className="form-group password">
              <label htmlFor="password">Contraseña</label>
              <input 
                type="password" 
                id="password" 
                name="password" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                required 
              />
            </div>
            <div className="form-group password2">
              <label htmlFor="password2">Repetir Contraseña</label>
              <input 
                type="password" 
                id="password2" 
                name="password2" 
                value={password2} 
                onChange={(e) => setPassword2(e.target.value)} 
                required 
              />
            </div>
            <button type="submit" className="btn">
              Guardar
            </button>
          </form>
        </div>
      </div>
      <ToastContainer />
    </div>
  );
};

export default AltaUsuario;
