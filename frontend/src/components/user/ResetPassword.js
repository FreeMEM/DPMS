import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Box, Button, TextField, Typography, Paper, CircularProgress } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { useTranslation } from "react-i18next";
import axiosWrapper from "../../utils/AxiosWrapper";
import EditionLogo from "../common/EditionLogo";

const ResetPassword = () => {
  const { uid, token } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const theme = useTheme();

  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    if (password !== passwordConfirmation) {
      setError(t("Passwords don't match."));
      return;
    }

    setLoading(true);
    try {
      await axiosWrapper().post("/api/users/password-reset-confirm/", {
        uid,
        token,
        password,
        password_confirmation: passwordConfirmation,
      });
      setMessage(t("Password has been reset successfully."));
    } catch (err) {
      const data = err.response?.data;
      if (data?.non_field_errors) {
        setError(data.non_field_errors.join(" "));
      } else if (typeof data === "object") {
        setError(Object.values(data).flat().join(" "));
      } else {
        setError(t("An error occurred. Please try again."));
      }
    } finally {
      setLoading(false);
    }
  };

  if (!uid || !token) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh" bgcolor={theme.palette.background.default}>
        <Paper elevation={3} sx={{ padding: 4, maxWidth: 400, width: "100%", margin: { xs: 2, sm: 3 } }}>
          <Typography variant="h6" align="center" color="error">
            {t("Invalid reset link.")}
          </Typography>
        </Paper>
      </Box>
    );
  }

  return (
    <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh" bgcolor={theme.palette.background.default}>
      <Paper
        elevation={3}
        sx={{
          padding: 4,
          maxWidth: 400,
          width: "100%",
          margin: { xs: 2, sm: 3 },
          backgroundColor: theme.palette.background.paper,
          color: theme.palette.text.primary,
        }}
      >
        <EditionLogo />
        <Typography variant="h5" align="center" gutterBottom>
          {t("Reset password")}
        </Typography>

        {message ? (
          <>
            <Typography variant="body1" align="center" sx={{ mb: 2 }}>
              {message}
            </Typography>
            <Button fullWidth variant="contained" color="primary" onClick={() => navigate("/login")}>
              {t("Sign in")}
            </Button>
          </>
        ) : (
          <form onSubmit={handleSubmit}>
            <TextField
              label={t("New password")}
              variant="outlined"
              fullWidth
              margin="normal"
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (!passwordConfirmation) {
                  setPasswordConfirmation(e.target.value);
                }
              }}
              required
              autoComplete="new-password"
              inputProps={{ minLength: 5 }}
            />
            <TextField
              label={t("Confirm password")}
              variant="outlined"
              fullWidth
              margin="normal"
              type="password"
              autoComplete="new-password"
              value={passwordConfirmation}
              onChange={(e) => setPasswordConfirmation(e.target.value)}
              required
              inputProps={{ minLength: 5 }}
            />
            {error && (
              <Typography variant="body2" color="error" align="center" sx={{ mt: 1 }}>
                {error}
              </Typography>
            )}
            <Box mt={2}>
              <Button type="submit" variant="contained" color="primary" fullWidth disabled={loading}>
                {loading ? <CircularProgress size={24} /> : t("Reset password")}
              </Button>
            </Box>
          </form>
        )}
      </Paper>
    </Box>
  );
};

export default ResetPassword;
