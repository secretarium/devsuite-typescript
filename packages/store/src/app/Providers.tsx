import { FC, PropsWithChildren, useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { httpBatchLink } from '@trpc/client';
import superjson from 'superjson';
import { api } from './utils/api';

export const Providers: FC<PropsWithChildren> = ({ children }) => {
    const [queryClient] = useState(() => new QueryClient());
    const [trpcClient] = useState(() =>
        api.createClient({
            // TODO: To be replaced by import from `@secretarium/hubber-api`
            transformer: superjson,
            links: [
                httpBatchLink({
                    url: '/api/trpc'
                    // headers() {
                    //     return {
                    //         authorization: getAuthCookie()
                    //     };
                    // }
                })
            ]
        })
    );
    return (
        <api.Provider client={trpcClient} queryClient={queryClient}>
            <QueryClientProvider client={queryClient}>
                {children}
            </QueryClientProvider>
        </api.Provider>
    );
};

export default Providers;