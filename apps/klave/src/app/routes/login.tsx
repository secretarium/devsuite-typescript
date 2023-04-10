import { FC } from 'react';
import LoginSecKey from '../partials/LoginSecKey';
import LoginQR from '../partials/LoginQR';
import api from '../utils/api';
import { useNavigate } from 'react-router-dom';

export const Login: FC = () => {

    const navigate = useNavigate();
    const { data } = api.v0.auth.getSession.useQuery();
    if (data?.me)
        navigate('/');

    return <div id="login">

        <div className="flex flex-col sm:flex-row max-w-6xl mx-auto px-4 sm:px-6">
            <div className="p-5 min-w-[300px] bg-slate-100">
                <LoginSecKey />
            </div>
            <div className="p-5 min-w-[300px]">
                <LoginQR />
            </div>
        </div>

    </div>;
};

export default Login;