import React, { useEffect, useState } from 'react';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import Barrios from '../utils/Barrios_Rubros';
import '../styles/AltaCliente.css';
import { altaCliente } from '../apis/postApi';
import { useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify'; // Importa react-toastify
import 'react-toastify/dist/ReactToastify.css'; // Importa los estilos de toastify
import { getCobradores } from '../apis/getApi';

interface ClienteData {
  apellidoYnombre: string;
  barrio_comercial: string;
  barrioComercial: string;
  dni: number;
  barrioParticular: string;
  tel: string;
  direccionComercial: string;
  direccionParticular: string;
  fechaNac: string;
  rubro: string;
  tel2?: string;
  socio?: string;
  cobrador :{
    id: number; 
  }
}

interface Cobrador {
  id: number;
  nombreyApellido: string;
}

const AltaCliente: React.FC = () => {
  const [barrios, setBarrios] = useState<string[]>([]);
  const [rubros, setRubros] = useState<string[]>([]);
  const [cobradores, setCobradores] = useState<Cobrador[]>([]); // Estado para los cobradores
  const navigate = useNavigate(); 

  useEffect(() => {
    const barriosInstance = new Barrios();
    setBarrios(barriosInstance.getBarrios());
    setRubros(barriosInstance.getRubros());

    // Llamada para obtener los cobradores desde la API
    const fetchCobradores = async () => {
      try {
        const cobradoresData = await getCobradores(); // Obtener los cobradores
        setCobradores(cobradoresData); // Actualizar el estado con los cobradores
      } catch (error) {
        console.error('Error fetching cobradores:', error);
      }
    };

    fetchCobradores();
  }, []);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const clienteData: ClienteData = {
      apellidoYnombre: formData.get('nombre') as string,
      barrioComercial: formData.get('barrio_comercial') as string,
      dni: Number(formData.get('dni')),
      barrioParticular: formData.get('barrio_particular') as string,
      tel: formData.get('tel') as string,
      direccionComercial: formData.get('direccion_comercial') as string,
      direccionParticular: formData.get('direccion_particular') as string,
      fechaNac: formData.get('fecha_nac') as string,
      rubro: formData.get('rubro') as string,
      tel2: formData.get('tel2') as string,
      socio: formData.get('socio') as string,
      barrio_comercial: '',
      cobrador: { id: Number(formData.get('cobrador')) },
     
    };

    try {
      await altaCliente(clienteData);
      toast.success('Cliente creado con éxito!');
      setTimeout(() => {
        navigate('/clientes'); 
      }, 3000); 
    } catch (error: any) {
      toast.error(error.message); 
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
              <select id="cobrador" name="cobrador" required>
                <option value="">Seleccione Cobrador</option>
                {cobradores.map((cobrador) => (
                  <option key={cobrador.id} value={cobrador.id}>
                    {cobrador.nombreyApellido}
                  </option>
                ))}
              </select>
            </div>
            <button type="submit" className="action-btn">
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
