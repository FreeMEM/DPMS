import React, { useState } from "react";
import { Box, Button, TextField, Typography, Paper } from "@mui/material";
import { createTheme, ThemeProvider } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    mode: "dark",
    primary: {
      main: "#FFA500",
    },
    background: {
      default: "#121212",
    },
    text: {
      primary: "#FFFFFF",
    },
  },
});

const ForgotPassword = () => {
  const [email, setEmail] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();
    // Aquí puedes manejar la lógica para enviar el correo de recuperación de contraseña
    console.log("Email enviado para recuperación de contraseña:", email);
  };

  return (
    <ThemeProvider theme={theme}>
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh" bgcolor="background.default">
        <Paper
          elevation={3}
          sx={{
            padding: 4,
            maxWidth: 400,
            width: "100%",
            margin: { xs: 2, sm: 3 }, // Márgenes laterales en pantallas pequeñas
          }}
        >
          <Box display="flex" justifyContent="center" mb={2}>
            <img
              src={`${process.env.PUBLIC_URL}/assets/logo_navbar2024.png`}
              alt="Posadas Party Logo"
              style={{ height: 80 }}
            />
          </Box>
          <Typography variant="h5" align="center" gutterBottom>
            Forgot Password
          </Typography>
          <form onSubmit={handleSubmit}>
            <TextField
              label="Email"
              variant="outlined"
              fullWidth
              margin="normal"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              InputLabelProps={{
                shrink: !!email, // Force shrink if there's a value
              }}
              InputProps={{
                sx: {
                  "&:-webkit-autofill": {
                    WebkitBoxShadow: "0 0 0 1000px #333 inset",
                    WebkitTextFillColor: "#E0E0E0",
                  },
                },
              }}
              autoComplete="email"
            />
            <Box mt={2}>
              <Button type="submit" variant="contained" color="primary" fullWidth>
                Send
              </Button>
            </Box>
          </form>
        </Paper>
      </Box>
    </ThemeProvider>
  );
};

export default ForgotPassword;
