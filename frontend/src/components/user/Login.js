import React, { useState, useEffect, useContext } from "react";

import { useNavigate, Link } from "react-router-dom";
import { AuthContext } from "../../@dpms-freemem/AuthContext";
import { GoogleIcon } from "./CustomIcons";
import { Box, Button, TextField, Typography, Paper } from "@mui/material";
import { useTranslation } from "react-i18next";
// import Checkbox from "@mui/material/Checkbox";
import Divider from "@mui/material/Divider";
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
  const [emailError, setEmailError] = React.useState(false);
  const [emailErrorMessage, setEmailErrorMessage] = React.useState("");
  const [passwordError, setPasswordError] = React.useState(false);
  const [passwordErrorMessage, setPasswordErrorMessage] = React.useState("");
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();
  const { t } = useTranslation();
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

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

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
  const validateInputs = () => {
    const email = document.getElementById("email");
    const password = document.getElementById("password");

    let isValid = true;

    if (!email.value || !/\S+@\S+\.\S+/.test(email.value)) {
      setEmailError(true);
      setEmailErrorMessage("Please enter a valid email address.");
      isValid = false;
    } else {
      setEmailError(false);
      setEmailErrorMessage("");
    }

    if (!password.value || password.value.length < 6) {
      setPasswordError(true);
      setPasswordErrorMessage("Password must be at least 6 characters long.");
      isValid = false;
    } else {
      setPasswordError(false);
      setPasswordErrorMessage("");
    }

    return isValid;
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

          <Box
            component="form"
            onSubmit={handleSubmit}
            noValidate
            sx={{
              display: "flex",
              flexDirection: "column",
              width: "100%",
              gap: 2,
            }}
          >
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
            <Box mt={1} mb={2}>
              <Link to="/forgot-password" style={{ textDecoration: "none", color: "#FFA500" }}>
                <Typography variant="body2" align="right">
                  {t("Forgot Password?")}
                </Typography>
              </Link>
            </Box>
            <Box mt={2}>
              <Button type="submit" variant="contained" color="primary" fullWidth>
                Login
              </Button>
              <Typography sx={{ textAlign: "center" }}>
                {t("Don't have an account?")}{" "}
                <Link to="/forgot-password" style={{ textDecoration: "none", color: "#FFA500" }}>
                  {t("Sing Up")}
                </Link>
              </Typography>
            </Box>
            <Divider>or</Divider>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <Button
                type="submit"
                fullWidth
                variant="outlined"
                onClick={() => alert("Sign in with Google")}
                startIcon={<GoogleIcon />}
              >
                {t("Sign in with Google")}
              </Button>
            </Box>
          </Box>
        </Paper>
      </Box>
    </ThemeProvider>
  );
};

export default Login;
