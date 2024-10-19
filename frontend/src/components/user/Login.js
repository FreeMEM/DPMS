import React, { useState, useEffect, useContext } from "react";

import { useNavigate, Link } from "react-router-dom";
import { AuthContext } from "../../@dpms-freemem/AuthContext";
// import { GoogleIcon } from "./CustomIcons";
import ModalForgotPassword from "./ModalForgotPassword";
import { Box, Button, TextField, Typography, Paper, FormControl, FormLabel } from "@mui/material";
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
const SceneIDIcon = () => (
  <img
    src={`${process.env.PUBLIC_URL}/assets/SceneID_Icon_80x30.png`}
    alt="SceneID Logo"
    style={{ width: 65, height: 24 }}
  />
);

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [emailError, setEmailError] = useState(false);
  const [emailErrorMessage, setEmailErrorMessage] = useState("");
  const [passwordError, setPasswordError] = useState(false);
  const [passwordErrorMessage, setPasswordErrorMessage] = useState("");
  const [open, setOpen] = useState(false);
  const { login } = useContext(AuthContext);
  const [loginError, setLoginError] = useState(""); // Estado para el mensaje de error de login
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
    if (validateInputs()) {
      try {
        await login(email, password);
        navigate("/");
      } catch (error) {
        if (error.response && error.response.status === 401) {
          setLoginError("Invalid email or password. Please try again.");
        } else {
          setLoginError("An unexpected error occurred. Please try again later.");
        }
      }
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
            <FormControl>
              <FormLabel htmlFor="email">Email</FormLabel>
              <TextField
                error={emailError}
                helperText={emailErrorMessage}
                id="email"
                type="email"
                name="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                autoComplete="email"
                autoFocus
                required
                fullWidth
                variant="outlined"
                color={emailError ? "error" : "primary"}
                sx={{ ariaLabel: "email" }}
              />
            </FormControl>
            <FormControl>
              <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                <FormLabel htmlFor="password">Password</FormLabel>
                {/* <Link component="button" onClick={handleClickOpen} variant="body2" sx={{ alignSelf: "baseline" }}>
                  Forgot your password?
                </Link> */}
                <Link
                  component="button"
                  onClick={handleClickOpen}
                  variant="body2"
                  style={{ textDecoration: "none", color: "#FFA500" }}
                >
                  <Typography variant="body2" align="right">
                    {t("Forgot your Password?")}
                  </Typography>
                </Link>
              </Box>
              <TextField
                error={passwordError}
                helperText={passwordErrorMessage}
                name="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••"
                type="password"
                id="password"
                autoComplete="current-password"
                autoFocus
                required
                fullWidth
                variant="outlined"
                color={passwordError ? "error" : "primary"}
              />
            </FormControl>
            {/* <FormControlLabel control={<Checkbox value="remember" color="primary" />} label="Remember me" /> */}
            <ModalForgotPassword open={open} handleClose={handleClose} />
            {loginError && (
              <Typography color="error" variant="body2" align="center">
                {t(loginError)}
              </Typography>
            )}
            <Button type="submit" fullWidth variant="contained" onClick={validateInputs}>
              {t("Sign in")}
            </Button>

            <Box mt={2}>
              <Typography sx={{ textAlign: "center" }}>
                {t("Don't have an account?")}{" "}
                <Link to="/signup" style={{ textDecoration: "none", color: "#FFA500" }}>
                  {t("Sing Up")}
                </Link>
              </Typography>
            </Box>
          </Box>
          <Divider>or</Divider>
          <Box mt={2} sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {/* <Button
              type="submit"
              fullWidth
              variant="outlined"
              onClick={() => alert("Sign in with Google")}
              startIcon={<GoogleIcon />}
            >
              {t("Sign in with Google")}
            </Button> */}
            <Button
              type="submit"
              fullWidth
              variant="outlined"
              onClick={() => alert("Sign in with SceneID")}
              startIcon={<SceneIDIcon />}
            >
              {t("Sign in with SceneID")}
            </Button>
          </Box>
        </Paper>
      </Box>
    </ThemeProvider>
  );
};

export default Login;
