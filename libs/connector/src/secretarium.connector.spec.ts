import { assert } from 'console';
import { SCP } from './secretarium.connector';
import { Key } from './secretarium.key';
// import { ConnectionStateMessage } from './secretarium.constant';

describe('Connection test', () => {
    it('Connects to Klave', async () => {
        const scp = new SCP();
        console.log('\n>> Opening SCP...');
        await scp.connect();

        const tx = scp.newTx('wasm-manager', 'version', 'requestId1', { });
        tx.onError((err) => { console.error('Query error:', err); });
        tx.onResult((res) => { console.log('Query result:', res); });

        console.log('\n>> Sending request...');
        const coucou = await tx.send();
        expect(coucou['version']['wasm_version']['major']).not.toBe('');

        scp.close();
    }, 100000);

    it('Connects to Klave with url and key', async () => {
        const scp = new SCP();
        const myKey = await Key.createKey();
        console.log('\n>> Opening SCP...');
        await scp.connect('wss://on.klave.network', myKey);

        const tx = scp.newTx('wasm-manager', 'version', 'requestId1', { });
        tx.onError((err) => { console.error('Query error:', err); });
        tx.onResult((res) => { console.log('Query result:', res); });
        console.log('\n>> Sending request...');
        const coucou = await tx.send();

        expect(coucou['version']['wasm_version']['major']).not.toBe('');

        scp.close();
    }, 100000);
});