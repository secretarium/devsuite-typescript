import { DeploymentPushPayload, DeploymentPullRequestPayload } from '@secretarium/hubber-api';
import { prisma } from '@secretarium/hubber-db';
import type { KlaveRcConfiguration } from '@secretarium/trustless-app';
import { Utils } from '@secretarium/connector';
import path from 'node:path';
import stream from 'node:stream';
import type { Context } from 'probot';
import * as asb from 'asbuild';
import secretariumClient from '../../utils/secretarium';

type DeploymentContext<Type> = {
    octokit: Context['octokit']
} & Type;

export const deployToSubstrate = async ({ octokit, ...context }: DeploymentContext<DeploymentPushPayload>) => {

    const { data: { files } } = await octokit.repos.compareCommits({
        owner: context.repo.owner,
        repo: context.repo.name,
        base: context.commit.before,
        head: context.commit.after
    });

    if (!files)
        return;

    const repo = await prisma.repo.findUnique({
        include: {
            applications: true
        },
        where: {
            owner_name: {
                name: context.repo.name,
                owner: context.repo.owner
            }
        }
    });

    if (!repo)
        return;

    const availableApplicationsConfig = (repo.config as unknown as KlaveRcConfiguration).applications.reduce((prev, current) => {
        prev[current.name] = current;
        return prev;
    }, {} as Record<string, KlaveRcConfiguration['applications'][number]>);

    repo.applications.forEach(async application => {

        if (files.filter(({ filename }) => {
            const commitFileDir = path.normalize(path.join('/', filename));
            const appPath = path.normalize(path.join('/', availableApplicationsConfig[application.name].rootDir ?? ''));
            return commitFileDir.startsWith(appPath) || filename === '.klaverc.json';
        }).length === 0)
            return;

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
            const deployment = await prisma.deployment.create({
                data: {
                    version: availableApplicationsConfig[application.name].version,
                    build: context.commit.after.substring(0, 8),
                    locations: ['FR'],
                    application: {
                        connect: { id: application.id }
                    }
                }
            });
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

            (new Promise((resolve, reject) => {
                setTimeout(reject, 30000);
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
                if (currentState?.status !== 'deployed')
                    await prisma.deployment.update({
                        where: {
                            id: deployment.id
                        },
                        data: {
                            status: 'errored'
                        }
                    });
            });

            try {

                console.log('availableApplicationsConfig', application.name, availableApplicationsConfig);
                console.log('Fetching repo content...', `${availableApplicationsConfig[application.name].rootDir}`, context.commit.ref);
                const handle = await octokit.repos.getContent({
                    owner: repo.owner,
                    repo: repo.name,
                    ref: context.commit.ref,
                    path: `${availableApplicationsConfig[application.name].rootDir}`,
                    mediaType: {
                        format: 'raw+json'
                    }
                });

                const availableFiles = Array.isArray(handle.data) ? handle.data : [];
                const compilableFiles = availableFiles.find(file => ['index.ts'].includes(file.name));

                const source = await octokit.repos.getContent({
                    owner: repo.owner,
                    repo: repo.name,
                    ref: context.commit.ref,
                    path: `${compilableFiles?.path}`,
                    mediaType: {
                        format: 'raw+json'
                    }
                });

                let compileBinary = new Uint8Array(0);
                // const compileOutput = await new Promise((resolve) => {
                console.log('starting compilation...', compilableFiles);
                // const { default: asc } = (await import('assemblyscript/dist/asc.js'));
                // console.log('starting compilation...', asc);
                // const compileOutput = await asc.main([
                const compileStdOut = new stream.Duplex();
                const compileStdErr = new stream.Duplex();
                const compileOutput = await asb.main([
                    'build',
                    '.',
                    // '--wat',
                    // '--verbose',
                    // '--',
                    // '--debug',
                    // '--bindings', 'esm',
                    '--stats',
                    // '--bindings', 'esm',
                    '--disable', 'bulk-memory'
                ], {
                    stdout: compileStdOut,
                    stderr: compileStdErr,
                    reportDiagnostic: (diagnostic) => {
                        console.log(diagnostic);
                        console.log(diagnostic.message);
                    },
                    readFile(filename, baseDir) {
                        console.log('Reading the FILE from...', filename, baseDir);
                        if (filename === 'asconfig.json')
                            // return '{}';
                            return `
                            {
                                "options": {
                                    "bindings": "esm",
                                    "disable": "bulk-memory"
                                }
                            }`;
                        if (filename === 'node_modules\\@secretarium\\trustless-app\\package.json')
                            return `
                            {
                                "name": "@secretarium/trustless-app",
                                "description": "Secretarium Trustless Apps helpers and definitions",
                                "version": "0.3.2",
                                "license": "MIT",
                                "private": false,
                                "author": {
                                    "email": "florian@secretarium.com",
                                    "name": "Florian Guitton"
                                },
                                "bin": {
                                    "stac": "./bin/stac"
                                },
                                "type": "commonjs",
                                "main": "assembly/index.ts",
                                "types": "assembly/index.ts",
                                "exports": {
                                    ".": {
                                    "require": "./src/index.js"
                                    },
                                    "./stac": {
                                    "default": "./src/compile.js",
                                    "require": "./src/compile.js"
                                    }
                                },
                                "dependencies": {
                                    "asbuild": "0.2.0",
                                    "assemblyscript": "^0.19.3",
                                    "chalk": "4.1.2",
                                    "fs-extra": "9.1.0",
                                    "zod": "3.20.2"
                                },
                                "devDependencies": {
                                    "chalk": "4.1.2",
                                    "fs-extra": "9.1.0"
                                }
                            }`;
                        if (filename === 'node_modules\\@secretarium\\trustless-app\\assembly\\index.ts')
                            return `
                            /**
                             * Environment definitions for compiling Klave Trustless Application.
                             * @module trustless/sdk
                             */

                            @external("env", "add_user_query")
                            declare function runtime_add_user_query(s: ArrayBuffer): void;
                            @external("env", "add_user_transaction")
                            declare function runtime_add_user_transaction(s: ArrayBuffer): void;
                            @external("env", "notify")
                            declare function runtime_notify(s: ArrayBuffer): i32;
                            @external("env", "read_ledger")
                            declare function runtime_read_ledger_raw(table: ArrayBuffer, key: ArrayBuffer, key_size: i32, value: ArrayBuffer, value_size: i32): i32;
                            @external("env", "write_ledger")
                            declare function runtime_write_ledger_raw(table: ArrayBuffer, key: ArrayBuffer, key_size: i32, value: ArrayBuffer, value_size: i32): i32;

                            export class Router {
                                static addQuery(queryFunctionName: ArrayBuffer): void {
                                    runtime_add_user_query(queryFunctionName);
                                }
                                static addTransaction(transactionFunctionName: ArrayBuffer): void {
                                    runtime_add_user_transaction(transactionFunctionName);
                                }
                            }

                            export class Table {
                                tableName: ArrayBuffer;
                                constructor(table: ArrayBuffer) {
                                    this.tableName = table;
                                }
                                get(key: ArrayBuffer): i32 {
                                    const value = new ArrayBuffer(64);
                                    const result = Ledger.readFromTableIntoBuffer(this.tableName, key, value);
                                    return result;
                                }
                                set(key: ArrayBuffer, value: ArrayBuffer): i32 {
                                    return runtime_write_ledger_raw(this.tableName, key, key.byteLength, value, value.byteLength);
                                }
                            }

                            export class Ledger {
                                static readFromTableIntoBuffer(table: ArrayBuffer, key: ArrayBuffer, value: ArrayBuffer): i32 {
                                    return runtime_read_ledger_raw(table, key, key.byteLength, value, value.byteLength);
                                }
                                static writeToTable(table: ArrayBuffer, key: ArrayBuffer, value: ArrayBuffer): i32 {
                                    return runtime_write_ledger_raw(table, key, key.byteLength, value, value.byteLength);
                                }
                                static getTable(table: ArrayBuffer): Table {
                                    return new Table(table);
                                }
                            }

                            export class Notifier {
                                static notify(message: ArrayBuffer): i32 {
                                    return runtime_notify(message);
                                }
                            }`;
                        // return `
                        // {
                        //     "targets": {
                        //         "debug": {
                        //             "sourceMap": true,
                        //             "debug": true
                        //         },
                        //         "release": {
                        //             "sourceMap": true,
                        //             "optimizeLevel": 3,
                        //             "shrinkLevel": 0,
                        //             "converge": false,
                        //             "noAssert": false
                        //         }
                        //     },
                        //     "options": {
                        //         "bindings": "esm",
                        //         "disable": "bulk-memory"
                        //     }
                        // }`;
                        console.log('CONTENT...\n', source.data.toString());
                        return source.data.toString();
                    },
                    writeFile(filename, contents) {
                        console.log('Writing the content off the compiler', filename);
                        if (filename.includes('.wasm'))
                            compileBinary = contents;
                    }
                    // }, result => {
                    //     console.log('Compilation output', result);
                    //     resolve(result);
                    //     return 0;
                });
                // });

                console.log('>>>>>>>\n', compileBinary.length);
                if (compileBinary.length === 0)
                    return;

                console.log('AFTER COMPILE COMPILATION', compileOutput);
                console.log('>>>>>>>\n', compileBinary.length);

                await secretariumClient.newTx('wasm-manager', 'register_smart_contract', `klave-deployment-${deployment.id}`, {
                    contract: {
                        name: `${deployment.id.split('-').pop()}.sta.klave.network`,
                        wasm_bytes: [],
                        wasm_bytes_b64: Utils.toBase64(compileBinary)
                    }
                }).onExecuted(async () => {
                    console.log('Updating deployment status');
                    const updated = await prisma.deployment.update({
                        where: {
                            id: deployment.id
                        },
                        data: {
                            status: 'deployed'
                        }
                    });
                    console.log('updated', updated);
                }).onError((error) => {
                    console.error('Secretarium failed', error);
                    // Timeout will eventually error this
                }).send();

                console.log('DEPLOYEMENT FINISHED');

            } catch (error) {
                console.error(error);
                // Timeout will eventually error this
            }
        };

        if (context.class === 'push')
            launchDeploy().finally(() => { return; });
    });

    return;
};

