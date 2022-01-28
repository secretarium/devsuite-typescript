import { useEffect } from 'react';
import { Route } from 'react-router-dom';
import { useNavigate } from 'react-router';
import { useRecoilValue } from 'recoil';

import { authAtom } from '../_state';
import { Login, Register } from './';

export { Account };

function Account() {
    const auth = useRecoilValue(authAtom);
    const navigate = useNavigate();
    // const { pathname } = useLocation();

    useEffect(() => {
        // redirect to home if already logged in
        if (auth)
            navigate('/');
    }, [auth, navigate]);

    return (
        <div className="container">
            <div className="row">
                <div className="col-sm-8 offset-sm-2 mt-5">
                    {/* <Routes>
                        <Route path={`${pathname}/login`} element={Login} />
                        <Route path={`${pathname}/register`} element={Register} />
                    </Routes> */}
                    <Route path={'login'} element={<Login />} />
                    <Route path={'register'} element={<Register />} />
                </div>
            </div>
        </div>
    );
}