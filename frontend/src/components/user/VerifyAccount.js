import React, { useState, useEffect, useContext } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { AuthContext } from "../../AuthContext";
import { Box, Button, Typography, Paper } from "@mui/material";
import { useTheme } from "@mui/material/styles"; // Importar useTheme
import { useTranslation } from "react-i18next";

const VerifyAccount = () => {
  const { verifyAccount } = useContext(AuthContext);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { token } = useParams();
  const { t } = useTranslation();
  const theme = useTheme(); // Acceder al tema definido en App.js

  useEffect(() => {
    if (token) {
      verifyAccount(token)
        .then((response) => {
          if (response.status === 200) {
            console.log(response.data);
            setMessage(t("Congratulations and welcome to Posadas Party community"));
          } else {
            setError(t("Verification failed. Please try again"));
          }
        })
        .catch((error) => {
          setError(error.response?.data?.detail || t("An error occurred"));
        });
    } else {
      setError(t("Token is missing"));
    }
  }, [token, verifyAccount, t]);

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
  );
};

export default VerifyAccount;
