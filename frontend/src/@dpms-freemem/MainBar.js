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
import { useTranslation } from "react-i18next";
import { AuthContext } from "../AuthContext";

const MainBar = () => {
  const { t } = useTranslation();
  const { logout, groups } = useContext(AuthContext);
  const [open, setOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [panel, setPanel] = useState("user");
  const theme = useTheme();

  const isLargeScreen = useMediaQuery(theme.breakpoints.up("lg"));
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const navigate = useNavigate();
  const location = useLocation();

  // Determina el panel correcto según la ruta
  useEffect(() => {
    if (location.pathname === "/demo-party/dashboard") {
      setPanel("user");
    } else if (groups.includes("DPMS Admins") && location.pathname.startsWith("/admin/dashboard")) {
      setPanel("admin");
    } else if (groups.includes("DPMS Users")) {
      setPanel("user");
    }
  }, [groups, location]);

  // Cierra el drawer en móvil cuando cambia la ubicación
  useEffect(() => {
    if (isMobile && open) {
      setOpen(false);
    }
  }, [location.pathname, isMobile]);

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
    setPanel("user");
    navigate("/");
    handleClose();
  };

  const handleAdminPanel = () => {
    setPanel("admin");
    navigate("/admin/dashboard");
    handleClose();
  };

  const handleParty = () => {
    setPanel("user");
    navigate("/demo-party/dashboard");
    handleClose();
  };

  // Función para obtener el label actual para mostrar al lado del AccountCircle
  const getCurrentLabel = () => {
    if (location.pathname.startsWith("/admin/dashboard")) {
      return t("Administrator");
    } else if (location.pathname === "/demo-party/dashboard") {
      return t("Demo Party");
    } else {
      return t("User");
    }
  };

  // Función para verificar si una ruta está activa
  const isActive = (path) => location.pathname === path;

  return (
    <Box>
      <Box className="top-bar" display="flex" alignItems="center" justifyContent="space-between">
        <Box display="flex" alignItems="center">
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={toggleDrawer}
            className="icon-button"
          >
            <MenuIcon />
          </IconButton>
          <img src={`${process.env.PUBLIC_URL}/assets/logo_navbar2025.png`} alt="Posadas Party Logo" className="logo" />
        </Box>
        <Box display="flex" alignItems="center">
          <Typography variant="body1" color="inherit" sx={{ marginRight: 1 }}>
            {getCurrentLabel()}
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
            <MenuItem onClick={handleAdminPanel} selected={location.pathname.startsWith("/admin/dashboard")}>
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
              <ListItemButton selected={isActive("/")} onClick={handleUserPanel} sx={{ justifyContent: open ? 'initial' : 'center' }}>
                <ListItemIcon sx={{ minWidth: open ? 40 : 0, mr: open ? 3 : 'auto', justifyContent: 'center' }}>
                  <HomeIcon />
                </ListItemIcon>
                {open && <ListItemText primary={t("User Panel")} />}
              </ListItemButton>
              <ListItemButton selected={isActive("/admin/dashboard")} onClick={() => navigate("/admin/dashboard")} sx={{ justifyContent: open ? 'initial' : 'center' }}>
                <ListItemIcon sx={{ minWidth: open ? 40 : 0, mr: open ? 3 : 'auto', justifyContent: 'center' }}>
                  <DashboardIcon />
                </ListItemIcon>
                {open && <ListItemText primary={t("Dashboard")} />}
              </ListItemButton>
              <ListItemButton
                selected={isActive("/admin/dashboard/users")}
                onClick={() => navigate("/admin/dashboard/users")}
                sx={{ justifyContent: open ? 'initial' : 'center' }}
              >
                <ListItemIcon sx={{ minWidth: open ? 40 : 0, mr: open ? 3 : 'auto', justifyContent: 'center' }}>
                  <PeopleIcon />
                </ListItemIcon>
                {open && <ListItemText primary={t("Users")} />}
              </ListItemButton>
              <ListItemButton
                selected={isActive("/admin/dashboard/settings")}
                onClick={() => navigate("/admin/dashboard/settings")}
                sx={{ justifyContent: open ? 'initial' : 'center' }}
              >
                <ListItemIcon sx={{ minWidth: open ? 40 : 0, mr: open ? 3 : 'auto', justifyContent: 'center' }}>
                  <SettingsIcon />
                </ListItemIcon>
                {open && <ListItemText primary={t("Settings")} />}
              </ListItemButton>
            </List>
          </Box>
        )}
      </Drawer>
    </Box>
  );
};

export default MainBar;
