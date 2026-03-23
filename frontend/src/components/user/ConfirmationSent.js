import React from "react";
import { useNavigate } from "react-router-dom";
import { Box, Button, Typography, Paper } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { useTranslation } from "react-i18next";
import EditionLogo from "../common/EditionLogo";

const ConfirmationSent = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const theme = useTheme();

  return (
    <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh" bgcolor={theme.palette.background.default}>
      <Paper
        elevation={3}
        sx={{
          padding: 4,
          maxWidth: 400,
          width: "100%",
          margin: { xs: 2, sm: 3 },
        }}
      >
        <EditionLogo />
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
  );
};

export default ConfirmationSent;
