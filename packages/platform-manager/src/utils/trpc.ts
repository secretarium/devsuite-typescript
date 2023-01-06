import { createTRPCNext } from '@trpc/next';
import { httpBatchLink, loggerLink } from '@trpc/client';
import { inferRouterInputs, inferRouterOutputs } from '@trpc/server';
import type { V0Router } from '@secretarium/hubber-api';
import { transformer } from '@secretarium/hubber-api';

const getBaseUrl = () => {

    if (typeof window !== 'undefined') return ''; // browser should use relative url
    if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`; // SSR should use vercel url

    return `http://localhost:${process.env.PORT ?? 4200}`; // dev SSR should use localhost
};

export const trpc = createTRPCNext<V0Router>({
    config() {
        return {
            transformer,
            links: [
                loggerLink({
                    enabled: (opts) =>
                        process.env.NODE_ENV === 'development' ||
                        (opts.direction === 'down' && opts.result instanceof Error)
                }),
                httpBatchLink({
                    url: `${getBaseUrl()}/api/trpc`
                })
            ]
        };
    },
    ssr: false
});

/**
 * Inference helpers for input types
 * @example type HelloInput = RouterInputs['example']['hello']
 **/
export type RouterInputs = inferRouterInputs<V0Router>;

/**
 * Inference helpers for output types
 * @example type HelloOutput = RouterOutputs['example']['hello']
 **/
export type RouterOutputs = inferRouterOutputs<V0Router>;