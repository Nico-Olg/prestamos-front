import React from "react";
import "../styles/Footer.css";

const Footer: React.FC = () => {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-section">
          <p>Versión de la Aplicación: 2.3.1</p>
          <p>Última Actualización: 13 de Agosto, 2024</p>
        </div>
        <div className="footer-section">
          <p>&copy; 2024 Tu Empresa. Todos los derechos reservados.</p>
          <p>
            Recuerda: No compartas tu contraseña ni dejes sesiones abiertas en
            equipos compartidos.
          </p>
        </div>
        <div className="footer-section">
          <p>
            Soporte Técnico:{" "}
            <a href="mailto:nolguin077@gmail.com">nolguin077@gmail.com</a>
          </p>
          <p>Tel: +54 3512440572</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
