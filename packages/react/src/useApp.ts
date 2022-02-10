import { useEffect, useRef } from 'react';
// import SecretariumContext from './SecretariumContext';
import useRefState from 'urs';
import useSSR from 'use-ssr';
import useCache from './useCache';
import type { QueryOptions } from './types';
import { CachePolicies } from './types';

export const useApp = (application: string, options?: QueryOptions, dependencies?: any[]) => {

    const { persist = true, cacheLife = 0, cachePolicy = CachePolicies.CACHE_FIRST, suspense = true } = options || {};

    const { isServer } = useSSR();
    const cache = useCache({ persist, cacheLife, cachePolicy });
    const error = useRef<any>();
    const suspender = useRef<Promise<any>>();
    const suspenseStatus = useRef('pending');
    const mounted = useRef(false);
    const [loading] = useRefState(true);

    // Abort at any unmount
    // useEffect(() =>{ request.abort}, []);

    if (suspense && suspender.current) {
        if (isServer) throw new Error('Suspense on server side is not yet supported! 🙅‍♂️');
        switch (suspenseStatus.current) {
            case 'pending':
                throw suspender.current;
            case 'error':
                throw error.current;
        }
    }

    console.log(cache);

    useEffect((): any => {
        mounted.current = true;
        if (Array.isArray(dependencies)) {
            // const methodName = requestInit.method || HTTPMethod.GET;
            // const methodLower = methodName.toLowerCase() as keyof ReqMethods<TData>;
            // const req = request[methodLower] as NoArgs;
            // req();
        }
        return () => mounted.current = false;

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, dependencies);

    return Object.assign<any, any>(
        [application, loading.current, error.current],
        { data: application, loading: loading.current, error: error.current }
    );
    // const { connector } = useContext(SecretariumContext);
    // return connector;
};

export default useApp;