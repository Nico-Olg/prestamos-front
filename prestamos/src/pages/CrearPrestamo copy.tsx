// import React, { useState, useEffect } from "react";
// import Header from "../components/Header";
// import Sidebar from "../components/Sidebar";
// import { Formik, Field, Form, FormikConfig, FormikValues, useFormik, useFormikContext } from "formik";
// import {
//   Box,
//   Button,
//   Card,
//   CardContent,
//   CircularProgress,
//   Grid,
//   Step,
//   StepLabel,
//   Stepper,
//   MenuItem,
//   Select,
//   InputLabel,
//   FormControl,
// } from "@mui/material";
// import { CheckboxWithLabel, TextField } from "formik-material-ui";
// import * as Yup from "yup";
// import "../styles/CrearPrestamo.css";
// import { useNavigate } from "react-router-dom";
// import { getClientebyDni, crearPrestamo, eliminarPrestamo, actualizarFechaInicio } from "../apis/postApi";
// import { getProductos } from "../apis/getApi"; // Importar las funciones getProductos, getAllClients y getPrestamosPorCliente
// import dayjs from "dayjs"; // Usaremos dayjs para manejar fechas
// import { set } from "react-datepicker/dist/date_utils";




// function FechaFinUpdater() {
//   const { values, setFieldValue } = useFormikContext<FormikValues>();

//   useEffect(() => {
//     if (values.fechaInicio && values.dias) {
//       const fechaFin = dayjs(values.fechaInicio).add(values.dias, "day").format("YYYY-MM-DD");
//       setFieldValue("fechaFin", fechaFin);
//     }
//   }, [values.fechaInicio, values.dias, setFieldValue]);

//   return null;
// }

// const sleep = (time: number) =>
//   new Promise((resolve) => setTimeout(resolve, time));

// export interface FormikStepProps
//   extends Pick<FormikConfig<FormikValues>, "children" | "validationSchema"> {
//   label: string;
// }

// export interface ClienteData {
//   dni: string;
//   apellidoYnombre: string;
//   direccionParticular: string;
//   tel: string;
//   barrioComercial: string;
//   barrioParticular: string;
//   fechaNac: string;
//   fechaAlta: string;
//   [key: string]: string | number | undefined;
// }

// export interface PrestamoData{
//   id: number;
//   total: number;
//   cantidadCuotas: number;
//   codigoProducto: number;
//   dni_cliente: number;
//   periodo_pago: string;
//   monto: number;
//   fechaInicio: string;
//   fechaFin: string;
//   pagoEnEfectivo: boolean;
//   montoCuota: number;
  
// }

// export interface ProductoData {
//   id: number;
//   descripcion: string;
//   valor: number;
// }


// export function FormikStep({ children }: FormikStepProps) {
//   return <>{children}</>;
// }

// export function FormikStepper({
//   children,
//   productos,
//   ...props
// }: FormikConfig<FormikValues> & { productos: ProductoData[] }) {
//   const childrenArray = React.Children.toArray(
//     children
//   ) as React.ReactElement<FormikStepProps>[];
//   const [step, setStep] = useState(0);
//   const currentChild = childrenArray[step];
//   const [completed, setCompleted] = useState(false);
//   const navigate = useNavigate(); // Hook para redirigir
//   const [prestamoCreado, setPrestamoCreado] = useState<number | null>(null);

 

//   function isLastStep() {
//     return step === childrenArray.length - 1;
//   }

//   return (
//     <Formik
//       {...props}
//       validationSchema={currentChild.props.validationSchema}
//       onSubmit={async (values, helpers) => {
//          if (isLastStep()) {
//           // Redirige a la página principal si es el último paso
//           navigate("/");  // Aquí redirigimos al finalizar
//           return;
//         }
//         if (step === 0) {
//           try {
//             const cliente: ClienteData = await getClientebyDni(
//               Number(values.dni)
//             );
//             const newValues = {
//               ...values,
//               nombre: cliente.apellidoYnombre,
//               direccion: cliente.direccionParticular,
//               telefono: cliente.tel,
//               barrioComercial: cliente.barrioComercial,
//               direccionComercial: cliente.direccionComercial,
//               barrioParticular: cliente.barrioParticular,
//               direccionParticular: cliente.direccionParticular,
//               fechaNac: cliente.fechaNac,
//               fechaAlta: cliente.fechaAlta,
//             };
//             helpers.setValues(newValues);
//             // setStep((s: number) => s + 1);
//           } catch (error) {
//             alert("Cliente no encontrado. Redirigiendo a alta de cliente...");
//             navigate("/alta-cliente");
//           }
//         }
//         if (step === 2) {
//           const productos = await getProductos();
//           console.log("Productos:", productos);
//           try {
//             const prestamo: PrestamoData = await crearPrestamo(
//               values.dias,
//               values.producto, // El producto seleccionado debe ser el id
//               Number(values.dni), // Utilizando el DNI como ID del cliente
//               values.periodo,
//               values.monto,
//               values.pagoEnEfectivo // Asegúrate de que este valor esté presente

