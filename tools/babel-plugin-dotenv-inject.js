const fs = require('fs');
const pathResolve = require('path').resolve;
const dotenvParse = require('dotenv').parse;
const dotenvExpand = require('dotenv-expand').expand;

let dotenvContent;

function loadDotenvContent(opts) {

    const environment = process.env.NODE_ENV || process.env.BABEL_ENV || '';
    let searchPaths = [process.cwd()];
    let encoding = 'utf8';
    let debug = false;

    if (opts.path)
        searchPaths = opts.path;
    if (opts.encoding)
        encoding = opts.encoding;
    if (opts.debug)
        debug = true;
    if (!dotenvContent)
        dotenvContent = {};

    searchPaths.forEach(path => {
        let expandedPaths = [
            pathResolve(path, '.env'),
            pathResolve(path, `.env.${environment}`),
            pathResolve(path, `.env.local.${environment}`)
        ];
        expandedPaths.forEach(expandedPath => {
            if (!fs.existsSync(expandedPath))
                return;
            let content = fs.readFileSync(expandedPath, { encoding: encoding });
            if (!content)
                return;
            dotenvContent = {
                ...dotenvContent,
                ...dotenvParse(content, { debug: debug })
            };
        });
    });

    dotenvContent = dotenvExpand({ parsed: dotenvContent, ignoreProcessEnv: opts.systemVar !== 'all' }).parsed;
}

function getValue(dotenvContent, systemContent, opts, name) {
    if (opts.env && name in opts.env)
        return opts.env[name];

    switch (opts.systemVar) {
        case 'overwrite':
            if (name in dotenvContent && name in systemContent)
                return systemContent[name];
            if (name in dotenvContent)
                return dotenvContent[name];
            return;
        case 'disable':
            if (name in dotenvContent)
                return dotenvContent[name];
            return;
        case 'all':
        default:
            if (name in systemContent)
                return systemContent[name];
            if (name in dotenvContent)
                return dotenvContent[name];
            return;
    }
}

function dotenvInject(options) {
    var t = options.types;

    return {
        visitor: {
            MemberExpression: function MemberExpression(path, state) {
                if (t.isAssignmentExpression(path.parent) && path.parent.left == path.node) return;
                if (path.get('object').matchesPattern('process.env')) {
                    if (!dotenvContent)
                        loadDotenvContent(state.opts);
                    var key = path.toComputedKey();
                    if (t.isStringLiteral(key)) {
                        var name = key.value;
                        var value = getValue(dotenvContent, process.env, state.opts, name);
                        var me = t.memberExpression;
                        var i = t.identifier;
                        var le = t.logicalExpression;
                        var replace = state.opts.unsafe
                            ? t.valueToNode(value)
                            : le(
                                '||',
                                le(
                                    '&&',
                                    le('&&', i('process'), me(i('process'), i('env'))),
                                    me(i('process.env'), i(name))
                                ),
                                t.valueToNode(value)
                            );

                        path.replaceWith(replace);
                    }
                }
            }
        }
    };
}

module.exports = dotenvInject;