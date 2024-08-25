import React, { useState } from "react";
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import theme from "./theme";
import NavBar from "./@dpms-freemem/MainBar";
import ParticleEffects from "./effects/ParticleEffects";
import Content from "./@dpms-freemem/Content";

function App() {
  const [page, setPage] = useState(0);

  const handleChange = (event, newValue) => {
    setPage(newValue);
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <ParticleEffects />
      <NavBar value={page} handleChange={handleChange} />
      <Content page={page} />
    </ThemeProvider>
  );
}

export default App;
