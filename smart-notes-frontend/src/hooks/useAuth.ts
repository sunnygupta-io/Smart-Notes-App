import { useContext } from "react";
import { AuthContext } from "../AuthContext";


// this function helps us to easily access authentication data from anywhere in the project
export function useAuth(){
    return useContext(AuthContext)
}