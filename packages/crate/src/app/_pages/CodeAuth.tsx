import { useLocation } from 'react-router';
import { parse as queryParser } from 'query-string';
import QRCode from 'react-qr-code';
import { CachePolicies, useQuery } from '@secretarium/react';

export const CodeAuth = () => {

    const { search, pathname } = useLocation();
    const { r: refererApplicationToken } = queryParser(search);

    const [data, loading /*, error*/] = useQuery<string, string>({
        app: 'sfx',
        route: 'version'
    }, {
        cachePolicy: CachePolicies.CACHE_AND_NETWORK
    }, []);

    if (typeof refererApplicationToken === 'string')
        return <div className='flex flex-col items-center gap-4'>
            <div className='px-2 py-1 bg-slate-300 rounded'>{pathname}{search}</div>
            <div className='p-5 bg-white'>
                <QRCode size={120} value={`https://secretarium.io/a/${refererApplicationToken}`} />
            </div>
            <div className='px-2 py-1 text-xs text-gray-400'>{loading ? 'loading' : data}</div>
        </div>;
    return null;
};

export default CodeAuth;