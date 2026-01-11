import React, { useState, useContext, useEffect } from "react";
import {
  Drawer,
  List,
  ListItemButton,
  ListItemText,
  IconButton,
  Box,
  useMediaQuery,
  useTheme,
  Menu,
  MenuItem,
  ListItemIcon,
  Typography,
} from "@mui/material";
import { useNavigate, useLocation } from "react-router-dom";
import MenuIcon from "@mui/icons-material/Menu";
import AccountCircle from "@mui/icons-material/AccountCircle";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import HomeIcon from "@mui/icons-material/Home";
import GavelIcon from "@mui/icons-material/Gavel";
import PhotoLibraryIcon from "@mui/icons-material/PhotoLibrary";
import ContactMailIcon from "@mui/icons-material/ContactMail";
import PersonIcon from "@mui/icons-material/Person";
import ExitToAppIcon from "@mui/icons-material/ExitToApp";
import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings";
import DashboardIcon from "@mui/icons-material/Dashboard";
import SettingsIcon from "@mui/icons-material/Settings";
import PeopleIcon from "@mui/icons-material/People";
import CelebrationIcon from "@mui/icons-material/Celebration";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import FolderIcon from "@mui/icons-material/Folder";
import CategoryIcon from "@mui/icons-material/Category";
import { useTranslation } from "react-i18next";
import { AuthContext } from "../AuthContext";

