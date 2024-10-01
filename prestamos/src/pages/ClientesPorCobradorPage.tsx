import React from "react";
// import { Cliente } from "../pages/ClientesPorCobrador"; // Importa el tipo Cliente si está en otro archivo


interface Cliente {
  apellidoYnombre: string;
  dni: number;
  direccion: string;
  tel: string;
}
interface ClientesPorCobradoresGridProps {
  clientes: Cliente[];
}

const ClientesPorCobradoresGrid: React.FC<ClientesPorCobradoresGridProps> = ({ clientes }) => {
  return (
    <div className="clientes-grid">
      {clientes.map((cliente, index) => (
        <div key={index} className="cliente-item">
          <p>{cliente.apellidoYnombre}</p>
          <p>{cliente.dni}</p>
          <p>{cliente.direccion}</p>
          <p>{cliente.tel}</p>
        </div>
      ))}
    </div>
  );
};

export default ClientesPorCobradoresGrid;
