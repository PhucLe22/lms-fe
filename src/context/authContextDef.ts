import { createContext } from "react";
import type { User, AuthResponse } from "../types";

export interface AuthContextType {
  user: User | null;
  token: string | null;
  isAdmin: boolean;
  isStudent: boolean;
  loading: boolean;
  login: (res: AuthResponse) => void;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType>(null!);
