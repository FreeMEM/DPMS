// src/i18n.js
import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import Backend from "i18next-http-backend";

// Traducciones
const resources = {
  en: {
    translation: {
      Home: "Inicio",
      Competitions: "Competitions",
      Rules: "NormaRulestiva",
      Gallery: "Gallery",
      Contact: "Contact",
      "My Productions": "My Productions",
      "Forgot your Password?": "Forgot your Password?",
      "Don't have an account?": "Don't have an account?",
      "Sing Up": "Sing Up",
      "Sign in with Google": "Sign in with Google",
      "Sign in with SceneID": "Sign in with SceneID",
      "Sign in": "Sign in",
      "Invalid email or password. Please try again.": "Invalid email or password. Please try again.",
      "An unexpected error occurred. Please try again later.": "An unexpected error occurred. Please try again later.",
      Profile: "Profile",
      "Sign out": "Sign out",
      Administration: "Administration",
    },
  },
  es: {
    translation: {
      Home: "Inicio",
      Competitions: "Competiciones",
      Rules: "Normativa",
      Gallery: "Galería",
      Contact: "Contacto",
      "My Productions": "Mis Producciones",
      "Forgot your Password?": "¿Olvidaste tu contraseña?",
      "Don't have an account?": "¿No tienes una cuenta?",
      "Sing Up": "Regístrate",
      "Sign in with Google": "Iniciar sesión con Google",
      "Sign in": "Iniciar sesión",
      "Sign In": "Iniciar Sesión",
      "Sign Up": "Registrarse",
      "Enter your email": "Introduce tu correo",
      "Enter your password": "Introduce tu contraseña",
      "Confirm your password": "Confirma tu contraseña",
      "Enter your group": "Introduce tu grupo",
      "Enter your nickname": "Introduce tu nick/apodo",
      "Enter your first name": "Introduce tu nombre",
      "Enter your last name": "Introduce tu apellido",
      "Invalid email or password. Please try again.": "Correo o contraseña inválidos. Por favor, inténtalo de nuevo.",
      "An unexpected error occurred. Please try again later.":
        "Ocurrió un error inesperado. Por favor, inténtalo de nuevo más tarde.",
      "Sign in with SceneID": "Iniciar sesión con SceneID",
      "Already have an account?": "¿Ya tienes una cuenta?",
      "Account Verification": "Verificación de Cuenta",
      "Please wait while we verify your account": "Por favor, espera mientras verificamos tu cuenta",
      "Welcome {{name}}! Your account is verified.": "¡Bienvenido {{name}}! Tu cuenta está verificada.",
      "Congratulations and welcome to Posadas Party community":
        "¡Felicidades y bienvenido a la comunidad de Posadas Party!",
      "Verification failed. Please try again": "La verificación falló. Por favor, inténtalo de nuevo",
      "Token is missing": "Falta el token",
      "An error occurred": "Ocurrió un error",
      "Sorry, the page you are looking for does not exist": "Lo siento, la página que buscas no existe",
      "A confirmation email has been sent to your email address. Please check your inbox to verify your account":
        "Se ha enviado un correo de confirmación a tu dirección de correo. Por favor, revisa tu bandeja de entrada para verificar tu cuenta",
      "Registration Complete": "Registro Completado",
      Profile: "Perfil",
      "Sign out": "Cerrar sesión",
      Administration: "Administración",
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
