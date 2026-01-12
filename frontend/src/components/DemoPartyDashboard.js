import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import MainBar from "../@dpms-freemem/MainBar";
import ThreeBackground from "./common/ThreeBackground";
import BackgroundToggle from "./common/BackgroundToggle";
import StatsCard from "./admin/common/StatsCard";
import { AuthContext } from "../AuthContext";
import axiosWrapper from "../utils/AxiosWrapper";
import { sponsorsAPI } from "../services/api";
import {
  Box,
  Container,
  Grid,
  Card,
  CardContent,
  CardActions,
  Typography,
  Button,
  Chip,
  Alert,
  CircularProgress,
  Divider,
  IconButton,
  Tooltip,
} from "@mui/material";
import {
  EmojiEvents as TrophyIcon,
  CloudUpload as UploadIcon,
  Folder as FolderIcon,
  Timer as TimerIcon,
  Event as EventIcon,
  LocationOn as LocationIcon,
  ArrowForward as ArrowForwardIcon,
  Visibility as VisibilityIcon,
  Edit as EditIcon,
  Category as CategoryIcon,
  Celebration as CelebrationIcon,
} from "@mui/icons-material";

const DemoPartyDashboard = () => {
  const navigate = useNavigate();
  useContext(AuthContext); // Keep context for future use
  const [value, setValue] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeEdition, setActiveEdition] = useState(null);
  const [openCompos, setOpenCompos] = useState([]);
  const [myProductions, setMyProductions] = useState([]);
  const [countdown, setCountdown] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [sponsors, setSponsors] = useState([]);

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  useEffect(() => {
    if (activeEdition?.start_date) {
      const timer = setInterval(() => {
        const now = new Date().getTime();
        const eventDate = new Date(activeEdition.start_date).getTime();
        const distance = eventDate - now;

        if (distance > 0) {
          setCountdown({
            days: Math.floor(distance / (1000 * 60 * 60 * 24)),
            hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
            minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
            seconds: Math.floor((distance % (1000 * 60)) / 1000),
          });
        } else {
          setCountdown({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        }
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [activeEdition]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const client = axiosWrapper();

      const [editionsRes, productionsRes, hasComposRes] = await Promise.all([
        client.get('/api/editions/').catch(() => ({ data: [] })),
        client.get('/api/productions/my_productions/').catch(() => ({ data: [] })),
        client.get('/api/hascompos/').catch(() => ({ data: [] })),
      ]);

      // Find active/upcoming edition
      const editions = editionsRes.data || [];
      const now = new Date();
      const upcoming = editions.find(e => new Date(e.start_date) > now) || editions[0];
      setActiveEdition(upcoming);

      // Filter open compos for the active edition
      const hasCompos = hasComposRes.data || [];
      const open = hasCompos.filter(hc => {
        if (!upcoming) return false;
        const isEdition = hc.edition === upcoming.id || hc.edition_name === upcoming.name;
        return isEdition && hc.open_to_upload;
      });
      setOpenCompos(open);

      // My productions
      setMyProductions(productionsRes.data?.slice(0, 5) || []);

      // Fetch sponsors for the active edition
      if (upcoming?.id) {
        try {
          const sponsorsRes = await sponsorsAPI.byEdition(upcoming.id);
          setSponsors(sponsorsRes.data || []);
        } catch (sponsorErr) {
          console.error('Error fetching sponsors:', sponsorErr);
          setSponsors([]);
        }
      }

      setError(null);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError('Error al cargar los datos del dashboard');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const CountdownBox = ({ value, label }) => (
    <Box sx={{ textAlign: 'center', px: 2 }}>
      <Typography
        variant="h3"
        sx={{
          fontWeight: 700,
          color: 'primary.main',
          fontFamily: 'monospace',
          textShadow: '0 0 20px rgba(255, 165, 0, 0.5)',
        }}
      >
        {String(value).padStart(2, '0')}
      </Typography>
      <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase' }}>
        {label}
      </Typography>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      <ThreeBackground variant="user" />
      <BackgroundToggle />
      <MainBar value={value} panel={"user"} handleChange={handleChange} />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          mt: 8,
          ml: { sm: '64px' },
          position: 'relative',
          zIndex: 1,
          minHeight: '100vh',
        }}
      >
        <Container maxWidth="xl">
          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
              <CircularProgress />
            </Box>
          ) : (
            <>
              {/* Hero Section - Next Event */}
              {activeEdition && (
                <Card
                  sx={{
                    mb: 4,
                    background: 'linear-gradient(135deg, rgba(255, 165, 0, 0.15) 0%, rgba(30, 30, 30, 0.9) 100%)',
                    border: '1px solid rgba(255, 165, 0, 0.3)',
                    overflow: 'visible',
                  }}
                >
                  <CardContent sx={{ p: 4 }}>
                    <Grid container spacing={4} alignItems="center">
                      <Grid item xs={12} md={7}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                          <CelebrationIcon sx={{ fontSize: 40, color: 'primary.main' }} />
                          <Chip
                            label="Próximo Evento"
                            color="primary"
                            size="small"
                            sx={{ fontWeight: 600 }}
                          />
                        </Box>
                        <Typography
                          variant="h3"
                          sx={{
                            fontWeight: 700,
                            mb: 2,
                            background: 'linear-gradient(90deg, #FFA500, #FFD700)',
                            backgroundClip: 'text',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                          }}
                        >
                          {activeEdition.name}
                        </Typography>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3, mb: 3 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <EventIcon color="primary" />
                            <Typography variant="body1" color="text.secondary">
                              {formatDate(activeEdition.start_date)}
                            </Typography>
                          </Box>
                          {activeEdition.location && (
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <LocationIcon color="primary" />
                              <Typography variant="body1" color="text.secondary">
                                {activeEdition.location}
                              </Typography>
                            </Box>
                          )}
                        </Box>
                        {activeEdition.description && (
                          <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
                            {activeEdition.description}
                          </Typography>
                        )}
                        <Button
                          variant="contained"
                          size="large"
                          endIcon={<ArrowForwardIcon />}
                          onClick={() => navigate('/compos')}
                          sx={{ mt: 2 }}
                        >
                          Ver Competiciones
                        </Button>
                      </Grid>
                      <Grid item xs={12} md={5}>
                        <Box
                          sx={{
                            p: 3,
                            borderRadius: 2,
                            bgcolor: 'rgba(0, 0, 0, 0.4)',
                            border: '1px solid rgba(255, 165, 0, 0.2)',
                          }}
                        >
                          <Typography
                            variant="subtitle2"
                            color="text.secondary"
                            sx={{ textAlign: 'center', mb: 2, textTransform: 'uppercase', letterSpacing: 2 }}
                          >
                            Cuenta Atrás
                          </Typography>
                          <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                            <CountdownBox value={countdown.days} label="Días" />
                            <Typography variant="h3" sx={{ color: 'primary.main', alignSelf: 'flex-start', mt: 0.5 }}>:</Typography>
                            <CountdownBox value={countdown.hours} label="Horas" />
                            <Typography variant="h3" sx={{ color: 'primary.main', alignSelf: 'flex-start', mt: 0.5 }}>:</Typography>
                            <CountdownBox value={countdown.minutes} label="Min" />
                            <Typography variant="h3" sx={{ color: 'primary.main', alignSelf: 'flex-start', mt: 0.5 }}>:</Typography>
                            <CountdownBox value={countdown.seconds} label="Seg" />
                          </Box>
                        </Box>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              )}

              {/* Stats Cards */}
              <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid item xs={12} sm={6} md={3}>
                  <StatsCard
                    title="Mis Producciones"
                    value={myProductions.length}
                    icon={<FolderIcon />}
                    color="primary"
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <StatsCard
                    title="Compos Abiertas"
                    value={openCompos.length}
                    icon={<CategoryIcon />}
                    color="success"
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <StatsCard
                    title="Días Restantes"
                    value={countdown.days}
                    icon={<TimerIcon />}
                    color="info"
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <StatsCard
                    title="Edición Actual"
                    value={activeEdition?.name?.split(' ')[0] || '-'}
                    icon={<TrophyIcon />}
                    color="warning"
                  />
                </Grid>
              </Grid>

              <Grid container spacing={3}>
                {/* Open Compos Section */}
                <Grid item xs={12} md={6}>
                  <Card sx={{ height: '100%' }}>
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <UploadIcon color="primary" sx={{ fontSize: 32 }} />
                          <Typography variant="h6">Competiciones Abiertas</Typography>
                        </Box>
                        <Chip
                          label={`${openCompos.length} abiertas`}
                          color="success"
                          size="small"
                        />
                      </Box>
                      <Divider sx={{ mb: 2 }} />
                      {openCompos.length === 0 ? (
                        <Box sx={{ py: 4, textAlign: 'center' }}>
                          <Typography color="text.secondary">
                            No hay competiciones abiertas en este momento
                          </Typography>
                        </Box>
                      ) : (
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                          {openCompos.slice(0, 4).map((compo) => (
                            <Box
                              key={compo.id}
                              sx={{
                                p: 2,
                                borderRadius: 1,
                                bgcolor: 'rgba(255, 165, 0, 0.05)',
                                border: '1px solid rgba(255, 165, 0, 0.1)',
                                '&:hover': {
                                  bgcolor: 'rgba(255, 165, 0, 0.1)',
                                  borderColor: 'rgba(255, 165, 0, 0.3)',
                                },
                                cursor: 'pointer',
                              }}
                              onClick={() => navigate('/compos')}
                            >
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Box>
                                  <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                                    {compo.compo_name || compo.name}
                                  </Typography>
                                  {compo.upload_deadline && (
                                    <Typography variant="caption" color="text.secondary">
                                      Cierre: {new Date(compo.upload_deadline).toLocaleDateString('es-ES')}
                                    </Typography>
                                  )}
                                </Box>
                                <Button
                                  size="small"
                                  variant="outlined"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    navigate(`/productions/new?compo=${compo.compo || compo.id}`);
                                  }}
                                >
                                  Participar
                                </Button>
                              </Box>
                            </Box>
                          ))}
                        </Box>
                      )}
                    </CardContent>
                    <CardActions sx={{ p: 2, pt: 0 }}>
                      <Button
                        fullWidth
                        variant="contained"
                        onClick={() => navigate('/compos')}
                        endIcon={<ArrowForwardIcon />}
                      >
                        Ver Todas las Competiciones
                      </Button>
                    </CardActions>
                  </Card>
                </Grid>

                {/* My Productions Section */}
                <Grid item xs={12} md={6}>
                  <Card sx={{ height: '100%' }}>
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <FolderIcon color="primary" sx={{ fontSize: 32 }} />
                          <Typography variant="h6">Mis Producciones</Typography>
                        </Box>
                        <Chip
                          label={`${myProductions.length} total`}
                          color="primary"
                          size="small"
                          variant="outlined"
                        />
                      </Box>
                      <Divider sx={{ mb: 2 }} />
                      {myProductions.length === 0 ? (
                        <Box sx={{ py: 4, textAlign: 'center' }}>
                          <Typography color="text.secondary" sx={{ mb: 2 }}>
                            Aún no has subido ninguna producción
                          </Typography>
                          <Button
                            variant="outlined"
                            onClick={() => navigate('/compos')}
                            startIcon={<UploadIcon />}
                          >
                            Subir mi primera producción
                          </Button>
                        </Box>
                      ) : (
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                          {myProductions.map((prod) => (
                            <Box
                              key={prod.id}
                              sx={{
                                p: 2,
                                borderRadius: 1,
                                bgcolor: 'rgba(255, 255, 255, 0.02)',
                                border: '1px solid rgba(255, 255, 255, 0.05)',
                                '&:hover': {
                                  bgcolor: 'rgba(255, 255, 255, 0.05)',
                                },
                              }}
                            >
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <Box sx={{ flex: 1 }}>
                                  <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                                    {prod.title}
                                  </Typography>
                                  <Typography variant="caption" color="text.secondary">
                                    {prod.compo_name} - {prod.edition_name}
                                  </Typography>
                                </Box>
                                <Box sx={{ display: 'flex', gap: 1 }}>
                                  <Tooltip title="Ver">
                                    <IconButton
                                      size="small"
                                      onClick={() => navigate(`/productions/${prod.id}`)}
                                    >
                                      <VisibilityIcon fontSize="small" />
                                    </IconButton>
                                  </Tooltip>
                                  <Tooltip title="Editar">
                                    <IconButton
                                      size="small"
                                      onClick={() => navigate(`/productions/${prod.id}/edit`)}
                                    >
                                      <EditIcon fontSize="small" />
                                    </IconButton>
                                  </Tooltip>
                                </Box>
                              </Box>
                            </Box>
                          ))}
                        </Box>
                      )}
                    </CardContent>
                    <CardActions sx={{ p: 2, pt: 0 }}>
                      <Button
                        fullWidth
                        variant="outlined"
                        onClick={() => navigate('/my-productions')}
                        endIcon={<ArrowForwardIcon />}
                      >
                        Ver Todas Mis Producciones
                      </Button>
                    </CardActions>
                  </Card>
                </Grid>
              </Grid>

              {/* Quick Actions */}
              <Typography variant="h6" sx={{ mt: 4, mb: 2 }}>
                Acciones Rápidas
              </Typography>
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6} md={3}>
                  <Card
                    sx={{
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: '0 8px 24px rgba(255, 165, 0, 0.2)',
                      },
                    }}
                    onClick={() => navigate('/compos')}
                  >
                    <CardContent sx={{ textAlign: 'center', py: 3 }}>
                      <TrophyIcon sx={{ fontSize: 48, color: 'primary.main', mb: 1 }} />
                      <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                        Competiciones
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Ver todas las compos
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Card
                    sx={{
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: '0 8px 24px rgba(255, 165, 0, 0.2)',
                      },
                    }}
                    onClick={() => navigate('/my-productions')}
                  >
                    <CardContent sx={{ textAlign: 'center', py: 3 }}>
                      <FolderIcon sx={{ fontSize: 48, color: 'primary.main', mb: 1 }} />
                      <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                        Mis Producciones
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Gestionar mis obras
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Card
                    sx={{
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: '0 8px 24px rgba(255, 165, 0, 0.2)',
                      },
                    }}
                    onClick={() => navigate('/productions/new')}
                  >
                    <CardContent sx={{ textAlign: 'center', py: 3 }}>
                      <UploadIcon sx={{ fontSize: 48, color: 'primary.main', mb: 1 }} />
                      <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                        Nueva Producción
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Subir una obra
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Card
                    sx={{
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: '0 8px 24px rgba(255, 165, 0, 0.2)',
                      },
                    }}
                    onClick={() => navigate('/profile')}
                  >
                    <CardContent sx={{ textAlign: 'center', py: 3 }}>
                      <CelebrationIcon sx={{ fontSize: 48, color: 'primary.main', mb: 1 }} />
                      <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                        Mi Perfil
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Configurar cuenta
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>

              {/* Sponsors Section */}
              {sponsors.length > 0 && (
                <Box sx={{ mt: 6 }}>
                  <Typography
                    variant="h6"
                    sx={{
                      mb: 3,
                      textAlign: 'center',
                      color: 'text.secondary',
                      textTransform: 'uppercase',
                      letterSpacing: 2,
                    }}
                  >
                    Patrocinadores
                  </Typography>
                  <Box
                    sx={{
                      display: 'flex',
                      flexWrap: 'wrap',
                      justifyContent: 'center',
                      alignItems: 'center',
                      gap: 4,
                      p: 3,
                      borderRadius: 2,
                      bgcolor: 'rgba(255, 255, 255, 0.02)',
                      border: '1px solid rgba(255, 255, 255, 0.05)',
                    }}
                  >
                    {sponsors.map((sponsor) => (
                      <Tooltip key={sponsor.id} title={sponsor.name}>
                        <Box
                          component={sponsor.url ? "a" : "div"}
                          href={sponsor.url || undefined}
                          target={sponsor.url ? "_blank" : undefined}
                          rel={sponsor.url ? "noopener noreferrer" : undefined}
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            p: 2,
                            borderRadius: 1,
                            bgcolor: 'rgba(255, 255, 255, 0.05)',
                            transition: 'all 0.2s',
                            cursor: sponsor.url ? 'pointer' : 'default',
                            textDecoration: 'none',
                            '&:hover': {
                              bgcolor: 'rgba(255, 165, 0, 0.1)',
                              transform: 'scale(1.05)',
                            },
                          }}
                        >
                          {sponsor.logo ? (
                            <Box
                              component="img"
                              src={sponsor.logo}
                              alt={sponsor.name}
                              sx={{
                                maxHeight: 60,
                                maxWidth: 150,
                                objectFit: 'contain',
                                filter: 'brightness(0.9)',
                                '&:hover': {
                                  filter: 'brightness(1)',
                                },
                              }}
                            />
                          ) : (
                            <Typography
                              variant="body1"
                              sx={{
                                fontWeight: 600,
                                color: 'primary.main',
                              }}
                            >
                              {sponsor.name}
                            </Typography>
                          )}
                        </Box>
                      </Tooltip>
                    ))}
                  </Box>
                </Box>
              )}
            </>
          )}
        </Container>
      </Box>
    </Box>
  );
};

export default DemoPartyDashboard;
