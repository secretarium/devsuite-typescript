import * as fs from 'node:fs';
import * as path from 'node:path';
import { Key, EncryptedKeyPairV0, EncryptedKeyPairV2 } from './secretarium.key';
import { fileURLToPath } from 'node:url';

const dirname = path.dirname(fileURLToPath(import.meta.url));
const encV1Key = JSON.parse(fs.readFileSync(path.join(dirname, '../fixtures/enc.v1.json'), 'utf8')) as EncryptedKeyPairV0;
const encV2Key = JSON.parse(fs.readFileSync(path.join(dirname, '../fixtures/enc.v2.json'), 'utf8')) as EncryptedKeyPairV2;

describe('Connector key', () => {
    it('Creates a new key from static method', async () => {
        const newKeyPromise = Key.createKey();
        expect(newKeyPromise).toBeInstanceOf(Promise);

        const newKey = await newKeyPromise;
        expect(newKey).toBeInstanceOf(Key);

        const exportedKeyPair = await newKey.exportKey();
        expect(exportedKeyPair).toBeDefined();
        expect(exportedKeyPair.privateKey).toBeDefined();
        expect(exportedKeyPair.publicKey).toBeDefined();
    });

    it('Seals a key', async () => {
        const newKey = await Key.createKey();
        const newSealPromise = newKey.seal('HelloWorld');
        expect(newSealPromise).toBeInstanceOf(Promise);

        const sealedKey = await newSealPromise;
        expect(sealedKey).toBeInstanceOf(Key);

        const encryptedKey = await sealedKey.exportEncryptedKey();
        expect(encryptedKey.version).toBeDefined();
        expect(encryptedKey.iv).toBeDefined();
        expect(encryptedKey.salt).toBeDefined();
        expect(encryptedKey.data).toBeDefined();
    });

    it('Imports sealed key v1', async () => {
        try {
            const newKey = await Key.importEncryptedKeyPair(encV1Key, '1234');
            expect(newKey).toBeInstanceOf(Key);
        } catch (e) {
            console.error(e);
            console.error('msrcrypto does not support PKCS8');
        }
    });

    it('Imports sealed key v1 with wrong password', async () => {
        expect.assertions(1);
        return Key.importEncryptedKeyPair(encV1Key, 'HelloWorld')
            .then(() => {
                return;
            })
            .catch((err) => {
                expect(err).toEqual(new Error('Cannot decrypt, Invalid password'));
            });
    });

    it('Imports sealed key v2', async () => {
        console.log(encV2Key);
        console.log(JSON.stringify(encV2Key, null, 2));
        const newKey = await Key.importEncryptedKeyPair(encV2Key, 'HelloWorld');
        expect(newKey).toBeInstanceOf(Key);
    });

    it('Imports sealed key v2 with wrong password', async () => {
        expect.assertions(1);
        return Key.importEncryptedKeyPair(encV2Key, '1234')
            .then(() => {
                return;
            })
            .catch((err) => {
                expect(err).toEqual(new Error('Cannot decrypt, Invalid password'));
            });
    });

    it('Reexports clear an imported sealed key v2', async () => {
        const newKey = await Key.importEncryptedKeyPair(encV2Key, 'HelloWorld');
        const exportedKeyPair = await newKey.exportKey();
        expect(exportedKeyPair).toBeDefined();
        expect(exportedKeyPair.privateKey).toBeDefined();
        expect(exportedKeyPair.publicKey).toBeDefined();
    });

    it('Reexports sealed an imported sealed key v2', async () => {
        const newKey = await Key.importEncryptedKeyPair(encV2Key, 'HelloWorld');
        const exportedEncryptedKeyPair = await newKey.exportEncryptedKey();
        expect(exportedEncryptedKeyPair).toBeDefined();
        expect(exportedEncryptedKeyPair.version).toBeDefined();
        expect(exportedEncryptedKeyPair.iv).toBeDefined();
        expect(exportedEncryptedKeyPair.salt).toBeDefined();
        expect(exportedEncryptedKeyPair.data).toBeDefined();
    });

    test('Key cycle generate import', async () => {
        const newKey = await Key.createKey();
        const clearKey = await newKey.exportKey();
        const newSeal = await newKey.seal('HelloWorld');
        const encKey = await newSeal.exportEncryptedKey();
        const nextKey = await Key.importEncryptedKeyPair(encKey, 'HelloWorld');
        const nextClearKey = await nextKey.exportKey();

        expect(nextClearKey).toEqual(clearKey);
    });

    test('Check consistant key size', async () => {
        for (let i = 0; i < 1000; i++) {
            const keyPair = await Key.createKey();
            const rawPubKey = await keyPair.getRawPublicKey();
            expect(rawPubKey.length).toBe(64);
        }
    }, 100000);
});
