import * as SecretariumHandle from './index';

describe('Connector entry', () => {
    it('Exports the right shape', () => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const BaseHandle: any = SecretariumHandle;

        expect(Object.getOwnPropertyNames(BaseHandle).sort()).toEqual(['__esModule', 'Constants', 'Key', 'SCP', 'Utils', 'crypto', 'SecretariumConnector'].sort());
    });
});
