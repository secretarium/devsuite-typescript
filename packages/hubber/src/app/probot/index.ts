import type { Probot, Context } from 'probot';

const check = async (context: Context) => {
    context.log.info('Code was pushed to the repo, what should we do with it?');
};

const ping = async (context: Context<'ping'>) => {
    const { sender, repository } = context.payload;
    context.log.info(`Github pinged from ${sender?.login}@${repository?.name}`);
};

const probotApp = (app: Probot) => {

    app.on(['ping'], ping);
    app.on(
        [
            'pull_request.opened',
            'pull_request.synchronize',
            'check_run.rerequested'
        ],
        check
    );

};

export default probotApp;