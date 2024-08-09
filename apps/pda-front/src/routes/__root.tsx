import { FC, lazy, Suspense, useEffect } from 'react';
import { createRootRoute, Outlet, Link, useRouter } from '@tanstack/react-router';
import { observer } from '@legendapp/state/react';
import { sessionState } from '../utils/sessionStore';
import SecretariumLogo from '../assets/secretarium_logo_wide.svg';

const TanStackRouterDevtools = process.env.NODE_ENV === 'production'
    ? () => null // Render nothing in production
    : lazy(async () =>
        // Lazy load in development
        import('@tanstack/router-devtools').then((res) => ({
            default: res.TanStackRouterDevtools
            // For Embedded Mode
            // default: res.TanStackRouterDevtoolsPanel
        }))
    );

// let reactTriggerFunction: () => void | undefined;
// localForage.ready(() => {
//     const forage = localForageObservable.extendPrototype(localForage);
//     const observable = forage.getItemObservable('pda_v0');
//     const subscription = observable.subscribe({
//         next: (update) => {
//             console.log('LocalForage Update:', update);
//             reactTriggerFunction?.();
//         },
//         error: (err) => {
//             console.error('LocalForage Error:', err);
//         }
//     });
// });


const StoreDump = observer(() => {

    // const [state] = useLocalForage('pda_v0', initialState);
    const state = sessionState.get();

    if (process.env.NODE_ENV === 'production')
        return null;

    const filteredState = { ...state } as Record<string, any>;
    if (filteredState['token']) {
        filteredState['token'] = { ...state.token } as Record<string, any>;
        filteredState['token'].nounce = filteredState['token'].nounce?.toString();
        filteredState['token'].userVendorId = filteredState['token'].userVendorId?.toString();
        filteredState['token'].authLevel = filteredState['token'].authLevel?.toString();
        filteredState['token'].time = filteredState['token'].time?.toString();
        filteredState['token'].sig = filteredState['token'].sig?.toString();
        filteredState['token'].data = filteredState['token'].data?.toString();
        // filteredState.token.data = new TextDecoder().decode(new ArrayBuffer(filteredState.token.data));
    }
    return <pre className='bg-slate-100 text-xs p-2 rounded my-5'>{JSON.stringify(filteredState ?? null, null, 2)}</pre>;
});

const Director = observer(() => {

    const router = useRouter();
    const state = sessionState.get();

    useEffect(() => {
        if (!state)
            return;
        if (!state.token) {
            router.navigate({
                to: '/login'
            });
            return;
        }

        const destinations = {
            0: '/login',
            1: '/',
            2: '/login/ecode',
            3: '/login/pass',
            4: '/login/totp',
            5: '/login/pin',
            6: '/login/wallet',
            7: '/login/fido'
        };

        const futurePath = destinations[state.token.authLevel[0] as keyof typeof destinations];
        if (futurePath !== router.latestLocation.pathname)
            router.navigate({
                to: destinations[state.token.authLevel[0] as keyof typeof destinations]
            });
    });

    return null;
});

const Footer: FC = () => {
    return <footer className='text-center text-xs text-slate-500 mt-4'>© 2024 Secretarium Ltd.</footer>;
};

export const Route = createRootRoute({
    errorComponent: (error) => <div>Error: {error.error.name}: {error.error.message} {error.info?.componentStack}</div>,
    component: () => {
        return <>
            <div className="p-0 m-0 h-full w-full flex items-center justify-center">
                <div className="w-full max-w-[30rem] align-middle items-center overflow-hidden">
                    <Link to='/'>
                        <img src={SecretariumLogo} alt="Secretarium Logo" className="w-full h-8 mb-5" />
                    </Link>
                    <Outlet />
                    <Director />
                    <StoreDump />
                    <Footer />
                </div>
            </div>
            {<Suspense>
                <TanStackRouterDevtools />
            </Suspense>}
        </>;
    }
});