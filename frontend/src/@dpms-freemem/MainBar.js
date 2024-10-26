import React, { useState, useContext } from "react";
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
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import AccountCircle from "@mui/icons-material/AccountCircle";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft"; // Importa el icono de cierre
import { useTranslation } from "react-i18next";
import { AuthContext } from "./AuthContext"; // Importa el contexto de autenticación

function MainBar() {
  const { t } = useTranslation();
  const { logout } = useContext(AuthContext); // Usa el contexto de autenticación
  const [open, setOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

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

  return (
    <Box>
      <Box className="top-bar">
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
        <Menu
          id="menu-appbar"
          anchorEl={anchorEl}
          anchorOrigin={{
            vertical: "top",
            horizontal: "right",
          }}
          keepMounted
          transformOrigin={{
            vertical: "top",
            horizontal: "right",
          }}
          open={Boolean(anchorEl)}
          onClose={handleClose}
        >
          <MenuItem onClick={handleClose}>{t("Perfil")}</MenuItem>
          <MenuItem onClick={handleLogout}>{t("Salir")}</MenuItem>
        </Menu>
      </Box>
      <Drawer
        variant={isMobile ? "temporary" : "persistent"}
        className="drawer"
        classes={{ paper: "drawer-paper" }}
        open={open}
        onClose={toggleDrawer}
        ModalProps={{
          keepMounted: true, // Mejor rendimiento en pantallas móviles
        }}
      >
        <Box className="drawer-header">
          <img src={`${process.env.PUBLIC_URL}/assets/logo_navbar2025.png`} alt="Posadas Party Logo" className="logo" />
          <IconButton onClick={toggleDrawer}>
            <ChevronLeftIcon />
          </IconButton>
        </Box>
        <Box className="drawer-content">
          <List sx={{ width: "100%" }}>
            <ListItemButton>
              <ListItemText primary={t("Home")} />
            </ListItemButton>

            <ListItemButton>
              <ListItemText primary={t("Competitions")} />
            </ListItemButton>
            <ListItemButton>
              <ListItemText primary={t("Rules")} />
            </ListItemButton>
            <ListItemButton>
              <ListItemText primary={t("Gallery")} />
            </ListItemButton>
            <ListItemButton>
              <ListItemText primary={t("Contact")} />
            </ListItemButton>
          </List>
        </Box>
      </Drawer>
    </Box>
  );
}

export default MainBar;
