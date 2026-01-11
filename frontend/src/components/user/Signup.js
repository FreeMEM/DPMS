import React, { useState, useEffect, useContext } from "react";
import { useNavigate, Link } from "react-router-dom";
import { AuthContext } from "../../AuthContext";
import { Box, Button, TextField, Typography, Paper, FormControl, FormLabel } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { useTranslation } from "react-i18next";
import axiosWrapper from "../../utils/AxiosWrapper";

const Signup = () => {
  const [email, setEmail] = useState("");
  const [nickname, setNickname] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [group, setGroup] = useState("");
  const [errors, setErrors] = useState({});
  const [edition, setEdition] = useState(null);
  const [editionLoaded, setEditionLoaded] = useState(false);
  const { signup } = useContext(AuthContext);
  const navigate = useNavigate();
  const { t } = useTranslation();
  const theme = useTheme();

  // Cargar edición actual (la primera edición pública)
  useEffect(() => {
    const fetchCurrentEdition = async () => {
      try {
        const client = axiosWrapper();
        const response = await client.get('/api/editions/?public=true');
        if (response.data && response.data.length > 0) {
          setEdition(response.data[0]);
        } else {
          setEdition(null);
        }
      } catch (error) {
        setEdition(null);
      } finally {
        setEditionLoaded(true);
      }
    };
    fetchCurrentEdition();
  }, []);

  const handleSignup = async (e) => {
    e.preventDefault();
    setErrors({});
    try {
      await signup({
        email,
        nickname,
        password,
        password_confirmation: passwordConfirmation,
        first_name: firstName,
        last_name: lastName,
        group,
      });
      navigate("/confirmation-sent");
    } catch (error) {
      if (error.response && error.response.status === 400) {
        setErrors(error.response.data);
      } else {
        setErrors({ non_field_errors: "Registration failed. Please try again." });
      }
    }
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
        <Box display="flex" justifyContent="center" alignItems="center" mb={2} sx={{ minHeight: 100 }}>
          {editionLoaded && edition?.logo ? (
            <img
              src={edition.logo}
              alt={edition.title || "Logo"}
              style={{
                maxHeight: 100,
                maxWidth: '100%',
                objectFit: 'contain',
                filter: edition.logo_border_width > 0
                  ? `drop-shadow(0 0 ${edition.logo_border_width}px ${edition.logo_border_color || '#00ff00'})`
                  : 'none',
              }}
            />
          ) : editionLoaded && edition?.title ? (
            <Typography variant="h4" align="center" color="primary" fontWeight={700}>
              {edition.title}
            </Typography>
          ) : editionLoaded ? (
            <Typography variant="h4" align="center" color="primary" fontWeight={700}>
              DPMS
            </Typography>
          ) : null}
        </Box>
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
              error={Boolean(errors.email)}
              helperText={errors.email ? errors.email[0] : ""}
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
              fullWidth
              variant="outlined"
            />
          </FormControl>

          <FormControl>
            <FormLabel htmlFor="firstName">{t("First Name")}</FormLabel>
            <TextField
              error={Boolean(errors.first_name)}
              helperText={errors.first_name ? errors.first_name[0] : ""}
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
              error={Boolean(errors.last_name)}
              helperText={errors.last_name ? errors.last_name[0] : ""}
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
              fullWidth
              variant="outlined"
            />
          </FormControl>

          <FormControl>
            <FormLabel htmlFor="password">{t("Password")}</FormLabel>
            <TextField
              error={Boolean(errors.password)}
              helperText={errors.password ? errors.password[0] : ""}
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
              error={Boolean(errors.password_confirmation)}
              helperText={errors.password_confirmation ? errors.password_confirmation[0] : ""}
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

          {errors.non_field_errors && (
            <Typography color="error" variant="body2" align="center">
              {t(errors.non_field_errors)}
            </Typography>
          )}

          <Button type="submit" fullWidth variant="contained">
            {t("Sign Up")}
          </Button>

          <Box mt={2}>
            <Typography sx={{ textAlign: "center" }}>
              {t("Already have an account?")}{" "}
              <Link to="/login" style={{ textDecoration: "none", color: theme.palette.primary.main }}>
                {t("Sign In")}
              </Link>
            </Typography>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
};

export default Signup;
