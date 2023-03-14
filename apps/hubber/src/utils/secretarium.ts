import { /* SecretariumConnector, */ SCP, Key } from '@secretarium/connector';
import i18n from '../i18n';
import logger from './logger';

// const secCon = new SecretariumConnector({
//     connection: {
//         url: 'wss://ovh-fr-gra-2388-2.node.secretarium.org:6001',
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
            client.connect('wss://ovh-fr-gra-2388-2.node.secretarium.org:5001', key, '3KYI/qGoh0xW4DEQ/2G8GzuFGJ4r/X4CUi81UkCtrVnkW7bfSvsiKNBsQhCcVMFGZduTHt/0C+fMH3btntBSCA==');
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