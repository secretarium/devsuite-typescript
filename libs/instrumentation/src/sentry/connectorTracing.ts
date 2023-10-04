import type { Hub /*, IdleTransaction, Transaction */ } from '@sentry/core';
import {
    // addTracingExtensions,
    // extractTraceparentData,
    // getActiveTransaction,
    startIdleTransaction,
    // startTransaction,
    TRACING_DEFAULTS
} from '@sentry/core';
import type { Integration } from '@sentry/types';
import { logger } from '@sentry/utils';
import { SCP } from '@secretarium/connector';

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
            __DEBUG_BUILD__ && logger.error('SecretariumConnectorIntegration is missing an SCP instance.');
            return;
        }

        if (shouldDisableAutoInstrumentation(getCurrentHub)) {
            __DEBUG_BUILD__ && logger.log('SecretariumConnectorIntegration is skipped because of instrumenter configuration.');
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
    return function (...args: any[]) {
        const result = originalCall.call(options.connector, ...args);
        const originalSend = result.send;
        result.send = () => {
            let host = args[0];
            options.domains.forEach(d => host = host.replace(d, ''));
            const transaction = startIdleTransaction.call(result, options.hub, {
                name: `SCP /${host}/${args[1]}`,
                description: `Secretarium ${options.type}`,
                op: `secretarium.${options.operation}`,
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
                    'contract': host,
                    'contract.name': host,
                    'contract.name.fq': args[0],
                    'contract.route': args[1]

                }
                // traceId: ...,
                // parentSampled,
                // parentSpanId: ...,
            }, TRACING_DEFAULTS.idleTimeout, TRACING_DEFAULTS.finalTimeout);
            let stepChild = transaction.startChild({
                description: 'Acknowledgement',
                op: `${options.short}.acknowledgement`
            });
            result.onAcknowledged(() => {
                stepChild.setStatus('ok');
                stepChild.finish();
                stepChild = transaction.startChild({
                    description: 'Proposal',
                    op: `${options.short}.proposal`
                });
            });
            result.onProposed(() => {
                stepChild.setStatus('ok');
                stepChild.finish();
                stepChild = transaction.startChild({
                    description: 'Commitment',
                    op: `${options.short}.commitment`
                });
            });
            result.onCommitted(() => {
                stepChild.setStatus('ok');
                stepChild.finish();
                stepChild = transaction.startChild({
                    description: 'Execution',
                    op: `${options.short}.execution`
                });
            });
            result.onExecuted(() => {
                stepChild.setStatus('ok');
                stepChild.finish();
            });
            result.onResult(() => {
                const resultTimepoint = transaction.startChild({
                    description: 'Result',
                    op: `${options.short}.result`
                });
                resultTimepoint.finish();
            });
            result.onError(() => {
                stepChild.setStatus('internal_error');
                stepChild.finish();
                transaction.setStatus('internal_error');
                transaction.finish();
            });
            const promise = originalSend();
            return promise.then((res: any) => {
                if (stepChild.endTimestamp === undefined) {
                    stepChild.setStatus('ok');
                    stepChild.finish();
                }
                transaction.setStatus('ok');
                transaction.finish();
                return res;
            }).finally(() => {
                transaction.setStatus('internal_error');
                transaction.finish();
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