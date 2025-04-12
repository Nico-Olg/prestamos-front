
import { useEffect } from "react";
import { useFormikContext, FormikValues } from "formik";
import dayjs from "dayjs";

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

const FechaFinUpdater = () => {
  const { values, setFieldValue } = useFormikContext<FormikValues>();

  useEffect(() => {
    if (values.fechaInicio && values.dias) {
      const fechaInicio = dayjs(values.fechaInicio);
      const fechaFinInicial = fechaInicio.add(values.dias, "day");
      const domingos = contarDomingos(fechaInicio, fechaFinInicial);
      const fechaFinFinal = fechaFinInicial.add(domingos, "day").format("YYYY-MM-DD");
      setFieldValue("fechaFin", fechaFinFinal);
    }
  }, [values.fechaInicio, values.dias, setFieldValue]);

  return null;
};

export default FechaFinUpdater;