import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { getPagosDeHoy } from '../apis/getApi';  // Asegúrate de tener esta API disponible
import { PagosHoy } from '../interfaces/PagosHoy';  // Importa la interfaz

// Define el contexto
interface PagosHoyContextProps {
    pagosHoy: PagosHoy[];
    setPagosHoy: React.Dispatch<React.SetStateAction<PagosHoy[]>>;
    refreshPagosHoy: () => void;
}

// Tipo para las props del proveedor que incluye children
interface PagosHoyProviderProps {
    children: ReactNode;
}

const PagosHoyContext = createContext<PagosHoyContextProps | undefined>(undefined);

// Hook para usar el contexto de pagos de hoy
export const usePagosHoyContext = () => {
    const context = useContext(PagosHoyContext);
    if (!context) {
        throw new Error('usePagosHoyContext must be used within a PagosHoyProvider');
    }
    return context;
};

// Proveedor del contexto
export const PagosHoyProvider: React.FC<PagosHoyProviderProps> = ({ children }) => {
    const [pagosHoy, setPagosHoy] = useState<PagosHoy[]>([]);

    // Función para refrescar los pagos de hoy
    const refreshPagosHoy = async () => {
        try {
            const fetchedPagosHoy = await getPagosDeHoy();
            setPagosHoy(fetchedPagosHoy);
        } catch (error) {
            console.error('Error fetching pagos de hoy:', error);
        }
    };

    // Obtener los pagos de hoy en el login o primera carga
    useEffect(() => {
        refreshPagosHoy();
    }, []);

    return (
        <PagosHoyContext.Provider value={{ pagosHoy, setPagosHoy, refreshPagosHoy }}>
            {children}
        </PagosHoyContext.Provider>
    );
};
