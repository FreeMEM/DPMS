import React, { useState } from "react";
import { Box, Button, TextField, Typography, Paper } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { useTranslation } from "react-i18next";
import axiosWrapper from "../../utils/AxiosWrapper";
import EditionLogo from "../common/EditionLogo";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const { t } = useTranslation();
  const theme = useTheme();

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    try {
      await axiosWrapper().post("/api/users/password-reset/", { email });
      setSubmitted(true);
    } catch (err) {
      // Always show success to prevent email enumeration
      setSubmitted(true);
    } finally {
      setLoading(false);
    }
  };

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
          {t("Forgot Password")}
        </Typography>
        {submitted ? (
          <Typography variant="body1" align="center">
            {t("If an account with that email exists, a reset link has been sent.")}
          </Typography>
        ) : (
          <form onSubmit={handleSubmit}>
            <TextField
              label={t("Email")}
              variant="outlined"
              fullWidth
              margin="normal"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              type="email"
              required
            />
            <Box mt={2}>
              <Button type="submit" variant="contained" color="primary" fullWidth disabled={loading}>
                {t("Send")}
              </Button>
            </Box>
          </form>
        )}
      </Paper>
    </Box>
  );
};

export default ForgotPassword;
