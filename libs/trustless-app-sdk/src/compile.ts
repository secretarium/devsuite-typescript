import * as fs from 'fs-extra';
import * as path from 'node:path';
import * as asc from 'assemblyscript/cli/asc';
import * as chalk from 'chalk';
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
                        asc.main([
                            '.',
                            // '--stats',
                            '--exportRuntime',
                            '--traceResolution',
                            '-O', '--noAssert',
                            '--optimizeLevel', '3',
                            '--shrinkLevel', '2',
                            '--converge',
                            '--binaryFile', `${path.join(CWD, '.klave', index.toString())}.wasm`,
                            '--textFile', `${path.join(CWD, '.klave', index.toString())}.wat`,
                            '--tsdFile', `${path.join(CWD, '.klave', index.toString())}.d.ts`,
                            '--idlFile', `${path.join(CWD, '.klave', index.toString())}.idl`
                            // '--',
                            // '--title="Klave WASM Compiler"',
                            // '--enable-fips'
                        ], {
                            stdout: process.stdout,
                            stderr: process.stderr,
                            reportDiagnostic: (diagnostic) => {
                                console.log(diagnostic);
                                console.log(diagnostic.message);
                            }
                        }, (error) => {
                            console.error(error);
                            resolve();
                            return 0;
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
