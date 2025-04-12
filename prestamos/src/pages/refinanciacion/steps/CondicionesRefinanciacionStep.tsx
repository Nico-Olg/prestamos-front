import { useEffect } from "react";
import { useFormikContext, Field } from "formik";
import { Box, Grid } from "@mui/material";
import { TextField } from "formik-material-ui";
import dayjs from "dayjs";
import { Prestamo } from "../../../interfaces/Prestamo";

const CondicionesRefinanciacionStep = () => {
  const { values, setFieldValue } = useFormikContext<any>();

  // Función para contar domingos entre dos fechas
  const contarDomingos = (fechaInicio: dayjs.Dayjs, fechaFin: dayjs.Dayjs) => {
    let domingos = 0;
    let fechaActual = fechaInicio;

    while (fechaActual.isBefore(fechaFin)) {
      if (fechaActual.day() === 0) {
        domingos += 1;
      }
      fechaActual = fechaActual.add(1, "day");
    }

    return domingos;
  };
  useEffect(() => {
    if (values.fechaInicio && values.cuotas > 0) {
      const fechaInicio = dayjs(values.fechaInicio);
      const fechaFinInicial = fechaInicio.add(values.cuotas, "day");
      const domingos = contarDomingos(fechaInicio, fechaFinInicial);
      const fechaFinal = fechaFinInicial
        .add(domingos, "day")
        .format("YYYY-MM-DD");

      setFieldValue("fechaFin", fechaFinal);
    }
  }, [values.fechaInicio, values.cuotas, setFieldValue]);

  useEffect(() => {
    const prestamos: Prestamo[] = values.prestamosCliente || [];
    const seleccionados: number[] = values.prestamosSeleccionados || [];

    if (seleccionados.length > 0 && prestamos.length > 0) {
      const prestamosSeleccionados = prestamos.filter((p) =>
        seleccionados.includes(Number(p.idPrestamo))
      );
      console.log("prestamos seleccionados", prestamosSeleccionados);

      const total = prestamosSeleccionados.reduce((acc, prestamo) => {
        const pagado = (prestamo.cuotasPagadas ?? 0) * prestamo.montoCuota;
        const saldo = prestamo.montoPrestamo - pagado;
        return acc + saldo;
      }, 0);
      console.log("total", total);
      setFieldValue("totalConInteres", total.toFixed(2));
    }
  }, [values.prestamosSeleccionados, values.prestamosCliente, setFieldValue]);

  useEffect(() => {
    const total = Number(values.totalRefinanciado);
    const interes = Number(values.interes);

    if (!isNaN(total) && !isNaN(interes)) {
      const interesDecimal = interes / 100;
      const montoConInteres = total * (1 + interesDecimal);
      setFieldValue("totalConInteres", montoConInteres.toFixed(2));
    }
  }, [values.interes, values.totalRefinanciado, setFieldValue]);

  return (
    <Box padding={2}>
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6}>
          <Field
            name="cuotas"
            component={TextField}
            label="Cantidad de Cuotas"
            type="number"
            fullWidth
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <Field
            name="montoCuota"
            component={TextField}
            label="Monto de Cutoa"
            type="number"
            fullWidth
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <Field
            name="fechaInicio"
            component={TextField}
            type="date"
            label="Fecha de Inicio"
            InputLabelProps={{ shrink: true }}
            fullWidth
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <Field
            name="fechaFin"
            component={TextField}
            type="text"
            label="Fecha de Finalización"
            disabled
            fullWidth
          />
        </Grid>
        <Grid item xs={12}>
          <Field
            name="totalConInteres"
            component={TextField}
            type="text"
            label="Total a Refinanciar con Interés"
            disabled
            fullWidth
          />
        </Grid>
      </Grid>
    </Box>
  );
};

export default CondicionesRefinanciacionStep;
