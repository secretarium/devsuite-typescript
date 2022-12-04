import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from './AuthProvider';

export const ProtectedLayout = () => {
    const { user } = useAuth();

    if (!user)
        return <Navigate to="/login" />;

    return <Outlet />;
};