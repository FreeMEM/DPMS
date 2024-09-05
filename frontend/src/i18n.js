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
