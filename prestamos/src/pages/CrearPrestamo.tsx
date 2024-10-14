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
import { getClientebyDni, crearPrestamo, modificarCuotas } from "../apis/postApi";
import { getProductos } from "../apis/getApi";
import dayjs from "dayjs";
import BuscarClienteStep from "../components/steps/BuscarClienteStep";

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

// Función para contar los domingos entre dos fechas
const contarDomingos = (fechaInicio: dayjs.Dayjs, fechaFin: dayjs.Dayjs) => {
  let domingos = 0;
  let fechaActual = fechaInicio;

  while (fechaActual.isBefore(fechaFin)) {
    // Si es domingo (0 = Domingo en dayjs), sumamos un día extra
    if (fechaActual.day() === 0) {
      domingos += 1;
    }
    fechaActual = fechaActual.add(1, "day");
  }

  return domingos;
};

// Actualiza el valor de "fechaFin" cuando se cambia la fecha de inicio o los días
function FechaFinUpdater() {
  const { values, setFieldValue } = useFormikContext<FormikValues>();

  useEffect(() => {
    if (values.fechaInicio && values.dias) {
      const fechaInicio = dayjs(values.fechaInicio);
      const fechaFinInicial = fechaInicio.add(values.dias, "day");

      // Contar los domingos entre la fecha de inicio y la fecha de fin inicial
      const domingos = contarDomingos(fechaInicio, fechaFinInicial);

      // Sumar los domingos adicionales a la fecha final
      const fechaFinFinal = fechaFinInicial.add(domingos, "day").format("YYYY-MM-DD");

      setFieldValue("fechaFin", fechaFinFinal);
    }
  }, [values.fechaInicio, values.dias, setFieldValue]);

  return null;
}

// Actualiza el valor del monto basado en el producto seleccionado y ajusta las opciones de días
function MontoProductoUpdater({ productos }: { productos: ProductoData[] }) {
  const { values, setFieldValue } = useFormikContext<FormikValues>();

  useEffect(() => {
    const productoSeleccionado = productos.find(producto => producto.id === values.producto);
    if (productoSeleccionado) {
      if (productoSeleccionado.descripcion !== "Efectivo") {
        setFieldValue("monto", productoSeleccionado.valor);
      }

      // Cambia las opciones de días según el producto
      const opcionesDias =
        productoSeleccionado.descripcion === "Efectivo"
          ? [15, 20, 30, 40]
          : [15, 20, 30, 40, 50, 60, 70, 80, 90, 100, 120, 150];
      setFieldValue("diasOpciones", opcionesDias);
    }
  }, [productos, values.producto, setFieldValue]);

  return null;
}

const FormFieldWithModifyButton = ({ name, label, disabledInitially }: { name: string; label: string; disabledInitially?: boolean }) => {
  const [isEditable, setIsEditable] = useState(disabledInitially);
  const { values, setFieldValue } = useFormikContext<FormikValues>();

  const handleModifyClick = () => {
    setIsEditable(!isEditable);
  };

  const handleSaveClick = async () => {
    try {
      // Llamada al endpoint para modificar la cuota
      const updatedPrestamo = await modificarCuotas( values.montoCuota,values.id);
      // Actualizar los valores del préstamo con la respuesta del backend
      setFieldValue("montoAPagar", updatedPrestamo.data.total);
      setFieldValue("montoCuota", updatedPrestamo.data.montoCuota);
    } catch (error) {
      console.error("Error al modificar la cuota:", error);
    } finally {
      setIsEditable(false); // Volver a desactivar el campo después de guardar
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
              startIcon={<CircularProgress size="1rem" />} // Mostrar un spinner mientras se guarda
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
        const cliente = await getClientebyDni(Number(values.dni));
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
        const prestamo = await crearPrestamo(values.dias, values.producto, Number(values.dni), values.periodo, values.monto, values.pagoEnEfectivo, values.fechaInicio, values.fechaFin);
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
          <MontoProductoUpdater productos={productos} /> {/* Monto basado en producto */}
          
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
                  await new Promise((resolve) => setTimeout(resolve, 3000));
                  console.log("Préstamo creado con éxito", values);
                  setSubmitting(false);
                }}
              >
                <FormikStep label="Buscar Cliente">
                   <BuscarClienteStep />
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
                </FormikStep>
                <FormikStep label="Resumen del Préstamo">
                  <FormField name="dni" label="DNI del Cliente" disabled />
                  <FormField name="apellidoYnombre" label="Apellido y Nombre" disabled />
                  <FormField name="monto" label="Monto Solicitado" disabled />
                  <FormField name="montoAPagar" label="Monto Total a Pagar" disabled />
                   <FormFieldWithModifyButton name="montoCuota" label="Valor de las Cuotas" disabledInitially />
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
