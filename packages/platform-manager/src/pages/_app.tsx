import { SessionProvider } from 'next-auth/react';
import './styles.css';

import type { AppProps } from 'next/app';
import type { Session } from 'next-auth';

// import { trpc } from '../utils/trpc';

// Use of the <SessionProvider> is mandatory to allow components that call
// `useSession()` anywhere in your application to access the `session` object.
export function App({
    Component,
    pageProps: { session, ...pageProps }
}: AppProps<{ session: Session }>) {
    return (
        <SessionProvider session={session}>
            <Component {...pageProps} />
        </SessionProvider>
    );
}

export default App;
// export default trpc.withTRPC(App);