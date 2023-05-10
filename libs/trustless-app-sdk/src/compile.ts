import * as fs from 'fs-extra';
import * as path from 'node:path';
import * as chalk from 'chalk';
import { createCompilter } from '@klave/compiler';
import { klaveRcConfigurationSchema as schema } from './rc';

// `yarn run` may change the current working dir, then we should use `INIT_CWD` env.
const CWD = process.env['INIT_CWD'] || process.cwd();

const compile = () => {
    try {

        const configContent = fs.readFileSync(path.join(CWD, '.klaverc.json')).toString();
        const parsingOutput = schema.safeParse(JSON.parse(configContent));

        if (parsingOutput.success)
            parsingOutput.data.applications.forEach(async (app, index) => {
                try {
                    new Promise<void>((resolve) => {
                        const appPathRoot = path.join(CWD, app.rootDir ?? parsingOutput.data.rootDir ?? '.');
                        let appPath = path.join(appPathRoot, app.index ?? '');
                        if (!fs.existsSync(appPath) || !fs.statSync(appPath).isFile())
                            appPath = path.join(appPathRoot, 'index.ssc');
                        if (!fs.existsSync(appPath) || !fs.statSync(appPath).isFile())
                            appPath = path.join(appPathRoot, 'index.ssc.ts');
                        if (!fs.existsSync(appPath) || !fs.statSync(appPath).isFile())
                            appPath = path.join(appPathRoot, 'index.ts');
                        if (!fs.existsSync(appPath) || !fs.statSync(appPath).isFile())
                            console.error(`Could not read entry point for application ${chalk.green(app.name)}`);

                        console.error(`Compiling ${chalk.green(app.name)} from ${path.join('.', path.relative(CWD, appPath))}...`);

                        const compiler = createCompilter();

                        compiler.on('message', (message) => {
                            // if (message.type === 'start') {
                            //     ...
                            // }
                            if (message.type === 'read') {
                                console.log('Requested file: ' + message.filename);
                                console.log('Trying ...' + path.resolve(appPathRoot, message.filename));
                                fs.readFile(path.resolve(appPathRoot, message.filename)).then(contents => {
                                    compiler.postMessage({
                                        type: 'read',
                                        filename: message.filename,
                                        contents: contents
                                    });
                                });
                            } else if (message.type === 'write') {
                                fs.writeFile(`${path.join(CWD, '.klave', index.toString())}.${path.extname(message.filename)}`, message.contents);
                            } else if (message.type === 'diagnostic') {
                                console.log(message.diagnostics);
                            } else if (message.type === 'errored') {
                                console.error(message.error);
                                compiler.terminate().finally(() => {
                                    resolve();
                                    return 1;
                                });
                            } else if (message.type === 'done') {
                                resolve();
                                return 0;
                            }
                        });
                    });
                } catch (error) {
                    console.log('Compilation failed: ' + error?.toString());
                    console.error(error);
                }
            });
        else
            console.error(parsingOutput.error.flatten());
    } catch (e) {
        console.error(e);
    }
};

compile();
