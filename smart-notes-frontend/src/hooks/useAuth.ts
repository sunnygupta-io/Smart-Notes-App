import { useAuthStore } from "../store/authStore";

export function useAuth(){
    const user =useAuthStore((state)=> state.user);
    const isLoading =useAuthStore((state)=> state.isLoading);
    const login =useAuthStore((state)=> state.login);
    const logout =useAuthStore((state)=> state.logout);

    return {user, isLoading, login, logout};
}