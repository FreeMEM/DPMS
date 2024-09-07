// src/i18n.js
import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import Backend from "i18next-http-backend";

// Traducciones
const resources = {
  en: {
    translation: {
      HOME: "HOME",
      "WHAT IS IT?": "WHAT IS IT?",
      COMPETITIONS: "COMPETITIONS",
      RULES: "RULES",
      GALLERY: "GALLERY",
      CONTACT: "CONTACT",
      REGISTER: "REGISTER",
      LOGIN: "LOGIN",
      "Forgot Password?": "Forgot Password?",
      "Don't have an account?": "Don't have an account?",
      "Sing Up": "Sing Up",
      "Sign in with Google": "Sign in with Google",
    },
  },
  es: {
    translation: {
      HOME: "INICIO",
      "WHAT IS IT?": "¿QUÉ ES?",
      COMPETITIONS: "COMPETICIONES",
      RULES: "NORMATIVA",
      GALLERY: "GALERÍA",
      CONTACT: "CONTACTO",
      REGISTER: "REGISTRO",
      LOGIN: "LOGIN",
      "Forgot Password?": "¿Olvidaste tu contraseña?",
      "Don't have an account?": "¿No tienes una cuenta?",
      "Sing Up": "Regístrate",
      "Sign in with Google": "Iniciar sesión con Google",
    },
  },
};

i18n
  .use(Backend)
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: "en",
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
