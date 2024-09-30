import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getClientesPorCobrador } from "../apis/getApi";
import "../styles/PrestamosPage.css";
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import ClientesPorCobradoresGrid from "../components/ClientesPorCobradoresGrid";

interface Cliente {
  apellidoYnombre: string;
  dni: number;
  direccion: string;
  tel: string;
}

export const ClientesPorCobrador: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [clientes, setClientes] = useState<Cliente[]>([]);

  useEffect(() => {
    const fetchClientes = async () => {
      try {
        const data = await getClientesPorCobrador(parseInt(id || "0"));
        setClientes(data);
      } catch (error) {
        console.log("Error fetching clientes: ", error);
      }
    };

    fetchClientes();
  }, [id]);

  return (
    <div className="clientes-page">
      
      <Header title="Clientes del Cobrador" />
      <div className="content">
        <Sidebar />
         {/* Renderizamos la grid de clientes pasando los clientes */}
        <ClientesPorCobradoresGrid clientes={clientes} /> 
      </div>
    </div>
  );
};


export default ClientesPorCobrador;
