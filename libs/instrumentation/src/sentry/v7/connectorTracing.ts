/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck
import type { Hub, IdleTransaction/*, Transaction */ } from '@sentry/core';
import { addNonEnumerableProperty } from '@sentry/utils';
import { getActiveSpan, startIdleTransaction, TRACING_DEFAULTS } from '@sentry/core';
import type { Integration } from '@sentry/types';
import { logger } from '@sentry/utils';
import { SCP } from '@secretarium/connector';
import prettyBytes from 'pretty-bytes';

type ConnectorTracingOptions = {
    connector?: SCP;
    domains?: string[];
};

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
    public setupOnce(_: unknown, getCurrentHub: () => Hub): void {
        if (!this._connector) {
            if (__DEBUG_BUILD__)
                logger.error('SecretariumConnectorIntegration is missing an SCP instance.');
            return;
        }

        if (shouldDisableAutoInstrumentation(getCurrentHub)) {
            if (__DEBUG_BUILD__)
                logger.log('SecretariumConnectorIntegration is skipped because of instrumenter configuration.');
            return;
        }

        instrumentSCP(this._connector, {
            hub: getCurrentHub(),
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
    hub: Hub;
    domains?: string[];
    trimEnd?: boolean;
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
        });
    });
}

function patchConnectorCall(originalCall: (...args: any[]) => any, options: {
    hub: Hub;
    domains: string[];
    connector: SCP;
    trimEnd?: boolean;
    type: 'Transaction' | 'Query';
    operation: 'transaction' | 'query';
    short: 'tx' | 'q';
}) {
    const endpoint = options.connector.getEndpoint();
    const cryptoContext = options.connector.getCryptoContext();
    return function (...args: any[]) {

        const result = originalCall.call(options.connector, ...args);

        let host = args[0];
        options.domains.forEach(d => host = host.replace(d, ''));
        const currentSpan = getActiveSpan();
        const highLevelSpan = currentSpan?.startChild({
            name: `SCP /${host}/${args[1]}`,
            description: `Secretarium ${options.type}`,
            op: `secretarium.${options.operation}`,
            origin: `auto.scp.instrumentation.${options.operation}`
        });
        const transaction = startIdleTransaction.call(result, options.hub, {
            name: `SCP /${host}/${args[1]}`,
            description: `Secretarium ${options.type}`,
            op: `secretarium.${options.operation}`,
            origin: `auto.scp.instrumentation.${options.operation}`,
            parentSpanId: currentSpan?.spanId,
            traceId: currentSpan?.traceId,
            metadata: {
                request: {
                    method: 'POST',
                    host,
                    hostname: args[0],
                    url: `/${args[1]}`,
                    protocol: 'scp'
                },
                source: 'component'
            },
            trimEnd: options.trimEnd ?? true,
            tags: {
                'connector': typeof window !== 'undefined' ? (window as any).__SECRETARIUM_DEVTOOLS_CONNECTOR__.version : typeof global !== 'undefined' ? (global as any).__SECRETARIUM_DEVTOOLS_CONNECTOR__.version : 'unknown',
                'crypto.type': cryptoContext?.type,
                'crypto.version': cryptoContext?.version,
                'endpoint': endpoint?.url,
                'endpoint.connected': options.connector.isConnected(),
                'endpoint.trusted_key': endpoint?.knownTrustedKey,
                'contract': host,
                'contract.name': host,
                'contract.name.fq': args[0],
                'contract.route': args[1]

            }
            // traceId: ...,
            // parentSampled,
            // parentSpanId: ...,
        }, TRACING_DEFAULTS.idleTimeout, TRACING_DEFAULTS.finalTimeout) as IdleTransaction;

        // Wrap prepare and encrypt
        if ((options.connector as any).__sentry_sub__encrypt === undefined)
            addNonEnumerableProperty(options.connector, '__sentry_sub__encrypt', (options.connector as any)._encrypt);
        if ((options.connector as any).__sentry_sub__prepare === undefined)
            addNonEnumerableProperty(options.connector, '__sentry_sub__prepare', (options.connector as any)._prepare);

        const originalEncrypt = (options.connector as any).__sentry_sub__encrypt;
        const originalPrepare = (options.connector as any).__sentry_sub__prepare;

        (options.connector as any)._encrypt = async function (data: Uint8Array): Promise<Uint8Array> {

            if (result.stepChild?.tags['fibre']) {
                result.stepChild?.setStatus('ok');
                result.stepChild?.finish();
                result.stepChild = result.topChild?.startChild({
                    description: 'Encrypting',
                    op: 'prepare.encrypt'
                });
            }

            const arrayRes = await originalEncrypt.call(options.connector, data);
            return arrayRes;
        };

        (options.connector as any)._prepare = async function (app: string, command: string, requestId: string, args: Record<string, unknown> | string) {

            const fibreTag = Math.random().toString();
            result.stepChild?.setTag('fibre', fibreTag);

            const arrayRes = await originalPrepare.call(options.connector, app, command, requestId, args);

            transaction.setTag('payload.size', prettyBytes(arrayRes.length));

            result.stepChild?.setStatus('ok');
            result.stepChild?.finish();
            result.topChild?.setStatus('ok');
            result.topChild?.finish();

            result.topChild = transaction.startChild({
                description: options.type,
                op: options.short
            });
            result.stepChild = result.topChild?.startChild({
                description: 'Acknowledgement',
                op: `${options.short}.acknowledgement`
            });

            return arrayRes;
        };

        // Patch the send function
        const originalSend = result.send;
        result.send = async () => {

            result.topChild = transaction.startChild({
                description: 'Prepare',
                op: 'prepare'
            });
            result.stepChild = result.topChild.startChild({
                description: 'Encoding',
                op: 'prepare.encode'
            });

            if (options.operation === 'transaction') {
                result.onAcknowledged(() => {
                    result.stepChild?.setStatus('ok');
                    result.stepChild?.finish();
                    result.stepChild = result.topChild?.startChild({
                        description: 'Commitment',
                        op: `${options.short}.commitment`
                    });
                });
                result.onCommitted(() => {
                    result.stepChild?.setStatus('ok');
                    result.stepChild?.finish();
                    result.stepChild = result.topChild?.startChild({
                        description: 'Execution',
                        op: `${options.short}.execution`
                    });
                });
                result.onExecuted(() => {
                    result.stepChild?.setStatus('ok');
                    result.stepChild?.finish();
                });
            }
            result.onResult(() => {
                const resultTimepoint = result.topChild?.startChild({
                    description: 'Result',
                    op: `${options.short}.result`
                });
                resultTimepoint?.finish();
            });
            result.onError(() => {
                result.stepChild?.setStatus('internal_error');
                result.stepChild?.finish();
                result.topChild?.setStatus('internal_error');
                result.topChild?.finish();
                transaction.setStatus('internal_error');
                transaction.finish();
            });

            const promise = originalSend();
            return promise.then((res: any) => {
                if (result.stepChild?.endTimestamp === undefined) {
                    result.stepChild?.setStatus('ok');
                    result.stepChild?.finish();
                }
                if (result.topChild?.endTimestamp === undefined) {
                    result.topChild?.setStatus('ok');
                    result.topChild?.finish();
                }
                transaction.setStatus('ok');
                transaction.finish();
                highLevelSpan?.setStatus('ok');
                highLevelSpan?.finish();
                return res;
            });
        };
        return result;
    };
}

/**
 * Check if Sentry auto-instrumentation should be disabled.
 *
 * @param getCurrentHub A method to fetch the current hub
 * @returns boolean
 */
export function shouldDisableAutoInstrumentation(getCurrentHub: () => Hub): boolean {
    const clientOptions = getCurrentHub().getClient()?.getOptions();
    const instrumenter = clientOptions?.instrumenter || 'sentry';

    return instrumenter !== 'sentry';
}