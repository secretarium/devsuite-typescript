import { NodeTracerProvider } from '@opentelemetry/sdk-trace-node';
import { registerInstrumentations } from '@opentelemetry/instrumentation';
import { DnsInstrumentation } from '@opentelemetry/instrumentation-dns';
import { ExpressInstrumentation } from '@opentelemetry/instrumentation-express';
import { HttpInstrumentation } from '@opentelemetry/instrumentation-http';
import { MongoDBInstrumentation } from '@opentelemetry/instrumentation-mongodb';
import { NetInstrumentation } from '@opentelemetry/instrumentation-net';
import { WinstonInstrumentation } from '@opentelemetry/instrumentation-winston';

const provider = new NodeTracerProvider();
provider.register();

registerInstrumentations({
    instrumentations: [
        new WinstonInstrumentation({
            // Optional hook to insert additional context to log metadata.
            // Called after trace context is injected to metadata.
            logHook: (span, record) => {
                record['resource.service.name'] = provider.resource.attributes['service.name'];
            }
        }),
        new NetInstrumentation(),
        new DnsInstrumentation({
            ignoreHostnames: []
        }),
        // MongoDB instrumentation
        new MongoDBInstrumentation(),
        // Express instrumentation expects HTTP layer to be instrumented
        new HttpInstrumentation(),
        new ExpressInstrumentation()
    ]
});