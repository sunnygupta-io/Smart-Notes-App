import { createContext, useState, useEffect, type ReactNode } from "react";
import type { User } from "./types";
import { getMe } from "./api/auth";

interface AuthContextType {
  user: User | null;
  // token: string | null;
  isLoading: boolean;
  login: () => Promise<void>;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType>({
  user: null,
  // token: null,
  isLoading: true,
  login: async () => {},
  logout: () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  // const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // const savedToken = localStorage.getItem("token");
    // if (savedToken) {
    //   setToken(savedToken);
      getMe()
        .then((res) => {
          // console.log("SUCCESS:", res.data);
          setUser(res.data);
        })
        .catch(() => {
          // localStorage.removeItem("token");
          // localStorage.removeItem("refresh_token");
          setUser(null);
        })
        .finally(() => setIsLoading(false));
    // } else {
    //   setIsLoading(false);
    // }
  }, []);

  const login = async () => {
    // localStorage.setItem("token", access_token);
    // localStorage.setItem("refresh_token", refresh_token);
    // setToken(access_token);
    const res = await getMe();
    setUser(res.data);
  };

  const logout = () => {
    // localStorage.removeItem("token");
    // localStorage.removeItem("refresh_token");
    // setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
