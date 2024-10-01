import React, { useState, useEffect, ReactNode } from "react";
import Header from "../components/Header";
import Sidebar from "../components/Sidebar";
import { Formik, Field, Form, FormikConfig, FormikValues, useFormikContext } from "formik";
import {
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Grid,
  Step,
  StepLabel,
  Stepper,
  MenuItem,
  Select,
} from "@mui/material";
import { CheckboxWithLabel, TextField } from "formik-material-ui";
import * as Yup from "yup";
import "../styles/CrearPrestamo.css";
import { useNavigate } from "react-router-dom";
import { getClientebyDni, crearPrestamo } from "../apis/postApi";
import { getProductos } from "../apis/getApi"; // Importar las funciones getProductos, getAllClients y getPrestamosPorCliente
import dayjs from "dayjs"; // Usaremos dayjs para manejar fechas

const sleep = (time: number) =>
  new Promise((resolve) => setTimeout(resolve, time));

interface ClienteData {
  dni: string;
  apellidoYnombre: string;
  direccionParticular: string;
  tel: string;
  barrioComercial: string;
  barrioParticular: string;
  fechaNac: string;
  fechaAlta: string;
  [key: string]: string | number | undefined;
}

interface PrestamoData {
  id: number;
  total: number;
  cantidadCuotas: number;
  codigoProducto: number;
  dni_cliente: number;
  periodo_pago: string;
  monto: number;
  fechaInicio: string;
  fechaFin: string;
  pagoEnEfectivo: boolean;
  montoCuota: number;
}

interface ProductoData {
  id: number;
  descripcion: string;
  valor: number;
}

interface FormikStepProps {
  label: string;
  validationSchema?: any;
  children: React.ReactNode;
}

function FechaFinUpdater() {
  const { values, setFieldValue } = useFormikContext<FormikValues>();

  useEffect(() => {
    if (values.fechaInicio && values.dias) {
      const fechaFin = dayjs(values.fechaInicio).add(values.dias, "day").format("YYYY-MM-DD");
      setFieldValue("fechaFin", fechaFin);
    }
  }, [values.fechaInicio, values.dias, setFieldValue]);

  return null;
}

const FormikStep = ({ children }: FormikStepProps) => <>{children}</>;

const FormField = ({ name, label, type = "text", disabled = false, children }: { name: string; label: string; type?: string; disabled?: boolean; children?: React.ReactNode }) => (
  <Box paddingBottom={2}>
    <Field fullWidth name={name} component={type === "select" ? Select : TextField} label={label} type={type} disabled={disabled}>
      {children}
    </Field>
  </Box>
);

const FormikStepper = ({ children, productos, ...props }: FormikConfig<FormikValues> & { productos: ProductoData[] }) => {
  const [step, setStep] = useState(0);
  const [completed, setCompleted] = useState(false);
  const [prestamoCreado, setPrestamoCreado] = useState<number | null>(null);
  const navigate = useNavigate();

  const childrenArray = React.Children.toArray(children as ReactNode[]) as React.ReactElement<FormikStepProps>[];
  const currentChild = childrenArray[step];

  const isLastStep = () => step === childrenArray.length - 1;

  const handleSubmit = async (values: FormikValues, helpers: any) => {
    if (isLastStep()) {
      navigate("/clientes"); // Redirige a la página principal si es el último paso
      return;
    }

    if (step === 0) {
      try {
        const cliente: ClienteData = await getClientebyDni(Number(values.dni));
        helpers.setValues({
          ...values,
          ...cliente,
        });
      } catch (error) {
        alert("Cliente no encontrado. Redirigiendo a alta de cliente...");
        navigate("/alta-cliente");
      }
    } else if (step === 2) {
      try {
        const prestamo: PrestamoData = await crearPrestamo(values.dias, values.producto, Number(values.dni), values.periodo, values.monto, values.pagoEnEfectivo, values.fechaInicio, values.fechaFin);
        console.log("Datos enviados al backend para crear el préstamo:", values);
        helpers.setValues({
          ...values,
          id: prestamo.id,
          montoAPagar: prestamo.total,
          fechaInicio: prestamo.fechaInicio,
          fechaFin: prestamo.fechaFin,
          montoCuota: prestamo.montoCuota,
        });
        setCompleted(true);
        setPrestamoCreado(prestamo.id);
      } catch (error) {
        console.error("Error al crear el préstamo:", error);
      }
    } else if (step === 3) {
      prestamoCreado;
      // try {
      //   await actualizarFechaInicio(values.id, values.fechaInicio);
      //   helpers.setValues({
      //     fechaInicio: values.fechaInicio,
      //     fechaFin: dayjs(values.fechaInicio).add(values.dias, "day").format("YYYY-MM-DD"),
      //   });
      // } catch (error) {
      //   console.error("Error al actualizar la fecha de inicio:", error);
      // }
    }

    setStep((prev) => prev + 1);
    helpers.setTouched({});
  };

  return (
    <Formik {...props} onSubmit={handleSubmit}>
      {({ isSubmitting }) => (
        <Form autoComplete="off">
          <FechaFinUpdater />
          <Stepper alternativeLabel activeStep={step}>
            {childrenArray.map((child, index) => (
              <Step key={index} completed={step > index || completed}>
                <StepLabel>{child.props.label}</StepLabel>
              </Step>
            ))}
          </Stepper>

          {currentChild}

          <Grid container spacing={2}>
            {step > 0 && (
              <Grid item>
                <Button
                  className="btn"
                  disabled={isSubmitting}
                  onClick={() => setStep((prev) => prev - 1)}
                >
                  Volver
                </Button>
              </Grid>
            )}
            <Grid item>
              <Button className="btn" disabled={isSubmitting} type="submit" startIcon={isSubmitting ? <CircularProgress size="1rem" /> : null}>
                {isSubmitting ? "Creando" : isLastStep() ? "Finalizar" : "Siguiente"}
              </Button>
            </Grid>
          </Grid>
        </Form>
      )}
    </Formik>
  );
};

