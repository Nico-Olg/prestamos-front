import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';

// Importación de componentes con lazy loading
const PrestamosPage = lazy(() => import('./pages/PrestamosPage'));
const CrearPrestamo = lazy(() => import('./pages/CrearPrestamo'));
const AltaCliente = lazy(() => import('./pages/AltaCliente'));
const Clientes = lazy(() => import('./pages/ClientesPage'));
const Pagos = lazy(() => import('./pages/PagosPage'));
const NotFound = lazy(() => import('./pages/NotFound'));

const App: React.FC = () => {
  return (
    <Router>
      <Suspense fallback={<div className="spinner">Loading...</div>}>
        <Routes>
          <Route path="/" element={<Clientes />} /> {/* Ruta principal */}
          <Route path="/prestamos" element={<PrestamosPage />} />
          <Route path="/crear-prestamo" element={<CrearPrestamo />} />
          <Route path="/alta-cliente" element={<AltaCliente />} />
          <Route path="/clientes" element={<Clientes />} />
          <Route path="/pagos" element={<Pagos />} />
          <Route path="*" element={<NotFound />} /> {/* Ruta de fallback */}
        </Routes>
      </Suspense>
    </Router>
  );
}

export default App;
