import {Navigate} from 'react-router-dom'
import {useAuth} from '../hooks/useAuth'


interface Props {
    children: React.ReactNode
    adminOnly?: boolean
}

function ProtectedRoute({children, adminOnly= false}: Props){
    const {user, isLoading} = useAuth()

    if(isLoading){
        return(
            <div className='flex items-center justify-center min-h-screen'>
                <p className='text-gray-500'>
                    Loading...
                </p>
            </div>
        )
    }


    if(!user){
        return <Navigate to="/login"  replace/>
    }

    if(adminOnly && user.role !== 'admin'){
        return <Navigate to="/dashboard" replace/>
    }

    return <>{children}</>
}

export default ProtectedRoute;