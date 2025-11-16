import React from "react";
import { Link } from "react-router-dom";
import { Box, Button, Typography, Paper } from "@mui/material";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { useTranslation } from "react-i18next";
import ThreeBackground from "./common/ThreeBackground";
import BackgroundToggle from "./common/BackgroundToggle";

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

const Error404 = () => {
  const { t } = useTranslation();

  return (
    <ThemeProvider theme={theme}>
      <ThreeBackground variant="user" />
      <BackgroundToggle />
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh" bgcolor="background.default" sx={{ position: 'relative', zIndex: 1 }}>
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
            {t("404 - Page Not Found")}
          </Typography>

          <Box display="flex" justifyContent="center" mb={2}>
            <Typography variant="body1" align="center">
              {t("Sorry, the page you are looking for does not exist")}
            </Typography>
          </Box>

          <Button fullWidth variant="contained" color="primary" component={Link} to="/">
            {t("Go to Home")}
          </Button>
        </Paper>
      </Box>
    </ThemeProvider>
  );
};

export default Error404;
