import { getActiveSpan, getClient, startSpanManual, startInactiveSpan, addNonEnumerableProperty, logger } from '@sentry/core';
import type { Integration, Span, StartSpanOptions } from '@sentry/core';
import { Query, SCP, Transaction } from '@secretarium/connector';
import prettyBytes from 'pretty-bytes';

type ConnectorTracingOptions = {
    connector?: SCP
    domains?: string[];
};

type DecoratedExtraKeys = keyof (Query & Transaction);

type DecoratedTransaction = (Query | Transaction) & {
    topChild?: Span;
    stepChild?: Span;
} & {
    [K in DecoratedExtraKeys]?: Transaction[K];
};

type DecoratedSCP = Omit<SCP, '_encrypt' | '_prepare'> & {
    __sentry_sub__encrypt: SCP['_encrypt'];
    __sentry_sub__prepare: SCP['_prepare'];
    _encrypt: SCP['_encrypt'];
    _prepare: SCP['_prepare'];
};

export function connectorTracingIntegration(options: ConnectorTracingOptions): Integration {
    return new ConnectorTracing(options);
}

/**
 * The Connector Tracing integration automatically instruments Secretarium Connector
 * actions as transactions, and captures requests, metrics and errors as spans.
 *
 * The integration can be configured with a variety of options, and can be extended to use
 * any routing library. This integration uses {@see Transaction} to create transactions.
 */
export class ConnectorTracing implements Integration {

    /**
     * @inheritDoc
     */
    public static id = 'ConnectorTracing';

    /**
     * @inheritDoc
     */
    public name: string = ConnectorTracing.id;

    /**
     * Secretarium instance
     */
    private readonly _connector?: SCP;
    private readonly _domains?: string[];

    /**
     * @inheritDoc
     */
    public constructor(options: ConnectorTracingOptions = {}) {
        this._connector = options.connector;
        this._domains = options.domains;
    }

    /**
     * @inheritDoc
     */
    public setupOnce(): void {

        if (!this._connector) {
            if (typeof __DEBUG_BUILD__ !== 'undefined' && __DEBUG_BUILD__)
                logger.error('SecretariumConnectorIntegration is missing an SCP instance.');
            return;
        }

        if (shouldDisableAutoInstrumentation()) {
            if (typeof __DEBUG_BUILD__ !== 'undefined' && __DEBUG_BUILD__)
                logger.log('SecretariumConnectorIntegration is skipped because of instrumenter configuration.');
            return;
        }

        instrumentSCP(this._connector, {
            domains: this._domains
        });
    }
}

/**
 * Instrument the Secretarium Connector.
 *
 * @param connector An instance of Secretarium Connector
 */
function instrumentSCP(connector: SCP, options: {
    domains?: string[];
}) {

    const domains = options.domains?.map(d => d.startsWith('.') ? d : `.${d}`) ?? [];
    (['newTx', 'newQuery'] as const).forEach((method) => {
        const original = connector[method];
        connector[method] = patchConnectorCall(original, {
            ...options,
            domains,
            connector,
            type: method === 'newTx' ? 'Transaction' : 'Query',
            operation: method === 'newTx' ? 'transaction' : 'query',
            short: method === 'newTx' ? 'tx' : 'q'
        }) as any;
    });
}

