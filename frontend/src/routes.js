import React, { useContext } from "react";
import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";
import { AuthContext } from "./@dpms-freemem/AuthContext";
import Login from "./components/user/Login";
import Signup from "./components/user/Signup";
import ConfirmationSent from "./components/user/ConfirmationSent";
import VerifyAccount from "./components/user/VerifyAccount";
import ForgotPassword from "./components/user/ForgotPassword";
import Dashboard from "./components/Dashboard";
import Error404 from "./components/Error404";

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
        <Route path="/signup" element={<Signup />} />
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
        <Route path="/verify-account/:token" element={<VerifyAccount />} />
        <Route path="/confirmation-sent" element={<ConfirmationSent />} />
        <Route path="*" element={<Error404 />} />
      </Routes>
    </Router>
  );
};

export default AppRoutes;
