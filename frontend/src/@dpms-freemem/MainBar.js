// src/NavBar.js
import React from "react";
import { AppBar, Toolbar, Typography, Tabs, Tab } from "@mui/material";

function NavBar({ value, handleChange }) {
  return (
    <AppBar position="static">
      <Toolbar>
        <Typography variant="h6" sx={{ flexGrow: 1 }}>
          <img
            src={`${process.env.PUBLIC_URL}/assets/logo_navbar2024.png`}
            alt="Posadas Party Logo"
            style={{ height: 50 }}
          />
        </Typography>
        <Tabs value={value} onChange={handleChange} textColor="inherit" indicatorColor="secondary">
          <Tab label="INICIO" />
          <Tab label="¿QUÉ ES?" />
          <Tab label="COMPETICIONES" />
          <Tab label="NORMATIVA" />
          <Tab label="GALERÍA" />
          <Tab label="CONTACTO" />
          <Tab label="REGISTRO" />
          <Tab label="LOGIN" />
        </Tabs>
      </Toolbar>
    </AppBar>
  );
}

export default NavBar;
