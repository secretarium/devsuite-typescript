import { FC, useEffect, useState } from 'react';
import Editor from '@monaco-editor/react';
import { SCP, Key } from '@secretarium/connector';
import { UilSpinner } from '@iconscout/react-unicons';

const client = new SCP({
    logger: console
});

function useSecretariumQuery(app: string, route: string, args?: unknown) {

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
        // await client.connect('wss://wasm-dev.node.secretarium.org:6001', key, 'rliD/CISqPEeYKbWYdwa+L+8oytAPvdGmbLC0KdvsH+OVMraarm1eo+q4fte0cWJ7+kmsq8wekFIJK0a83/yCg==');
        await client.connect('wss://wasm-dev.node.secretarium.org:5001', key, 'eOx//L640C1WcBKKuxL7Uy6EehF2rL0Ir+PqVeZKzomyJHbfEeceqftHQSnJAhaYCMO5Du5GqpNTaRdUJp46xA==');
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

type RunCommandProps = {
    address: string;
}

export const RunCommand: FC<RunCommandProps> = ({ address }) => {

    const [route, setRoute] = useState('');
    const [args, setArgs] = useState('');
    const { data, loading, error, refetch } = useSecretariumQuery(address, route, args);

    return <>
        <h2 className='font-bold mb-3'>Command runner</h2>
        <h3 className='mb-3'>Execution input</h3>
        <div className='flex'>
            <input type="text" name='klave-route-name' className="h-9 font-mono mb-2 bg-gray-900 text-gray-100 border border-gray-300 dark:border-gray-700 dark:text-white w-full text-sm" placeholder="Route name" onChange={({ target }) => setRoute(target.value)} />
            <button onClick={() => refetch()} className='h-9 mb-2 bg-gray-800 hover:bg-gray-600 text-gray-100 border border-gray-300 dark:border-gray-700 dark:text-white rounded-none text-sm font-normal'>Go</button>
        </div>
        <Editor
            key={`args.${address}`}
            options={{
                minimap: { enabled: false },
                hover: { enabled: false },
                suggest: {
                    showFields: false,
                    showFunctions: false
                }
            }}
            theme='vs-dark'
            height="10vh"
            defaultLanguage="json"
            defaultValue={args}
            onChange={value => { if (value) setArgs(value); }}
        />
        <h3 className='my-3 h-5'>Application response {loading ? <UilSpinner className='inline-block animate-spin h-5' /> : ''}</h3>
        <Editor
            key={`result.${address}`}
            value={loading ? '// executing...' : data ? JSON.stringify(data, null, 4) : error ? `// error: ${error}` : ''}
            options={{
                minimap: { enabled: false },
                semanticHighlighting: { enabled: false },
                hover: { enabled: false },
                readOnly: true,
                suggest: {
                    showFields: false,
                    showFunctions: false
                }
            }}
            theme='vs-dark'
            height="10vh"
            defaultLanguage="json"
        />
    </>;
};

export default RunCommand;