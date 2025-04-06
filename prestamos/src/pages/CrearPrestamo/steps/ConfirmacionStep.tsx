// components/crearPrestamo/steps/ConfirmacionStep.tsx
import React from "react";
import { Box, Typography } from "@mui/material";

const ConfirmacionStep: React.FC = () => {
  return (
    <Box paddingBottom={2}>
      <Typography variant="h6" color="primary">
        Préstamo creado con éxito.
      </Typography>
    </Box>
  );
};

export default ConfirmacionStep;
