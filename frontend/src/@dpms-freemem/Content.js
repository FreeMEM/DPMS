// Inicio
// src/Content.js
import React from "react";
import { Container, Box, Typography, Button } from "@mui/material";

function Content({ page }) {
  const renderContent = () => {
    switch (page) {
      case 0:
        return (
          <>
            <Typography variant="h2" component="h1" gutterBottom>
              Bienvenidos a Posadas Party
            </Typography>
            <Typography variant="h5" component="h2" gutterBottom>
              {"Disfruta de la mejor fiesta con nosotros."}
            </Typography>
            <Button variant="contained" color="primary" href="#learn-more">
              Aprende más
            </Button>
          </>
        );
      case 1:
        return <Typography variant="h5">¿QUÉ ES?</Typography>;
      case 2:
        return <Typography variant="h5">COMPETICIONES</Typography>;
      case 3:
        return <Typography variant="h5">NORMATIVA</Typography>;
      case 4:
        return <Typography variant="h5">GALERÍA</Typography>;
      case 5:
        return <Typography variant="h5">CONTACTO</Typography>;
      case 6:
        return <Typography variant="h5">REGISTRO</Typography>;
      case 7:
        return <Typography variant="h5">LOGIN</Typography>;
      default:
        return null;
    }
  };

  return (
    <Container>
      <Box sx={{ my: 4 }}>{renderContent()}</Box>
    </Container>
  );
}

export default Content;
