import { version } from '../package.json';

if (typeof window !== 'undefined')
    (window as any)['__SECRETARIUM_DEVTOOLS_CONNECTOR__'] = {
        version
    };