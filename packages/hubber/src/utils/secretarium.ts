import { /* SecretariumConnector, */ SCP, Key } from '@secretarium/connector';
import i18n from '../i18n';
import logger from './logger';

// const secCon = new SecretariumConnector({
//     connection: {
//         url: 'wss://ovh-fr-gra-2388-2.node.secretarium.org:5001',
//         trustKey: 'e5hbjH7MymfUaq+0FfalmTaYM4XUOG/4caBIyvvAxboMxo9JwZUFDKc0nKrS+1OFtWhoD1pwmg6allICGcwDQw=='
//     }
// });

export const client = new SCP({
    logger: console
});

export const AppLedgerSource = {
    initialize: async () => {
        try {
            const key = await Key.createKey();
            client.connect('wss://ovh-fr-gra-2388-2.node.secretarium.org:5001', key, 'e5hbjH7MymfUaq+0FfalmTaYM4XUOG/4caBIyvvAxboMxo9JwZUFDKc0nKrS+1OFtWhoD1pwmg6allICGcwDQw==');
            return;
        } catch (e) {
            logger.error(i18n.t('errors:DB_CONNECT_ERROR'));
            throw new Error(i18n.t('errors:DB_CONNECT_ERROR') || '');
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