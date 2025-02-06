import { ConnectorTracing as ConnectorTracingV8, connectorTracingIntegration } from './v8/connectorTracing';

export const Sentry = {
    ConnectorTracing: ConnectorTracingV8,
    ConnectorTracingV8,
    connectorTracingIntegration
};