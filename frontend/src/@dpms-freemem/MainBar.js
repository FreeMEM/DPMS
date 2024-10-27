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
import SportsEsportsIcon from "@mui/icons-material/SportsEsports";
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
  const location = useLocation(); // Obtener la ubicación actual

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

  useEffect(() => {
    setOpen(isLargeScreen);
  }, [isLargeScreen]);

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
        variant={isMobile ? "temporary" : "persistent"}
        open={open}
        onClose={!isLargeScreen ? toggleDrawer : null}
        ModalProps={{ keepMounted: true }}
        sx={{ "& .MuiDrawer-paper": { width: 240 } }}
      >
        <Box className="drawer-header" display="flex" justifyContent="space-between" alignItems="center" p={1}>
          <img src={`${process.env.PUBLIC_URL}/assets/logo_navbar2025.png`} alt="Posadas Party Logo" className="logo" />
          <IconButton onClick={toggleDrawer}>
            <ChevronLeftIcon />
          </IconButton>
        </Box>
        {panel === "user" && (
          <Box className="drawer-content">
            <List sx={{ width: "100%" }}>
              <ListItemButton selected={isActive("/")} onClick={() => navigate("/")}>
                <ListItemIcon>
                  <HomeIcon />
                </ListItemIcon>
                <ListItemText primary={t("Home")} />
              </ListItemButton>
              <ListItemButton selected={isActive("/competitions")} onClick={() => navigate("/competitions")}>
                <ListItemIcon>
                  <SportsEsportsIcon />
                </ListItemIcon>
                <ListItemText primary={t("Competitions")} />
              </ListItemButton>
              <ListItemButton selected={isActive("/rules")} onClick={() => navigate("/rules")}>
                <ListItemIcon>
                  <GavelIcon />
                </ListItemIcon>
                <ListItemText primary={t("Rules")} />
              </ListItemButton>
              <ListItemButton selected={isActive("/gallery")} onClick={() => navigate("/gallery")}>
                <ListItemIcon>
                  <PhotoLibraryIcon />
                </ListItemIcon>
                <ListItemText primary={t("Gallery")} />
              </ListItemButton>
              <ListItemButton selected={isActive("/contact")} onClick={() => navigate("/contact")}>
                <ListItemIcon>
                  <ContactMailIcon />
                </ListItemIcon>
                <ListItemText primary={t("Contact")} />
              </ListItemButton>
            </List>
          </Box>
        )}
        {panel === "admin" && (
          <Box className="drawer-content">
            <List sx={{ width: "100%" }}>
              <ListItemButton selected={isActive("/")} onClick={handleUserPanel}>
                <ListItemIcon>
                  <HomeIcon />
                </ListItemIcon>
                <ListItemText primary={t("User Panel")} />
              </ListItemButton>
              <ListItemButton selected={isActive("/admin/dashboard")} onClick={() => navigate("/admin/dashboard")}>
                <ListItemIcon>
                  <DashboardIcon />
                </ListItemIcon>
                <ListItemText primary={t("Dashboard")} />
              </ListItemButton>
              <ListItemButton
                selected={isActive("/admin/dashboard/users")}
                onClick={() => navigate("/admin/dashboard/users")}
              >
                <ListItemIcon>
                  <PeopleIcon />
                </ListItemIcon>
                <ListItemText primary={t("Users")} />
              </ListItemButton>
              <ListItemButton
                selected={isActive("/admin/dashboard/settings")}
                onClick={() => navigate("/admin/dashboard/settings")}
              >
                <ListItemIcon>
                  <SettingsIcon />
                </ListItemIcon>
                <ListItemText primary={t("Settings")} />
              </ListItemButton>
            </List>
          </Box>
        )}
      </Drawer>
    </Box>
  );
};

export default MainBar;
