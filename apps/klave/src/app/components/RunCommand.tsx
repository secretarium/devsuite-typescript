import { FC, useState } from 'react';
import Editor from '@monaco-editor/react';
import { UilSpinner } from '@iconscout/react-unicons';
import { useSecretariumQuery } from '../utils/secretarium';

type RunCommandProps = {
    address: string;
    functions?: string[];
}

export const RunCommand: FC<RunCommandProps> = ({ address, functions = [] }) => {

    const [route, setRoute] = useState(functions[0] ?? '');
    const [args, setArgs] = useState('');
    const { data, loading, error, refetch } = useSecretariumQuery(address, route, args);

    return <>
        <h2 className='font-bold mb-3'>Command runner</h2>
        <h3 className='mb-3'>Execution input</h3>
        <div className='flex'>
            {/* <input type="text" name='klave-route-name' className="h-9 font-mono mb-2 bg-gray-900 text-gray-100 border border-gray-300 dark:border-gray-700 dark:text-white w-full text-sm" placeholder="Route name" onChange={({ target }) => setRoute(target.value)} /> */}
            <select name='klave-route-name' placeholder="Route name" onChange={({ target }) => setRoute(target.value)} className="h-9 font-mono mb-2 bg-gray-900 text-gray-100 border border-gray-300 dark:border-gray-700 dark:text-white w-full text-sm" >
                {functions.map((f, i) => <option key={`function.${i}`} value={f}>{f}</option>)}
            </select>
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
            value={loading ? '// executing...' : data?.length ? JSON.stringify(data, null, 4) : error ? `// error: ${error}` : ''}
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
            height="20vh"
            defaultLanguage="json"
        />
    </>;
};

export default RunCommand;