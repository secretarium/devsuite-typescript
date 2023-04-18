import { /* SecretariumConnector, */ SCP, Key } from '@secretarium/connector';
import i18n from '../i18n';
import logger from './logger';

// const secCon = new SecretariumConnector({
//     connection: {
//         url: 'wss://wasm-dev.node.secretarium.org:6001',
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
            // await client.connect('wss://wasm-dev.node.secretarium.org:6001', key, 'rliD/CISqPEeYKbWYdwa+L+8oytAPvdGmbLC0KdvsH+OVMraarm1eo+q4fte0cWJ7+kmsq8wekFIJK0a83/yCg==');
            await client.connect('wss://wasm-dev.node.secretarium.org:5001', key, 'eOx//L640C1WcBKKuxL7Uy6EehF2rL0Ir+PqVeZKzomyJHbfEeceqftHQSnJAhaYCMO5Du5GqpNTaRdUJp46xA==');
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