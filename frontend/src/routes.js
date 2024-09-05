import React, { useContext } from "react";
import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";
import AuthContext from "@dpms-freemem/AuthContext";
import NavBar from "./@dpms-freemem/MainBar"; // Ruta relativa
import Login from "./components/user/Login"; // Ruta relativa
import Register from "./components/user/Register"; // Ruta relativa
// import DashboardConfig from "./components/DashboardConfig"; // Asegúrate de que este archivo exista
// import Error404 from "./components/Error404"; // Asegúrate de que este archivo exista

const PrivateRoute = ({ children }) => {
  const { isAuthenticated } = useContext(AuthContext);
  return isAuthenticated ? children : <Navigate to="/login" />;
};

const AppRoutes = () => {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route
          path="/"
          element={
            <PrivateRoute>
              <NavBar />
              {/* <DashboardConfig /> */}
            </PrivateRoute>
          }
        />
        {/* <Route path="*" element={<Error404 />} /> */}
      </Routes>
    </Router>
  );
};

export default AppRoutes;
