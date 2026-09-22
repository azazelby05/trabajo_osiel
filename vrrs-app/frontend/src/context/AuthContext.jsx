import { createContext, useContext, useEffect, useState } from "react";
import api from "../api/client.js";
import { isAdmin, canReport } from "../constants/nav.js";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/auth/me")
      .then(({ data }) => {
        setUser(data.user);
        if (data.user) localStorage.setItem("vrrs_user", JSON.stringify(data.user));
      })
      .catch(() => {
        setUser(null);
        localStorage.removeItem("vrrs_user");
      })
      .finally(() => setLoading(false));
  }, []);

  const login = (userData) => {
    setUser(userData);
    localStorage.setItem("vrrs_user", JSON.stringify(userData));
  };

  const logout = async () => {
    try {
      await api.post("/auth/logout");
    } catch {
      /* ignore */
    }
    setUser(null);
    localStorage.removeItem("vrrs_user");
  };

  return (
    <AuthContext.Provider
      value={{ user, login, logout, loading, isAuthenticated: !!user, isAdmin: isAdmin(user), canReport: canReport(user) }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
