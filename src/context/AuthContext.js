import { createContext, useContext, useEffect, useState } from "react";
import API from "../services/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isActive = true;

    const restoreSession = async () => {
      try {
        const response = await API.get("/me");

        if (isActive) {
          setUser(response.data.user ?? null);
        }
      } catch {
        if (isActive) {
          setUser(null);
        }
      } finally {
        if (isActive) {
          setLoading(false);
        }
      }
    };

    restoreSession();

    return () => {
      isActive = false;
    };
  }, []);

  const login = async (credentials) => {
    const response = await API.post("/login", credentials);
    const authenticatedUser = response.data.user ?? null;
    setUser(authenticatedUser);
    return authenticatedUser;
  };

  const register = async (payload) => {
    await API.post("/register", payload);
  };

  const changePassword = async (payload) => {
    const response = await API.post("/change-password", payload);
    const updatedUser = response.data.user ?? user ?? null;
    setUser(updatedUser);
    return response.data;
  };

  const logout = async () => {
    try {
      await API.get("/logout");
    } finally {
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        logout,
        register,
        changePassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside an AuthProvider.");
  }

  return context;
}
