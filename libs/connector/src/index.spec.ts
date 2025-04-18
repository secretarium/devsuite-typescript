import * as SecretariumHandle from './index.js';

describe('Connector entry', () => {
    it('Exports the right shape', () => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const BaseHandle: any = SecretariumHandle;

        expect(Object.getOwnPropertyNames(BaseHandle).sort()).toEqual(['Constants', 'Key', 'SCP', 'Utils', 'crypto', 'SecretariumConnector'].sort());
    });
});
