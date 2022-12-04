import type { Probot } from 'probot';
import logger from '../../utils/logger';
import { storeHook } from '../controllers/hookController';

const probotApp = (app: Probot) => {

    app.on([
        'ping',
        'pull_request.opened',
        'pull_request.synchronize',
        'check_run.rerequested',
        'push'
    ], async (context) => {
        const hook = await storeHook({
            source: 'github',
            event: context.name,
            remoteId: context.id,
            payload: context.payload as any
        });
        logger.info(`New record of hook ${hook._id}`);
    });
};

export default probotApp;