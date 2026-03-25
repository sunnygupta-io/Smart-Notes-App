import type { ReactNode } from 'react';
import { Navigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

const PublicRoute = ({ children }: { children: ReactNode }) => {
    const { user } = useAuth();
         
    if (user) {
        return <Navigate to="/dashboard" replace />;
    }

    return <>{children}</>;
};

export default PublicRoute;