//             );
//             const newValues = {
//               ...values,
//               id: prestamo.id,
//               montoAPagar: prestamo.total,
//               fechaInicio: prestamo.fechaInicio,
//               fechaFin: prestamo.fechaFin,
//               montoCuota: prestamo.montoCuota,
              
//             };
//             helpers.setValues(newValues);
//             console.log("Id del prestamo creado:", prestamo.id);
//             setCompleted(true);
//             setStep((s: number) => s + 1);
//             setPrestamoCreado(prestamo.id);
//           } catch (error) {
//             console.error("Error al crear el préstamo:", error);
//           } finally {
//             helpers.setSubmitting(false);
//           }
//         }  else if(step === 3) {
//           console.log("el id del prestamo", values.id);
//           const prestamo: PrestamoData = await actualizarFechaInicio(values.id, values.fechaInicio);
//          const newValues = {
//             fechaInicio: values.fechaInicio,
//             fechaFin: dayjs(values.fechaInicio).add(values.dias, "day").format("YYYY-MM-DD"),
//          };
//           helpers.setValues(newValues);
//           setStep((s: number) => s + 1);

//         }
//          else {
//           setStep((s: number) => s + 1);
//           helpers.setTouched({});
//         }
//       }}
//     >
//       {({ isSubmitting, values }) => (
//         <Form autoComplete="off">
//           <FechaFinUpdater />
//           <Stepper alternativeLabel activeStep={step}>
//             {childrenArray.map((child, index) => (
//               <Step
//                 key={child.props.label}
//                 completed={step > index || completed}
//               >
//                 <StepLabel>{child.props.label}</StepLabel>
//               </Step>
//             ))}
//           </Stepper>
 
//           {currentChild}

//           <Grid container spacing={2}>
//             {step > 0 ? (
//               <Grid item>
//                 <Button
//                   className="btn"
//                   disabled={isSubmitting}
//                   onClick={async () =>{
//                     if(step === 3 && prestamoCreado){
//                       await eliminarPrestamo(prestamoCreado);
//                       setPrestamoCreado(null);
//                     }
//                     setStep((s) => s - 1);
//                   }}
//                 >
//                   Volver
//                 </Button>
//               </Grid>
//             ) : null}
//             <Grid item>
//               <Button
//                 className="btn"
//                 startIcon={
//                   isSubmitting ? <CircularProgress size="1rem" /> : null
//                 }
//                 disabled={isSubmitting}
//                 type="submit"
//               >
//                 {isSubmitting
//                   ? "Creando"
//                   : isLastStep()
//                   ? "Finalizar"
//                   : "Siguiente"}
//               </Button>
//             </Grid>
//           </Grid>
//         </Form>
//       )}
//     </Formik>
//   );
// }

// export default function CrearPrestamo() {
//   const navigate = useNavigate();
//   const initialValues = {
//     dni: "",
//     nombre: "",
//     apellido: "",
//     direccion: "",
//     telefono: "",
//     producto: "",
//     monto: 0,
//     periodo: "",
//     dias: 0,
//     resumen: "",
//      fechaInicio: dayjs().format("YYYY-MM-DD"), // Fecha inicial predeterminada (hoy)
//     fechaFin: "", // Calcularemos la fecha de finalización
//   };
//   const periodos = [
//     {key : "Diario", value: "Diario"},
//     {key : "Semanal", value: "Semanal"},
//     {key : "Quincenal", value: "Quincenal"},
//     {key : "Mensual", value: "Mensual"},
//   ];

//   // Estado para almacenar los productos obtenidos desde la API
//   const [productos, setProductos] = useState<ProductoData[]>([]); // Inicializado como array vacío

