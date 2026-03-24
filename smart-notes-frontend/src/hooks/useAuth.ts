// import { useContext } from "react";
// import { AuthContext } from "../AuthContext";
import { useAuthStore } from "../store/authStore";


// this function helps us to easily access authentication data from anywhere in the project
export function useAuth(){
    // return useContext(AuthContext)

    const user =useAuthStore((state)=> state.user);
    const isLoading =useAuthStore((state)=> state.isLoading);
    const login =useAuthStore((state)=> state.login);
    const logout =useAuthStore((state)=> state.logout);

    return {user, isLoading, login, logout};
}