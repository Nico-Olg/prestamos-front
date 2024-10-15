import React, { useState } from "react";
import { useClientContext } from "../../provider/ClientContext"; // Importar el contexto de clientes
import { Box, Grid } from "@mui/material";
import { Field, useFormikContext } from "formik";
import { TextField } from "formik-material-ui";
import { Cliente } from "../../interfaces/Cliente"; // Importa la interfaz Cliente
import "../../styles/BuscarClientesStep.css";

const BuscarClienteStep: React.FC = () => {
  const { clientes } = useClientContext(); // Obtener los clientes del contexto
  const { setFieldValue } = useFormikContext<any>();
  const [filteredClientes, setFilteredClientes] = useState<Cliente[]>([]);
  const [nombreBusqueda, setNombreBusqueda] = useState<string>("");

  // Función para manejar la búsqueda de clientes por nombre o DNI
  const handleNombreChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setNombreBusqueda(value);

    if (value) {
      const filtered = clientes.filter(
        (cliente) =>
          cliente.apellidoYnombre.toLowerCase().includes(value.toLowerCase()) ||
          cliente.dni.toString().startsWith(value)
      );
      setFilteredClientes(filtered);
    } else {
      setFilteredClientes([]);
    }
  };

  // Función para seleccionar un cliente de las sugerencias
  const handleClienteSelect = (cliente: Cliente) => {
    setFieldValue("dni", cliente.dni);
    setFieldValue("apellidoYnombre", cliente.apellidoYnombre);
    setFieldValue("direccionComercial", cliente.direccionComercial);
    setFieldValue("tel", cliente.tel);
    setNombreBusqueda(cliente.apellidoYnombre); // Establecer el nombre en el campo de búsqueda
    setFilteredClientes([]); // Limpiar las sugerencias
  };

  return (
    <Box paddingBottom={2}>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <Field
            fullWidth
            name="dni"
            component={TextField}
            label="Buscar Cliente (DNI o Nombre)"
            value={nombreBusqueda}
            onChange={handleNombreChange}
          />
          {/* Lista de sugerencias */}
          {filteredClientes.length > 0 && (
            <ul className="suggestions-list">
              {filteredClientes.map((cliente) => (
                <li
                  key={cliente.dni}
                  onClick={() => handleClienteSelect(cliente)}
                  style={{ cursor: "pointer" }}
                >
                  {cliente.apellidoYnombre} - {cliente.dni}
                </li>
              ))}
            </ul>
          )}
        </Grid>
      </Grid>
    </Box>
  );
};

export default BuscarClienteStep;
