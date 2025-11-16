import React, { useState } from "react";
import MainBar from "../@dpms-freemem/MainBar"; // Ruta relativa correcta
import Content from "../@dpms-freemem/Content"; // Ruta relativa correcta
import ThreeBackground from "./common/ThreeBackground";
import { Box } from "@mui/material";

const DemoPartyDashboard = () => {
  const [value, setValue] = useState(1);

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  return (
    <Box sx={{ display: 'flex' }}>
      <ThreeBackground variant="user" />
      <MainBar value={value} panel={"user"} handleChange={handleChange} />
      <Box component="main" sx={{ flexGrow: 1, p: 3, mt: 8, ml: { sm: '64px' }, position: 'relative', zIndex: 1 }}>
        <Content page={value} />
      </Box>
    </Box>
  );
};

export default DemoPartyDashboard;
