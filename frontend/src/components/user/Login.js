import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../@dpms-freemem/AuthContext";
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

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  // Effect to handle shrink behavior if the browser autocompletes the inputs
  useEffect(() => {
    const emailField = document.getElementById("email-field");
    const passwordField = document.getElementById("password-field");

    // Check if fields are autocompleted by the browser
    if (emailField && emailField.value) {
      setEmail(emailField.value); // Set the email state to trigger the shrink
    }

    if (passwordField && passwordField.value) {
      setPassword(passwordField.value); // Set the password state to trigger the shrink
    }
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      await login(email, password);
      navigate("/");
    } catch (error) {
      console.error("Login failed:", error);
      // Manejar el error de login aquí
    }
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
            Login
          </Typography>
          <form onSubmit={handleSubmit}>
            <TextField
              id="email-field"
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
            <TextField
              id="password-field"
              label="Password"
              type="password"
              variant="outlined"
              fullWidth
              margin="normal"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              InputLabelProps={{
                shrink: !!password, // Force shrink if there's a value
              }}
              InputProps={{
                sx: {
                  "&:-webkit-autofill": {
                    WebkitBoxShadow: "0 0 0 1000px #333 inset",
                    WebkitTextFillColor: "#E0E0E0",
                  },
                },
              }}
              autoComplete="current-password"
            />
            <Box mt={2}>
              <Button type="submit" variant="contained" color="primary" fullWidth>
                Login
              </Button>
            </Box>
          </form>
        </Paper>
      </Box>
    </ThemeProvider>
  );
};

export default Login;
