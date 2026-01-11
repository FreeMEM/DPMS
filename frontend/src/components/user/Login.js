import React, { useState, useEffect, useContext } from "react";
import { useNavigate, Link } from "react-router-dom";
import { AuthContext } from "../../AuthContext";
import ModalForgotPassword from "./ModalForgotPassword";
import { Box, Button, TextField, Typography, Paper, FormControl, FormLabel, Divider } from "@mui/material";
import { useTranslation } from "react-i18next";
import { useTheme } from "@mui/material/styles";
import axios from "axios";

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
  const [loginError, setLoginError] = useState("");
  const [edition, setEdition] = useState(null);
  const [editionLoaded, setEditionLoaded] = useState(false);
  const navigate = useNavigate();
  const { t } = useTranslation();
  const theme = useTheme();

  // Cargar edición actual
  useEffect(() => {
    const fetchCurrentEdition = async () => {
      try {
        const response = await axios.get('/api/editions/current/');
        setEdition(response.data);
      } catch (error) {
        // No hay edición actual o error
        setEdition(null);
      } finally {
        setEditionLoaded(true);
      }
    };
    fetchCurrentEdition();
  }, []);

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
        console.error("Login failed", error);
        if (error.response && error.response.status === 401) {
          setLoginError("Invalid email or password. Please try again.");
        } else {
          setLoginError("An unexpected error occurred. Please try again later.");
        }
      }
    }
  };

  const validateInputs = () => {
    const emailInput = document.getElementById("email");
    const passwordInput = document.getElementById("password");

    let isValid = true;

    if (!emailInput.value || !/\S+@\S+\.\S+/.test(emailInput.value)) {
      setEmailError(true);
      setEmailErrorMessage("Please enter a valid email address.");
      isValid = false;
    } else {
      setEmailError(false);
      setEmailErrorMessage("");
    }

    if (!passwordInput.value || passwordInput.value.length < 6) {
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
    <Box
      display="flex"
      justifyContent="center"
      alignItems="center"
      minHeight="100vh"
      bgcolor={theme.palette.background.default} // Usar el color de fondo del tema
    >
      <Paper
        elevation={3}
        sx={{
          padding: 4,
          maxWidth: 400,
          width: "100%",
          margin: { xs: 2, sm: 3 },
          backgroundColor: theme.palette.background.paper, // Fondo del Paper
          color: theme.palette.text.primary, // Color del texto
        }}
      >
        <Box display="flex" justifyContent="center" alignItems="center" mb={2} sx={{ minHeight: 120 }}>
          {editionLoaded && edition?.logo ? (
            <img
              src={edition.logo}
              alt={edition.title || "Logo"}
              style={{
                maxHeight: 120,
                maxWidth: '100%',
                objectFit: 'contain',
                filter: edition.logo_border_width > 0
                  ? `drop-shadow(0 0 ${edition.logo_border_width}px ${edition.logo_border_color || '#00ff00'})`
                  : 'none',
              }}
            />
          ) : editionLoaded && edition?.title ? (
            <Typography variant="h3" align="center" color="primary" fontWeight={700}>
              {edition.title}
            </Typography>
          ) : editionLoaded ? (
            <Typography variant="h3" align="center" color="primary" fontWeight={700}>
              DPMS
            </Typography>
          ) : null}
        </Box>
        <Typography variant="h5" align="center" gutterBottom>
          {t("Login")}
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
            <FormLabel htmlFor="email">{t("Email")}</FormLabel>
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
              <FormLabel htmlFor="password">{t("Password")}</FormLabel>
              <Link
                component="button"
                onClick={handleClickOpen}
                variant="body2"
                style={{ textDecoration: "none", color: theme.palette.primary.main }}
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
              required
              fullWidth
              variant="outlined"
              color={passwordError ? "error" : "primary"}
            />
          </FormControl>
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
              <Link to="/signup" style={{ textDecoration: "none", color: theme.palette.primary.main }}>
                {t("Sign Up")}
              </Link>
            </Typography>
          </Box>
        </Box>
        <Divider>{t("or")}</Divider>
        <Box mt={2} sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <Button
            type="button"
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
  );
};

export default Login;
