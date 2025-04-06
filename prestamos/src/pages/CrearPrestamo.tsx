// CrearPrestamo.tsx (componente principal)
import React, { useEffect, useState } from "react";
import Header from "../components/Header";
import Sidebar from "../components/Sidebar";
import { getProductos } from "../apis/getApi";
import dayjs from "dayjs";
import FormikStepper from "./CrearPrestamo/FormikStepper";
import BuscarClienteStep from "./CrearPrestamo/steps/ClienteStep";
import ClienteStep from "./CrearPrestamo/steps/ClienteStep";
import PrestamoStep from "./CrearPrestamo/steps/PrestamoStep";
import ResumenStep from "./CrearPrestamo/steps/ResumenStep";
import ConfirmacionStep from "./CrearPrestamo/steps/ConfirmacionStep";
// import "../styles/CrearPrestamo.css";

export default function CrearPrestamo() {
  const [productos, setProductos] = useState([]);
  const [ready, setReady] = useState(false);

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

  useEffect(() => {
    const fetchProductos = async () => {
      try {
        const response = await getProductos();
        setProductos(response);
      } catch (error) {
        console.error("Error al obtener los productos:", error);
      } finally {
        setReady(true);
      }
    };

    fetchProductos();
  }, []);

  return (
    <div className="crear-prestamo-page">
      <Header title="Crear Prestamo" />
      <div className="content">
        <Sidebar />
        <div className="form-container">
          {ready && (
            <FormikStepper
              initialValues={initialValues}
              productos={productos}
              onSubmit={(values) => {
                console.log("Form submitted with values:", values);
              }}
              steps={[
                { label: "Buscar Cliente", component: <BuscarClienteStep /> },
                { label: "Datos del Cliente", component: <ClienteStep /> },
                { label: "Datos del Préstamo", component: <PrestamoStep productos={productos} /> },
                { label: "Resumen del Préstamo", component: <ResumenStep /> },
                { label: "Confirmación", component: <ConfirmacionStep /> },
              ]}
            />
          )}
        </div>
      </div>
    </div>
  );
}
