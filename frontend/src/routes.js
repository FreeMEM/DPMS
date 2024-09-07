import React, { useContext } from "react";
import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";
import { AuthContext } from "./@dpms-freemem/AuthContext"; // Ruta relativa correcta
import Login from "./components/user/Login"; // Ruta relativa correcta
import Register from "./components/user/Register"; // Ruta relativa correcta
import ForgotPassword from "./components/user/ForgotPassword";
import Dashboard from "./components/Dashboard"; // Ruta relativa correcta
import Error404 from "./components/Error404"; // Ruta relativa correcta

const PrivateRoute = ({ children }) => {
  const { isAuthenticated, loading } = useContext(AuthContext);

  if (loading) {
    return <div>Loading...</div>; // Puedes mostrar un spinner de carga aquí
  }

  return isAuthenticated ? children : <Navigate to="/login" />;
};

const AppRoutes = () => {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          }
        />
        <Route path="/" element={<Navigate to="/dashboard" />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="*" element={<Error404 />} />
      </Routes>
    </Router>
  );
};

export default AppRoutes;
