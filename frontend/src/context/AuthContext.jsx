import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { api } from "../api/client";

const AuthContext = createContext(null);

const STORAGE_USER = "app_user";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    const storedUser = localStorage.getItem(STORAGE_USER);
    if (storedToken && storedUser) {
      try {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
      } catch {
        localStorage.removeItem("token");
        localStorage.removeItem(STORAGE_USER);
      }
    }
    setReady(true);
  }, []);

  const persistSession = useCallback((nextToken, nextUser) => {
    setToken(nextToken);
    setUser(nextUser);
    localStorage.setItem("token", nextToken);
    localStorage.setItem(STORAGE_USER, JSON.stringify(nextUser));
  }, []);

  const login = useCallback(
    async (email, password) => {
      const { data } = await api.post("/users/login", { email, password });
      persistSession(data.token, data.user);
      return data.user;
    },
    [persistSession]
  );

  const bootstrapAdmin = useCallback(
    async (payload) => {
      const { data } = await api.post("/users/bootstrap-first-admin", payload);
      persistSession(data.token, data.user);
      return data.user;
    },
    [persistSession]
  );

  const logout = useCallback(() => {
    setToken(null);
    setUser(null);
    localStorage.removeItem("token");
    localStorage.removeItem(STORAGE_USER);
  }, []);

  const value = useMemo(
    () => ({
      user,
      token,
      ready,
      isAdmin: user?.role === "admin",
      login,
      bootstrapAdmin,
      logout,
    }),
    [user, token, ready, login, bootstrapAdmin, logout]
  );

  return (
    <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return ctx;
}
