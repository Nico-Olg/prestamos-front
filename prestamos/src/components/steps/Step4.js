import React from 'react';

const Step4 = ({ prevStep }) => {
  // Supón que recibes los datos del préstamo como props
  const prestamo = {
    fechaInicio: '2024-01-01',
    fechaFin: '2024-06-01',
    montoCuota: 1000,
    montoTotal: 6000,
    formaPago: 'Efectivo',
    periodoPago: 'Mensual'
  };

  return (
    <div className="step">
      <h2>Step 4: Resumen del préstamo</h2>
      <p>Fecha de Inicio: {prestamo.fechaInicio}</p>
      <p>Fecha de Finalización: {prestamo.fechaFin}</p>
      <p>Monto por Cuota: {prestamo.montoCuota}</p>
      <p>Monto Total a Devolver: {prestamo.montoTotal}</p>
      <p>Forma de Pago: {prestamo.formaPago}</p>
      <p>Periodo de Pago: {prestamo.periodoPago}</p>
    </div>
  );
};

export default Step4;
