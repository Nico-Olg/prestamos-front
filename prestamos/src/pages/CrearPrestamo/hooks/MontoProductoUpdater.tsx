// components/crearPrestamo/hooks/MontoProductoUpdater.tsx
import { useEffect } from "react";
import { useFormikContext, FormikValues } from "formik";

interface ProductoData {
  id: number;
  descripcion: string;
  valor: number;
}

const MontoProductoUpdater = ({ productos }: { productos: ProductoData[] }) => {
  const { values, setFieldValue } = useFormikContext<FormikValues>();

  useEffect(() => {
    const productoSeleccionado = productos.find(p => p.id === values.producto);
    if (productoSeleccionado) {
      if (productoSeleccionado.descripcion !== "Efectivo") {
        setFieldValue("monto", productoSeleccionado.valor);
      }

      const opcionesDias =
        productoSeleccionado.descripcion === "Efectivo"
          ? [15, 20, 30, 40]
          : [15, 20, 30, 40, 50, 60, 70, 80, 90, 100, 120, 150];
      setFieldValue("diasOpciones", opcionesDias);
    }
  }, [productos, values.producto, setFieldValue]);

  return null;
};

export default MontoProductoUpdater;
