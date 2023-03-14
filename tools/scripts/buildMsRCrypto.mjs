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
            appendFileSync(resolve(repoLocation, 'gulpfile.js'), gulpTask)
            console.log('Compile msrcrypto...');
            execSync('npx gulp', {
                cwd: repoLocation,
                stdio: 'inherit'
                // stdio: 'ignore'
            });
            console.log('Copy msrcrypto artifact...');
            copyFileSync(resolve(repoLocation, 'lib/msrcrypto.min.js'), 'libs/crypto/vendor/msrCrypto.js')
        })
} catch (e) {
    console.error(e);
}

const gulpTask = `

const replace = require('gulp-replace');

const secretariumBuild = [
    "../../tools/fixtures/_msrBundleHead.js",
    "scripts/operations.js",
    "scripts/global.js",
    "scripts/utilities.js",
    "scripts/asn1.js",
    "scripts/worker.js",
    "scripts/jwk.js",
    "scripts/cryptoMath.js",
    "scripts/cryptoECC.js",
    "scripts/curves_NIST.js",
    "scripts/curves_BN.js",
    "scripts/curves_NUMS.js",
    "scripts/sha.js",
    "scripts/sha1.js",
    "scripts/sha256.js",
    "scripts/sha512.js",
    "scripts/hmac.js",
    "scripts/aes.js",
    "scripts/aes-cbc.js",
    "scripts/aes-gcm.js",
    "scripts/aes-kw.js",
    "scripts/random.js",
    "scripts/entropy.js",
    "scripts/prime.js",
    "scripts/rsa-base.js",
    "scripts/rsa-oaep.js",
    "scripts/rsa-pkcs1.js",
    "scripts/rsa-pss.js",
    "scripts/rsa.js",
    "scripts/concat.js",
    "scripts/pbkdf2.js",
    "scripts/hkdf.js",
    "scripts/hkdf-ctr.js",
    "scripts/ecdh.js",
    "scripts/ecdsa.js",
    "scripts/subtle.js",
    "scripts/wrapKey.js",
    "../../tools/fixtures/_msrBundleTail.js"
];

function compile() {
    return gulp.src(secretariumBuild)
        .pipe(concat("msrcrypto.js"))
        .pipe(replace(/(Sometimes the result[\\s\\S]*?array \\) {)[\\s\\S]*?(return msrcryptoUtilities)/m, '$1$2'))
        .pipe(gulp.dest("lib"));
}

gulp.task("default", gulp.series(cleanBuild, subtle, compile, format, minifyBundle));
`