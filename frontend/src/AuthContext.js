import React, { createContext, useState, useEffect } from "react";
import axiosWrapper from "./utils/AxiosWrapper"; // Asegúrate de que la ruta sea correcta

export const AuthContext = createContext();

const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [groups, setGroups] = useState([]);
  const [token, setToken] = useState(null);

  useEffect(() => {
    // Recupera token, user y groups desde localStorage
    const storedToken = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");
    const storedGroups = localStorage.getItem("groups");

    if (storedToken && storedUser && storedGroups) {
      setIsAuthenticated(true);
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
      setGroups(JSON.parse(storedGroups));
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      const client = axiosWrapper();
      const response = await client.post("/api/users/login/", { email, password });
      console.log(response.data);

      const { access_token, user, groups } = response.data; // Extrae token, user y groups
      localStorage.setItem("token", access_token);
      localStorage.setItem("user", JSON.stringify(user));
      localStorage.setItem("groups", JSON.stringify(groups)); // Guarda groups como un array de strings
      setIsAuthenticated(true);
      setToken(access_token);
      setUser(user);
      setGroups(groups);
    } catch (error) {
      throw error;
    }
  };

  const signup = async ({ email, nickname, group, password, password_confirmation, first_name, last_name }) => {
    try {
      const client = axiosWrapper();
      const username = email; // Puedes usar el email como nombre de usuario
      await client.post("/api/users/signup/", {
        email,
        username,
        password,
        password_confirmation,
        first_name,
        last_name,
        nickname,
        group,
      });
      // console.log(response.data);
      setIsAuthenticated(true);
    } catch (error) {
      throw error;
    }
  };

  const logout = () => {
    // Limpia el estado y el localStorage al cerrar sesión
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("groups");
    setIsAuthenticated(false);
    setToken(null);
    setUser(null);
    setGroups([]);
    // Redirect to backend home
    const backendURL = process.env.REACT_APP_BACKEND_ADDRESS || "http://localhost:8000";
    window.location.href = backendURL + "/";
  };

  const verifyAccount = async (token) => {
    try {
      const response = await axiosWrapper().get(`/api/users/verify?token=${token}`);
      return response; // Devuelve la respuesta con el status 200 o 400
    } catch (error) {
      throw error; // Maneja el error
    }
  };

  return (
    <AuthContext.Provider
      value={{ isAuthenticated, loading, login, signup, logout, verifyAccount, user, groups, token }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
