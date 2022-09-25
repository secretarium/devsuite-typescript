const { readFileSync } = require('fs');

const content = JSON.parse(readFileSync('./package.json'));
console.log('Workspace dependencies');
console.table(Object.entries(content.dependencies).reduce((prev, [package, version]) => {
    prev[package] = { version };
    return prev;
}, {}));
console.log('\n');
console.log('Workspace development dependencies');
console.table(Object.entries(content.devDependencies).reduce((prev, [package, version]) => {
    prev[package] = { version };
    return prev;
}, {}));