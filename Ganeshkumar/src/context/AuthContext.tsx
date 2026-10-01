import { createContext, useCallback, useState, type ReactNode } from "react";
import * as authService from "../services/authService";

export interface AuthContextValue {
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextValue | null>(null);

/** Session state is derived from sessionStorage on mount — a refresh keeps you signed in, a new tab does not. */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(() => authService.isAuthenticated());

  const login = useCallback(async (username: string, password: string) => {
    await authService.login(username, password);
    setIsAuthenticated(true);
  }, []);

  const logout = useCallback(() => {
    authService.logout();
    setIsAuthenticated(false);
  }, []);

  return <AuthContext.Provider value={{ isAuthenticated, login, logout }}>{children}</AuthContext.Provider>;
}
