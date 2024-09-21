import React, { useState } from 'react';

const Step3 = ({ nextStep, prevStep }) => {
  const [prestamo, setPrestamo] = useState({
    producto: '',
    monto: '',
    periodo: '',
    dias: ''
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setPrestamo({ ...prestamo, [name]: value });
  };

  return (
    <div className="step">
      <h2>Step 3: Complete los datos del préstamo</h2>
      <input 
        type="text" 
        name="producto" 
        value={prestamo.producto} 
        onChange={handleInputChange} 
        placeholder="Producto"
      />
      <input 
        type="number" 
        name="monto" 
        value={prestamo.monto} 
        onChange={handleInputChange} 
        placeholder="Monto solicitado"
      />
      <select 
        name="periodo" 
        value={prestamo.periodo} 
        onChange={handleInputChange}
      >
        <option value="diario">Diario</option>
        <option value="semanal">Semanal</option>
        <option value="quincenal">Quincenal</option>
        <option value="mensual">Mensual</option>
      </select>
      <input 
        type="number" 
        name="dias" 
        value={prestamo.dias} 
        onChange={handleInputChange} 
        placeholder="Cantidad de días"
      />
    </div>
  );
};

export default Step3;
