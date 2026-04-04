import React, { useState, useEffect, useContext, useRef } from "react";
import { AuthContext } from "../../AuthContext";
import MainBar from "../../@dpms-freemem/MainBar";
import axiosWrapper from "../../utils/AxiosWrapper";
import { useTranslation } from "react-i18next";
import { useTheme } from "@mui/material/styles";
import {
  Box,
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Avatar,
  IconButton,
  Alert,
  CircularProgress,
  FormControlLabel,
  Switch,
  Divider,
  Chip,
} from "@mui/material";
import {
  PhotoCamera as PhotoCameraIcon,
  Save as SaveIcon,
  Edit as EditIcon,
  Person as PersonIcon,
  Check as CheckIcon,
  Close as CloseIcon,
} from "@mui/icons-material";

const BACKEND_URL = process.env.REACT_APP_BACKEND_ADDRESS || "http://localhost:8000";

const resolveMediaUrl = (url) => {
  if (!url) return "";
  if (url.startsWith("http")) return url;
  return `${BACKEND_URL}${url}`;
};

const ProfilePage = () => {
  const { user } = useContext(AuthContext);
  const { t } = useTranslation();
  const theme = useTheme();
  const fileInputRef = useRef(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const [profileData, setProfileData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    nickname: "",
    group: "",
    extraInformation: "",
    visitListing: false,
    avatarUrl: "",
  });

  const [formData, setFormData] = useState({ ...profileData });
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState("");

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const client = axiosWrapper();
      const response = await client.get(`/api/users/${user.email}/`);
      const userData = response.data.user;
      const data = {
        firstName: userData.first_name || "",
        lastName: userData.last_name || "",
        email: userData.email || "",
        nickname: userData.profile?.nickname || "",
        group: userData.profile?.group || "",
        extraInformation: userData.profile?.extra_information || "",
        visitListing: userData.profile?.visit_listing || false,
        avatarUrl: userData.profile?.avatar || "",
      };
      setProfileData(data);
      setFormData(data);
    } catch (err) {
      setError(t("Failed to load profile data"));
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    setFormData({ ...profileData });
    setAvatarFile(null);
    setAvatarPreview("");
    setSuccess("");
    setError("");
    setEditing(true);
  };

  const handleCancel = () => {
    setFormData({ ...profileData });
    setAvatarFile(null);
    setAvatarPreview("");
    setError("");
    setEditing(false);
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const client = axiosWrapper();

      // Update user fields (first_name, last_name)
      await client.patch(`/api/users/${user.email}/`, {
        first_name: formData.firstName,
        last_name: formData.lastName,
      });

      // Update profile fields (always use FormData to support avatar upload)
      const payload = new FormData();
      payload.append("nickname", formData.nickname);
      payload.append("group", formData.group);
      payload.append("extra_information", formData.extraInformation);
      payload.append("visit_listing", formData.visitListing);
      if (avatarFile) {
        payload.append("avatar", avatarFile);
      }
      await client.patch(`/api/users/${user.email}/profile/`, payload);

      // Refresh profile data
      const refreshed = await client.get(`/api/users/${user.email}/`);
      const updatedUser = refreshed.data.user;
      localStorage.setItem("user", JSON.stringify(updatedUser));

      const newData = {
        firstName: updatedUser.first_name || "",
        lastName: updatedUser.last_name || "",
        email: updatedUser.email || "",
        nickname: updatedUser.profile?.nickname || "",
        group: updatedUser.profile?.group || "",
        extraInformation: updatedUser.profile?.extra_information || "",
        visitListing: updatedUser.profile?.visit_listing || false,
        avatarUrl: updatedUser.profile?.avatar || "",
      };
      setProfileData(newData);
      setFormData(newData);
      setAvatarFile(null);
      setAvatarPreview("");
      setSuccess(t("Profile updated successfully"));
      setEditing(false);
    } catch (err) {
      setError(t("Failed to update profile"));
    } finally {
      setSaving(false);
    }
  };

  const mainSx = {
    flexGrow: 1,
    p: { xs: 1.5, sm: 3 },
    mt: 8,
    position: "relative",
    zIndex: 1,
    minHeight: "100vh",
    minWidth: 0,
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex" }}>
        <MainBar />
        <Box component="main" sx={mainSx}>
          <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
            <CircularProgress sx={{ color: theme.palette.primary.main }} />
          </Box>
        </Box>
      </Box>
    );
  }

  const displayAvatar = editing
    ? (avatarPreview || resolveMediaUrl(formData.avatarUrl))
    : resolveMediaUrl(profileData.avatarUrl);
  const displayName = profileData.nickname || profileData.firstName || profileData.email.split("@")[0];

  return (
    <Box sx={{ display: "flex" }}>
      <MainBar />
      <Box component="main" sx={mainSx}>
        <Container maxWidth="md">
          <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
            <Typography variant="h4" fontWeight={700}>
              {t("Profile")}
            </Typography>
            {!editing && (
              <Button
                variant="outlined"
                startIcon={<EditIcon />}
                onClick={handleEdit}
              >
                {t("Edit")}
              </Button>
            )}
          </Box>

          {success && (
            <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess("")}>
              {success}
            </Alert>
          )}
          {error && (
            <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError("")}>
              {error}
            </Alert>
          )}

          <Box component={editing ? "form" : "div"} onSubmit={editing ? handleSaveProfile : undefined}>
            <Grid container spacing={3}>
              {/* Avatar Card */}
              <Grid item xs={12} md={4}>
                <Card
                  sx={{
                    backgroundColor: theme.palette.background.paper,
                    textAlign: "center",
                    p: 3,
                  }}
                >
                  <CardContent>
                    <Box position="relative" display="inline-block">
                      <Avatar
                        src={displayAvatar}
                        sx={{
                          width: 120,
                          height: 120,
                          mx: "auto",
                          mb: 2,
                          bgcolor: theme.palette.primary.main,
                          fontSize: 48,
                        }}
                      >
                        {!displayAvatar && <PersonIcon sx={{ fontSize: 60 }} />}
                      </Avatar>
                      {editing && (
                        <>
                          <IconButton
                            sx={{
                              position: "absolute",
                              bottom: 12,
                              right: -4,
                              backgroundColor: theme.palette.primary.main,
                              color: "#fff",
                              "&:hover": {
                                backgroundColor: theme.palette.primary.dark,
                              },
                              width: 36,
                              height: 36,
                            }}
                            onClick={() => fileInputRef.current?.click()}
                          >
                            <PhotoCameraIcon fontSize="small" />
                          </IconButton>
                          <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            hidden
                            onChange={handleAvatarChange}
                          />
                        </>
                      )}
                    </Box>
                    <Typography variant="h6" fontWeight={600}>
                      {displayName}
                    </Typography>
                    {profileData.group && (
                      <Typography variant="body2" color="text.secondary">
                        {profileData.group}
                      </Typography>
                    )}
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                      {profileData.email}
                    </Typography>
                    {profileData.visitListing && (
                      <Chip
                        icon={<CheckIcon />}
                        label={t("Visible in visitors list")}
                        size="small"
                        color="primary"
                        variant="outlined"
                        sx={{ mt: 1.5 }}
                      />
                    )}
                  </CardContent>
                </Card>
              </Grid>

              {/* Profile Info / Form */}
              <Grid item xs={12} md={8}>
                <Card sx={{ backgroundColor: theme.palette.background.paper }}>
                  <CardContent sx={{ p: 3 }}>
                    <Typography variant="h6" fontWeight={600} gutterBottom>
                      {t("Personal Information")}
                    </Typography>
                    <Divider sx={{ mb: 2 }} />

                    {editing ? (
                      /* Edit mode */
                      <>
                        <Grid container spacing={2}>
                          <Grid item xs={12} sm={6}>
                            <TextField
                              label={t("First Name")}
                              value={formData.firstName}
                              onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                              fullWidth
                              variant="outlined"
                            />
                          </Grid>
                          <Grid item xs={12} sm={6}>
                            <TextField
                              label={t("Last Name")}
                              value={formData.lastName}
                              onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                              fullWidth
                              variant="outlined"
                            />
                          </Grid>
                          <Grid item xs={12} sm={6}>
                            <TextField
                              label={t("Nickname")}
                              value={formData.nickname}
                              onChange={(e) => setFormData({ ...formData, nickname: e.target.value })}
                              fullWidth
                              variant="outlined"
                            />
                          </Grid>
                          <Grid item xs={12} sm={6}>
                            <TextField
                              label={t("Group")}
                              value={formData.group}
                              onChange={(e) => setFormData({ ...formData, group: e.target.value })}
                              fullWidth
                              variant="outlined"
                            />
                          </Grid>
                          <Grid item xs={12}>
                            <TextField
                              label={t("Email")}
                              value={formData.email}
                              fullWidth
                              variant="outlined"
                              disabled
                              helperText={t("Email cannot be changed")}
                            />
                          </Grid>
                          <Grid item xs={12}>
                            <TextField
                              label={t("About me")}
                              value={formData.extraInformation}
                              onChange={(e) => setFormData({ ...formData, extraInformation: e.target.value })}
                              fullWidth
                              variant="outlined"
                              multiline
                              rows={3}
                              inputProps={{ maxLength: 2000 }}
                              helperText={`${formData.extraInformation.length}/2000`}
                            />
                          </Grid>
                          <Grid item xs={12}>
                            <FormControlLabel
                              control={
                                <Switch
                                  checked={formData.visitListing}
                                  onChange={(e) => setFormData({ ...formData, visitListing: e.target.checked })}
                                  color="primary"
                                />
                              }
                              label={t("Show me in the visitors list")}
                            />
                          </Grid>
                        </Grid>

                        <Box display="flex" justifyContent="flex-end" gap={1} mt={3}>
                          <Button
                            variant="outlined"
                            startIcon={<CloseIcon />}
                            onClick={handleCancel}
                            disabled={saving}
                          >
                            {t("Cancel")}
                          </Button>
                          <Button
                            type="submit"
                            variant="contained"
                            startIcon={saving ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
                            disabled={saving}
                          >
                            {saving ? t("Saving...") : t("Save changes")}
                          </Button>
                        </Box>
                      </>
                    ) : (
                      /* View mode */
                      <Grid container spacing={2}>
                        <Grid item xs={12} sm={6}>
                          <Typography variant="caption" color="text.secondary">
                            {t("First Name")}
                          </Typography>
                          <Typography variant="body1">
                            {profileData.firstName || "-"}
                          </Typography>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <Typography variant="caption" color="text.secondary">
                            {t("Last Name")}
                          </Typography>
                          <Typography variant="body1">
                            {profileData.lastName || "-"}
                          </Typography>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <Typography variant="caption" color="text.secondary">
                            {t("Nickname")}
                          </Typography>
                          <Typography variant="body1">
                            {profileData.nickname || "-"}
                          </Typography>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <Typography variant="caption" color="text.secondary">
                            {t("Group")}
                          </Typography>
                          <Typography variant="body1">
                            {profileData.group || "-"}
                          </Typography>
                        </Grid>
                        <Grid item xs={12}>
                          <Typography variant="caption" color="text.secondary">
                            {t("Email")}
                          </Typography>
                          <Typography variant="body1">
                            {profileData.email}
                          </Typography>
                        </Grid>
                        {profileData.extraInformation && (
                          <Grid item xs={12}>
                            <Typography variant="caption" color="text.secondary">
                              {t("About me")}
                            </Typography>
                            <Typography variant="body1" sx={{ whiteSpace: "pre-wrap" }}>
                              {profileData.extraInformation}
                            </Typography>
                          </Grid>
                        )}
                      </Grid>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Box>
        </Container>
      </Box>
    </Box>
  );
};

export default ProfilePage;
