import React, { useState } from "react";
import MainBar from "../@dpms-freemem/MainBar"; // Ruta relativa correcta
import Content from "../@dpms-freemem/Content"; // Ruta relativa correcta
import { Box } from "@mui/material";

const Dashboard = () => {
  const [value, setValue] = useState(0);

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  return (
    <Box>
      <MainBar value={value} handleChange={handleChange} />
      {value === 0 && <Content />}
      {value === 1 && <div>What is it? Content</div>}
      {value === 2 && <div>Competitions Content</div>}
      {value === 3 && <div>Rules Content</div>}
      {value === 4 && <div>Gallery Content</div>}
      {value === 5 && <div>Contact Content</div>}
      {value === 6 && <div>Register Content</div>}
      {value === 7 && <div>Login Content</div>}
    </Box>
  );
};

export default Dashboard;
