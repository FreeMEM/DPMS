// src/NavBar.js
import React from "react";
import { AppBar, Toolbar, Tabs, Tab, Box } from "@mui/material";
import { useTranslation } from "react-i18next";

function NavBar({ value, handleChange }) {
  const { t } = useTranslation();

  return (
    <AppBar position="static">
      <Toolbar>
        <Box sx={{ flexGrow: 1 }}>
          <img
            src={`${process.env.PUBLIC_URL}/assets/logo_navbar2024.png`}
            alt="Posadas Party Logo"
            style={{ height: 50 }}
          />
        </Box>
        <Tabs value={value} onChange={handleChange} textColor="inherit" indicatorColor="secondary">
          <Tab label={t("HOME")} />
          <Tab label={t("WHAT IS IT?")} />
          <Tab label={t("COMPETITIONS")} />
          <Tab label={t("RULES")} />
          <Tab label={t("GALLERY")} />
          <Tab label={t("CONTACT")} />
          <Tab label={t("REGISTER")} />
          <Tab label={t("LOGIN")} />
        </Tabs>
      </Toolbar>
    </AppBar>
  );
}

export default NavBar;
