import { createLazyFileRoute } from '@tanstack/react-router';
import { VerificationResponse, sessionState, initialState, tokenParser } from '../../utils/sessionStore';
import { useCallback, useState } from 'react';
import { observer } from '@legendapp/state/react';
import { useSecretariumClient } from '../../utils/secretarium';

const ECode = observer(() => {

    const [challenge, setChallenge] = useState<string>();
    const [error, setError] = useState<string>();
    const [scpClient, initPromise] = useSecretariumClient();
    const state = sessionState.get();

    const verify = useCallback(() => {
        void (async () => {
            if (!state.token)
                return;
            await initPromise;
            await scpClient.newTx<VerificationResponse>('personal-data', 'auth/authenticate', undefined, { token: state.token.text, challenge })
                .onResult(result => {
                    sessionState.set({
                        ...state,
                        token: tokenParser(result.token),
                        currentTotpSeed: result.seedTotp
                        // loginStep: 'totp'
                    });
                })
                .onError(err => {
                    setError(err);
                })
                .send();
        })();
    }, [challenge]);

    const cancel = useCallback(() => {
        sessionState.set(initialState);
    }, []);

    // useEffect(() => {
    //     if (!state)
    //         return;
    //     if (state.loginStep !== 'ecode')
    //         router.navigate({
    //             to: '/'
    //         });
    //     if (state.loginStep === 'totp') {
    //         router.navigate({
    //             to: '/login/totp'
    //         });
    //     }
    // }, [state]);

    if (!state)
        return 'Loading...';

    return (
        <div className="my-8 flex flex-col items-center gap-5">
            <h1 className='text-2xl'>Login</h1>
            <input autoComplete='off' placeholder='Email Code' name="challenge" type="text" value={challenge ?? ''} onChange={(e) => setChallenge(e.currentTarget.value.trim())} className="w-64 p-1 border-slate-300 rounded" />
            {error && <div className="bg-red-200 rounded p-2">{error}</div>}
            <button onClick={verify} className="w-64 p-1 bg-blue-500 text-white rounded cursor-pointer">Next</button>
            <button onClick={cancel} className="w-64 p-1 bg-slate-200 rounded cursor-pointer">Cancel</button>
        </div>
    );
});

export const Route = createLazyFileRoute('/login/ecode')({
    component: ECode
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
        const { baseElement } = render(<ECode />);
        expect(baseElement).toBeTruthy();
    });
}