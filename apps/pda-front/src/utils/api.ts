import { createTRPCReact } from '@trpc/react-query';
import { createTRPCClient, httpBatchLink } from '@trpc/client';
import type { Router } from '@secretarium/pda-api';
import superjson from 'superjson';

export const apiClientOptions = {
    // TODO: To be replaced by import from `@secretarium/pda-api`
    links: [
        httpBatchLink({
            url: `${window.secretariumFrontConfig.PDA_API__}/trpc`,
            transformer: superjson,
            fetch: async (url, options) => {
                return fetch(url, {
                    ...options,
                    credentials: 'include'
                });
            }
        })
    ]
};

export const hookApi = createTRPCReact<Router>();
export const httpApi = createTRPCClient<Router>(apiClientOptions);
export default hookApi;