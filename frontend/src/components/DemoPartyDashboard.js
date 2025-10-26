import React, { useState } from "react";
import MainBar from "../@dpms-freemem/MainBar"; // Ruta relativa correcta
import Content from "../@dpms-freemem/Content"; // Ruta relativa correcta
import { Box } from "@mui/material";

const DemoPartyDashboard = () => {
  const [value, setValue] = useState(1);
  console.log("value", value);

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  return (
    <Box sx={{ display: 'flex' }}>
      <MainBar value={value} panel={"user"} handleChange={handleChange} />
      <Box component="main" sx={{ flexGrow: 1, p: 3, mt: 8, ml: { sm: '64px' } }}>
        <Content page={value} />
      </Box>
    </Box>
  );
};

export default DemoPartyDashboard;
