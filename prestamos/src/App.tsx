import React, { Suspense, lazy, useEffect, useState } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';

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

// Componente de ruta protegida
const ProtectedRoute: React.FC<{ children: JSX.Element }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    
    if (token) {
      setIsAuthenticated(true); // Si existe el token, considera al usuario autenticado
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
    <Router>
      <Suspense fallback={<div className="spinner">Loading...</div>}>
        <Routes>
          <Route path="/login" element={<Login />} />
          
          {/* Rutas protegidas */}
          <Route path="/" element={
            <ProtectedRoute>
              <Clientes />
            </ProtectedRoute>
          } />

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



          {/* Ruta de fallback */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </Router>
  );
};

export default App;
