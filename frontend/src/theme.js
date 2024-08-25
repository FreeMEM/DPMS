import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    mode: "dark",
    primary: {
      main: "#00FF00", // Verde vibrante
    },
    secondary: {
      main: "#FFA500", // Naranja vibrante
    },
    background: {
      default: "#000000", // Fondo negro
      paper: "#1C1C1C", // Fondo de papel oscuro
    },
    text: {
      primary: "#FFFFFF", // Blanco para el texto principal
      secondary: "#00FF00", // Verde para el texto secundario
    },
  },
  typography: {
    fontFamily: "Roboto, Arial, sans-serif",
  },
});

export default theme;
