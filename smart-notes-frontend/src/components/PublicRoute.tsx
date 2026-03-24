import type { ReactNode } from 'react';
import { Navigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

const PublicRoute = ({ children }: { children: ReactNode }) => {
    const { user } = useAuth();
    
    // if (isLoading) {
        
    //     return (
    //         <div className="flex justify-center items-center min-h-screen">
    //             <div className="h-12 w-12 animate-spin border-r-2 border-b-2 border-t-olive-500 border-l-olive-500 rounded-full"></div>
    //         </div>
    //     );
    // }
         
    if (user) {
        return <Navigate to="/dashboard" replace />;
    }

    return <>{children}</>;
};

export default PublicRoute;