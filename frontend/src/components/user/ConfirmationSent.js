import React from "react";
import { useNavigate } from "react-router-dom"; // Hook para redireccionar
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

const ConfirmationSent = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

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
            {t("Registration Complete")}
          </Typography>

          <Box display="flex" justifyContent="center" mb={2}>
            <Typography variant="body1" align="center">
              {t(
                "A confirmation email has been sent to your email address. Please check your inbox to verify your account"
              )}
            </Typography>
          </Box>

          <Button fullWidth variant="contained" color="primary" onClick={() => navigate("/login")}>
            {t("Go to Login")}
          </Button>
        </Paper>
      </Box>
    </ThemeProvider>
  );
};

export default ConfirmationSent;
