import { Route, useNavigate, useLocation } from 'react-router-dom';
import type { RouteProps } from 'react-router';
import { useRecoilValue } from 'recoil';
import { authAtom } from '../_state';

export { PrivateRoute };

const PrivateRoute: React.FC<RouteProps> = ({ ...props }) => {

    const auth = useRecoilValue(authAtom);
    const navigate = useNavigate();
    const location = useLocation();

    if (!auth) {
        navigate('/account/login', { state: { from: location.pathname } });
        return null;
    }

    return <Route {...props} />;
};

PrivateRoute.displayName = 'Route';