import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { getAllClients } from '../apis/getApi';
import { Cliente } from '../interfaces/Cliente';  // Importa la interfaz

// Define el contexto
interface ClientContextProps {
    clientes: Cliente[];
    setClientes: React.Dispatch<React.SetStateAction<Cliente[]>>;
    refreshClientes: () => void;
}

// Tipo para las props del proveedor que incluye children
interface ClientProviderProps {
    children: ReactNode;
}

const ClientContext = createContext<ClientContextProps | undefined>(undefined);

// Hook para usar el contexto de clientes
export const useClientContext = () => {
    const context = useContext(ClientContext);
    if (!context) {
        throw new Error('useClientContext must be used within a ClientProvider');
    }
    return context;
};

// Proveedor del contexto
export const ClientProvider: React.FC<ClientProviderProps> = ({ children }) => {
    const [clientes, setClientes] = useState<Cliente[]>([]);

    // Función para refrescar clientes (ej. luego de crear o editar)
    const refreshClientes = async () => {
        try {
            const fetchedClientes = await getAllClients();
            setClientes(fetchedClientes);
        } catch (error) {
            console.error('Error fetching clients:', error);
        }
    };

    // Obtener clientes en el login o primera carga
    useEffect(() => {
        refreshClientes();
    }, []);

    return (
        <ClientContext.Provider value={{ clientes, setClientes, refreshClientes }}>
            {children}
        </ClientContext.Provider>
    );
};
