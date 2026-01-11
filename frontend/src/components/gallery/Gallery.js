import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Container,
  Grid,
  Card,
  CardMedia,
  CardContent,
  CardActions,
  Typography,
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Alert,
  CircularProgress,
  Tabs,
  Tab,
  Tooltip,
  ImageList,
  ImageListItem,
  ImageListItemBar,
  Fab,
  Backdrop,
} from "@mui/material";
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Close as CloseIcon,
  CloudUpload as UploadIcon,
  PhotoLibrary as GalleryIcon,
  Person as PersonIcon,
  FilterList as FilterIcon,
} from "@mui/icons-material";
import MainBar from "../../@dpms-freemem/MainBar";
import ThreeBackground from "../common/ThreeBackground";
import BackgroundToggle from "../common/BackgroundToggle";
import { AuthContext } from "../../AuthContext";
import { galleryAPI, editionsAPI } from "../../services/api";

const Gallery = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useContext(AuthContext);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [images, setImages] = useState([]);
  const [myImages, setMyImages] = useState([]);
  const [editions, setEditions] = useState([]);
  const [selectedEdition, setSelectedEdition] = useState("");
  const [tabValue, setTabValue] = useState(0);
  const [value, setValue] = useState(4); // Gallery menu item

  // Upload dialog
  const [uploadOpen, setUploadOpen] = useState(false);
  const [uploadFile, setUploadFile] = useState(null);
  const [uploadPreview, setUploadPreview] = useState(null);
  const [uploadTitle, setUploadTitle] = useState("");
  const [uploadDescription, setUploadDescription] = useState("");
  const [uploadEdition, setUploadEdition] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState(null);

  // Edit dialog
  const [editOpen, setEditOpen] = useState(false);
  const [editImage, setEditImage] = useState(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editEdition, setEditEdition] = useState("");

  // Delete dialog
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteImage, setDeleteImage] = useState(null);

  // Lightbox
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxImage, setLightboxImage] = useState(null);

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  useEffect(() => {
    fetchData();
  }, [selectedEdition]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchMyImages();
    }
  }, [isAuthenticated]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [editionsRes, imagesRes] = await Promise.all([
        editionsAPI.list().catch(() => ({ data: [] })),
        selectedEdition
          ? galleryAPI.byEdition(selectedEdition).catch(() => ({ data: { images: [] } }))
          : galleryAPI.list().catch(() => ({ data: [] })),
      ]);

      setEditions(editionsRes.data || []);

      if (selectedEdition) {
        setImages(imagesRes.data?.images || []);
      } else {
        setImages(imagesRes.data || []);
      }

      // Set default upload edition to first/current edition
      if (editionsRes.data?.length > 0 && !uploadEdition) {
        const now = new Date();
        const upcoming = editionsRes.data.find(e => new Date(e.start_date) > now) || editionsRes.data[0];
        setUploadEdition(upcoming.id);
      }

      setError(null);
    } catch (err) {
      console.error("Error fetching gallery data:", err);
      setError("Error al cargar la galería");
    } finally {
      setLoading(false);
    }
  };

  const fetchMyImages = async () => {
    try {
      const res = await galleryAPI.myImages();
      setMyImages(res.data || []);
    } catch (err) {
      console.error("Error fetching my images:", err);
    }
  };

  // Upload handlers
  const handleUploadOpen = () => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
    setUploadOpen(true);
  };

  const handleUploadClose = () => {
    setUploadOpen(false);
    setUploadFile(null);
    setUploadPreview(null);
    setUploadTitle("");
    setUploadDescription("");
    setUploadError(null);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setUploadFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setUploadPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpload = async () => {
    if (!uploadFile) {
      setUploadError("Selecciona una imagen");
      return;
    }

    try {
      setUploading(true);
      setUploadError(null);

      const formData = new FormData();
      formData.append("image", uploadFile);
      formData.append("title", uploadTitle);
      formData.append("description", uploadDescription);
      if (uploadEdition) {
        formData.append("edition", uploadEdition);
      }

      await galleryAPI.upload(formData);

      handleUploadClose();
      fetchData();
      fetchMyImages();
    } catch (err) {
      console.error("Error uploading image:", err);
      setUploadError(err.response?.data?.image?.[0] || "Error al subir la imagen");
    } finally {
      setUploading(false);
    }
  };

  // Edit handlers
  const handleEditOpen = (image) => {
    setEditImage(image);
    setEditTitle(image.title || "");
    setEditDescription(image.description || "");
    setEditEdition(image.edition || "");
    setEditOpen(true);
  };

  const handleEditClose = () => {
    setEditOpen(false);
    setEditImage(null);
  };

  const handleEditSave = async () => {
    try {
      await galleryAPI.update(editImage.id, {
        title: editTitle,
        description: editDescription,
        edition: editEdition || null,
      });
      handleEditClose();
      fetchData();
      fetchMyImages();
    } catch (err) {
      console.error("Error updating image:", err);
    }
  };

  // Delete handlers
  const handleDeleteOpen = (image) => {
    setDeleteImage(image);
    setDeleteOpen(true);
  };

  const handleDeleteClose = () => {
    setDeleteOpen(false);
    setDeleteImage(null);
  };

  const handleDeleteConfirm = async () => {
    try {
      await galleryAPI.delete(deleteImage.id);
      handleDeleteClose();
      fetchData();
      fetchMyImages();
    } catch (err) {
      console.error("Error deleting image:", err);
    }
  };

  // Lightbox handlers
  const handleLightboxOpen = (image) => {
    setLightboxImage(image);
    setLightboxOpen(true);
  };

  const handleLightboxClose = () => {
    setLightboxOpen(false);
    setLightboxImage(null);
  };

  const isOwner = (image) => {
    return user && image.uploaded_by?.id === user.id;
  };

  const ImageCard = ({ image, showActions = false }) => (
    <Card
      sx={{
        cursor: "pointer",
        transition: "transform 0.2s, box-shadow 0.2s",
        "&:hover": {
          transform: "translateY(-4px)",
          boxShadow: "0 8px 24px rgba(255, 165, 0, 0.2)",
        },
      }}
    >
      <CardMedia
        component="img"
        height="200"
        image={image.image_url || image.thumbnail_url}
        alt={image.title || "Gallery image"}
        onClick={() => handleLightboxOpen(image)}
        sx={{ objectFit: "cover" }}
      />
      <CardContent sx={{ pb: 1 }}>
        {image.title && (
          <Typography variant="subtitle1" noWrap sx={{ fontWeight: 600 }}>
            {image.title}
          </Typography>
        )}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mt: 0.5 }}>
          <PersonIcon fontSize="small" color="action" />
          <Typography variant="caption" color="text.secondary">
            {image.uploader_name}
          </Typography>
        </Box>
        {image.edition_name && (
          <Chip
            label={image.edition_name}
            size="small"
            sx={{ mt: 1 }}
            variant="outlined"
          />
        )}
      </CardContent>
      {showActions && isOwner(image) && (
        <CardActions sx={{ pt: 0 }}>
          <Tooltip title="Editar">
            <IconButton size="small" onClick={() => handleEditOpen(image)}>
              <EditIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Eliminar">
            <IconButton
              size="small"
              color="error"
              onClick={() => handleDeleteOpen(image)}
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </CardActions>
      )}
    </Card>
  );

  return (
    <Box sx={{ display: "flex" }}>
      <ThreeBackground variant="user" />
      <BackgroundToggle />
      <MainBar value={value} panel={"user"} handleChange={handleChange} />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          mt: 8,
          ml: { sm: "64px" },
          position: "relative",
          zIndex: 1,
          minHeight: "100vh",
        }}
      >
        <Container maxWidth="xl">
          {/* Header */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 4,
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <GalleryIcon sx={{ fontSize: 40, color: "primary.main" }} />
              <Typography variant="h4" sx={{ fontWeight: 700 }}>
                Galería
              </Typography>
            </Box>
            {isAuthenticated && (
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={handleUploadOpen}
              >
                Subir Imagen
              </Button>
            )}
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          {/* Tabs */}
          <Tabs
            value={tabValue}
            onChange={(e, v) => setTabValue(v)}
            sx={{ mb: 3 }}
          >
            <Tab label="Todas las imágenes" />
            {isAuthenticated && <Tab label="Mis imágenes" />}
          </Tabs>

          {/* Filter by edition */}
          {tabValue === 0 && (
            <Box sx={{ mb: 3, display: "flex", alignItems: "center", gap: 2 }}>
              <FilterIcon color="action" />
              <FormControl size="small" sx={{ minWidth: 200 }}>
                <InputLabel>Filtrar por edición</InputLabel>
                <Select
                  value={selectedEdition}
                  label="Filtrar por edición"
                  onChange={(e) => setSelectedEdition(e.target.value)}
                >
                  <MenuItem value="">Todas las ediciones</MenuItem>
                  {editions.map((edition) => (
                    <MenuItem key={edition.id} value={edition.id}>
                      {edition.title}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              {selectedEdition && (
                <Button
                  size="small"
                  onClick={() => setSelectedEdition("")}
                >
                  Limpiar filtro
                </Button>
              )}
            </Box>
          )}

          {loading ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
              <CircularProgress />
            </Box>
          ) : (
            <>
              {/* All images tab */}
              {tabValue === 0 && (
                <Grid container spacing={3}>
                  {images.length === 0 ? (
                    <Grid item xs={12}>
                      <Box sx={{ textAlign: "center", py: 8 }}>
                        <GalleryIcon sx={{ fontSize: 80, color: "text.secondary", mb: 2 }} />
                        <Typography variant="h6" color="text.secondary">
                          No hay imágenes en la galería
                        </Typography>
                        {isAuthenticated && (
                          <Button
                            variant="outlined"
                            startIcon={<UploadIcon />}
                            onClick={handleUploadOpen}
                            sx={{ mt: 2 }}
                          >
                            Sube la primera imagen
                          </Button>
                        )}
                      </Box>
                    </Grid>
                  ) : (
                    images.map((image) => (
                      <Grid item xs={12} sm={6} md={4} lg={3} key={image.id}>
                        <ImageCard image={image} showActions={true} />
                      </Grid>
                    ))
                  )}
                </Grid>
              )}

              {/* My images tab */}
              {tabValue === 1 && isAuthenticated && (
                <Grid container spacing={3}>
                  {myImages.length === 0 ? (
                    <Grid item xs={12}>
                      <Box sx={{ textAlign: "center", py: 8 }}>
                        <GalleryIcon sx={{ fontSize: 80, color: "text.secondary", mb: 2 }} />
                        <Typography variant="h6" color="text.secondary">
                          Aún no has subido ninguna imagen
                        </Typography>
                        <Button
                          variant="outlined"
                          startIcon={<UploadIcon />}
                          onClick={handleUploadOpen}
                          sx={{ mt: 2 }}
                        >
                          Subir mi primera imagen
                        </Button>
                      </Box>
                    </Grid>
                  ) : (
                    myImages.map((image) => (
                      <Grid item xs={12} sm={6} md={4} lg={3} key={image.id}>
                        <ImageCard image={image} showActions={true} />
                      </Grid>
                    ))
                  )}
                </Grid>
              )}
            </>
          )}

          {/* Floating upload button for mobile */}
          {isAuthenticated && (
            <Fab
              color="primary"
              sx={{
                position: "fixed",
                bottom: 24,
                right: 24,
                display: { xs: "flex", md: "none" },
              }}
              onClick={handleUploadOpen}
            >
              <AddIcon />
            </Fab>
          )}
        </Container>
      </Box>

      {/* Upload Dialog */}
      <Dialog open={uploadOpen} onClose={handleUploadClose} maxWidth="sm" fullWidth>
        <DialogTitle>
          Subir Imagen
          <IconButton
            onClick={handleUploadClose}
            sx={{ position: "absolute", right: 8, top: 8 }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          {uploadError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {uploadError}
            </Alert>
          )}

          <Box
            sx={{
              border: "2px dashed",
              borderColor: uploadPreview ? "primary.main" : "grey.500",
              borderRadius: 2,
              p: 3,
              textAlign: "center",
              mb: 3,
              cursor: "pointer",
              "&:hover": { borderColor: "primary.main" },
            }}
            onClick={() => document.getElementById("upload-input").click()}
          >
            {uploadPreview ? (
              <img
                src={uploadPreview}
                alt="Preview"
                style={{ maxWidth: "100%", maxHeight: 300 }}
              />
            ) : (
              <>
                <UploadIcon sx={{ fontSize: 48, color: "text.secondary", mb: 1 }} />
                <Typography color="text.secondary">
                  Haz click o arrastra una imagen aquí
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  JPG, PNG, GIF, WebP (máx. 20MB)
                </Typography>
              </>
            )}
            <input
              id="upload-input"
              type="file"
              accept="image/*"
              hidden
              onChange={handleFileChange}
            />
          </Box>

          <TextField
            fullWidth
            label="Título (opcional)"
            value={uploadTitle}
            onChange={(e) => setUploadTitle(e.target.value)}
            sx={{ mb: 2 }}
          />

          <TextField
            fullWidth
            label="Descripción (opcional)"
            value={uploadDescription}
            onChange={(e) => setUploadDescription(e.target.value)}
            multiline
            rows={2}
            sx={{ mb: 2 }}
          />

          <FormControl fullWidth>
            <InputLabel>Edición</InputLabel>
            <Select
              value={uploadEdition}
              label="Edición"
              onChange={(e) => setUploadEdition(e.target.value)}
            >
              {editions.map((edition) => (
                <MenuItem key={edition.id} value={edition.id}>
                  {edition.title}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleUploadClose}>Cancelar</Button>
          <Button
            variant="contained"
            onClick={handleUpload}
            disabled={!uploadFile || uploading}
            startIcon={uploading ? <CircularProgress size={20} /> : <UploadIcon />}
          >
            {uploading ? "Subiendo..." : "Subir"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={editOpen} onClose={handleEditClose} maxWidth="sm" fullWidth>
        <DialogTitle>Editar Imagen</DialogTitle>
        <DialogContent>
          {editImage && (
            <Box sx={{ mb: 2, textAlign: "center" }}>
              <img
                src={editImage.image_url}
                alt="Preview"
                style={{ maxWidth: "100%", maxHeight: 200 }}
              />
            </Box>
          )}

          <TextField
            fullWidth
            label="Título"
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            sx={{ mb: 2 }}
          />

          <TextField
            fullWidth
            label="Descripción"
            value={editDescription}
            onChange={(e) => setEditDescription(e.target.value)}
            multiline
            rows={2}
            sx={{ mb: 2 }}
          />

          <FormControl fullWidth>
            <InputLabel>Edición</InputLabel>
            <Select
              value={editEdition}
              label="Edición"
              onChange={(e) => setEditEdition(e.target.value)}
            >
              <MenuItem value="">Sin edición</MenuItem>
              {editions.map((edition) => (
                <MenuItem key={edition.id} value={edition.id}>
                  {edition.title}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleEditClose}>Cancelar</Button>
          <Button variant="contained" onClick={handleEditSave}>
            Guardar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={deleteOpen} onClose={handleDeleteClose}>
        <DialogTitle>Eliminar Imagen</DialogTitle>
        <DialogContent>
          <Typography>
            ¿Estás seguro de que quieres eliminar esta imagen? Esta acción no se
            puede deshacer.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteClose}>Cancelar</Button>
          <Button variant="contained" color="error" onClick={handleDeleteConfirm}>
            Eliminar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Lightbox */}
      <Backdrop
        open={lightboxOpen}
        onClick={handleLightboxClose}
        sx={{ zIndex: 9999, bgcolor: "rgba(0, 0, 0, 0.9)" }}
      >
        {lightboxImage && (
          <Box sx={{ position: "relative", maxWidth: "90vw", maxHeight: "90vh" }}>
            <IconButton
              onClick={handleLightboxClose}
              sx={{
                position: "absolute",
                top: -40,
                right: 0,
                color: "white",
              }}
            >
              <CloseIcon />
            </IconButton>
            <img
              src={lightboxImage.image_url}
              alt={lightboxImage.title}
              style={{
                maxWidth: "90vw",
                maxHeight: "85vh",
                objectFit: "contain",
              }}
            />
            <Box
              sx={{
                position: "absolute",
                bottom: -60,
                left: 0,
                right: 0,
                textAlign: "center",
                color: "white",
              }}
            >
              {lightboxImage.title && (
                <Typography variant="h6">{lightboxImage.title}</Typography>
              )}
              <Typography variant="body2" color="grey.400">
                Por {lightboxImage.uploader_name}
                {lightboxImage.edition_name && ` - ${lightboxImage.edition_name}`}
              </Typography>
            </Box>
          </Box>
        )}
      </Backdrop>
    </Box>
  );
};

export default Gallery;
