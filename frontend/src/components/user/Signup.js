import React, { useState, useContext } from "react";
import { useNavigate, Link } from "react-router-dom";
import { AuthContext } from "../../@dpms-freemem/AuthContext";
import { Box, Button, TextField, Typography, Paper, FormControl, FormLabel } from "@mui/material";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { useTranslation } from "react-i18next";

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

const Signup = () => {
  const [email, setEmail] = useState("");
  const [nickname, setNickname] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [group, setGroup] = useState(""); // Nuevo campo para group
  const [emailError, setEmailError] = useState(false);
  const [emailErrorMessage, setEmailErrorMessage] = useState("");
  const [passwordError, setPasswordError] = useState(false);
  const [passwordErrorMessage, setPasswordErrorMessage] = useState("");
  const [passwordConfirmationError, setPasswordConfirmationError] = useState(false);
  const [passwordConfirmationErrorMessage, setPasswordConfirmationErrorMessage] = useState("");
  const [registrationError, setRegistrationError] = useState("");
  const { signup } = useContext(AuthContext);
  const navigate = useNavigate();
  const { t } = useTranslation();

  const handleSignup = async (e) => {
    e.preventDefault();
    if (validateInputs()) {
      try {
        await signup({
          email,
          nickname,
          password,
          password_confirmation: passwordConfirmation,
          first_name: firstName,
          last_name: lastName,
          group, // Incluyendo el campo group en el post
        });
        navigate("/login");
      } catch (error) {
        setRegistrationError("Registration failed. Please try again.");
      }
    }
  };

  const validateInputs = () => {
    let isValid = true;

    if (!email || !/\S+@\S+\.\S+/.test(email)) {
      setEmailError(true);
      setEmailErrorMessage("Please enter a valid email address.");
      isValid = false;
    } else {
      setEmailError(false);
      setEmailErrorMessage("");
    }

    if (!password || password.length < 6) {
      setPasswordError(true);
      setPasswordErrorMessage("Password must be at least 6 characters long.");
      isValid = false;
    } else {
      setPasswordError(false);
      setPasswordErrorMessage("");
    }

    if (password !== passwordConfirmation) {
      setPasswordConfirmationError(true);
      setPasswordConfirmationErrorMessage("Passwords do not match.");
      isValid = false;
    } else {
      setPasswordConfirmationError(false);
      setPasswordConfirmationErrorMessage("");
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
            maxWidth: 400, // Ajuste de ancho máximo igual al de Login
            width: "100%", // Asegura que el formulario se ajuste al ancho del contenedor
            margin: { xs: 2, sm: 3 }, // Márgenes laterales, igual al de Login
          }}
        >
          <Typography variant="h5" align="center" gutterBottom>
            {t("Sign Up")}
          </Typography>

          <Box
            component="form"
            onSubmit={handleSignup}
            noValidate
            sx={{
              display: "flex",
              flexDirection: "column",
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
                placeholder={t("Enter your email")}
                autoComplete="email"
                autoFocus
                required
                fullWidth
                variant="outlined"
              />
            </FormControl>

            <FormControl>
              <FormLabel htmlFor="nickname">{t("Nickname")}</FormLabel>
              <TextField
                id="nickname"
                type="text"
                name="nickname"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                placeholder={t("Enter your nickname")}
                required
                fullWidth
                variant="outlined"
              />
            </FormControl>

            <FormControl>
              <FormLabel htmlFor="firstName">{t("First Name")}</FormLabel>
              <TextField
                id="firstName"
                type="text"
                name="firstName"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder={t("Enter your first name")}
                required
                fullWidth
                variant="outlined"
              />
            </FormControl>

            <FormControl>
              <FormLabel htmlFor="lastName">{t("Last Name")}</FormLabel>
              <TextField
                id="lastName"
                type="text"
                name="lastName"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder={t("Enter your last name")}
                required
                fullWidth
                variant="outlined"
              />
            </FormControl>

            <FormControl>
              <FormLabel htmlFor="group">{t("Group")}</FormLabel>
              <TextField
                id="group"
                type="text"
                name="group"
                value={group}
                onChange={(e) => setGroup(e.target.value)}
                placeholder={t("Enter your group")}
                required
                fullWidth
                variant="outlined"
              />
            </FormControl>

            <FormControl>
              <FormLabel htmlFor="password">{t("Password")}</FormLabel>
              <TextField
                error={passwordError}
                helperText={passwordErrorMessage}
                id="password"
                type="password"
                name="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={t("Enter your password")}
                autoComplete="new-password"
                required
                fullWidth
                variant="outlined"
              />
            </FormControl>

            <FormControl>
              <FormLabel htmlFor="passwordConfirmation">{t("Confirm Password")}</FormLabel>
              <TextField
                error={passwordConfirmationError}
                helperText={passwordConfirmationErrorMessage}
                id="passwordConfirmation"
                type="password"
                name="passwordConfirmation"
                value={passwordConfirmation}
                onChange={(e) => setPasswordConfirmation(e.target.value)}
                placeholder={t("Confirm your password")}
                required
                fullWidth
                variant="outlined"
              />
            </FormControl>

            {registrationError && (
              <Typography color="error" variant="body2" align="center">
                {t(registrationError)}
              </Typography>
            )}

            <Button type="submit" fullWidth variant="contained">
              {t("Sign Up")}
            </Button>

            <Box mt={2}>
              <Typography sx={{ textAlign: "center" }}>
                {t("Already have an account?")}{" "}
                <Link to="/login" style={{ textDecoration: "none", color: "#FFA500" }}>
                  {t("Sign In")}
                </Link>
              </Typography>
            </Box>
          </Box>
        </Paper>
      </Box>
    </ThemeProvider>
  );
};

export default Signup;
