
import { useState, useEffect } from 'react';
import { SCP, Key } from '@secretarium/connector';

export const client = new SCP({
    logger: console
});

export function useSecretariumQuery(app: string, route: string, args?: unknown) {

    const [config, setConfig] = useState({
        app,
        route,
        args
    });

    const [status, setStatus] = useState<{
        loading: boolean;
        error?: Error;
        data: Array<any>;
    }>({
        loading: false,
        data: []
    });

    async function refetch() {
        const localAccu: Array<any> = [];
        setStatus({ loading: true, data: localAccu });
        const key = await Key.createKey();
        const [node, trustKey] = process.env['NX_SECRETARIUM_NODE']?.split('|') ?? [];
        await client.connect(node, key, trustKey);
        client.newTx(config.app, config.route, `klave-deployment-${config.app}`, config.args as any)
            .onResult(result => {
                localAccu.push(result);
                setStatus({ loading: false, data: localAccu });
            }).onError(error => {
                setStatus({ loading: false, error: error as any, data: [] });
            }).send().catch(error => {
                setStatus({ loading: false, error: error as any, data: [] });
            });
    }

    // useEffect(() => {
    //     if (app && route) {
    //         refetch();
    //     }
    // }, []);

    useEffect(() => {
        if (config.app !== app || config.route !== route)
            setStatus({ loading: false, error: undefined, data: [] });
        setConfig({
            app,
            route,
            args
        });
    }, [app, route, args, config.app]);

    return { ...status, refetch };
}