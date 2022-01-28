import { useRecoilState, useSetRecoilState, useResetRecoilState } from 'recoil';
import { useNavigate, useLocation } from 'react-router';
import { useFetchWrapper } from '../_helpers';
import { authAtom, usersAtom, userAtom } from '../_state';

export { useUserActions };

function useUserActions() {
    const baseUrl = '/users';
    const fetchWrapper = useFetchWrapper();
    const [auth, setAuth] = useRecoilState(authAtom);
    const setUsers = useSetRecoilState(usersAtom);
    const setUser = useSetRecoilState(userAtom);
    const navigate = useNavigate();
    const location = useLocation();

    return {
        login,
        logout,
        register,
        getAll,
        getById,
        update,
        delete: _delete,
        resetUsers: useResetRecoilState(usersAtom),
        resetUser: useResetRecoilState(userAtom)
    };

    function login({ username, password }: Record<string, string>) {
        return fetchWrapper.post(`${baseUrl}/authenticate`, { username, password })
            .then(user => {
                // store user details and jwt token in local storage to keep user logged in between page refreshes
                localStorage.setItem('user', JSON.stringify(user));
                setAuth(user);

                // get return url from location state or default to home page
                const { from } = location.state as any || { from: { pathname: '/' } };
                navigate(from);
            });
    }

    function logout() {
        // remove user from local storage, set auth state to null and redirect to login page
        localStorage.removeItem('user');
        setAuth(null);
        navigate('/account/login');
    }

    function register(user: Record<string, any>) {
        return fetchWrapper.post(`${baseUrl}/register`, user);
    }

    function getAll() {
        return fetchWrapper.get(baseUrl).then(setUsers);
    }

    function getById(id: string) {
        return fetchWrapper.get(`${baseUrl}/${id}`).then(setUser);
    }

    function update(id: string, params: Record<string, any>) {
        return fetchWrapper.put(`${baseUrl}/${id}`, params)
            .then(x => {
                // update stored user if the logged in user updated their own record
                if (id === auth?.id) {
                    // update local storage
                    const user = { ...auth, ...params };
                    localStorage.setItem('user', JSON.stringify(user));

                    // update auth user in recoil state
                    setAuth(user);
                }
                return x;
            });
    }

    // prefixed with underscored because delete is a reserved word in javascript
    function _delete(id: string) {
        setUsers(users => users?.map(x => {
            // add isDeleting prop to user being deleted
            if (x.id === id)
                return { ...x, isDeleting: true };

            return x;
        }) ?? null);

        return fetchWrapper.delete(`${baseUrl}/${id}`)
            .then(() => {
                // remove user from list after deleting
                setUsers(users => users?.filter(x => x.id !== id) ?? null);

                // auto logout if the logged in user deleted their own record
                if (id === auth?.id) {
                    logout();
                }
            });
    }
}