import { createLazyFileRoute } from '@tanstack/react-router';
// import { useEffect } from 'react';
import { observer } from '@legendapp/state/react';
import { sessionState } from '../utils/sessionStore';
import { useSecretariumQuery } from '../utils/secretarium';

const Index = observer(() => {

    // const router = useRouter();
    const state = sessionState.get();
    const { data } = useSecretariumQuery({
        live: !!state?.token,
        app: 'personal-data',
        route: 'auth/user-devices/get',
        args: {
            token: state?.token
        }
    });
    // console.log(data);

    // useEffect(() => {
    //     if (!state)
    //         return;
    //     console.log('PLOP', state.token, state.token?.authLevel[0], typeof state.token?.authLevel[0], state.token?.authLevel[0] === 0);
    //     if (!state.token || /* !state.loginStep || */ state.token.authLevel[0] === 0) {
    //         console.log('PLOP .....', state.token?.authLevel[0]);
    //         router.navigate({
    //             to: '/login'
    //         });
    //         return;
    //     }
    //     // if (state.loginStep !== 'done' && state.loginStep !== 'login') {
    //     //     router.navigate({
    //     //         to: `/login/${state.loginStep}`
    //     //     });
    //     // }
    // }, [state.token]);

    if (!state?.token)
        return 'Loading...';

    return (
        <div className="p-2 flex flex-col items-center gap-5">
            <h1 className='text-2xl'>Your Devices</h1>
            {!data
                ? <span className='text-slate-500'>No device information in your account</span>
                : <pre>{JSON.stringify(data, null, 2)}</pre>}
        </div>
    );
});

export const Route = createLazyFileRoute('/')({
    component: Index
});

if (import.meta.vitest) {

    const { it, expect, beforeEach } = import.meta.vitest;
    let render: typeof import('@testing-library/react').render;

    beforeEach(async () => {
        render = (await import('@testing-library/react')).render;
    });

    it('should render successfully', () => {
        const { baseElement } = render(<Index />);
        expect(baseElement).toBeTruthy();
    });
}