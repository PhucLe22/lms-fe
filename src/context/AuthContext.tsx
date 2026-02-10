import {
  useState,
  useEffect,
  type ReactNode,
} from "react";
import { authApi } from "../api/authApi";
import type { User, AuthResponse } from "../types";
import { AuthContext } from "./authContextDef";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(
    localStorage.getItem("token")
  );
  const [loading, setLoading] = useState(!!localStorage.getItem("token"));

  useEffect(() => {
    if (token) {
      authApi
        .getMe()
        .then((res) => setUser(res.data))
        .catch(() => {
          localStorage.removeItem("token");
          setToken(null);
        })
        .finally(() => setLoading(false));
    }
  }, [token]);

  const login = (res: AuthResponse) => {
    localStorage.setItem("token", res.token);
    setToken(res.token);
    setUser({
      id: "",
      fullName: res.fullName,
      email: res.email,
      role: res.role,
      createdAt: "",
    });
  };

  const logout = () => {
    localStorage.removeItem("token");
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        logout,
        isAdmin: user?.role === "Admin",
        isStudent: user?.role === "Student",
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
