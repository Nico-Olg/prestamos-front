// components/crearPrestamo/steps/ResumenStep.tsx
import React from "react";
import { Box, Button, CircularProgress, Grid } from "@mui/material";
import { Field, useFormikContext } from "formik";
import { TextField } from "formik-material-ui";
import { modificarCuotas } from "../../../apis/postApi";

const FormField = ({ name, label, type = "text", disabled = false }: { name: string; label: string; type?: string; disabled?: boolean }) => (
  <Box paddingBottom={2}>
    <Field
      fullWidth
      name={name}
      component={TextField}
      label={label}
      type={type}
      disabled={disabled}
    />
  </Box>
);

const FormFieldWithModifyButton = ({ name, label, disabledInitially }: { name: string; label: string; disabledInitially?: boolean }) => {
  const [isEditable, setIsEditable] = React.useState(disabledInitially);
  const { values, setFieldValue } = useFormikContext<any>();

  const handleModifyClick = () => setIsEditable(!isEditable);

  const handleSaveClick = async () => {
    try {
      const updatedPrestamo = await modificarCuotas(values.montoCuota, values.id);
      setFieldValue("montoAPagar", updatedPrestamo.data.total);
      setFieldValue("montoCuota", updatedPrestamo.data.montoCuota);
    } catch (error) {
      console.error("Error al modificar la cuota:", error);
    } finally {
      setIsEditable(false);
    }
  };

  return (
    <Box paddingBottom={2}>
      <Grid container alignItems="center" spacing={2}>
        <Grid item xs={8}>
          <Field
            fullWidth
            name={name}
            component={TextField}
            label={label}
            type="number"
            disabled={!isEditable}
          />
        </Grid>
        <Grid item xs={4}>
          {isEditable ? (
            <Button
              variant="contained"
              color="primary"
              onClick={handleSaveClick}
              startIcon={<CircularProgress size="1rem" />}
            >
              Guardar
            </Button>
          ) : (
            <Button variant="outlined" onClick={handleModifyClick}>
              Modificar
            </Button>
          )}
        </Grid>
      </Grid>
    </Box>
  );
};

const ResumenStep: React.FC = () => {
  return (
    <>
      <FormField name="dni" label="DNI del Cliente" disabled />
      <FormField name="apellidoYnombre" label="Apellido y Nombre" disabled />
      <FormField name="monto" label="Monto Solicitado" disabled />
      <FormField name="montoAPagar" label="Monto Total a Pagar" disabled />
      <FormFieldWithModifyButton name="montoCuota" label="Valor de las Cuotas" disabledInitially />
    </>
  );
};

export default ResumenStep;