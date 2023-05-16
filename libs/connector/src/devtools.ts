import packageInfo from '../package.json';

if (typeof window !== 'undefined')
    (window as any)['__SECRETARIUM_DEVTOOLS_CONNECTOR__'] = {
        version: packageInfo.version
    };

if (typeof global !== 'undefined')
    (global as any)['__SECRETARIUM_DEVTOOLS_CONNECTOR__'] = {
        version: packageInfo.version
    };