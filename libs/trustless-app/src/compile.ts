import * as fs from 'fs-extra';
import * as path from 'node:path';
import * as z from 'zod';
import * as asb from 'asbuild';
import * as chalk from 'chalk';

// `yarn run` may change the current working dir, then we should use `INIT_CWD` env.
const CWD = process.env['INIT_CWD'] || process.cwd();

const compile = () => {
    try {
        const schema = z.object({
            version: z.string(),
            name: z.string(),
            branch: z.string().optional(),
            targetSdk: z.string().optional(),
            applications: z.array(z.object({
                name: z.string(),
                root: z.string().optional(),
                branch: z.string().optional(),
                targetSdk: z.string().optional()
            }))
        });

        const configContent = fs.readFileSync(path.join(CWD, '.secretariumrc.json')).toString();
        const parsingOutput = schema.safeParse(JSON.parse(configContent));

        if (parsingOutput.success)
            parsingOutput.data.applications.forEach(async (app, index) => {
                try {
                    new Promise((resolve) => {
                        const appPathRoot = path.join(CWD, app.root ?? '.');
                        let appPath = appPathRoot;
                        if (!fs.existsSync(appPath) || !fs.statSync(appPath).isFile())
                            appPath = path.join(appPathRoot, 'index.ssc');
                        if (!fs.existsSync(appPath) || !fs.statSync(appPath).isFile())
                            appPath = path.join(appPathRoot, 'index.ssc.ts');
                        if (!fs.existsSync(appPath) || !fs.statSync(appPath).isFile())
                            appPath = path.join(appPathRoot, 'index.ts');
                        if (!fs.existsSync(appPath) || !fs.statSync(appPath).isFile())
                            console.error(`Could not read entry point for application ${chalk.green(app.name)}`);

                        // const { error, /* stdout, stderr, */ stats } = await (await import('assemblyscript/dist/asc.js')).main([
                        //     appPath,
                        //     '--outFile', path.join(CWD, '.secretarium', index.toString(), 'out.wasm'),
                        //     '--textFile', path.join(CWD, '.secretarium', index.toString(), 'out.wat'),
                        //     '--bindings', ' esm',
                        //     '--exportStart', 'trustless_main',
                        //     '--exportTable',
                        //     '--disable', 'mutable-globals',
                        //     '--disable', 'sign-extension',
                        //     '--disable', 'nontrapping-f2i',
                        //     '--disable', 'bulk-memory',
                        //     '--noUnsafe',
                        //     '--sourceMap',
                        //     '--debug',
                        //     '--pedantic',
                        //     '--stats'
                        // ], {
                        //     stdout: process.stdout,
                        //     stderr: process.stderr
                        // });

                        console.error(`Compiling ${chalk.green(app.name)} from ${path.join('.', path.relative(CWD, appPath))}...`);
                        asb.main([
                            'build',
                            appPath,
                            '--wat',
                            '--outDir',
                            path.join(CWD, '.secretarium', index.toString())
                        ], {
                            stdout: process.stdout,
                            stderr: process.stderr,
                            reportDiagnostic: (diagnostic) => {
                                console.log(diagnostic);
                                console.log(diagnostic.message);
                            }
                        }, result => {
                            resolve(result);
                            return 0;
                        });

                        // if (error) {
                        //     console.log('Compilation failed: ' + error.message);
                        //     // console.log(stderr.toString());
                        // } else {
                        //     console.log(stats.toString());
                        // }
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
