import { create } from "zustand";
import type { User } from "../types/index";
import { getMe } from "../api/auth";

interface AuthState {
  user: User | null;
  isLoading: boolean;
  login: () => Promise<void>;
  logout: () => void;
  checkAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: true,
  login: async () => {
    const res = await getMe();
    set({ user: res.data });
  },

  logout: async () => {
    set({ user: null, isLoading: false });
  },

  checkAuth: async()=>{
    try {
        const res = await getMe();
        set({user: res.data, isLoading: false});
    } catch {
        set({user: null, isLoading: false})
    }
  }
}));
