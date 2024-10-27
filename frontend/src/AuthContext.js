import React, { createContext, useState, useEffect } from "react";
import axiosWrapper from "./utils/AxiosWrapper"; // Asegúrate de que la ruta sea correcta

export const AuthContext = createContext();

const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      // Aquí puedes agregar lógica para verificar la validez del token
      setIsAuthenticated(true);
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      const client = axiosWrapper();
      const response = await client.post("/users/login/", { email, password });
      console.log(response.data);
      const { token } = response.data;
      localStorage.setItem("token", token);
      setIsAuthenticated(true);
    } catch (error) {
      // console.error("Login failed", error);
      throw error;
    }
  };

  const signup = async ({ email, nickname, group, password, password_confirmation, first_name, last_name }) => {
    try {
      const client = axiosWrapper();
      const username = email; // Puedes usar el email como nombre de usuario
      const response = await client.post("/users/signup/", {
        email,
        username,
        password,
        password_confirmation,
        first_name,
        last_name,
        nickname,
        group,
      });
      console.log(response.data);
      setIsAuthenticated(true);
    } catch (error) {
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    setIsAuthenticated(false);
  };

  const verifyAccount = async (token) => {
    try {
      const response = await axiosWrapper().get(`/users/verify?token=${token}`);
      return response; // Devuelve la respuesta con el status 200 o 400
    } catch (error) {
      throw error; // Maneja el error
    }
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, loading, login, signup, logout, verifyAccount }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
