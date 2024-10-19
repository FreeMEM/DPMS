import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { AuthContext } from "../../../@dpms-freemem/AuthContext"; // Ajusta la ruta según tu estructura
import Login from "../Login"; // Ajusta la ruta según tu estructura
import { BrowserRouter as Router } from "react-router-dom";

// Mock de `useTranslation` para evitar problemas con las traducciones
jest.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key) => key, // Devuelve las claves de las traducciones
  }),
}));

describe("Login Component", () => {
  const mockLogin = jest.fn(); // Mock para la función login
  const mockNavigate = jest.fn(); // Mock para la función navigate

  beforeEach(() => {
    mockLogin.mockClear();
    mockNavigate.mockClear();
  });

  const renderLogin = () => {
    return render(
      <AuthContext.Provider value={{ login: mockLogin }}>
        <Router>
          <Login />
        </Router>
      </AuthContext.Provider>
    );
  };

  test("renders login form correctly", () => {
    renderLogin();

    // Verifica que los campos de entrada se rendericen correctamente
    expect(screen.getByLabelText(/Email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Password/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Sign in/i })).toBeInTheDocument();
  });

  test("allows user to input email and password", () => {
    renderLogin();

    // Simula la entrada de datos
    fireEvent.change(screen.getByLabelText(/Email/i), { target: { value: "user@example.com" } });
    fireEvent.change(screen.getByLabelText(/Password/i), { target: { value: "password123" } });

    // Verifica que los valores se hayan actualizado correctamente
    expect(screen.getByLabelText(/Email/i).value).toBe("user@example.com");
    expect(screen.getByLabelText(/Password/i).value).toBe("password123");
  });

  test("validates input before calling login", async () => {
    renderLogin();

    // Intenta enviar el formulario sin ningún dato
    fireEvent.click(screen.getByRole("button", { name: /Sign in/i }));

    // Verifica que la función `login` no se haya llamado debido a la validación fallida
    expect(mockLogin).not.toHaveBeenCalled();

    // Simula la entrada de un email incorrecto
    fireEvent.change(screen.getByLabelText(/Email/i), { target: { value: "invalid-email" } });
    fireEvent.change(screen.getByLabelText(/Password/i), { target: { value: "short" } });

    fireEvent.click(screen.getByRole("button", { name: /Sign in/i }));

    // Verifica nuevamente que la función `login` no se haya llamado
    expect(mockLogin).not.toHaveBeenCalled();
  });

  test("calls login function with valid data", async () => {
    renderLogin();

    // Simula la entrada de datos válidos
    fireEvent.change(screen.getByLabelText(/Email/i), { target: { value: "user@example.com" } });
    fireEvent.change(screen.getByLabelText(/Password/i), { target: { value: "password123" } });

    // Enviar el formulario
    fireEvent.click(screen.getByRole("button", { name: /Sign in/i }));

    // Espera que la función `login` haya sido llamada con los datos correctos
    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith("user@example.com", "password123");
    });
  });

  test("shows error message when login fails", async () => {
    // Simula que el login falla con un error 401
    mockLogin.mockRejectedValueOnce({
      response: { status: 401 },
    });

    renderLogin();

    // Simula la entrada de datos válidos
    fireEvent.change(screen.getByLabelText(/Email/i), { target: { value: "user@example.com" } });
    fireEvent.change(screen.getByLabelText(/Password/i), { target: { value: "password123" } });

    // Enviar el formulario
    fireEvent.click(screen.getByRole("button", { name: /Sign in/i }));

    // Espera que se muestre el mensaje de error
    await waitFor(() => {
      expect(screen.getByText(/Invalid email or password. Please try again./i)).toBeInTheDocument();
    });

    // Verifica que `login` haya sido llamado
    expect(mockLogin).toHaveBeenCalledWith("user@example.com", "password123");
  });

  test("opens modal when Forgot your Password is clicked", () => {
    renderLogin();

    // Simula el clic en "Forgot your Password?"
    fireEvent.click(screen.getByText(/Forgot your Password?/i));

    // Verifica que el modal se abra
    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });
});