export default function CrearPrestamo() {
  // const navigate = useNavigate();
  const initialValues = {
    dni: "",
    nombre: "",
    apellido: "",
    direccion: "",
    telefono: "",
    producto: "",
    monto: 0,
    periodo: "",
    dias: 0,
    resumen: "",
    fechaInicio: dayjs().format("YYYY-MM-DD"),
    fechaFin: "",
  };

  const periodos = [
    { key: "Diario", value: "Diario" },
    { key: "Semanal", value: "Semanal" },
    { key: "Quincenal", value: "Quincenal" },
    { key: "Mensual", value: "Mensual" },
  ];

  const [productos, setProductos] = useState<ProductoData[]>([]);

  useEffect(() => {
    const fetchProductos = async () => {
      try {
        const response = await getProductos();
        setProductos(response);
      } catch (error) {
        console.error("Error al obtener los productos:", error);
      }
    };

    if (productos.length === 0) {
      fetchProductos();
    }
  }, [productos]);

  return (
    <div className="crear-prestamo-page">
      <Header title="Crear Prestamo" />
      <div className="content">
        <Sidebar />
        <div className="form-container">
          <Card>
            <CardContent>
              <FormikStepper
                initialValues={initialValues}
                productos={productos} // Pasar los productos como prop
                onSubmit={async (values, { setSubmitting }) => {
                  await sleep(3000);
                  console.log("Préstamo creado con éxito", values);
                  setSubmitting(false);
                }}
              >
                <FormikStep label="Buscar Cliente">
                  <FormField name="dni" label="DNI del Cliente" />
                </FormikStep>
                <FormikStep label="Datos del Cliente">
                  <FormField name="dni" label="DNI del Cliente" />
                  <FormField name="apellidoYnombre" label="Apellido y Nombre" />
                  <FormField name="fechaNac" label="Fecha de Nacimiento" />
                  <FormField name="direccionComercial" label="Dirección Comercial" />
                  <FormField name="barrioComercial" label="Barrio Comercial" />
                  <FormField name="direccionParticular" label="Dirección Particular" />
                  <FormField name="barrioParticular" label="Barrio Particular" />
                  <FormField name="tel" label="Teléfono" />
                  <FormField name="fechaAlta" label="Fecha de Alta" />
                </FormikStep>
                <FormikStep
                  label="Datos del Préstamo"
                  validationSchema={Yup.object({
                    monto: Yup.number().required("El monto es obligatorio"),
                    periodo: Yup.string().required("El periodo de pago es obligatorio"),
                    dias: Yup.number().required("La cantidad de días es obligatoria").min(1, "Debe ser al menos 1 día"),
                  })}
                >
                 <Box paddingBottom={2}>
                    <Field
                      name="producto"
                      as={Select}
                      label="Producto"
                      labelId="producto-label"
                      fullWidth
                    >
                      {productos.length > 0 ? (
                        productos.map((producto: ProductoData) => (
                          <MenuItem key={producto.id} value={producto.id}>
                            {producto.descripcion}
                          </MenuItem>
                        ))
                      ) : (
                        <MenuItem disabled>
                          No hay productos disponibles
                        </MenuItem>
                      )}
                    </Field>
                  </Box>
                  <FormField name="monto" label="Monto Solicitado" type="number" />
                   <Box paddingBottom={2}>
                    <Field
                      fullWidth
                      name="periodo"
                      as={Select}
                      label="Periodo de Pago (Diario, Semanal, etc.)"
                    >
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
                  <Field name="pagoEnEfectivo" type="checkbox" component={CheckboxWithLabel} Label={{ label: "Paga en Efectivo" }} />
                </FormikStep>
                <FormikStep label="Resumen del Préstamo">
                  <FormField name="dni" label="DNI del Cliente" disabled />
                  <FormField name="apellidoYnombre" label="Apellido y Nombre" disabled />
                  <FormField name="monto" label="Monto Solicitado" disabled />
                  <FormField name="montoAPagar" label="Monto Total a Pagar" disabled />
                  <FormField name="montoCuota" label="Valor de las Cuotas" disabled />
                 
                </FormikStep>
                <FormikStep label="Confirmación">
                  <Box paddingBottom={2}>
                    <p>Préstamo creado con éxito.</p>
                  </Box>
                </FormikStep>
              </FormikStepper>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}