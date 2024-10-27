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
    <Box>
      <MainBar value={value} panel={"user"} handleChange={handleChange} />
      <Content page={value} />
    </Box>
  );
};

export default DemoPartyDashboard;
