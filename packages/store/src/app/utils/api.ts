import { createTRPCReact } from '@trpc/react-query';
import { createTRPCProxyClient, httpBatchLink } from '@trpc/client';
import type { Router } from '@secretarium/hubber-api';
import superjson from 'superjson';

export const apiClientOptions = {
    // TODO: To be replaced by import from `@secretarium/hubber-api`
    transformer: superjson,
    links: [
        httpBatchLink({
            url: '/api/trpc',
            headers() {
                return {
                    'X-Trustless-Store-Ephemeral-Tag': window.localStorage.getItem('emphemeralSessionTag') ?? undefined
                };
            }
        })
    ]
};

export const hookApi = createTRPCReact<Router>();
export const httpApi = createTRPCProxyClient<Router>(apiClientOptions);
export default hookApi;