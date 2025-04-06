// components/crearPrestamo/FormikStepper.tsx
import React, { useState } from "react";
import {
  Formik,
  FormikConfig,
  FormikValues,
  Form,
  useFormikContext
} from "formik";
import {
  Box,
  Button,
  CircularProgress,
  Grid,
  Step,
  StepLabel,
  Stepper,
  Card,
  CardContent
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { getClientebyDni, crearPrestamo } from "../../apis/postApi";
import { useClientContext } from "../../provider/ClientContext";
import FechaFinUpdater from "./hooks/FechaFinUpdater";
import MontoProductoUpdater from "./hooks/MontoProductoUpdater";

interface FormikStepperProps extends FormikConfig<FormikValues> {
  productos: any[];
  steps: {
    label: string;
    component: React.ReactNode;
  }[];
}

const FormikStepper: React.FC<FormikStepperProps> = ({ children, productos, steps, ...props }) => {
  const [step, setStep] = useState(0);
  const [completed, setCompleted] = useState(false);
  const navigate = useNavigate();
  const { refreshClientes } = useClientContext();

  const currentStep = steps[step];
  const isLastStep = () => step === steps.length - 1;

  const handleSubmit = async (values: FormikValues, helpers: any) => {
    if (isLastStep()) {
      try {
        await refreshClientes();
        navigate("/clientes");
      } catch (error) {
        console.error("Error al refrescar los clientes:", error);
      }
      return;
    }

    if (step === 0) {
      try {
        const cliente = await getClientebyDni(Number(values.dni));
        helpers.setValues({ ...values, ...cliente });
      } catch (error) {
        alert("Cliente no encontrado. Redirigiendo a alta de cliente...");
        navigate("/alta-cliente");
      }
    } else if (step === 2) {
      try {
        const prestamo = await crearPrestamo(
          values.dias,
          values.producto,
          Number(values.dni),
          values.periodo,
          values.monto,
          values.pagoEnEfectivo,
          values.fechaInicio,
          values.fechaFin
        );
        helpers.setValues({
          ...values,
          id: prestamo.id,
          montoAPagar: prestamo.total,
          fechaInicio: prestamo.fechaInicio,
          fechaFin: prestamo.fechaFin,
          montoCuota: prestamo.montoCuota,
        });
        setCompleted(true);
      } catch (error) {
        console.error("Error al crear el préstamo:", error);
      }
    }

    setStep((prev) => prev + 1);
    helpers.setTouched({});
  };

  return (
    <Formik {...props} onSubmit={handleSubmit}>
      {({ isSubmitting }) => (
        <Form autoComplete="off">
          <FechaFinUpdater />
          <MontoProductoUpdater productos={productos} />

          <Stepper alternativeLabel activeStep={step} sx={{ marginBottom: 2 }}>
            {steps.map((stepObj, index) => (
              <Step key={index} completed={step > index || completed}>
                <StepLabel>{stepObj.label}</StepLabel>
              </Step>
            ))}
          </Stepper>

          <Card>
            <CardContent>{currentStep.component}</CardContent>
          </Card>

          <Grid container spacing={2} sx={{ marginTop: 2 }}>
            {step > 0 && (
              <Grid item>
                <Button
                  variant="outlined"
                  disabled={isSubmitting}
                  onClick={() => setStep((prev) => prev - 1)}
                >
                  Volver
                </Button>
              </Grid>
            )}
            <Grid item>
              <Button
                variant="contained"
                disabled={isSubmitting}
                type="submit"
                startIcon={isSubmitting ? <CircularProgress size="1rem" /> : null}
              >
                {isSubmitting ? "Creando" : isLastStep() ? "Finalizar" : "Siguiente"}
              </Button>
            </Grid>
          </Grid>
        </Form>
      )}
    </Formik>
  );
};

export default FormikStepper;
