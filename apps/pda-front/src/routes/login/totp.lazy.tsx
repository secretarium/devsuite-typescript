import { createLazyFileRoute } from '@tanstack/react-router';
import { VerificationResponse, sessionState, initialState, tokenParser } from '../../utils/sessionStore';
import { useCallback, useState } from 'react';
import { observer } from '@legendapp/state/react';
import { useSecretariumClient } from '../../utils/secretarium';
import TOTPQrCode from '../../components/TOTPQrCode';

const TCode = observer(() => {

    // const router = useRouter();
    const [totp, setTotp] = useState<string>();
    const [error, setError] = useState<string>();
    const [scpClient, initPromise] = useSecretariumClient();
    const state = sessionState.get();

    const verify = useCallback(async () => {
        if (!state.token)
            return;
        await initPromise;
        await scpClient.newTx<VerificationResponse>('personal-data', 'auth/authenticate', undefined, { token: state.token.text, totp })
            .onResult(result => {
                sessionState.set({
                    ...state,
                    token: tokenParser(result.token)
                    // loginStep: 'done'
                });
            })
            .onError(err => {
                setError(err);
            })
            .send();
    }, [totp]);

    const cancel = useCallback(() => {
        sessionState.set(initialState);
    }, []);

    // useEffect(() => {
    //     if (!state)
    //         return;
    //     if (state.loginStep !== 'totp')
    //         router.navigate({
    //             to: '/'
    //         });
    //     if (state.loginStep === 'done') {
    //         router.navigate({
    //             to: '/'
    //         });
    //     }
    // }, [state]);

    if (!state)
        return 'Loading...';

    if (!state.selectedAccount || !state.currentTotpSeed)
        return null;

    return (
        <div className="my-8 flex flex-col items-center gap-5">
            <h1 className='text-2xl'>Login</h1>
            <TOTPQrCode appName={'Secretarium ID'} username={state.selectedAccount} otpSecret={state.currentTotpSeed} />
            <input autoComplete='off' placeholder='TOTP Code' name="totp" type="text" value={totp ?? ''} onChange={(e) => setTotp(e.currentTarget.value.trim())} className="w-64 p-1 border-slate-300 rounded" />
            {error && <div className="bg-red-200 rounded p-2">{error}</div>}
            <button onClick={verify} className="w-64 p-1 bg-blue-500 text-white rounded cursor-pointer">Next</button>
            <button onClick={cancel} className="w-64 p-1 bg-slate-200 rounded cursor-pointer">Cancel</button>
        </div>
    );
});

export const Route = createLazyFileRoute('/login/totp')({
    component: TCode
});

if (import.meta.vitest) {

    const { it, expect, beforeEach } = import.meta.vitest;
    let render: typeof import('@testing-library/react').render;

    beforeEach(async () => {
        render = (await import('@testing-library/react')).render;
    });

    it('should render successfully', () => {
        const { baseElement } = render(<TCode />);
        expect(baseElement).toBeTruthy();
    });
}