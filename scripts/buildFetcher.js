const path = require('path');
const { mkdirSync, rmSync } = require('fs');
const { execSync, spawn } = require('child_process');

const rootPath = path.resolve(__dirname, '..');
process.chdir(rootPath);
process.stdout.write(`Build fetching from ${rootPath}...\n`);
const [, , ...args] = process.argv;
const buildProcess = spawn('yarn', ['nx', 'affected', '--output-style=stream', '--target=eas-build', ...args], { shell: true });
let result = undefined;
let expectingBuildOutput = false;
buildProcess.stderr.on('data', (data) => {
    process.stdout.write(data);
    if (data.includes('You can press Ctrl+C to exit'))
        expectingBuildOutput = true;
});
buildProcess.stdout.on('data', (data) => {
    if (expectingBuildOutput)
        try {
            result = JSON.parse(data);
            expectingBuildOutput = false;
        } catch (e) {
            // nothing
        }
});
buildProcess.on('error', (error) => {
    process.stderr.write(`${error}\n`);
});
buildProcess.on('close', (code) => {
    if (code !== 0) {
        process.stderr.write('An error occured while building mobile binaries\n');
        process.exit(code);
    }
    rmSync('./dist/artifacts', { recursive: true, force: true });
    mkdirSync('./dist/artifacts', { recursive: true });
    if (!result) {
        process.stderr.write('Failed to obtain build output\n');
        process.exit(1);
    }
    let hasFailures = false;
    result.forEach(build => {
        if (build.status === 'CANCELED') {
            process.stderr.write(`The build process for ${build.platform} was canceled\n`);
            hasFailures = true;
        } else if (build.artifacts === undefined || build.artifacts.buildUrl === undefined) {
            process.stderr.write(`The build process for ${build.platform} failed\n`);
            process.stderr.write(JSON.stringify(build, null, 4));
            process.stderr.write('\n');
            hasFailures = true;
        } else {
            process.stdout.write(`Downloading ${build.platform} build...\n`);
            execSync(`download -o ./dist/artifacts --filename ${build.platform}-${build.releaseChannel}-${build.buildProfile}-${build.distribution}-${build.appVersion}-${build.appBuildVersion}-${build.gitCommitHash.substr(0, 8)}-${build.artifacts.buildUrl.split('.').pop()} ${build.artifacts.buildUrl}`);
        }
    });
    if (hasFailures)
        process.exit(1);
    process.exit(0);
});