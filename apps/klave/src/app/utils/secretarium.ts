
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
        data?: any;
    }>({
        loading: false
    });

    async function refetch() {
        setStatus({ loading: true });
        const key = await Key.createKey();
        const [node, trustKey] = process.env['NX_SECRETARIUM_NODE']?.split('|') ?? [];
        await client.connect(node, key, trustKey);
        client.newTx(config.app, config.route, `klave-deployment-${config.app}`, config.args as any)
            .onResult(result => {
                setStatus({ loading: false, data: result });
            }).onError(error => {
                setStatus({ loading: false, error: error as any });
            }).send().catch(error => {
                setStatus({ loading: false, error: error as any });
            });
    }

    useEffect(() => {
        if (app && route) {
            refetch();
        }
    }, []);

    useEffect(() => {
        if (config.app !== app)
            setStatus({ loading: false, error: undefined });
        setConfig({
            app,
            route,
            args
        });
    }, [app, route, args, config.app]);

    return { ...status, refetch };
}