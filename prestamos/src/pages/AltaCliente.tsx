import React, { useEffect, useState } from 'react';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import Barrios from '../utils/Barrios_Rubros';
import '../styles/AltaCliente.css';
import { altaCliente } from '../apis/postApi';
import { useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify'; // Importa react-toastify
import 'react-toastify/dist/ReactToastify.css'; // Importa los estilos de toastify

interface ClienteData {
  nombre_y_apellido: string;
  barrio_comercial: string;
  dni: number;
  barrio_particular: string;
  tel: number;
  direccion_comercial: string;
  direccion_particular: string;
  fecha_nac: string;
  rubro: string;
  tel2?: string;
  socio?: string;
}

const AltaCliente: React.FC = () => {
  const [barrios, setBarrios] = useState<string[]>([]);
  const [rubros, setRubros] = useState<string[]>([]);
  const navigate = useNavigate(); // Hook para navegar

  useEffect(() => {
    const barriosInstance = new Barrios();

    setBarrios(barriosInstance.getBarrios());
    setRubros(barriosInstance.getRubros());
  }, []);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const clienteData: ClienteData = {
      nombre_y_apellido: formData.get('nombre') as string,
      barrio_comercial: formData.get('barrio_comercial') as string,
      dni: Number(formData.get('dni')),
      barrio_particular: formData.get('barrio_particular') as string,
      tel: Number(formData.get('tel')),
      direccion_comercial: formData.get('direccion_comercial') as string,
      direccion_particular: formData.get('direccion_particular') as string,
      fecha_nac: formData.get('fecha_nac') as string,
      rubro: formData.get('rubro') as string,
      tel2: formData.get('tel2') as string,
      socio: formData.get('socio') as string,
    };

    try {
      const response = await altaCliente(clienteData);
      toast.success('Cliente creado con éxito!'); // Mostrar notificación de éxito
      setTimeout(() => {
        navigate('/'); // Redirigir a la página principal después de la notificación
      }, 3000); // Espera 3 segundos antes de redirigir
    } catch (error: any) {         
      toast.error(error.message); // Mostrar notificación de error
    }
  };

  return (
    <div className="alta-cliente-page">
      <Header title="Alta Cliente" />
      <div className="content">
        <Sidebar />
        <div className="form-container">
          <form onSubmit={handleSubmit}>
            <div className="form-group nombre">
              <label htmlFor="nombre">Apellido y Nombre</label>
              <input type="text" id="nombre" name="nombre" required />
            </div>
            <div className="form-group dni">
              <label htmlFor="dni">DNI</label>
              <input type="number" id="dni" name="dni" required />
            </div>
            <div className="form-group fecha">
              <label htmlFor="fecha_nac">Fecha de Nacimiento</label>
              <input type="date" id="fecha_nac" name="fecha_nac" required />
            </div>
            <div className="form-group domcom">
              <label htmlFor="direccion_comercial">Domicilio Comercial</label>
              <input type="text" id="direccion_comercial" name="direccion_comercial" required />
            </div>
            <div className="form-group barrio">
              <label htmlFor="barrio_comercial">Barrio Comercial</label>
              <select id="barrio_comercial" name="barrio_comercial" required>
                <option value="">Seleccione Barrio</option>
                {barrios.map((barrio, index) => (
                  <option key={index} value={barrio}>
                    {barrio}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group dompart">
              <label htmlFor="direccion_particular">Domicilio Particular</label>
              <input type="text" id="direccion_particular" name="direccion_particular" required />
            </div>
            <div className="form-group barrio">
              <label htmlFor="barrio_particular">Barrio Particular</label>
              <select id="barrio_particular" name="barrio_particular" required>
                <option value="">Seleccione Barrio</option>
                {barrios.map((barrio, index) => (
                  <option key={index} value={barrio}>
                    {barrio}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group rubro">
              <label htmlFor="rubro">Rubro</label>
              <select id="rubro" name="rubro" required>
                <option value="">Seleccione Rubro</option>
                {rubros.map((rubro, index) => (
                  <option key={index} value={rubro}>
                    {rubro}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group celular">
              <label htmlFor="tel">Teléfono</label>
              <input type="number" id="tel" name="tel" required />
            </div>
            <div className="form-group celular2">
              <label htmlFor="tel2">Teléfono 2</label>
              <input type="number" id="tel2" name="tel2" />
            </div>
            <div className="form-group socio">
              <label htmlFor="socio">Socio / Conyugue</label>
              <input type="text" id="socio" name="socio" />
            </div>
            <div className="form-group cobrador">
              <label htmlFor="cobrador">Cobrador</label>
              <select id="cobrador" name="cobrador">
                <option value="">Seleccione Cobrador</option>
                <option value="Diario">Pablo</option>
                <option value="Semanal">Nati</option>
                <option value="Quincenal">Nico</option>
                <option value="Mensual">Fer</option>
              </select>
            </div>
            <button type="submit" className="btn">
              Guardar
            </button>
          </form>
        </div>
      </div>
      <ToastContainer /> {/* Componente para mostrar notificaciones */}
    </div>
  );
};

export default AltaCliente;
