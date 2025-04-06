// components/crearPrestamo/steps/PrestamoStep.tsx
import React from "react";
import { Box, MenuItem, Select } from "@mui/material";
import { Field } from "formik";
import { TextField } from "formik-material-ui";

const FormField = ({ name, label, type = "text" }: { name: string; label: string; type?: string }) => (
  <Box paddingBottom={2}>
    <Field fullWidth name={name} component={TextField} label={label} type={type} />
  </Box>
);

interface ProductoData {
  id: number;
  descripcion: string;
  valor: number;
}

const PrestamoStep: React.FC<{ productos: ProductoData[] }> = ({ productos }) => {
  const periodos = [
    { key: "Diario", value: "Diario" },
    { key: "Semanal", value: "Semanal" },
    { key: "Quincenal", value: "Quincenal" },
    { key: "Mensual", value: "Mensual" },
  ];

  return (
    <>
      <Box paddingBottom={2}>
        <Field name="producto" as={Select} label="Producto" fullWidth>
          {productos.length > 0 ? (
            productos.map((producto) => (
              <MenuItem key={producto.id} value={producto.id}>
                {producto.descripcion}
              </MenuItem>
            ))
          ) : (
            <MenuItem disabled>No hay productos disponibles</MenuItem>
          )}
        </Field>
      </Box>
      <FormField name="monto" label="Monto Solicitado" type="number" />
      <Box paddingBottom={2}>
        <Field name="periodo" as={Select} label="Periodo de Pago" fullWidth>
          {periodos.map((periodo) => (
            <MenuItem key={periodo.key} value={periodo.value}>
              {periodo.value}
            </MenuItem>
          ))}
        </Field>
      </Box>
      <FormField name="dias" label="Cantidad de Días del Préstamo" type="number" />
      <FormField name="fechaInicio" label="Fecha Inicio" type="date" />
      <FormField name="fechaFin" label="Fecha Fin" />
    </>
  );
};

export default PrestamoStep;