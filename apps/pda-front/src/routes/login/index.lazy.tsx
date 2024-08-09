import { createLazyFileRoute } from '@tanstack/react-router';
import { AuthenticationResponse, sessionState, tokenParser } from '../../utils/sessionStore';
import { useCallback, useState } from 'react';
import { observer } from '@legendapp/state/react';
import { useSecretariumClient } from '../../utils/secretarium';

const Login = observer(() => {

    // const router = useRouter();
    const [email, setEmail] = useState<string>();
    const [error, setError] = useState<string>();
    const [scpClient, initPromise] = useSecretariumClient();
    const state = sessionState.get();

    const authenticate = useCallback(() => {
        void (async () => {
            setError(undefined);
            if (!state || !email)
                return;
            await initPromise;
            await scpClient.newTx<AuthenticationResponse>('personal-data', 'auth/authenticate', undefined, { email })
                .onResult(result => {
                    sessionState.set({
                        ...state,
                        token: tokenParser(result.token),
                        selectedAccount: email,
                        currentTotpSeed: null
                        // loginStep: 'ecode'
                    });
                })
                .onError(err => {
                    setError(err);
                })
                .send();
        })();
    }, [email]);

    // const cancel = useCallback(() => {
    //     sessionState.set(initialState);
    // }, []);

    // useEffect(() => {
    //     if (!state)
    //         return;
    //     if (state.loginStep !== 'login')
    //         router.navigate({
    //             to: '/'
    //         });
    //     if (state.loginStep === 'ecode') {
    //         router.navigate({
    //             to: '/login/ecode'
    //         });
    //     }
    // }, [state]);

    if (!state)
        return 'Loading...';

    return (
        <div className="my-8 flex flex-col items-center gap-5">
            <h1 className='text-2xl'>Login</h1>
            <input autoComplete='off' placeholder='Email' name="email" type="text" value={email ?? ''} onChange={(e) => setEmail(e.currentTarget.value.trim())} className="w-64 p-1 border-slate-300 rounded" />
            {error && <div className="bg-red-200 rounded p-2">{error}</div>}
            <button onClick={authenticate} className="w-64 p-1 bg-blue-500 text-white rounded cursor-pointer">Login</button>
            {/* <button onClick={cancel} className="w-64 p-1 bg-slate-200 rounded cursor-pointer">Cancel</button> */}
        </div>
    );
});

export const Route = createLazyFileRoute('/login/')({
    component: Login
});

if (import.meta.vitest) {

    const { it, expect, beforeEach, vi } = import.meta.vitest;

    vi.mock('../../utils/secretarium', async () => {
        return {
            useSecretariumClient: () => ([{}, Promise.resolve()])
        };
    });

    let render: typeof import('@testing-library/react').render;

    beforeEach(async () => {
        render = (await import('@testing-library/react')).render;
    });

    it('should render successfully', () => {
        const { baseElement } = render(<Login />);
        expect(baseElement).toBeTruthy();
    });
}