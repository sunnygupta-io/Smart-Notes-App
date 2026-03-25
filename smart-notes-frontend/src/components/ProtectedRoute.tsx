import {Navigate} from 'react-router-dom'
import {useAuth} from '../hooks/useAuth'


interface Props {
    children: React.ReactNode
    adminOnly?: boolean
}

function ProtectedRoute({children, adminOnly= false}: Props){
    const {user} = useAuth()

    if(!user){
        return <Navigate to="/login"  replace/>
    }

    if(adminOnly && user.role !== 'admin'){
        return <Navigate to="/dashboard" replace/>
    }

    return <>{children}</>
}

export default ProtectedRoute;