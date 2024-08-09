import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { SCP, Key } from '@secretarium/connector';

export default async function (fastify: FastifyInstance) {

    const key = await Key.createKey();
    const scp = new SCP({
        logger: fastify.log
    });

    const checkConnection = async () => {
        const secretariumUrl = process.env.SECRETARIUM_URL;
        if (!scp.isConnected() && secretariumUrl)
            await scp.connect(secretariumUrl, key);
    };

    const performCall = async (type: string, req: FastifyRequest, res: FastifyReply) => {

        await checkConnection();

        scp.newTx('personal-data', 'debug/auth/webauthn', undefined, {
            webauthn: type,
            ...(req.body as any)
        }).onResult((result) => {
            res.send({
                status: result.verified === false ? '' : 'ok',
                errorMessage: '',
                ...result
            });
        }).send().catch((err) => {
            res.send({
                status: 'failed',
                errorMessage: err.message ?? err ?? ''
            });
        });
    };

    fastify.get('/ping', async function () {
        return { pong: true };
    });
    fastify.post('/fido2/attestation/options', function (req, res) {

        checkConnection().then(async () => scp.newTx('personal-data', 'debug/auth/webauthn', undefined, {
            webauthn: 'init-user',
            email: (req.body as any).username,
            name: (req.body as any).username,
            displayName: (req.body as any).displayName
        }).onExecuted(() => {
            performCall('register', req, res);
        }).send().catch((err) => {
            res.send({
                status: 'failed',
                errorMessage: err.message ?? err ?? ''
            });
        }));
    });
    fastify.post('/fido2/attestation/result', function (req, res) {
        performCall('register-verify', req, res);
    });
    fastify.post('/fido2/assertion/options', function (req, res) {
        performCall('authenticate', req, res);
    });
    fastify.post('/fido2/assertion/result', function (req, res) {
        performCall('authenticate-verify', req, res);
    });

    // MDS3
    // https://mds3.fido.tools/execute/8a402321299de84f0706bbbede528d1a4a3217635e8aac8c11ec02798772e1fd
    // https://mds3.fido.tools/execute/249a4b710edd8c77287d7929feab8827d0deff90a68231b23be17bff321e3bea
    // https://mds3.fido.tools/execute/f12132d4dcf10eb11bb555ff76d2df94c98753f771e66996d43216a09919217a
    // https://mds3.fido.tools/execute/eadca17ed121e13e923138648ed8afabfff38c3817a8c9269b9c2febe64302ae
    // https://mds3.fido.tools/execute/18bbd4b83953d84ed607fa929ef4c9788cc9930f1c0bcd067bebbeeee9cd8e91
}
