import React from "react";
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import theme from "./theme";
import AuthProvider from "./@dpms-freemem/AuthContext";

import AppRoutes from "./routes";

function App() {
  // const [page, setPage] = useState(0);

  // const handleChange = (event, newValue) => {
  //   setPage(newValue);
  // };

  return (
    <AuthProvider>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <AppRoutes />
        {/* <ParticleEffects /> */}
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;
