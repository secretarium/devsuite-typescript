import { /* SecretariumConnector, */ SCP, Key } from '@secretarium/connector';
import i18n from '../i18n';
import logger from './logger';

// const [node, trustKey] = process.env['NX_SECRETARIUM_NODE']?.split('|') ?? [];
// const secCon = new SecretariumConnector({
//     connection: {
//         url: 'node,
//         trustKey
//     }
// });

export const client = new SCP();

export const AppLedgerSource = {
    initialize: async () => {
        try {
            const key = await Key.createKey();
            const [node, trustKey] = process.env['NX_SECRETARIUM_NODE']?.split('|') ?? [];
            await client.connect(node, key, trustKey);
            return;
        } catch (e) {
            logger.error(i18n.t('errors:SCT_CONNECT_ERROR'));
            logger.error(e);
            throw new Error(i18n.t('errors:SCT_CONNECT_ERROR') || '');
        }
    },
    stop: async () => {
        try {
            await client.close();
            return;
        } catch (e) {
            //
        }
    }
};

export default client;