function patchConnectorCall(originalCall: (...args: Parameters<SCP['newTx']>) => Query | Transaction, options: {
    domains: string[];
    connector: SCP;
    type: 'Transaction' | 'Query';
    operation: 'transaction' | 'query';
    short: 'tx' | 'q';
}) {
    const decoratedConnector = options.connector as any as DecoratedSCP;
    const endpoint = decoratedConnector.getEndpoint();
    const cryptoContext = decoratedConnector.getCryptoContext();
    return function (...args: Parameters<SCP['newTx']>) {

        const result = originalCall.call(decoratedConnector, ...args) as DecoratedTransaction;

        let host = args[0];
        options.domains.forEach(d => host = host.replace(d, ''));
        // const currentSpan = getActiveSpan();
        // return startSpan({
        //     name: `SCP /${host}/${args[1]}`,
        //     //     description: `Secretarium ${options.type}`,
        //     op: `secretarium.${options.operation}`,
        //     //     origin: `auto.scp.instrumentation.${options.operation}`
        //     parentSpan: currentSpan,

        // }, highLevelSpan => {

        const spanOptions: StartSpanOptions = {
            name: `SCP /${host}/${args[1]}`,
            // description: `Secretarium ${options.type}`,
            op: `secretarium.${options.operation}`,
            parentSpan: getActiveSpan(),
            attributes: {
                'sentry.source': 'component',
                'sentry.origin': `auto.scp.instrumentation.${options.operation}`,
                'connector': typeof window !== 'undefined' ? (window as any).__SECRETARIUM_DEVTOOLS_CONNECTOR__.version : typeof global !== 'undefined' ? (global as any).__SECRETARIUM_DEVTOOLS_CONNECTOR__.version : 'unknown',
                'crypto.type': cryptoContext?.type,
                'crypto.version': cryptoContext?.version,
                'endpoint': endpoint?.url,
                'endpoint.connected': decoratedConnector.isConnected(),
                'endpoint.trusted_key': endpoint?.knownTrustedKey,
                'contract': host,
                'contract.name': host,
                'contract.name.fq': args[0],
                'contract.route': args[1],
                'request.method': 'POST',
                'request.host': host,
                'request.hostname': args[0],
                'request.url': `/${args[1]}`,
                'request.protocol': 'scp'
            }
        };

        const transaction = startSpanManual.call(result, spanOptions, span => span) as Span;

        // Wrap prepare and encrypt
        if (decoratedConnector.__sentry_sub__encrypt === undefined)
            addNonEnumerableProperty(decoratedConnector, '__sentry_sub__encrypt', (decoratedConnector as any)._encrypt);
        if (decoratedConnector.__sentry_sub__prepare === undefined)
            addNonEnumerableProperty(decoratedConnector, '__sentry_sub__prepare', (decoratedConnector as any)._prepare);

        const originalEncrypt = decoratedConnector.__sentry_sub__encrypt;
        const originalPrepare = decoratedConnector.__sentry_sub__prepare;

        decoratedConnector._encrypt = async function (data: Uint8Array): Promise<Uint8Array> {

            if (result.stepChild) {
                result.stepChild?.setStatus({ code: 1, message: 'ok' });
                result.stepChild?.end();
                result.stepChild = startInactiveSpan({
                    name: 'Encoding',
                    parentSpan: result.topChild,
                    // description: 'Encrypting',
                    op: 'prepare.encrypt'
                });
            }

            const arrayRes = await originalEncrypt.call(decoratedConnector, data);
            return arrayRes;
        };

        decoratedConnector._prepare = async function (query: any) {

            // const fibreTag = Math.random().toString();
            // result.stepChild?.setTag('fibre', fibreTag);

            const arrayRes = await originalPrepare.call(decoratedConnector, query);
            // const arrayRes = await originalPrepare.call(options.connector, app, command, requestId, args);

            transaction.setAttribute('payload.size', prettyBytes(arrayRes.length));

            result.stepChild?.setStatus({ code: 1, message: 'ok' });
            result.stepChild?.end();
            result.topChild?.setStatus({ code: 1, message: 'ok' });
            result.topChild?.end();

            result.topChild = startInactiveSpan({
                name: options.type,
                // description: options.type,
                op: options.short
            });
            result.stepChild = startInactiveSpan({
                name: 'Acknowledgement',
                // description: 'Acknowledgement',
                parentSpan: result.topChild,
                op: `${options.short}.acknowledgement`
            });

            return arrayRes;
        };

        // Patch the send function
        const originalSend = result.send;
        result.send = async () => {

            result.topChild = startInactiveSpan({
                name: 'Prepare',
                // description: 'Prepare',
                op: 'prepare'
            });
            result.stepChild = startInactiveSpan({
                name: 'Encoding',
                parentSpan: result.topChild,
                // description: 'Encoding',
                op: 'prepare.encode'
            });

            if (options.operation === 'transaction') {
                result.onAcknowledged?.(() => {
                    result.stepChild?.setStatus({ code: 1, message: 'ok' });
                    result.stepChild?.end();
                    result.stepChild = startInactiveSpan({
                        name: 'Commitment',
                        // description: 'Commitment',
                        parentSpan: result.topChild,
                        op: `${options.short}.commitment`
                    });
                });
                result.onCommitted?.(() => {
                    result.stepChild?.setStatus({ code: 1, message: 'ok' });
                    result.stepChild?.end();
                    result.stepChild = startInactiveSpan({
                        name: 'Execution',
                        // description: 'Execution',
                        parentSpan: result.topChild,
                        op: `${options.short}.execution`
                    });
                });
                result.onExecuted?.(() => {
                    result.stepChild?.setStatus({ code: 1, message: 'ok' });
                    result.stepChild?.end();
                });
            }
            result.onResult(() => {
                const resultTimepoint = startInactiveSpan({
                    name: 'Result',
                    // description: 'Result',
                    parentSpan: result.topChild,
                    op: `${options.short}.result`
                });
                resultTimepoint?.end();
            });
            result.onError(() => {
                result.stepChild?.setStatus({ code: 2, message: 'internal_error' });
                result.stepChild?.end();
                result.topChild?.setStatus({ code: 2, message: 'internal_error' });
                result.topChild?.end();
                transaction.setStatus({ code: 2, message: 'internal_error' });
                transaction.end();
                // highLevelSpan?.setStatus({ code: 2, message: 'internal_error' });
                // highLevelSpan?.end();
            });

            const promise = originalSend();
            return promise.then((res: any) => {
                if (result.stepChild?.isRecording()) {
                    result.stepChild?.setStatus({ code: 1, message: 'ok' });
                    result.stepChild?.end();
                }
                if (result.topChild?.isRecording()) {
                    result.topChild?.setStatus({ code: 1, message: 'ok' });
                    result.topChild?.end();
                }
                transaction.setStatus({ code: 1, message: 'ok' });
                transaction.end();
                // highLevelSpan?.setStatus({ code: 1, message: 'ok' });
                // highLevelSpan?.end();
                return res;
            });
        };
        return result;
        // })
    };
}

/**
 * Check if Sentry auto-instrumentation should be disabled.
 *
 * @param getCurrentHub A method to fetch the current hub
 * @returns boolean
 */
function shouldDisableAutoInstrumentation(): boolean {
    const clientOptions = getClient()?.getOptions();
    const instrumenter = clientOptions?._metadata?.sdk?.name || 'sentry';

    return clientOptions?.enabled || !instrumenter.includes('sentry');
}