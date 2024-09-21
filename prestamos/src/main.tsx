import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './styles/index.css';

// Asegúrate de que el elemento con id "root" existe en el HTML
const rootElement = document.getElementById('root');

// Si el elemento "root" está presente, crea y renderiza el componente `App`
if (!rootElement) {
  throw new Error("No se pudo encontrar el elemento con id 'root'.");
}

createRoot(rootElement).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
