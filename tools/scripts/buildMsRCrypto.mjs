import { rmSync, mkdirSync, appendFileSync, copyFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execSync } from 'node:child_process';
import { simpleGit } from 'simple-git';

try {
    const repoLocation = resolve(dirname(fileURLToPath(import.meta.url)), '../../tmp/msrcrypto');
    rmSync(repoLocation, { force: true, recursive: true });
    mkdirSync(repoLocation, { recursive: true });
    console.log('Cloning msrcrypto...');
    simpleGit(repoLocation)
        .clone('https://github.com/microsoft/MSR-JavaScript-Crypto.git', repoLocation)
        .then(() => {
            console.log('Installing msrcrypto dependencies...');
            execSync('npm install gulp-replace', {
                cwd: repoLocation,
                stdio: 'ignore'
            });
            console.log('Modify msrcrypto build pipeline...');
            appendFileSync(resolve(repoLocation, 'gulpfile.js'), gulpTask);
            console.log('Compile msrcrypto...');
            execSync('npx gulp', {
                cwd: repoLocation,
                stdio: 'inherit'
                // stdio: 'ignore'
            });
            console.log('Copy msrcrypto artifact...');
            copyFileSync(resolve(repoLocation, 'lib/msrcrypto.min.js'), 'libs/crypto/vendor/msrCrypto.js');
        });
} catch (e) {
    console.error(e);
}

const gulpTask = `

const replace = require('gulp-replace');

const secretariumBuild = [
    "scripts/bundleHead.js",
    "scripts/operations.js",
    "scripts/global.js",
    "scripts/utilities.js",
    "scripts/asn1.js",
    "scripts/worker.js",
    "scripts/cryptoMath.js",
    "scripts/sha.js",
    "scripts/sha256.js",
    "scripts/aes.js",
    "scripts/aes-gcm.js",
    "scripts/random.js",
    "scripts/entropy.js",
    "scripts/ecdh.js",
    "scripts/ecdsa.js",
    "scripts/subtle.js",
    "scripts/bundleTail.js"
];

function compile() {
    return gulp.src(fullBuild)
        .pipe(concat("msrcrypto.js"))
        .pipe(replace(/(Sometimes the result[\\s\\S]*?array \\) {)[\\s\\S]*?(return msrcryptoUtilities)/m, '$1$2'))
        .pipe(replace(/(if \\(typeof define)/, 'if (typeof root === "undefined") { if (typeof self !== "undefined") root = self; else if (typeof globalThis !== "undefined") root = globalThis; else if (typeof window !== "undefined") root = window;} $1'))
        .pipe(gulp.dest("lib"));
}

gulp.task("default", gulp.series(cleanBuild, subtle, compile, format, minifyBundle));
`;