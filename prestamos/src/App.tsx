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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    
    if (token) {
      setIsAuthenticated(true); // Si existe el token, considera al usuario autenticado
    }else{
      setIsAuthenticated(false);
    }
    setLoading(false); // Ya no está cargando
  }, []);

  if (loading) {
    return <div>Cargando...</div>; // O cualquier componente de loading
  }

  return isAuthenticated ? children : <Navigate to="/login" />;
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

            <Route path="/prestamos" element={
              <ProtectedRoute>
                <PrestamosPage />
              </ProtectedRoute>
            } />

            <Route path="/crear-prestamo" element={
              <ProtectedRoute>
                <CrearPrestamo />
              </ProtectedRoute>
            } />

            <Route path="/alta-cliente" element={
              <ProtectedRoute>
                <AltaCliente />
              </ProtectedRoute>
            } />

            <Route path="/clientes" element={
              <ProtectedRoute>
                <Clientes />
              </ProtectedRoute>
            } />

            <Route path="/pagos" element={
              <ProtectedRoute>
                <Pagos />
              </ProtectedRoute>
            } />
           
            <Route path="/cobradores/:id/clientes" element={
              <ProtectedRoute>
                <ClientesPorCobradores />
              </ProtectedRoute>
            } />

            <Route path="/cobradores" element={
              <ProtectedRoute>
                <Cobradores />
              </ProtectedRoute>
            } />

            <Route path="/usuarios" element={
              <ProtectedRoute>
                <Usuarios />
              </ProtectedRoute>
            } />

            <Route path="/alta-usuario" element={
              <ProtectedRoute>
                <AltaUsuario />
              </ProtectedRoute>
            } />

            <Route path="/alta-cobrador" element={
              <ProtectedRoute>
                <AltaCobrador />
              </ProtectedRoute>
            } />

            <Route path="/productos" element={
              <ProtectedRoute>
                <ProductosPage />
              </ProtectedRoute>
            } />

            <Route path="/nuevo-producto" element={
              <ProtectedRoute>
                <NuevoProducto />
              </ProtectedRoute>
            } />
            <Route path="/pagosHoyGrid" element={
              <ProtectedRoute>
                <PagosDelDia />
              </ProtectedRoute>
            } />
            <Route path="/editar-cliente" element={
              <ProtectedRoute>
                <EditarCliente />
              </ProtectedRoute>
            } />

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