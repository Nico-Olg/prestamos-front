// components/crearPrestamo/steps/ClienteStep.tsx
import React from "react";
import { Box } from "@mui/material";
import { Field } from "formik";
import { TextField } from "formik-material-ui";

const FormField = ({ name, label, type = "text" }: { name: string; label: string; type?: string }) => (
  <Box paddingBottom={2}>
    <Field fullWidth name={name} component={TextField} label={label} type={type} />
  </Box>
);

const ClienteStep: React.FC = () => {
  return (
    <>
      <FormField name="dni" label="DNI del Cliente" />
      <FormField name="apellidoYnombre" label="Apellido y Nombre" />
      <FormField name="fechaNac" label="Fecha de Nacimiento" />
      <FormField name="direccionComercial" label="Dirección Comercial" />
      <FormField name="barrioComercial" label="Barrio Comercial" />
      <FormField name="direccionParticular" label="Dirección Particular" />
      <FormField name="barrioParticular" label="Barrio Particular" />
      <FormField name="tel" label="Teléfono" />
      <FormField name="fechaAlta" label="Fecha de Alta" />
    </>
  );
};

export default ClienteStep;