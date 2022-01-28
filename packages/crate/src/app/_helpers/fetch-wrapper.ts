import { useRecoilState } from 'recoil';

import { useNavigate } from 'react-router';
import { authAtom } from '../_state';
import { useAlertActions } from '../_actions';

export { useFetchWrapper };

function useFetchWrapper() {
    const [auth, setAuth] = useRecoilState(authAtom);
    const alertActions = useAlertActions();
    const nagivate = useNavigate();

    return {
        get: request('GET'),
        post: request('POST'),
        put: request('PUT'),
        delete: request('DELETE')
    };

    function request(method: 'GET' | 'POST' | 'PUT' | 'DELETE') {
        return (url: string, body?: any) => {
            const requestOptions = {
                method,
                headers: authHeader(url),
                body: undefined as string | undefined
            };
            if (body) {
                requestOptions.headers['Content-Type'] = 'application/json';
                requestOptions.body = JSON.stringify(body);
            }
            return fetch(url, requestOptions).then(handleResponse);
        };
    }

    // helper functions

    function authHeader(url: string): Record<string, string> {
        // return auth header with jwt if user is logged in and request is to the api url
        const token = auth?.token;
        const isLoggedIn = !!token;
        const isApiUrl = url.startsWith('');
        if (isLoggedIn && isApiUrl) {
            return { Authorization: `Bearer ${token}` };
        } else {
            return {};
        }
    }

    function handleResponse(response: Response) {
        return response.text().then(text => {
            const data = text && JSON.parse(text);

            if (!response.ok) {
                if ([401, 403].includes(response.status) && auth?.token) {
                    // auto logout if 401 Unauthorized or 403 Forbidden response returned from api
                    localStorage.removeItem('user');
                    setAuth(null);
                    nagivate('/account/login');
                }

                const error = (data && data.message) || response.statusText;
                alertActions.error(error);
                return Promise.reject(error);
            }

            return data;
        });
    }
}