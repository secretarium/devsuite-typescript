import { useState, useEffect, useRef, useContext, useCallback } from 'react';
import SecretariumContext from './SecretariumContext';
import useRefState from 'urs';
import useSSR from 'use-ssr';
import useCache from './useCache';
import type { Query, QueryDataFunction, QueryOptions } from './types';
import { CachePolicies } from './types';
import { useDeepQueryCallback } from './utils';

export const useQuery = <TData, TError>(query: Query, options?: QueryOptions, dependencies?: Array<unknown>) => {

    const { connector, options: globalOptions } = useContext(SecretariumContext);
    const { persist = true, cacheLife = 0, cachePolicy = CachePolicies.CACHE_FIRST, suspense = false } = {
        ...globalOptions,
        ...(options || {})
    };

    const { isServer } = useSSR();
    const cache = useCache({ persist, cacheLife, cachePolicy });
    const [, forceUpdateWith] = useState<any>();
    const data = useRef<TData>();
    const error = useRef<TError>();
    const suspender = useRef<Promise<any>>();
    const suspenseStatus = useRef('pending');
    const mounted = useRef(false);
    const [loading, setLoading] = useRefState(true);
    // const [, forceUpdate] = useReducer(() => ({}), []);

    const makeQuery = useDeepQueryCallback((): QueryDataFunction<TData> => {

        const doQuery = async (): Promise<TData | void> => {

            if (isServer || !connector)
                return; // for now, we don't do anything on the server

            error.current = undefined;

            if (!suspense)
                setLoading(true);

            try {

                const cacheKey = Object.entries({ ...query }).map(([key, value]) => `${key}:${value}`).join('||');

                if ([CachePolicies.CACHE_FIRST, CachePolicies.CACHE_AND_NETWORK].includes(cachePolicy) && await cache.has(cacheKey)) {
                    data.current = await cache.get<TData>(cacheKey);
                    if (cachePolicy === CachePolicies.CACHE_FIRST) {
                        if (!suspense)
                            setLoading(false);
                        return data.current;
                    }
                }

                const request = await connector.request({
                    application: query.app,
                    route: query.route
                }, query.args);
                request.onResult((result) => {
                    data.current = result as TData;
                    // setPlop(result as TData);
                    cache.set(cacheKey, result);
                    forceUpdateWith(result);
                }).onError((result) => {
                    error.current = result as any as TError;
                    forceUpdateWith(result);
                }).send();

                // if (response.isCached && cachePolicy === CACHE_FIRST) {
                //     newRes = response.cached as Response;
                // } else {
                // newRes = (await fetch(url, options)).clone();
                // }
                // res.current = newRes.clone();

                // newData = await tryGetData(newRes, defaults.data, responseType);
                // res.current.data = onNewData(data.current, newData);

                // res.current = interceptors.response ? await interceptors.response({ response: res.current, request: requestInit }) : res.current;
                // invariant('data' in res.current, 'You must have `data` field on the Response returned from your `interceptors.response`');
                // data.current = res.current.data as TData;

                // const opts = { attempt: attempt.current, response: newRes };
                // const shouldRetry = (
                //     // if we just have `retries` set with NO `retryOn` then
                //     // automatically retry on fail until attempts run out
                //     !isFunction(retryOn) && Array.isArray(retryOn) && retryOn.length < 1 && newRes?.ok === false
                //     // otherwise only retry when is specified
                //     || Array.isArray(retryOn) && retryOn.includes(newRes.status)
                //     || isFunction(retryOn) && await retryOn(opts)
                // ) && retries > 0 && retries > attempt.current;

                // if (shouldRetry) {
                //     const theData = await retry(opts, routeOrBody, body);
                //     return theData;
                // }

                // if (cachePolicy === CACHE_FIRST && !response.isCached) {
                //     await cache.set(response.id, newRes.clone());
                // }

                // if (Array.isArray(data.current) && !!(data.current.length % perPage)) hasMore.current = false;
            } catch (err: any) {

                // if (shouldRetry) {
                //     const theData = await retry(opts, routeOrBody, body);
                //     return theData;
                // }

                if (err.name !== 'AbortError') {
                    error.current = err;
                }

            } finally {
                //
            }

            // if (newRes && !newRes.ok && !error.current) error.current = makeError(newRes.status, newRes.statusText);
            if (!suspense)
                setLoading(false);
            // if (attempt.current === retries) attempt.current = 0;
            // if (error.current)
            // onError({ error: error.current });

            return data.current;
        };

        if (suspense) {
            return async () => {
                suspender.current = doQuery().then(
                    (newData: any) => {
                        suspenseStatus.current = 'success';
                        return newData;
                    },
                    () => {
                        suspenseStatus.current = 'error';
                    }
                );
                forceUpdateWith(undefined);
                const newData = await suspender.current;
                return newData;
            };
        }

        return doQuery;

    }, [isServer, cachePolicy, persist, cacheLife, forceUpdateWith, suspense]);

    const send = useCallback(makeQuery(), [makeQuery]);

    useEffect((): any => {
        mounted.current = true;
        if (loading.current && !data.current) {
            console.log('start effect send', dependencies, loading.current, data.current);
            send();
        }
        // if (Array.isArray(dependencies)) {
        //     // Update when array of dependencies is provided
        // } else if (loading.current) {
        //     send();
        // }
        return () => mounted.current = false;

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, dependencies);

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

    return Object.assign<[TData | undefined, boolean, TError | undefined], {
        data?: TData,
        loading: boolean,
        error?: TError
    }>(
        [data.current, loading.current, error.current],
        {
            data: data.current,
            loading: loading.current,
            error: error.current
        }
    );
    // const { connector } = useContext(SecretariumContext);
    // return connector;
};

export default useQuery;