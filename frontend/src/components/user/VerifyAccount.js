import React, { useState, useEffect, useContext } from "react";
import { useNavigate, useParams } from "react-router-dom"; // Importa useParams
import { AuthContext } from "../../AuthContext"; // Importa el contexto de autenticación
import { Box, Button, Typography, Paper } from "@mui/material";
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

const VerifyAccount = () => {
  const { verifyAccount } = useContext(AuthContext); // Usar AuthContext para manejar la verificación
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { token } = useParams(); // Extrae el token de la URL
  const { t } = useTranslation();

  useEffect(() => {
    if (token) {
      verifyAccount(token)
        .then((response) => {
          if (response.status === 200) {
            console.log(response.data);
            setMessage(t(`Congratulations and welcome to Posadas Party community`));
            // Aquí podrías guardar el usuario en el estado global si lo necesitas
          } else {
            setError(t("Verification failed. Please try again"));
          }
        })
        .catch((error) => {
          setError(error.response?.data?.detail || t("An error occurred"));
        });
    } else {
      setError("Token is missing");
    }
  }, [token, verifyAccount, t]);

  return (
    <ThemeProvider theme={theme}>
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh" bgcolor="background.default">
        <Paper
          elevation={3}
          sx={{
            padding: 4,
            maxWidth: 400,
            width: "100%",
            margin: { xs: 2, sm: 3 },
          }}
        >
          <Box display="flex" justifyContent="center" mb={2}>
            <img
              src={`${process.env.PUBLIC_URL}/assets/logo_pp_192.png`}
              alt="Posadas Party Logo"
              style={{ height: 192 }}
            />
          </Box>
          <Typography variant="h5" align="center" gutterBottom>
            {t("Account Verification")}
          </Typography>

          <Box display="flex" justifyContent="center" mb={2}>
            <Typography variant="body1" align="center">
              {message || error || t("Please wait while we verify your account")}
            </Typography>
          </Box>

          {message && (
            <Button fullWidth variant="contained" color="primary" onClick={() => navigate("/login")}>
              {t("Sign in")}
            </Button>
          )}
        </Paper>
      </Box>
    </ThemeProvider>
  );
};

export default VerifyAccount;
