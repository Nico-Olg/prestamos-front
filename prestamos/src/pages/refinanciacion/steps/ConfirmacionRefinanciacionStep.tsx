import { useFormikContext } from "formik";
import { Box, Typography, Button, Grid } from "@mui/material";
import { refinanciarPrestamos } from "../../../apis/postApi";
import { useNavigate } from "react-router-dom";
import useAlert from "../../../hooks/useAlert";

const ConfirmacionRefinanciacionStep = () => {
  const { values } = useFormikContext<any>();
  const navigate = useNavigate();
  const { showSuccess, showError } = useAlert();

  const handleConfirmar = async () => {
    try {
      const payload = {
        idsPrestamos: values.prestamosSeleccionados,
        fechaInicio: values.fechaInicio,
        fechaFin: values.fechaFin,
        interes: values.interes,
        cuotas: values.cuotas,
        clienteID: values.cliente.id,
        periodo_pago: values.periodo_pago || "Diario",
      };

      await refinanciarPrestamos(payload);
      showSuccess(
        "Refinanciación exitosa",
        "El préstamo fue refinanciado correctamente.",
        () => {
          navigate("/clientes");
        }
      );
    } catch (error) {
      console.error("Error al refinanciar:", error);
      showError(
        "Error",
        "Ocurrió un problema al intentar refinanciar los préstamos."
      );
    }
  };

  return (
    <Box padding={3}>
      <Typography variant="h6" gutterBottom>
        Confirmación de la Refinanciación
      </Typography>

      <Typography variant="body1" gutterBottom>
        Cliente: <strong>{values.cliente?.apellidoYnombre}</strong>
      </Typography>
      <Typography variant="body1" gutterBottom>
        Cantidad de préstamos seleccionados:{" "}
        <strong>{values.prestamosSeleccionados?.length}</strong>
      </Typography>
      <Typography variant="body1" gutterBottom>
        Total a refinanciar: <strong>${values.totalRefinanciado}</strong>
      </Typography>
      <Typography variant="body1" gutterBottom>
        Interés: <strong>{values.interes}</strong>
      </Typography>
      <Typography variant="body1" gutterBottom>
        Total con interés: <strong>${values.totalConInteres}</strong>
      </Typography>
      <Typography variant="body1" gutterBottom>
        Cuotas: <strong>{values.cuotas}</strong>
      </Typography>
      <Typography variant="body1" gutterBottom>
        Fecha de inicio: <strong>{values.fechaInicio}</strong>
      </Typography>
      <Typography variant="body1" gutterBottom>
        Fecha fin: <strong>{values.fechaFin}</strong>
      </Typography>

      <Grid container spacing={2} marginTop={2}>
        <Grid item>
          <Button variant="contained" color="primary" onClick={handleConfirmar}>
            Confirmar y Crear
          </Button>
        </Grid>
      </Grid>
    </Box>
  );
};

export default ConfirmacionRefinanciacionStep;
