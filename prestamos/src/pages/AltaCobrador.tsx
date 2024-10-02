import React, { useState } from 'react';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import '../styles/AltaUsuario.css';
import { altaCobrador } from '../apis/postApi';
import { useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

interface CobradorData {
  nombreyApellido: string;
  dni: number;
  zona: number;
  tel: string;
}

const AltaCobrador: React.FC = () => {
  const [cobradorData, setCobradorData] = useState<CobradorData>({
    nombreyApellido: '',
    dni: 0,
    zona: 0,
    tel: ''
  });
  const navigate = useNavigate();

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setCobradorData(prevState => ({ ...prevState, [name]: value }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    try {
      await altaCobrador(cobradorData);
      toast.success('Cobrador creado con éxito!');
      setTimeout(() => {
        navigate('/');
      }, 3000);
    } catch (error: any) {
      toast.error('Error al crear el cobrador');
    }
  };

  return (
    <div className="alta-cobrador-page">
      <Header title="Alta Cobrador" />
      <div className="content">
        <Sidebar />
        <div className="form-container">
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="nombreyApellido">Nombre y Apellido</label>
              <input
                type="text"
                id="nombreyApellido"
                name="nombreyApellido"
                value={cobradorData.nombreyApellido}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="dni">DNI</label>
              <input
                type="number"
                id="dni"
                name="dni"
                value={cobradorData.dni}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="zona">Zona</label>
              <input
                type="number"
                id="zona"
                name="zona"
                value={cobradorData.zona}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="tel">Teléfono</label>
              <input
                type="text"
                id="tel"
                name="tel"
                value={cobradorData.tel}
                onChange={handleChange}
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

export default AltaCobrador;
