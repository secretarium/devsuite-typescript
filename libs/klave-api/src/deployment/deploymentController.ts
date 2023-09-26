import { DeploymentPushPayload } from '../types';
import { v4 as uuid } from 'uuid';
import { scp, logger } from '@klave/providers';
import { prisma } from '@klave/db';
// import type { KlaveRcConfiguration } from '@klave/sdk';
import { Utils } from '@secretarium/connector';
import * as path from 'node:path';
import prettyBytes from 'pretty-bytes';
import BuildMiniVM, { DeploymentContext } from './buildMiniVm';
import { router } from '../router';

export const deployToSubstrate = async (deploymentContext: DeploymentContext<DeploymentPushPayload>) => {

    const { octokit, ...context } = deploymentContext;
    let files: Awaited<ReturnType<typeof octokit.repos.compareCommits>>['data']['files'] = [];

    if (context.commit.before) {
        try {
            const { data: { files: filesManifest } } = await octokit.repos.compareCommits({
                owner: context.repo.owner,
                repo: context.repo.name,
                base: context.commit.before,
                head: context.commit.after
            });

            if (filesManifest)
                files = filesManifest;
        } catch (e) {
            logger.debug('Error while comparing files from github', e);
        }
    }

    if (!files?.length) {
        try {
            const { data: { files: filesManifest } } = await octokit.repos.getCommit({
                owner: context.repo.owner,
                repo: context.repo.name,
                ref: context.commit.after
            });

            if (filesManifest)
                files = filesManifest;
        } catch (e) {
            logger.error('Error while fetching files from github', e);
        }
    }

    if (!files.length && !context.commit.forced)
        return;

    const repo = await prisma.repo.findUnique({
        include: {
            applications: true
        },
        where: {
            source_owner_name: {
                source: 'github',
                name: context.repo.name,
                owner: context.repo.owner
            }
        }
    });

    if (!repo)
        return;

    const packageJsonResponse = await octokit.repos.getContent({
        owner: repo.owner,
        repo: repo.name,
        ref: context.commit.ref,
        path: 'package.json',
        mediaType: {
            format: 'raw+json'
        }
    });

    const packageJsonData = Array.isArray(packageJsonResponse.data) ? packageJsonResponse.data[0] : packageJsonResponse.data;

    if (!packageJsonData)
        return;

    let packageJson: any;
    try {
        packageJson = JSON.parse(packageJsonData.toString()) as any;
    } catch (e) {
        logger.error('Error while parsing package.json', e);
        return;
    }

    if (!packageJson)
        return;

    const klaveConfigurationResponse = await octokit.repos.getContent({
        owner: repo.owner,
        repo: repo.name,
        ref: context.commit.ref,
        path: 'klave.json',
        mediaType: {
            format: 'raw+json'
        }
    });

    const klaveConfigurationData = Array.isArray(klaveConfigurationResponse.data) ? klaveConfigurationResponse.data[0] : klaveConfigurationResponse.data;

    if (!klaveConfigurationData)
        return;

    let klaveConfiguration: any;
    try {
        klaveConfiguration = JSON.parse(klaveConfigurationData.toString());
    } catch (e) {
        logger.error('Error while parsing klave.json', e);
        return;
    }

    if (!klaveConfiguration)
        return;

    const availableApplicationsConfig = klaveConfiguration.applications.reduce((prev: any, current: any) => {
        prev[current.name] = current;
        return prev;
    }, {} as Record<string, any['applications'][number]>);

    // TODO Reenable the KlaveRcConfiguration type
    // const config = repo.config as any;
    // const availableApplicationsConfig = config.applications.reduce((prev: any, current: any) => {
    //     prev[current.name] = current;
    //     return prev;
    // }, {} as Record<string, any['applications'][number]>);

    repo.applications.forEach(async application => {


        // Bail out if the application is not in the running configuration
        if (!availableApplicationsConfig[application.name])
            return;

        // TODO There is typing error in this location
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        if (files.filter(({ filename }) => {
            const commitFileDir = path.normalize(path.join('/', filename));
            const appPath = path.normalize(path.join('/', availableApplicationsConfig[application.name]?.rootDir ?? ''));
            return commitFileDir.startsWith(appPath) || filename === 'klave.json';
        }).length === 0)
            return;

        logger.info(`Deploying ${application.name} from ${context.commit.after}`);

        await prisma.activityLog.create({
            data: {
                class: 'pushHook',
                application: {
                    connect: {
                        id: application.id
                    }
                },
                context: {
                    type: context.type,
                    payload: context
                }
            }
        });

        const launchDeploy = async () => {

            const branchName = context.commit.ref?.includes('/') ? context.commit.ref.split('/').pop() : 'master';
            const buildId = context.commit.after.substring(0, 8);
            const domains = await prisma.domain.findMany({
                where: {
                    applicationId: application.id,
                    verified: true
                }
            });

            const deploymentSet = uuid();
            const targets = domains
                .map(domain => `${branchName}.${domain.fqdn}`)
                .concat(`${branchName}.${application.id.split('-').shift()}.sta.klave.network`, `${buildId}.sta.klave.network`);

            targets.forEach(async target => {

                let contextualDeploymentId: string | undefined;

                try {
                    const targetRef = await prisma.deploymentAddress.findFirst({
                        where: {
                            fqdn: target
                        }
                    });

                    const previousDeployment = targetRef?.deploymentId ? await prisma.deployment.findFirst({
                        where: {
                            id: targetRef?.deploymentId
                        }
                    }) : null;

                    if (previousDeployment)
                        await prisma.deployment.update({
                            where: {
                                id: previousDeployment.id
                            },
                            data: {
                                status: 'updating'
                            }
                        });

                    const deployment = await prisma.deployment.create({
                        data: {
                            deploymentAddress: {
                                create: {
                                    fqdn: target
                                }
                            },
                            expiresOn: new Date(Date.now() + 1000 * 60 * 60 * 24 * 14),
                            version: availableApplicationsConfig[application.name]?.version,
                            set: deploymentSet,
                            build: context.commit.after.substring(0, 8),
                            branch: branchName,
                            locations: ['FR'],
                            application: {
                                connect: { id: application.id }
                            }
                            // TODO: Make sure we get the push event
                            // pushEvent
                        }
                    });

                    contextualDeploymentId = deployment.id;

                    await prisma.activityLog.create({
                        data: {
                            class: 'deployment',
                            application: {
                                connect: {
                                    id: application.id
                                }
                            },
                            context: {
                                type: 'start',
                                payload: {
                                    deploymentId: deployment.id
                                }
                            }
                        }
                    });

                    (new Promise((__unusedResolve, reject) => {
                        setTimeout(reject, 60000);
                        return prisma.deployment.update({
                            where: {
                                id: deployment.id
                            },
                            data: {
                                status: 'deploying'
                            }
                        });
                    })).catch(async () => {
                        const currentState = await prisma.deployment.findUnique({
                            where: {
                                id: deployment.id
                            }
                        });
                        if (currentState?.status !== 'deployed' && currentState?.status !== 'errored') {
                            logger.debug(`Deployment ${deployment.id} timed out`, {
                                parent: 'dpl'
                            });
                            await prisma.deployment.update({
                                where: {
                                    id: deployment.id
                                },
                                data: {
                                    status: 'errored',
                                    buildOutputStdErr: 'Deployment timed out'
                                }
                            }).catch((reason) => {
                                logger.debug('Error while updating deployment status to error', {
                                    parent: 'dpl',
                                    reason
                                });
                            });
                        }
                    });

                    logger.debug(`Starting compilation ${deployment.id}`, {
                        parent: 'dpl'
                    });
                    const buildVm = new BuildMiniVM({
                        type: 'github',
                        context: deploymentContext,
                        repo,
                        application: availableApplicationsConfig[application.name],
                        dependencies: {
                            ...(packageJson.optionalDependencies ?? {}),
                            ...(packageJson.peerDependencies ?? {}),
                            ...(packageJson.dependencies ?? {}),
                            ...(packageJson.devDependencies ?? {})
                        }
                    });

                    const buildResult = await buildVm.build();
                    const { stdout, stderr, dependenciesManifest } = buildResult;

                    await prisma.deployment.update({
                        where: {
                            id: deployment.id
                        },
                        data: {
                            dependenciesManifest,
                            buildOutputStdOut: stdout,
                            buildOutputStdErr: stderr
                        }
                    });

                    // TODO - Populate reasons why deployment failed
                    if (buildResult.success === false) {
                        logger.debug('Compilation failed', {
                            parent: 'dpl'
                        });
                        await prisma.deployment.update({
                            where: {
                                id: deployment.id
                            },
                            data: {
                                status: 'errored',
                                buildOutputErrorObj: buildResult.error as any
                            }
                        });
                        return;
                    }

                    const { result: { wasm, wat, dts } } = buildResult;
                    const wasmB64 = Utils.toBase64(wasm);

                    logger.debug(`Compilation was successful ${deployment.id} (${prettyBytes(wasmB64.length)})`, {
                        parent: 'dpl'
                    });

                    // TODO - Populate reasons we fail on empty wasm
                    if (wasm.length === 0) {
                        logger.debug('Empty wasm', {
                            parent: 'dpl'
                        });
                        await prisma.deployment.update({
                            where: {
                                id: deployment.id
                            },
                            data: {
                                status: 'errored',
                                buildOutputErrorObj: { error: 'Empty wasm' } as any
                            }
                        });
                        return;
                    }

                    await prisma.deployment.update({
                        where: {
                            id: deployment.id
                        },
                        data: {
                            status: 'compiled',
                            buildOutputWASM: wasmB64,
                            buildOutputWAT: wat,
                            buildOutputDTS: dts
                        }
                    });

                    if (dts) {
                        const matches = Array.from(dts.matchAll(/^export declare function (.*)\(/gm));
                        const validMatches = matches
                            .map(match => match[1])
                            .filter(Boolean)
                            .filter(match => !['__new', '__pin', '__unpin', '__collect', 'register_routes'].includes(match));
                        await prisma.deployment.update({
                            where: {
                                id: deployment.id
                            },
                            data: {
                                contractFunctions: validMatches
                            }
                        });
                    }

                    logger.debug(`${targetRef ? 'Updating' : 'Registering'} smart contract: ${target}`);
                    await scp.newTx('wasm-manager', targetRef ? 'update_smart_contract' : 'register_smart_contract', `klave-deployment-${deployment.id}`, {
                        contract: {
                            name: target,
                            own_enclave: false,
                            wasm_bytes: [],
                            wasm_bytes_b64: wasmB64
                        }
                    }).onExecuted(async () => {
                        logger.debug(`Successfully ${targetRef ? 'updated' : 'registered'} smart contract: ${target}`);
                        await prisma.deployment.update({
                            where: {
                                id: deployment.id
                            },
                            data: {
                                status: 'deployed'
                            }
                        });
                        if (previousDeployment) {
                            logger.debug(`Deleting previous deployment ${previousDeployment.id} for ${target}`);
                            const caller = router.v0.deployments.createCaller({
                                prisma
                            } as any);
                            caller.delete({
                                deploymentId: previousDeployment.id
                            }).catch((error) => {
                                logger.debug(`Failure while deleting previous deployment ${previousDeployment.id} for ${target}:, ${error}`);
                            });
                        }
                    }).onError(async (error) => {
                        logger.debug(`Error while ${!targetRef ? 'updating' : 'registering'} smart contract ${target}: ${error}`);
                        if (`${error}`.includes('use register_smart_contract') || `${error}`.includes('use update_smart_contract')) {
                            // TODO - Remove this when we have a proper way to update smart contracts list with `list_smart_contracts`
                            logger.debug(`Retrying with ${!targetRef ? 'update_smart_contract' : 'register_smart_contract'}...`);
                            await scp.newTx('wasm-manager', !targetRef ? 'update_smart_contract' : 'register_smart_contract', `klave-deployment-${deployment.id}`, {
                                contract: {
                                    name: target,
                                    own_enclave: false,
                                    wasm_bytes: [],
                                    wasm_bytes_b64: wasmB64
                                }
                            }).onExecuted(async () => {
                                logger.debug(`Successfully ${!targetRef ? 'updated' : 'registered'} smart contract: ${target}`);
                                await prisma.deployment.update({
                                    where: {
                                        id: deployment.id
                                    },
                                    data: {
                                        status: 'deployed'
                                    }
                                });
                                if (previousDeployment) {
                                    logger.debug(`Deleting previous deployment ${previousDeployment.id} for ${target}`);
                                    const caller = router.v0.deployments.createCaller({
                                        prisma
                                    } as any);
                                    caller.delete({
                                        deploymentId: previousDeployment.id
                                    }).catch((error) => {
                                        logger.debug(`Failure while deleting previous deployment ${previousDeployment.id} for ${target}: ${error}`);
                                    });
                                }
                            }).onError(async (error) => {
                                if (previousDeployment) {
                                    await prisma.deployment.update({
                                        where: {
                                            id: previousDeployment.id
                                        },
                                        data: {
                                            status: previousDeployment.status
                                        }
                                    });
                                }
                                logger.debug(`Error while ${!targetRef ? 'updating' : 'registering'} smart contract ${target}: ${error}`);
                                // Timeout will eventually error this
                            }).send();
                        } else {
                            if (previousDeployment) {
                                await prisma.deployment.update({
                                    where: {
                                        id: previousDeployment.id
                                    },
                                    data: {
                                        status: previousDeployment.status
                                    }
                                });
                            }
                            // Timeout will eventually error this
                        }
                    }).send();

                } catch (error: any) {
                    logger.debug(`General failure processing ${target}: ${error}`);
                    try {
                        if (contextualDeploymentId)
                            await prisma.deployment.update({
                                where: {
                                    id: contextualDeploymentId
                                },
                                data: {
                                    status: 'errored',
                                    buildOutputErrorObj: {
                                        message: error.message,
                                        stack: error.stack
                                    }
                                }
                            });
                    } catch (error) {
                        logger.debug(`General failure processing ${target}: ${error}`);
                        // Timeout will eventually error this
                    }
                }
            });
        };

        if (context.class === 'push')
            launchDeploy().finally(() => { return; });
    });

    return;
};
