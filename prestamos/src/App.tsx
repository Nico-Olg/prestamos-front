import React, { Suspense, lazy, useEffect, useState } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import  '../src/styles/Sidebar.css';

// Importa el ClientProvider
import { ClientProvider } from './provider/ClientContext';
import { PagosHoyProvider } from './provider/PagosHoyContext';

// Importación de componentes con lazy loading
const PrestamosPage = lazy(() => import('./pages/PrestamosPage'));
const CrearPrestamo = lazy(() => import('./pages/CrearPrestamo'));
const AltaCliente = lazy(() => import('./pages/AltaCliente'));
const Clientes = lazy(() => import('./pages/ClientesPage'));
const Pagos = lazy(() => import('./pages/PagosPage'));
const NotFound = lazy(() => import('./pages/NotFound'));
const Login = lazy(() => import('./pages/LoginPage'));
const Cobradores = lazy(() => import('./pages/CobranzaPage'));
const ClientesPorCobradores = lazy(() => import('./pages/ClientesPorCobradorPage'));
const Usuarios = lazy(() => import('./pages/UsuariosPage'));
const AltaUsuario = lazy(() => import('./pages/AltaUsuario'));
const AltaCobrador = lazy(() => import('./pages/AltaCobrador'));
const ProductosPage = lazy(() => import('./pages/ProductosPage'));
const NuevoProducto = lazy(() => import('./pages/NuevoProducto'));
const PagosDelDia = lazy(() => import('./pages/PagosDelDiaPage'));
const EditarCliente = lazy(() => import('./pages/EditarCliente'));

// Componente de ruta protegida
const ProtectedRoute: React.FC<{ children: JSX.Element }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('rol'); // Obtener rol del usuario

    if (token) {
      setIsAuthenticated(true);
      setUserRole(role);
    } else {
      setIsAuthenticated(false);
      setUserRole(null);
    }
    setLoading(false);
  }, []);

  if (loading) {
    return <div>Cargando...</div>; // Indicador de carga
  }

  return isAuthenticated ? children : <Navigate to="/login" />;
};

const RoleBasedRoute: React.FC<{ children: JSX.Element; allowedRoles: string[] }> = ({ children, allowedRoles }) => {
  const [userRole, setUserRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const role = localStorage.getItem('rol'); // Obtener rol del usuario
    setUserRole(role);
    setLoading(false);
  }, []);

  if (loading) {
    return <div>Cargando...</div>; // Indicador de carga
  }

  return userRole && allowedRoles.includes(userRole) ? children : <Navigate to="/login" />;
};




const App: React.FC = () => {
  return (
    <ClientProvider> {/* Envuelve la aplicación con ClientProvider */}
     <PagosHoyProvider>
      <Router>
        <Suspense fallback={<div className="spinner">Loading...</div>}>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/" element={<Navigate to="/login" />} />

              {/* Rutas accesibles solo para ADMIN */}
              <Route path="/prestamos" element={<RoleBasedRoute allowedRoles={["ADMIN"]}><PrestamosPage /></RoleBasedRoute>} />
              <Route path="/crear-prestamo" element={<RoleBasedRoute allowedRoles={["ADMIN"]}><CrearPrestamo /></RoleBasedRoute>} />
              <Route path="/alta-cliente" element={<RoleBasedRoute allowedRoles={["ADMIN"]}><AltaCliente /></RoleBasedRoute>} />
              <Route path="/clientes" element={<RoleBasedRoute allowedRoles={["ADMIN"]}><Clientes /></RoleBasedRoute>} />
              <Route path="/pagos" element={<RoleBasedRoute allowedRoles={["ADMIN"]}><Pagos /></RoleBasedRoute>} />
              <Route path="/usuarios" element={<RoleBasedRoute allowedRoles={["ADMIN"]}><Usuarios /></RoleBasedRoute>} />
              <Route path="/alta-usuario" element={<RoleBasedRoute allowedRoles={["ADMIN"]}><AltaUsuario /></RoleBasedRoute>} />
              <Route path="/alta-cobrador" element={<RoleBasedRoute allowedRoles={["ADMIN"]}><AltaCobrador /></RoleBasedRoute>} />
              <Route path="/productos" element={<RoleBasedRoute allowedRoles={["ADMIN"]}><ProductosPage /></RoleBasedRoute>} />
              <Route path="/nuevo-producto" element={<RoleBasedRoute allowedRoles={["ADMIN"]}><NuevoProducto /></RoleBasedRoute>} />
              <Route path="/editar-cliente" element={<RoleBasedRoute allowedRoles={["ADMIN"]}><EditarCliente /></RoleBasedRoute>} />

              {/* Rutas accesibles para ADMIN y COBRADOR */}
              <Route path="/cobradores/:id/clientes" element={<RoleBasedRoute allowedRoles={["ADMIN", "COBRADOR"]}><ClientesPorCobradores /></RoleBasedRoute>} />
              <Route path="/pagosHoyGrid" element={<RoleBasedRoute allowedRoles={["ADMIN", "COBRADOR"]}><PagosDelDia /></RoleBasedRoute>} />
              <Route path="/cobradores" element={<RoleBasedRoute allowedRoles={["ADMIN", "COBRADOR"]}><Cobradores /></RoleBasedRoute>} />

              {/* Ruta de fallback */}
              <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </Router>
      </PagosHoyProvider>
    </ClientProvider>  // Cierra el envoltorio de ClientProvider
  );
};

export default App;