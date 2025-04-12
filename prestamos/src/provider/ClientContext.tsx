import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { getAllClients } from '../apis/getApi';
import { getPrestamosPorCliente } from '../apis/postApi';
import { Cliente } from '../interfaces/Cliente';
import { Prestamo } from '../interfaces/Prestamo';

interface ClientContextProps {
  clientes: Cliente[];
  setClientes: React.Dispatch<React.SetStateAction<Cliente[]>>;
  prestamosPorCliente: Record<number, Prestamo[]>; // clave = DNI del cliente
  fetchPrestamos: (dni: number) => Promise<Prestamo[]>;
  refreshClientes: () => void;
}

interface ClientProviderProps {
  children: ReactNode;
}

const ClientContext = createContext<ClientContextProps | undefined>(undefined);

export const useClientContext = () => {
  const context = useContext(ClientContext);
  if (!context) {
    throw new Error('useClientContext must be used within a ClientProvider');
  }
  return context;
};

export const ClientProvider: React.FC<ClientProviderProps> = ({ children }) => {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [prestamosPorCliente, setPrestamosPorCliente] = useState<Record<number, Prestamo[]>>({});

  const refreshClientes = async () => {
    try {
      const data = await getAllClients(); // ahora devuelve ClienteDTO[]
      setClientes(data);
    } catch (error) {
      console.error('Error al cargar clientes:', error);
    }
  };

  const fetchPrestamos = async (dni: number): Promise<Prestamo[]> => {
    if (prestamosPorCliente[dni]) {
      return prestamosPorCliente[dni];
    }

    try {
      const prestamos = await getPrestamosPorCliente(dni);
      setPrestamosPorCliente(prev => ({ ...prev, [dni]: prestamos }));
      return prestamos;
    } catch (error) {
      console.error('Error al cargar préstamos:', error);
      return [];
    }
  };

  useEffect(() => {
    refreshClientes();
  }, []);

  return (
    <ClientContext.Provider
      value={{
        clientes,
        setClientes,
        prestamosPorCliente,
        fetchPrestamos,
        refreshClientes,
      }}
    >
      {children}
    </ClientContext.Provider>
  );
};
