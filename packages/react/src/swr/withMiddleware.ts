import type { Key, Fetcher, Middleware, SWRConfiguration, SWRHook } from 'swr';

// eslint-disable-next-line @typescript-eslint/ban-types
export const isFunction = (v: any): v is Function => typeof v == 'function';

export const normalize = <KeyType = Key, Data = any>(
    args:
        | [KeyType]
        | [KeyType, Fetcher<Data> | null]
        | [KeyType, SWRConfiguration | undefined]
        | [KeyType, Fetcher<Data> | null, SWRConfiguration | undefined]
): [KeyType, Fetcher<Data> | null, Partial<SWRConfiguration<Data>>] => {
    return isFunction(args[1])
        ? [args[0], args[1], args[2] || {}]
        : [args[0], null, (args[1] === null ? args[2] : args[1]) || {}];
};

// Create a custom hook with a middleware
export const withMiddleware = (
    useSWR: SWRHook,
    middleware: Middleware
): SWRHook => {
    return <Data = any, Error = any>(
        ...args:
            | [Key]
            | [Key, Fetcher<Data> | null]
            | [Key, SWRConfiguration | undefined]
            | [Key, Fetcher<Data> | null, SWRConfiguration | undefined]
    ) => {
        const [key, fn, config] = normalize(args);
        const uses = (config.use || []).concat(middleware);
        return useSWR<Data, Error>(key, fn, { ...config, use: uses });
    };
};