import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { getAllClients } from '../apis/getApi';
import { getPrestamosPorCliente } from '../apis/postApi'; // Importamos el nuevo método
import { Cliente, Prestamo } from '../interfaces/Cliente'; // Importa las interfaces

// Define el contexto
interface ClientContextProps {
    clientes: Cliente[];
    setClientes: React.Dispatch<React.SetStateAction<Cliente[]>>;
    prestamos: Prestamo[];
    setPrestamos: React.Dispatch<React.SetStateAction<Prestamo[]>>;
    refreshClientes: () => void;
    refreshPrestamos: (dni: number) => void;
    refreshPrestamosDelete: (dni: number) => Promise<void>; // Nuevo método
}

// Tipo para las props del proveedor que incluye children
interface ClientProviderProps {
    children: ReactNode;
}

const ClientContext = createContext<ClientContextProps | undefined>(undefined);

// Hook para usar el contexto de clientes y préstamos
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
    const [prestamos, setPrestamos] = useState<Prestamo[]>([]);

    // Función para refrescar clientes (ej. luego de crear o editar)
    const refreshClientes = async () => {
        try {
            const fetchedClientes = await getAllClients();
            setClientes(fetchedClientes);
        } catch (error) {
            console.error('Error fetching clients:', error);
        }
    };

    // Función para refrescar los préstamos de un cliente por DNI (desde el estado actual)
    const refreshPrestamos = async (dni: number) => {
        try {
            const cliente = clientes.find((c) => c.dni === dni);
            if (cliente) {
                setPrestamos(cliente.prestamo); // Almacena los préstamos del cliente seleccionado
            } else {
                setPrestamos([]);
            }
        } catch (error) {
            console.error('Error fetching prestamos:', error);
        }
    };

    // **Nuevo método** para refrescar préstamos desde la API después de una eliminación
    const refreshPrestamosDelete = async (dni: number) => {
        try {
            const nuevosPrestamos = await getPrestamosPorCliente(dni); // Obtiene los datos actualizados
            setClientes((prevClientes) =>
                prevClientes.map((cliente) =>
                    cliente.dni === dni ? { ...cliente, prestamo: nuevosPrestamos } : cliente
                )
            );
            setPrestamos(nuevosPrestamos); // Actualiza el estado local de préstamos
        } catch (error) {
            console.error('Error refreshing prestamos after delete:', error);
        }
    };

    // Obtener clientes en el login o primera carga
    useEffect(() => {
        refreshClientes();
    }, []);

    return (
        <ClientContext.Provider
            value={{
                clientes,
                setClientes,
                prestamos,
                setPrestamos,
                refreshClientes,
                refreshPrestamos,
                refreshPrestamosDelete, // Exportamos el nuevo método
            }}
        >
            {children}
        </ClientContext.Provider>
    );
};
