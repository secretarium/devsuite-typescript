import { createContext, useContext, useMemo, FC, PropsWithChildren } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLocalForage } from './useLocalStorage';

const AuthContext = createContext<{
    user?: any
}>({});

type AuthProviderProps = PropsWithChildren & {
    userData?: any
}

export const AuthProvider: FC<AuthProviderProps> = ({ children, userData = {} }) => {

    const [user, setUser] = useLocalForage('user', userData.me ?? null);
    const navigate = useNavigate();

    // call this function when you want to authenticate the user
    const login = async (data: any) => {
        setUser(data);
        navigate('/profile');
    };

    // call this function to sign out logged in user
    const logout = () => {
        setUser(null);
        navigate('/', { replace: true });
    };

    const value = useMemo(
        () => ({
            user,
            login,
            logout
        }),
        [user]
    );
    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
    return useContext(AuthContext);
};