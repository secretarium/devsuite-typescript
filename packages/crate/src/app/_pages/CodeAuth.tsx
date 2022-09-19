import { FC } from 'react';
import { useLocation } from 'react-router';
import { parse as queryParser } from 'query-string';
import QRCode, { QRCodeProps } from 'react-qr-code';
import { useQuery } from '@secretarium/react';

export const CodeAuth = () => {

    const { search, pathname } = useLocation();
    const { r: refererApplicationToken } = queryParser(search);
    const QRCodeComp: FC<QRCodeProps> = QRCode as any;

    const [data, loading /*, error*/] = useQuery<string, string>({
        app: 'sfx',
        route: 'version'
    });

    if (typeof refererApplicationToken === 'string')
        return <div className='flex flex-col items-center gap-4'>
            <div className='px-2 py-1 bg-slate-300 rounded'>{pathname}{search}</div>
            <div className='p-5 bg-white'>
                <QRCodeComp size={120} value={`https://secretarium.io/a/${refererApplicationToken}`} />
            </div>
            <div className='px-2 py-1 text-xs text-gray-400'>{loading ? 'loading' : data}</div>
        </div>;
    return null;
};

export default CodeAuth;