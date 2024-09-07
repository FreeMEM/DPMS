import "@fontsource/roboto"; // Importa la fuente Roboto
import { createTheme } from "@mui/material/styles";
import "@fontsource/roboto/300.css";
import "@fontsource/roboto/400.css";
import "@fontsource/roboto/500.css";
import "@fontsource/roboto/700.css";

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
  components: {
    MuiAlert: {
      styleOverrides: {
        root: ({ ownerState }) => ({
          ...(ownerState.severity === "info" && {
            backgroundColor: "#60a5fa",
          }),
        }),
      },
    },
  },
});

export default theme;
