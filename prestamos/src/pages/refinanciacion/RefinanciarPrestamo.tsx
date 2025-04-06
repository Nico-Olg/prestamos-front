import React, { useState } from "react";
import Header from "../../components/Header";
import Sidebar from "../../components/Sidebar";
import { Formik, Form, FormikConfig, FormikValues } from "formik";
import {
  Stepper,
  Step,
  StepLabel,
  Button,
  Grid,
  CircularProgress,
  Card,
  CardContent,
} from "@mui/material";
import BuscarClienteRefinanciacionStep from "../../pages/refinanciacion/steps/BuscarClienteRefinanciacion";
import PrestamosClienteStep from "../../pages/refinanciacion/steps/SeleccionarPrestamosStep";
import CondicionesRefinanciacionStep from "../../pages/refinanciacion/steps/CondicionesRefinanciacionStep";
import ConfirmacionRefinanciacionStep from "../../pages/refinanciacion/steps/ConfirmacionRefinanciacionStep";

// Tipado para cada paso del formulario
interface FormikStepProps {
  label: string;
  children: React.ReactNode;
}

const FormikStep = ({ children }: FormikStepProps) => <>{children}</>;

const FormikStepper = ({
  children,
  ...props
}: FormikConfig<FormikValues>) => {
  const [step, setStep] = useState(0);
  const [completed, _setCompleted] = useState(false);

  const childrenArray = React.Children.toArray(
    children as React.ReactNode[]
  ) as React.ReactElement<FormikStepProps>[];
  const currentChild = childrenArray[step];

  const isLastStep = () => step === childrenArray.length - 1;

  return (
    <Formik
      {...props}
      onSubmit={async (values, helpers) => {
        if (isLastStep()) {
          return await props.onSubmit(values, helpers);
        } else {
          setStep((s) => s + 1);
          helpers.setTouched({});
        }
      }}
    >
      {({ isSubmitting }) => (
        <Form autoComplete="off">
          <Stepper alternativeLabel activeStep={step}>
            {childrenArray.map((child, index) => (
              <Step key={index} completed={step > index || completed}>
                <StepLabel>{child.props.label}</StepLabel>
              </Step>
            ))}
          </Stepper>

          {currentChild}

          <Grid container spacing={2} style={{ marginTop: 20 }}>
            {step > 0 && (
              <Grid item>
                <Button onClick={() => setStep((s) => s - 1)} className="btn">
                  Volver
                </Button>
              </Grid>
            )}
            <Grid item>
              <Button
                className="btn"
                disabled={isSubmitting}
                type="submit"
                startIcon={isSubmitting ? <CircularProgress size="1rem" /> : null}
              >
                {isSubmitting
                  ? "Procesando"
                  : isLastStep()
                  ? "Confirmar"
                  : "Siguiente"}
              </Button>
            </Grid>
          </Grid>
        </Form>
      )}
    </Formik>
  );
};

export default function RefinanciarPrestamo() {
  const initialValues = {
    cliente: null,
    prestamosSeleccionados: [],
    fechaInicio: "",
    fechaFin: "",
    interes: 0,
    cuotas: 0,
    totalRefinanciado: 0,
    totalConInteres: 0,
    periodo_pago: "Diario",
  };

  return (
    <div className="crear-prestamo-page">
      <Header title="Refinanciar Préstamo" />
      <div className="content">
        <Sidebar />
        <div className="form-container">
          <Card>
            <CardContent>
              <FormikStepper initialValues={initialValues} onSubmit={() => {}}>
                <FormikStep label="Buscar Cliente">
                  <BuscarClienteRefinanciacionStep
                    onClienteSeleccionado={() => {}}
                  />
                </FormikStep>

                <FormikStep label="Seleccionar Préstamos">
                  <PrestamosClienteStep  />
                </FormikStep>

                <FormikStep label="Condiciones de Refinanciación">
                  <CondicionesRefinanciacionStep />
                </FormikStep>

                <FormikStep label="Confirmación">
                  <ConfirmacionRefinanciacionStep />
                </FormikStep>
              </FormikStepper>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
