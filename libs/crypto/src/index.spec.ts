import * as SecretariumHandle from './index';

describe('Crypto entry', () => {
    it('Exports the right shape', () => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const BaseHandle: any = SecretariumHandle;

        expect(Object.getOwnPropertyNames(BaseHandle).sort()).toEqual(['default', 'Utils', 'crypto'].sort());
    });
});