//   // useEffect para obtener los productos al cargar el componente
//   useEffect(() => {
//     const fetchProductos = async () => {
//       try {
//         const response = await getProductos();
//         setProductos(response);
//       } catch (error) {
//         console.error("Error al obtener los productos:", error);
//       }
//     };

//     if (productos.length === 0) {
//       fetchProductos();
//     }
//   }, [productos]);

//   return (
//     <div className="crear-prestamo-page">
//       <Header title="Crear Prestamo" />
//       <div className="content">
//         <Sidebar />
//         <div className="form-container">
//           <Card>
//             <CardContent>
//               <FormikStepper
//                 initialValues={initialValues}
//                 productos={productos} // Pasar los productos como prop
//                 onSubmit={async (values, { setSubmitting }) => {
//                   await sleep(3000);
//                   console.log("Préstamo creado con éxito", values);
//                   setSubmitting(false);
//                 }}
//               >
//                 {/************************** Step 1************************************/}
//                 <FormikStep label="Buscar Cliente">
//                   <Box paddingBottom={2}>
//                     <Field
//                       fullWidth
//                       name="dni"
//                       component={TextField}
//                       label="DNI del Cliente"
//                     />
//                   </Box>
//                 </FormikStep>
//                 {/************************** Step 2************************************/}
//                 <FormikStep label="Datos del Cliente">
//                   <Box paddingBottom={2}>
//                     <Field
//                       fullWidth
//                       name="dni"
//                       component={TextField}
//                       label="DNI del Cliente"
//                     />
//                   </Box>
//                   <Box paddingBottom={2}>
//                     <Field
//                       fullWidth
//                       name="nombre"
//                       component={TextField}
//                       label="Apellido y Nombre"
//                     />
//                   </Box>
//                   <Box paddingBottom={2}>
//                     <Field
//                       fullWidth
//                       name="fechaNac"
//                       component={TextField}
//                       label="Fecha de Nacimiento"
//                       InputLabelProps={{ shrink: true }}
//                     />
//                   </Box>
//                   <Box paddingBottom={2}>
//                     <Field
//                       fullWidth
//                       name="direccionComercial"
//                       component={TextField}
//                       label="Dirección Comercial"
//                     />
//                   </Box>
//                   <Box paddingBottom={2}>
//                     <Field
//                       fullWidth
//                       name="barrioComercial"
//                       component={TextField}
//                       label="Barrio Comercial"
//                     />
//                   </Box>
//                   <Box paddingBottom={2}>
//                     <Field
//                       fullWidth
//                       name="direccionParticular"
//                       component={TextField}
//                       label="Dirección Particular" 
//                     />
//                   </Box>
//                   <Box paddingBottom={2}>
//                     <Field
//                       fullWidth
//                       name="barrioParticular"
//                       component={TextField}
//                       label="Barrio Particular"
//                     />
//                   </Box>
//                   <Box paddingBottom={2}>
//                     <Field
//                       fullWidth
//                       name="tel"
//                       component={TextField}
//                       label="Teléfono"
//                     />
//                   </Box>
//                   <Box paddingBottom={2}>
//                     <Field
//                       fullWidth
//                       name="fechaAlta"
//                       component={TextField}
//                       label="Fecha de Alta"
//                       InputLabelProps={{ shrink: true }}
//                     />
//                   </Box>
//                 </FormikStep>
//                 {/************************** Step 3************************************/}
//                 <FormikStep
//                   label="Datos del Préstamo"
//                   validationSchema={Yup.object({
//                     monto: Yup.number().required("El monto es obligatorio"),
//                     periodo: Yup.string().required(
//                       "El periodo de pago es obligatorio"
//                     ),
//                     dias: Yup.number()
//                       .required("La cantidad de días es obligatoria")
//                       .min(1, "Debe ser al menos 1 día"),
//                   })}
//                 >
//                   <Box paddingBottom={2}>
//                     <Field
//                       name="producto"
//                       as={Select}
//                       label="Producto"
//                       labelId="producto-label"
//                       fullWidth
//                     >
//                       {productos.length > 0 ? (
//                         productos.map((producto: ProductoData) => (
//                           <MenuItem key={producto.id} value={producto.id}>
//                             {producto.descripcion}
//                           </MenuItem>
//                         ))
//                       ) : (
//                         <MenuItem disabled>
//                           No hay productos disponibles
//                         </MenuItem>
//                       )}
//                     </Field>
//                   </Box>

