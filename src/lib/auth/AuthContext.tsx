"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { login as apiLogin, register as apiRegister } from "@/lib/api/auth";
import { getToken, setToken, removeToken } from "@/lib/auth/token-storage";
import type {
  AuthResponse,
  AuthUser,
  LoginRequest,
  RegisterRequest,
} from "@/lib/types/auth";

const USER_STORAGE_KEY = "aika_user";

interface AuthContextValue {
  user: AuthUser | null;
  token: string | null;
  isLoading: boolean;
  login: (data: LoginRequest) => Promise<void>;
  register: (data: RegisterRequest) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function readStoredUser(): AuthUser | null {
  const raw = localStorage.getItem(USER_STORAGE_KEY);
  return raw ? (JSON.parse(raw) as AuthUser) : null;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setTokenState] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // One-time hydration from localStorage on mount: localStorage isn't
  // available during SSR, so this can't be a lazy useState initializer
  // without causing a hydration mismatch (server renders "loading", client
  // would otherwise render real content on that same first pass).
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    const storedToken = getToken();
    if (storedToken) {
      setTokenState(storedToken);
      setUser(readStoredUser());
    } else {
      // No token means no valid session — drop any orphaned user record
      // (e.g. left behind by a 401 that only clears the token).
      localStorage.removeItem(USER_STORAGE_KEY);
    }
    setIsLoading(false);
  }, []);
  /* eslint-enable react-hooks/set-state-in-effect */

  function persistSession(auth: AuthResponse) {
    const { token: newToken, ...authUser } = auth;
    setToken(newToken);
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(authUser));
    setTokenState(newToken);
    setUser(authUser);
  }

  async function login(data: LoginRequest) {
    persistSession(await apiLogin(data));
  }

  async function register(data: RegisterRequest) {
    persistSession(await apiRegister(data));
  }

  function logout() {
    removeToken();
    localStorage.removeItem(USER_STORAGE_KEY);
    setTokenState(null);
    setUser(null);
  }

  return (
    <AuthContext.Provider
      value={{ user, token, isLoading, login, register, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return ctx;
}
