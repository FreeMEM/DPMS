// src/i18n.js
import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import Backend from "i18next-http-backend";

// Traducciones
const resources = {
  en: {
    translation: {
      // Navigation
      Home: "Home",
      Competitions: "Competitions",
      Rules: "Rules",
      Gallery: "Gallery",
      Contact: "Contact",
      "My Productions": "My Productions",
      Profile: "Profile",
      "Sign out": "Sign out",
      Administration: "Administration",
      "Demo Party": "Demo Party",
      User: "User",

      // Auth
      "Forgot your Password?": "Forgot your Password?",
      "Don't have an account?": "Don't have an account?",
      "Sing Up": "Sign Up",
      "Sign Up": "Sign Up",
      "Sign in with Google": "Sign in with Google",
      "Sign in with SceneID": "Sign in with SceneID",
      "Sign in": "Sign in",
      "Sign In": "Sign In",
      "Invalid email or password. Please try again.": "Invalid email or password. Please try again.",
      "An unexpected error occurred. Please try again later.": "An unexpected error occurred. Please try again later.",

      // Admin Menu
      Dashboard: "Dashboard",
      Editions: "Editions",
      Productions: "Productions",
      "Voting Config": "Voting Config",
      Jury: "Jury",

      // Admin Pages - Titles
      "Administration Panel": "Administration Panel",
      "Editions Management": "Editions Management",
      "Competitions Management": "Competitions Management",
      "Productions Management": "Productions Management",
      "Jury Management": "Jury Management",
      "Voting Configuration": "Voting Configuration",
      "Attendance Codes": "Attendance Codes",
      "Edition Detail": "Edition Detail",
      "Competition Detail": "Competition Detail",
      "Production Detail": "Production Detail",
      "New Edition": "New Edition",
      "Edit Edition": "Edit Edition",
      "New Competition": "New Competition",
      "Edit Competition": "Edit Competition",

      // Admin Dashboard
      "Registered Users": "Registered Users",
      "Votes Cast": "Votes Cast",
      "Welcome to Administration Panel": "Welcome to Administration Panel",

      // Actions
      "View detail": "View detail",
      Edit: "Edit",
      Delete: "Delete",
      Save: "Save",
      Cancel: "Cancel",
      Create: "Create",
      Update: "Update",
      "Delete Edition": "Delete Edition",
      "Delete Competition": "Delete Competition",
      "Delete Production": "Delete Production",
      "Delete Configuration": "Delete Configuration",
      "Delete Jury Member": "Delete Jury Member",

      // Voting Config Labels
      "100% Public": "100% Public",
      "100% Jury": "100% Jury",
      Mixed: "Mixed",
      Open: "Open",
      "Attendance Code": "Attendance Code",
      "Manual Verification": "Manual Verification",
      "QR Check-in": "QR Check-in",

      // Dashboard descriptions
      "Create and manage party editions": "Create and manage party editions",
      "Configure competition types (compos)": "Configure competition types (compos)",
      "Configure voting system and juries": "Configure voting system and juries",
      "Manage all aspects of DPMS system from this centralized panel.": "Manage all aspects of DPMS system from this centralized panel.",
      "Manage Editions": "Manage Editions",
      "Manage Compos": "Manage Compos",
      "Configure Voting": "Configure Voting",
      Voting: "Voting",

      // Table Headers
      Title: "Title",
      Description: "Description",
      "Open Submissions": "Open Submissions",
      Compos: "Compos",
      Created: "Created",
      Actions: "Actions",
      Name: "Name",
      Authors: "Authors",
      Edition: "Edition",
      Closed: "Closed",
      Icon: "Icon",
      Order: "Order",
      "Rows per page:": "Rows per page:",
      of: "of",

      // Filter Labels
      All: "All",
      Competition: "Competition",
      Status: "Status",
      Pending: "Pending",
      Approved: "Approved",
      Rejected: "Rejected",
      Ranking: "Ranking",
      Submitted: "Submitted",

      // Search & Empty States
      "Search editions...": "Search editions...",
      "Search competitions...": "Search competitions...",
      "Search productions...": "Search productions...",
      "No editions found": "No editions found",
      "No editions. Create a new one to get started.": "No editions. Create a new one to get started.",
      "No competitions found": "No competitions found",
      "No competitions. Create a new one to get started.": "No competitions. Create a new one to get started.",
      "No productions found": "No productions found",
      "No productions yet.": "No productions yet.",

      // Confirmations
      'Are you sure you want to delete the edition "{{title}}"? This action cannot be undone.': 'Are you sure you want to delete the edition "{{title}}"? This action cannot be undone.',
      'Are you sure you want to delete the competition "{{name}}"? This action cannot be undone.': 'Are you sure you want to delete the competition "{{name}}"? This action cannot be undone.',
      'Are you sure you want to delete the production "{{title}}"? This action cannot be undone.': 'Are you sure you want to delete the production "{{title}}"? This action cannot be undone.',
      'Are you sure you want to delete the voting configuration for "{{title}}"? This action cannot be undone.': 'Are you sure you want to delete the voting configuration for "{{title}}"? This action cannot be undone.',
      'Are you sure you want to remove {{name}} from the jury? This action cannot be undone.': 'Are you sure you want to remove {{name}} from the jury? This action cannot be undone.',

      // Common
      Loading: "Loading...",
      Error: "Error",
      Success: "Success",
      Yes: "Yes",
      No: "No",
      Public: "Public",
      Private: "Private",
      Active: "Active",
      Inactive: "Inactive",
    },
  },
  es: {
    translation: {
      // Navigation
      Home: "Inicio",
      Competitions: "Competiciones",
      Rules: "Normativa",
      Gallery: "Galería",
      Contact: "Contacto",
      "My Productions": "Mis Producciones",
      Profile: "Perfil",
      "Sign out": "Cerrar sesión",
      Administration: "Administración",
      "Demo Party": "Demo Party",
      User: "Usuario",

      // Auth
      "Forgot your Password?": "¿Olvidaste tu contraseña?",
      "Don't have an account?": "¿No tienes una cuenta?",
      "Sing Up": "Regístrate",
      "Sign Up": "Registrarse",
      "Sign in with Google": "Iniciar sesión con Google",
      "Sign in with SceneID": "Iniciar sesión con SceneID",
      "Sign in": "Iniciar sesión",
      "Sign In": "Iniciar Sesión",
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

      // Admin Menu
      Dashboard: "Panel",
      Editions: "Ediciones",
      Productions: "Producciones",
      "Voting Config": "Config. Votación",
      Jury: "Jurado",

      // Admin Pages - Titles
      "Administration Panel": "Panel de Administración",
      "Editions Management": "Gestión de Ediciones",
      "Competitions Management": "Gestión de Competiciones",
      "Productions Management": "Gestión de Producciones",
      "Jury Management": "Gestión de Jurado",
      "Voting Configuration": "Configuración de Votación",
      "Attendance Codes": "Códigos de Asistencia",
      "Edition Detail": "Detalle de Edición",
      "Competition Detail": "Detalle de Competición",
      "Production Detail": "Detalle de Producción",
      "New Edition": "Nueva Edición",
      "Edit Edition": "Editar Edición",
      "New Competition": "Nueva Competición",
      "Edit Competition": "Editar Competición",

      // Admin Dashboard
      "Registered Users": "Usuarios Registrados",
      "Votes Cast": "Votos Emitidos",
      "Welcome to Administration Panel": "Bienvenido al Panel de Administración",

      // Actions
      "View detail": "Ver detalle",
      Edit: "Editar",
      Delete: "Eliminar",
      Save: "Guardar",
      Cancel: "Cancelar",
      Create: "Crear",
      Update: "Actualizar",
      "Delete Edition": "Eliminar Edición",
      "Delete Competition": "Eliminar Competición",
      "Delete Production": "Eliminar Producción",
      "Delete Configuration": "Eliminar Configuración",
      "Delete Jury Member": "Eliminar Miembro del Jurado",

      // Voting Config Labels
      "100% Public": "100% Público",
      "100% Jury": "100% Jurado",
      Mixed: "Mixto",
      Open: "Abierto",
      "Attendance Code": "Código Asistencia",
      "Manual Verification": "Verificación Manual",
      "QR Check-in": "QR Check-in",

      // Dashboard descriptions
      "Create and manage party editions": "Crear y gestionar ediciones de parties",
      "Configure competition types (compos)": "Configurar tipos de competiciones (compos)",
      "Configure voting system and juries": "Configurar sistema de votación y jurados",
      "Manage all aspects of DPMS system from this centralized panel.": "Gestiona todos los aspectos del sistema DPMS desde este panel centralizado.",
      "Manage Editions": "Gestionar Ediciones",
      "Manage Compos": "Gestionar Compos",
      "Configure Voting": "Configurar Votación",
      Voting: "Votaciones",

      // Table Headers
      Title: "Título",
      Description: "Descripción",
      "Open Submissions": "Envíos Abiertos",
      Compos: "Compos",
      Created: "Creada",
      Actions: "Acciones",
      Name: "Nombre",
      Authors: "Autores",
      Edition: "Edición",
      Closed: "Cerrada",
      Icon: "Icono",
      Order: "Orden",
      "Rows per page:": "Filas por página:",
      of: "de",

      // Filter Labels
      All: "Todas",
      Competition: "Competición",
      Status: "Estado",
      Pending: "Pendiente",
      Approved: "Aprobada",
      Rejected: "Rechazada",
      Ranking: "Ranking",
      Submitted: "Enviado",

      // Search & Empty States
      "Search editions...": "Buscar ediciones...",
      "Search competitions...": "Buscar competiciones...",
      "Search productions...": "Buscar producciones...",
      "No editions found": "No se encontraron ediciones",
      "No editions. Create a new one to get started.": "No hay ediciones. Crea una nueva para empezar.",
      "No competitions found": "No se encontraron competiciones",
      "No competitions. Create a new one to get started.": "No hay competiciones. Crea una nueva para empezar.",
      "No productions found": "No se encontraron producciones",
      "No productions yet.": "Aún no hay producciones.",

      // Confirmations
      'Are you sure you want to delete the edition "{{title}}"? This action cannot be undone.': '¿Estás seguro de que quieres eliminar la edición "{{title}}"? Esta acción no se puede deshacer.',
      'Are you sure you want to delete the competition "{{name}}"? This action cannot be undone.': '¿Estás seguro de que quieres eliminar la competición "{{name}}"? Esta acción no se puede deshacer.',
      'Are you sure you want to delete the production "{{title}}"? This action cannot be undone.': '¿Estás seguro de que quieres eliminar la producción "{{title}}"? Esta acción no se puede deshacer.',
      'Are you sure you want to delete the voting configuration for "{{title}}"? This action cannot be undone.': '¿Estás seguro de que quieres eliminar la configuración de votación para "{{title}}"? Esta acción no se puede deshacer.',
      'Are you sure you want to remove {{name}} from the jury? This action cannot be undone.': '¿Estás seguro de que quieres eliminar a {{name}} del jurado? Esta acción no se puede deshacer.',

      // Common
      Loading: "Cargando...",
      Error: "Error",
      Success: "Éxito",
      Yes: "Sí",
      No: "No",
      Public: "Público",
      Private: "Privado",
      Active: "Activo",
      Inactive: "Inactivo",
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
