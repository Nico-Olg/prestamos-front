import React, { useState } from "react";
import { TextField, Autocomplete, Box } from "@mui/material";
import { Cliente } from "../../../interfaces/Cliente";
import { getAllClients } from "../../../apis/getApi";

interface BuscarClienteRefinanciacionStepProps {
  onClienteSeleccionado: (cliente: Cliente) => void;
}

const BuscarClienteRefinanciacionStep: React.FC<BuscarClienteRefinanciacionStepProps> = ({ onClienteSeleccionado }) => {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [_inputValue, setInputValue] = useState<string>("");

  const buscarClientes = async (value: string) => {
    try {
      const all = await getAllClients();
      const filtrados = all.filter((cliente: Cliente) =>
        cliente.apellidoYnombre.toLowerCase().includes(value.toLowerCase()) ||
        cliente.dni.toString().startsWith(value)
      );
      setClientes(filtrados);
    } catch (error) {
      console.error("Error al obtener clientes:", error);
    }
  };

  return (
    <Box paddingBottom={2}>
      <Autocomplete
        options={clientes}
        getOptionLabel={(option) => `${option.apellidoYnombre} - ${option.dni}`}
        onInputChange={(_event, value) => {
          setInputValue(value);
          if (value.length >= 2) buscarClientes(value);
        }}
        onChange={(_event, value) => {
          if (value) onClienteSeleccionado(value);
        }}
        renderInput={(params) => (
          <TextField
            {...params}
            label="Buscar cliente por nombre o DNI"
            variant="outlined"
            fullWidth
          />
        )}
      />
    </Box>
  );
};

export default BuscarClienteRefinanciacionStep;
