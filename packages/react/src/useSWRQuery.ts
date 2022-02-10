import { useContext, useCallback } from 'react';
import SecretariumContext from './SecretariumContext';
// import useSWR, { Fetcher } from 'swr';
import type { Query, QueryOptions } from './types';
import { SWRSubscription, SWRSubscriptionHook, useSWRSubscription } from './swr/subscriptionMiddleware';

export const useQuery = <TData, TError>(query: Query, options?: QueryOptions, dependencies?: Array<unknown>) => {

    const { connector, options: globalOptions } = useContext(SecretariumContext);
    // const fetcher = useCallback<Fetcher<TData>>(async () => {

    //     if (!connector)
    //         throw 'Connector is not initialised';

    //     const request = await connector.request({
    //         application: query.app,
    //         route: query.route
    //     }, query.args);

    //     return new Promise<TData>((resolve, reject) => request.onResult<TData>(resolve).onError(reject).send());

    // }, [query, connector]);

    // const { data, error } = useSWR<TData>(query, fetcher);

    const subscribe = useCallback<SWRSubscription<TData, TError>>((key, callback) => {
        // const subscribe: SWRSubscription<TData, TError> = (key, callback) => {

        console.log('useQuery:SWR: Subscribing...');

        if (!connector)
            throw 'Connector is not initialised';

        connector.request({
            application: query.app,
            route: query.route
        }, query.args)
            .then(request => {
                request
                    .onResult<TData>((result) => callback(undefined, result))
                    .onError<TError>((error) => callback(error))
                    .send();
            }).catch(callback);

        return () => {
            console.log('useQuery:SWR: Closing subscription');
        };
    }, [query, connector]);
    // };

    const { data, error } = (useSWRSubscription as SWRSubscriptionHook<TData, TError>)(query, subscribe);

    console.log(globalOptions, options, dependencies);

    return Object.assign<[TData | undefined, boolean, TError | undefined], {
        data?: TData,
        loading: boolean,
        error?: TError
    }>(
        [data, !data, error],
        {
            data: data,
            loading: !data,
            error: error
        }
    );
};

export default useQuery;