//                   <Box paddingBottom={2}>
//                     <Field
//                       fullWidth
//                       name="monto"
//                       type="number"
//                       component={TextField}
//                       label="Monto Solicitado"
//                     />
//                   </Box>
//                   <Box paddingBottom={2}>
//                     <Field
//                       fullWidth
//                       name="periodo"
//                       as={Select}
//                       label="Periodo de Pago (Diario, Semanal, etc.)"
//                     >
//                       {periodos.map((periodo) => (
//                         <MenuItem key={periodo.key} value={periodo.value}>
//                           {periodo.value}
//                         </MenuItem>
//                       ))}
//                     </Field>
//                   </Box>
//                   <Box paddingBottom={2}>
//                     <Field
//                       fullWidth
//                       name="dias"
//                       type="number"
//                       component={TextField}
//                       label="Cantidad de Días del Préstamo"
//                     />
//                   </Box>
//                   <Box paddingBottom={2}>
//                     <Field
//                       name="pagoEnEfectivo"
//                       type="checkbox"
//                       component={CheckboxWithLabel}
//                       Label={{ label: "Paga en Efectivo" }}
//                       value={undefined}
//                     />
//                   </Box>
//                 </FormikStep>
//                 {/***************** Step 4*********************************** */}
//                 <FormikStep label="Resumen del Préstamo">
//                   <Box paddingBottom={2}>
//                     <Field
//                       fullWidth
//                       name="dni"
//                       component={TextField}
//                       label="DNI del Cliente"
//                       disabled
//                     />
//                   </Box>
//                   <Box paddingBottom={2}>
//                     <Field
//                       fullWidth
//                       name="nombre"
//                       component={TextField}
//                       label="Apellido y Nombre"
//                       disabled
//                     />
//                   </Box>
//                   <Box paddingBottom={2}>
//                     <Field
//                       fullWidth
//                       name="producto"
//                       as={Select}
//                       label="Producto"
//                       labelId="producto-label"
//                       disabled
//                     >
//                       {productos.length > 0 ? (
//                         productos.map((producto: ProductoData) => (
//                           <MenuItem
//                             key={producto.id}
//                             value={producto.id}
//                           >
//                             {producto.descripcion}
//                           </MenuItem>
//                         ))
//                       ) : (
//                         <MenuItem disabled>
//                           No hay productos disponibles
//                         </MenuItem>
//                       )}
//                     </Field>
//                   </Box>
//                   <Box paddingBottom={2}>
//                     <Field
//                       fullWidth
//                       name="monto"
//                       type="number"
//                       component={TextField}
//                       label="Monto Solicitado"
//                       disabled
//                     />
//                   </Box>
//                   <Box paddingBottom={2}>
//                     <Field
//                       fullWidth
//                       name="montoAPagar"
//                       type="number"
//                       component={TextField}
//                       label="Monto Total a Pagar"
//                       disabled
//                     />
//                   </Box>
//                   <Box paddingBottom={2}>
//                     <Field
//                       fullWidth
//                       name="montoCuota"
//                       type="number"
//                       component={TextField}
//                       label="Valor de las Cuotas"
//                       disabled
//                     />
//                   </Box>
                  
//                   <Box paddingBottom={2}>
//                     <Field
//                       fullWidth
//                       name="dias"
//                       type="number"
//                       component={TextField}
//                       label="Cantidad de Días del Préstamo"
//                       disabled
//                     />
//                   </Box>
//                   <Box paddingBottom={2}>
//                     <Field
//                       fullWidth
//                       name="fechaInicio"
//                       type="date"
//                       component={TextField}
//                       label="Fecha Inicio"
                      
//                     />
//                   </Box>
//                   <Box paddingBottom={2}>
//                     <Field
//                       fullWidth
//                       name="fechaFin"
//                       type="string"
//                       component={TextField}
//                       label="Fecha Fin"
//                     />
//                   </Box>
//                 </FormikStep>

//                 <FormikStep label="Confirmación">
//                   <Box paddingBottom={2}>
//                     <p>Préstamo creado con éxito.</p>
//                   </Box>
//                 </FormikStep>
//               </FormikStepper>
//             </CardContent>
//           </Card>
//         </div>
//       </div>
//     </div>
//   );
// }
