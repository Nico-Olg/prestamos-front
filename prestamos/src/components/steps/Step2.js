import React, { useState, useEffect } from 'react';

const Step2 = ({ nextStep, prevStep }) => {
  const [cliente, setCliente] = useState({
    nombre: '',
    apellido: '',
    direccion: '',
    telefono: ''
  });

  useEffect(() => {
    // Lógica para cargar datos del cliente si ya existe
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCliente({ ...cliente, [name]: value });
  };

  return (
    <div className="step">
      <h2>Step 2: Complete los datos del cliente</h2>
      <input 
        type="text" 
        name="nombre" 
        value={cliente.nombre} 
        onChange={handleInputChange} 
        placeholder="Nombre"
      />
      <input 
        type="text" 
        name="apellido" 
        value={cliente.apellido} 
        onChange={handleInputChange} 
        placeholder="Apellido"
      />
      <input 
        type="text" 
        name="direccion" 
        value={cliente.direccion} 
        onChange={handleInputChange} 
        placeholder="Dirección"
      />
      <input 
        type="text" 
        name="telefono" 
        value={cliente.telefono} 
        onChange={handleInputChange} 
        placeholder="Teléfono"
      />
    </div>
  );
};

export default Step2;
