import { prisma } from '@secretarium/hubber-db';
import { router } from '@secretarium/hubber-api';

let intervalTimer: NodeJS.Timeout;

async function errorLongDeployingDeployments() {
    return prisma.deployment.updateMany({
        where: {
            status: {
                // TODO Figure out what to with failing termination
                in: ['created', 'deploying']
            },
            updatedAt: {
                lt: new Date(Date.now() - 1000 * 60 * 5)
            }
        },
        data: {
            status: 'errored',
            buildOutputErrorObj: {
                message: 'Deployment timed out'
            }
        }
    });
}

async function terminateExpiredDeployments() {
    const expiredDeploymentList = await prisma.deployment.findMany({
        where: {
            status: {
                in: ['deployed']
            },
            expiresOn: {
                lt: new Date()
            }
        }
    });
    return Promise.allSettled(expiredDeploymentList.map((deployment) => {
        const caller = router.v0.deployments.createCaller({
            prisma
        } as any);
        return caller.terminateDeployment({
            deploymentId: deployment.id
        });
    }));
}

export async function prune() {
    try {
        await errorLongDeployingDeployments();
        await terminateExpiredDeployments();
    } catch (e) {
        console.error('Error while pruning', e);
    }
}

type PrunerOptions = {
    interval?: number;
}

export function startPruner(options?: PrunerOptions) {
    const { interval = 6000 } = options ?? {};
    prune();
    intervalTimer = setInterval(() => {
        prune();
    }, interval);
}

export function stopPruner() {
    clearInterval(intervalTimer);
}