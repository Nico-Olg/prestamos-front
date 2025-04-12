// src/components/ResumenCobranza.tsx
import React from "react";
import "../styles/ResumenCobranza.css";
import { Pago } from "../interfaces/Pagos";

interface ResumenCobranzaProps {
  totalCobrado: number;
  pagosParciales: Pago[];  
  onClose: () => void;
}

const ResumenCobranza: React.FC<ResumenCobranzaProps> = ({
  totalCobrado,
  pagosParciales,  
  onClose,
}) => {
  return (
    <div className="resumen-overlay">
      <div className="resumen-container">
        <h2>📋 Resumen de Cobranza</h2>
        <p><strong>Total Cobrado:</strong> ${totalCobrado.toFixed(2)}</p>       
        <p><strong>Pagos Parciales:</strong> {pagosParciales.length}</p>

        {pagosParciales.length > 0 && (
          <>
            <h3>⚠ Clientes con pagos parciales:</h3>
            <ul>
              {pagosParciales.map((pago) => (
                <li key={pago.id}>{pago.nombreCliente} - ${pago.montoAbonado}</li>
              ))}
            </ul>
          </>
        )}
        <button className="btn-cerrar" onClick={onClose}>Cerrar</button>
      </div>
    </div>
  );
};

export default ResumenCobranza;
