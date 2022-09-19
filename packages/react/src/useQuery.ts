import { useContext, useCallback } from 'react';
import SecretariumContext from './SecretariumContext';
import type { Query, QueryOptions } from './types';
import useSWRSubscription, { SWRSubscription, SWRSubscriptionHook, SWRConfiguration } from './swr/subscriptionMiddleware';

export const useQuery = <TData, TError>(query: Query, options?: QueryOptions<SWRConfiguration> /*, dependencies?: Array<unknown> */) => {

    const { connector /*, options: globalOptions */ } = useContext(SecretariumContext);

    const subscribe = useCallback<SWRSubscription<TData, TError>>((key, { next }) => {

        console.log('useQuery:SWR: Subscribing...');

        if (!connector)
            throw new Error('Connector is not initialised');

        connector.request({
            application: query.app,
            route: query.route
        }, query.args)
            .then(request => {
                request
                    .onResult<TData>((result) => next(undefined, result))
                    .onError<TError>((error) => next(error))
                    .send();
            }).catch(next);

        return () => {
            console.log('useQuery:SWR: Closing subscription');
        };
    }, [query, connector]);

    const { data, error } = (useSWRSubscription as SWRSubscriptionHook<TData, TError>)(query, subscribe, options);

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