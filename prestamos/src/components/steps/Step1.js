import React, { useState } from 'react';

const Step1 = ({ nextStep }) => {
  const [dni, setDni] = useState('');

  const handleDniChange = (e) => {
    setDni(e.target.value);
  };

  const handleNext = () => {
    nextStep();
  };

  return (
    <div className="step">
      <h2>Step 1: Ingrese el DNI del cliente</h2>
      <input 
        type="text" 
        value={dni} 
        onChange={handleDniChange} 
        placeholder="DNI del cliente"
      />
    </div>
  );
};

export default Step1;
