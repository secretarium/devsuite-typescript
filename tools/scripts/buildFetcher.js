const path = require('path');
const { mkdirSync, rmSync } = require('fs');
const { execSync, spawn } = require('child_process');

const project = process.env.NX_TASK_TARGET_PROJECT;
const rootPath = path.resolve(__dirname, '..');
process.chdir(rootPath);
const [, , ...args] = process.argv;
const buildProcess = spawn('nx', ['run', `${project}:eas-build`, '--output-style=static', ...args], { shell: true });
let result = undefined;
let showErrorOutput = false;
let expectingBuildOutput = false;
let stderrBuffer = '';
let stdoutBuffer = '';
buildProcess.stderr.on('data', (data) => {
    if (data.includes('✔'))
        showErrorOutput = true;
    if (showErrorOutput || data.includes('🤖') || data.includes('🍎'))
        process.stderr.write(data);
    stderrBuffer += data;
    if (data.includes('You can press Ctrl+C to exit'))
        expectingBuildOutput = true;
});
buildProcess.stdout.on('data', (data) => {
    if (expectingBuildOutput)
        stdoutBuffer += data;
});
buildProcess.on('error', (error) => {
    process.stderr.write(`${error}\n`);
});
buildProcess.on('close', (code) => {
    if (code !== 0) {
        process.stderr.write('An error occured while building mobile binaries\n');
        process.stderr.write(stderrBuffer);
        process.exit(code);
    }

    try {
        result = JSON.parse(stdoutBuffer.substring(0, stdoutBuffer.lastIndexOf(']') + 1));
    } catch (e) {
        process.stderr.write('Failed to obtain build output: ' + e + '\n');
        process.exit(1);
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