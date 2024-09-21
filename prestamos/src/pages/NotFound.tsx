import React from 'react';
import { Link } from 'react-router-dom';

const NotFound: React.FC = () => {
  return (
    <div style={{ textAlign: 'center', padding: '50px' }}>
      <h1>404 - Página No Encontrada</h1>
      <p>La página que estás buscando no existe.</p>
      <Link to="/">Volver al Inicio</Link>
    </div>
  );
};

export default NotFound;
