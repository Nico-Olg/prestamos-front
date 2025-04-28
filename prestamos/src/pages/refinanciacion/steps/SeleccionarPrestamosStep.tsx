import React, { useEffect, useState } from "react";
import { Checkbox, FormControlLabel, Box, Typography, Grid, Paper } from "@mui/material";
import { useFormikContext } from "formik";
import { Prestamo } from "../../../interfaces/Prestamo";
import { getPrestamosPorClienteParaRefinanciar } from "../../../apis/postApi";

const SeleccionarPrestamosStep: React.FC = () => {
  const { values, setFieldValue } = useFormikContext<any>();
  const [prestamos, setPrestamos] = useState<Prestamo[]>([]);

  useEffect(() => {
    const fetchPrestamos = async () => {
      if (!values.cliente?.dni) return;

      try {
        const data = await getPrestamosPorClienteParaRefinanciar(values.cliente.dni);
        setPrestamos(data);
        setFieldValue("prestamosCliente", data);
      } catch (error) {
        console.error("Error al obtener préstamos del cliente", error);
      }
    };

    fetchPrestamos();
  }, [values.cliente]);

  const handleCheckboxChange = (prestamoId: number) => {
    const seleccionados = values.prestamosSeleccionados || [];
    const nuevosSeleccionados = seleccionados.includes(prestamoId)
      ? seleccionados.filter((id: number) => id !== prestamoId)
      : [...seleccionados, prestamoId];

    setFieldValue("prestamosSeleccionados", nuevosSeleccionados);
  };

  const calcularSaldo = (prestamo: Prestamo) => {
    const cuotasPagadas = prestamo.cuotasPagadas || 0;
    return (
      Number(prestamo.montoPrestamo) - Number(prestamo.montoCuota) * cuotasPagadas
    ).toFixed(2);
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Seleccioná los préstamos a refinanciar:
      </Typography>

      <Grid container spacing={2}>
        {prestamos.map((prestamo) => (
          <Grid item xs={12} md={6} key={prestamo.idPrestamo}>
            <Paper elevation={2} style={{ padding: 16 }}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={values.prestamosSeleccionados?.includes(prestamo.idPrestamo)}
                    onChange={() => handleCheckboxChange(prestamo.idPrestamo)}
                  />
                }
                label={`#${prestamo.idPrestamo} - ${prestamo.tipoPlan} - ${prestamo.producto}`}
              />
              <Typography variant="body2">
                Total: ${prestamo.montoPrestamo} | Cuotas pagadas: {prestamo.cuotasPagadas} | Saldo: ${calcularSaldo(prestamo)}
              </Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default SeleccionarPrestamosStep;