export const updatePullRequestFromSubstrate = async ({ octokit, ...context }: DeploymentContext<DeploymentPullRequestPayload>) => {

    const { data: { files } } = await octokit.repos.compareCommits({
        owner: context.repo.owner,
        repo: context.repo.name,
        base: context.commit.before,
        head: context.commit.after
    });

    if (!files?.length)
        return;

    const repo = await prisma.repo.findUnique({
        include: {
            applications: true
        },
        where: {
            owner_name: {
                name: context.repo.name,
                owner: context.repo.owner
            }
        }
    });

    if (!repo)
        return;

    const availableApplicationsConfig = (repo.config as unknown as KlaveRcConfiguration).applications.reduce((prev, current) => {
        prev[current.name] = current;
        return prev;
    }, {} as Record<string, KlaveRcConfiguration['applications'][number]>);

    repo.applications.forEach(async application => {

        // console.log(application, files, repo);

        if (files.filter(({ filename }) => {
            const commitFileDir = path.normalize(path.join('/', filename));
            const appPath = path.normalize(path.join('/', availableApplicationsConfig[application.name].rootDir ?? ''));
            return commitFileDir.startsWith(appPath) || filename === '.klaverc.json';
        }).length === 0)
            return;

        await prisma.activityLog.create({
            data: {
                class: 'pullRequestHook',
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
    });

    return;
};