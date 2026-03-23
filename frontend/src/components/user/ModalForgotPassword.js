import React, { useState } from "react";
import PropTypes from "prop-types";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import OutlinedInput from "@mui/material/OutlinedInput";
import CircularProgress from "@mui/material/CircularProgress";
import { useTranslation } from "react-i18next";
import axiosWrapper from "../../utils/AxiosWrapper";

function ModalForgotPassword({ open, handleClose }) {
  const { t } = useTranslation();
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleCloseAndReset = () => {
    setEmail("");
    setSubmitted(false);
    setLoading(false);
    setError("");
    handleClose();
  };

  const handleSubmit = async () => {
    if (!email) return;
    setLoading(true);
    setError("");
    try {
      await axiosWrapper().post("/api/users/password-reset/", { email });
      setSubmitted(true);
    } catch (err) {
      setError(t("An error occurred. Please try again."));
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <Dialog open={open} onClose={handleCloseAndReset}>
      <DialogTitle>{t("Reset password")}</DialogTitle>
      <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2, width: "100%" }}>
        {submitted ? (
          <DialogContentText>
            {t("If an account with that email exists, a reset link has been sent.")}
          </DialogContentText>
        ) : (
          <>
            <DialogContentText>
              {t("Enter your account's email address, and we'll send you a link to reset your password.")}
            </DialogContentText>
            <OutlinedInput
              autoFocus
              required
              margin="dense"
              id="email"
              name="email"
              placeholder={t("Email address")}
              type="email"
              fullWidth
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={handleKeyDown}
            />
            {error && (
              <DialogContentText color="error">{error}</DialogContentText>
            )}
          </>
        )}
      </DialogContent>
      <DialogActions sx={{ pb: 3, px: 3 }}>
        {submitted ? (
          <Button variant="contained" onClick={handleCloseAndReset}>
            {t("Close")}
          </Button>
        ) : (
          <>
            <Button onClick={handleCloseAndReset}>{t("Cancel")}</Button>
            <Button
              variant="contained"
              onClick={handleSubmit}
              disabled={loading || !email}
            >
              {loading ? <CircularProgress size={24} /> : t("Continue")}
            </Button>
          </>
        )}
      </DialogActions>
    </Dialog>
  );
}

ModalForgotPassword.propTypes = {
  handleClose: PropTypes.func.isRequired,
  open: PropTypes.bool.isRequired,
};

export default ModalForgotPassword;
