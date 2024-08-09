import * as msrCryptoHoist from '../vendor/msrCrypto.cjs';

const msrCrypto = msrCryptoHoist;
const selectCrypto = () => {

    const windowCrypto = typeof window !== 'undefined' ? window.crypto : undefined;
    const nodeCrypto = typeof globalThis !== 'undefined' ? globalThis.crypto : undefined;

    if (windowCrypto && windowCrypto.subtle) {
        let version: string | undefined;
        if (typeof navigator !== 'undefined') {
            version = (() => {
                const ua = navigator.userAgent;
                let tem;
                let M: Array<string | undefined> = ua.match(/(opera|chrome|safari|firefox|msie|trident(?=\/))\/?\s*(\d+)/i) || [];
                if (M[1] && /trident/i.test(M[1])) {
                    tem = /\brv[ :]+(\d+)/g.exec(ua) || [];
                    return 'IE ' + (tem[1] || '');
                }
                if (M[1] === 'Chrome') {
                    tem = ua.match(/\b(OPR|Edge)\/(\d+)/);
                    if (tem != null) return tem.slice(1).join(' ').replace('OPR', 'Opera');
                }
                M = M[2] ? [M[1], M[2]] : [navigator.appName, navigator.appVersion, '-?'];
                if ((tem = ua.match(/version\/(\d+)/i)) != null) M.splice(1, 1, tem[1]);
                return M.join(' ');
            })();
        }
        (windowCrypto as any).context = {
            type: 'browser',
            version
        };
        return windowCrypto;
    }
    else if (nodeCrypto && nodeCrypto.subtle) {
        (nodeCrypto as any).context = {
            type: 'node',
            version: process.version
        };
        return nodeCrypto;
    }

    (msrCrypto as any).context = {
        type: 'msr',
        version: (msrCrypto as any).version
    };
    return msrCrypto;
};

export default selectCrypto();