const MainBar = () => {
  const { t } = useTranslation();
  const { logout, groups, user } = useContext(AuthContext);
  const [open, setOpen] = useState(() => {
    // Persistir estado del drawer en localStorage
    const saved = localStorage.getItem('drawerOpen');
    return saved !== null ? JSON.parse(saved) : false;
  });
  const [anchorEl, setAnchorEl] = useState(null);
  const theme = useTheme();

  const isDesktop = useMediaQuery(theme.breakpoints.up("sm")); // sm, md, lg, xl (≥600px)
  const isMobile = !isDesktop; // xs (<600px)
  const navigate = useNavigate();
  const location = useLocation();

  // Determina el panel basándose en la ruta actual
  const panel = location.pathname.startsWith("/admin") ? "admin" : "user";

  // Guardar estado del drawer en localStorage cuando cambia
  useEffect(() => {
    localStorage.setItem('drawerOpen', JSON.stringify(open));
  }, [open]);

  // Cierra el drawer en móvil cuando cambia la ubicación
  useEffect(() => {
    if (isMobile) {
      setOpen(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  const toggleDrawer = () => {
    setOpen(!open);
  };

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    handleClose();
  };

  const handleUserPanel = () => {
    navigate("/demo-party/dashboard");
    handleClose();
  };

  const handleAdminPanel = () => {
    navigate("/admin/dashboard");
    handleClose();
  };

  const handleParty = () => {
    navigate("/demo-party/dashboard");
    handleClose();
  };

  // Función para obtener el nombre del usuario para mostrar al lado del AccountCircle
  const getUserDisplayName = () => {
    if (user) {
      // Prioridad: nickname > first_name > email (parte antes del @)
      if (user.nickname) return user.nickname;
      if (user.first_name) return user.first_name;
      if (user.email) return user.email.split('@')[0];
    }
    return t("User");
  };

  // Función para verificar si una ruta está activa
  const isActive = (path) => location.pathname === path;

  return (
    <Box>
      <Box
        className="top-bar"
        display="flex"
        alignItems="center"
        justifyContent="space-between"
        sx={{
          position: 'fixed',
          top: 0,
          left: isDesktop ? (open ? '240px' : '64px') : 0,
          right: 0,
          zIndex: theme.zIndex.drawer - 1,
          paddingLeft: '0 !important',
          paddingRight: '16px',
          transition: theme.transitions.create('left', {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
          }),
        }}
      >
        <Box
          display="flex"
          alignItems="center"
          sx={{ pl: isDesktop ? '8px' : 0 }}
        >
          {isMobile && (
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="start"
              onClick={toggleDrawer}
              className="icon-button"
            >
              <MenuIcon />
            </IconButton>
          )}
          <img src={`${process.env.PUBLIC_URL}/assets/logo_navbar2025.png`} alt="Posadas Party Logo" className="logo" />
        </Box>
        <Box display="flex" alignItems="center">
          <Typography variant="body1" color="inherit" sx={{ marginRight: 1 }}>
            {getUserDisplayName()}
          </Typography>
          <IconButton
            color="inherit"
            aria-label="account of current user"
            aria-controls="menu-appbar"
            aria-haspopup="true"
            onClick={handleMenu}
            className="icon-button"
          >
            <AccountCircle />
          </IconButton>
        </Box>
        <Menu
          id="menu-appbar"
          anchorEl={anchorEl}
          anchorOrigin={{ vertical: "top", horizontal: "right" }}
          keepMounted
          transformOrigin={{ vertical: "top", horizontal: "right" }}
          open={Boolean(anchorEl)}
          onClose={handleClose}
        >
          <MenuItem onClick={handleClose}>
            <ListItemIcon>
              <PersonIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText primary={t("Profile")} />
          </MenuItem>
          {groups.includes("DPMS Admins") && (
            <MenuItem onClick={handleAdminPanel} selected={location.pathname.startsWith("/admin")}>
              <ListItemIcon>
                <AdminPanelSettingsIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText primary={t("Administration")} />
            </MenuItem>
          )}
          <MenuItem onClick={handleParty} selected={location.pathname === "/demo-party/dashboard"}>
            <ListItemIcon>
              <CelebrationIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText primary={t("Demo Party")} />
          </MenuItem>
          <MenuItem onClick={handleLogout}>
            <ListItemIcon>
              <ExitToAppIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText primary={t("Sign out")} />
          </MenuItem>
        </Menu>
      </Box>
      <Drawer
        variant={isMobile ? "temporary" : "permanent"}
        open={open}
        onClose={isMobile ? toggleDrawer : null}
        ModalProps={{ keepMounted: true }}
        sx={{
          width: open ? 240 : 64,
          flexShrink: 0,
          whiteSpace: 'nowrap',
          boxSizing: 'border-box',
          "& .MuiDrawer-paper": {
            width: open ? 240 : 64,
            transition: theme.transitions.create('width', {
              easing: theme.transitions.easing.sharp,
              duration: theme.transitions.duration.enteringScreen,
            }),
            overflowX: 'hidden',
            zIndex: theme.zIndex.drawer,
          },
        }}
      >
        <Box className="drawer-header" display="flex" justifyContent={open ? "space-between" : "center"} alignItems="center" p={1}>
          {open && <img src={`${process.env.PUBLIC_URL}/assets/logo_navbar2025.png`} alt="Posadas Party Logo" className="logo" />}
          <IconButton onClick={toggleDrawer}>
            {open ? <ChevronLeftIcon /> : <MenuIcon />}
          </IconButton>
        </Box>
        {panel === "user" && (
          <Box className="drawer-content">
            <List sx={{ width: "100%" }}>
              <ListItemButton selected={isActive("/")} onClick={() => navigate("/")} sx={{ justifyContent: open ? 'initial' : 'center' }}>
                <ListItemIcon sx={{ minWidth: open ? 40 : 0, mr: open ? 3 : 'auto', justifyContent: 'center' }}>
                  <HomeIcon />
                </ListItemIcon>
                {open && <ListItemText primary={t("Home")} />}
              </ListItemButton>
              <ListItemButton selected={isActive("/compos")} onClick={() => navigate("/compos")} sx={{ justifyContent: open ? 'initial' : 'center' }}>
                <ListItemIcon sx={{ minWidth: open ? 40 : 0, mr: open ? 3 : 'auto', justifyContent: 'center' }}>
                  <EmojiEventsIcon />
                </ListItemIcon>
                {open && <ListItemText primary={t("Competitions")} />}
              </ListItemButton>
              <ListItemButton selected={isActive("/my-productions")} onClick={() => navigate("/my-productions")} sx={{ justifyContent: open ? 'initial' : 'center' }}>
                <ListItemIcon sx={{ minWidth: open ? 40 : 0, mr: open ? 3 : 'auto', justifyContent: 'center' }}>
                  <FolderIcon />
                </ListItemIcon>
                {open && <ListItemText primary={t("My Productions")} />}
              </ListItemButton>
              <ListItemButton selected={isActive("/rules")} onClick={() => navigate("/rules")} sx={{ justifyContent: open ? 'initial' : 'center' }}>
                <ListItemIcon sx={{ minWidth: open ? 40 : 0, mr: open ? 3 : 'auto', justifyContent: 'center' }}>
                  <GavelIcon />
                </ListItemIcon>
                {open && <ListItemText primary={t("Rules")} />}
              </ListItemButton>
              <ListItemButton selected={isActive("/gallery")} onClick={() => navigate("/gallery")} sx={{ justifyContent: open ? 'initial' : 'center' }}>
                <ListItemIcon sx={{ minWidth: open ? 40 : 0, mr: open ? 3 : 'auto', justifyContent: 'center' }}>
                  <PhotoLibraryIcon />
                </ListItemIcon>
                {open && <ListItemText primary={t("Gallery")} />}
              </ListItemButton>
              <ListItemButton selected={isActive("/contact")} onClick={() => navigate("/contact")} sx={{ justifyContent: open ? 'initial' : 'center' }}>
                <ListItemIcon sx={{ minWidth: open ? 40 : 0, mr: open ? 3 : 'auto', justifyContent: 'center' }}>
                  <ContactMailIcon />
                </ListItemIcon>
                {open && <ListItemText primary={t("Contact")} />}
              </ListItemButton>
            </List>
          </Box>
        )}
        {panel === "admin" && (
          <Box className="drawer-content">
            <List sx={{ width: "100%" }}>
              <ListItemButton selected={isActive("/admin/dashboard")} onClick={() => navigate("/admin/dashboard")} sx={{ justifyContent: open ? 'initial' : 'center' }}>
                <ListItemIcon sx={{ minWidth: open ? 40 : 0, mr: open ? 3 : 'auto', justifyContent: 'center' }}>
                  <DashboardIcon />
                </ListItemIcon>
                {open && <ListItemText primary={t("Dashboard")} />}
              </ListItemButton>
              <ListItemButton
                selected={location.pathname.startsWith("/admin/editions")}
                onClick={() => navigate("/admin/editions")}
                sx={{ justifyContent: open ? 'initial' : 'center' }}
              >
                <ListItemIcon sx={{ minWidth: open ? 40 : 0, mr: open ? 3 : 'auto', justifyContent: 'center' }}>
                  <EmojiEventsIcon />
                </ListItemIcon>
                {open && <ListItemText primary={t("Editions")} />}
              </ListItemButton>
              <ListItemButton
                selected={location.pathname.startsWith("/admin/compos")}
                onClick={() => navigate("/admin/compos")}
                sx={{ justifyContent: open ? 'initial' : 'center' }}
              >
                <ListItemIcon sx={{ minWidth: open ? 40 : 0, mr: open ? 3 : 'auto', justifyContent: 'center' }}>
                  <CategoryIcon />
                </ListItemIcon>
                {open && <ListItemText primary={t("Competitions")} />}
              </ListItemButton>
              <ListItemButton
                selected={location.pathname.startsWith("/admin/productions")}
                onClick={() => navigate("/admin/productions")}
                sx={{ justifyContent: open ? 'initial' : 'center' }}
              >
                <ListItemIcon sx={{ minWidth: open ? 40 : 0, mr: open ? 3 : 'auto', justifyContent: 'center' }}>
                  <FolderIcon />
                </ListItemIcon>
                {open && <ListItemText primary={t("Productions")} />}
              </ListItemButton>
              <ListItemButton
                selected={location.pathname.startsWith("/admin/voting-config")}
                onClick={() => navigate("/admin/voting-config")}
                sx={{ justifyContent: open ? 'initial' : 'center' }}
              >
                <ListItemIcon sx={{ minWidth: open ? 40 : 0, mr: open ? 3 : 'auto', justifyContent: 'center' }}>
                  <SettingsIcon />
                </ListItemIcon>
                {open && <ListItemText primary={t("Voting Config")} />}
              </ListItemButton>
              <ListItemButton
                selected={location.pathname.startsWith("/admin/jury")}
                onClick={() => navigate("/admin/jury")}
                sx={{ justifyContent: open ? 'initial' : 'center' }}
              >
                <ListItemIcon sx={{ minWidth: open ? 40 : 0, mr: open ? 3 : 'auto', justifyContent: 'center' }}>
                  <PeopleIcon />
                </ListItemIcon>
                {open && <ListItemText primary={t("Jury")} />}
              </ListItemButton>
            </List>
          </Box>
        )}
      </Drawer>
    </Box>
  );
};

export default MainBar;
