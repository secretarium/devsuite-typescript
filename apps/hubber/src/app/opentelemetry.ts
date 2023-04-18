import { SimpleSpanProcessor, BatchSpanProcessor, ConsoleSpanExporter, TraceIdRatioBasedSampler } from '@opentelemetry/sdk-trace-base';
import { NodeTracerProvider } from '@opentelemetry/sdk-trace-node';
import { SemanticResourceAttributes } from '@opentelemetry/semantic-conventions';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { registerInstrumentations } from '@opentelemetry/instrumentation';
import { DnsInstrumentation } from '@opentelemetry/instrumentation-dns';
// import { ExpressInstrumentation } from '@opentelemetry/instrumentation-express';
// import { HttpInstrumentation } from '@opentelemetry/instrumentation-http';
import { MongoDBInstrumentation } from '@opentelemetry/instrumentation-mongodb';
import { NetInstrumentation } from '@opentelemetry/instrumentation-net';
import { WinstonInstrumentation } from '@opentelemetry/instrumentation-winston';
import { Resource } from '@opentelemetry/resources';
import { PrismaInstrumentation } from '@prisma/instrumentation';
import { SentrySpanProcessor, SentryPropagator } from '@sentry/opentelemetry-node';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { NodeSDK } from '@opentelemetry/sdk-node';
import { version } from '../../../../package.json';

const provider = new NodeTracerProvider({
    sampler: new TraceIdRatioBasedSampler(1),
    resource: new Resource({
        [SemanticResourceAttributes.SERVICE_NAME]: 'hubber',
        [SemanticResourceAttributes.SERVICE_VERSION]: version
    })
});

const traceExporter = new OTLPTraceExporter();

if (process.env.NODE_ENV === 'production') {
    provider.addSpanProcessor(new BatchSpanProcessor(traceExporter));
} else {
    provider.addSpanProcessor(new SimpleSpanProcessor(traceExporter));
    // provider.addSpanProcessor(new SimpleSpanProcessor(new ConsoleSpanExporter));
}

provider.addSpanProcessor(new SentrySpanProcessor());

const instrumentations = [
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
    // Express instrumentation expects HTTP layer to be instrumented
    // new HttpInstrumentation(),
    // new ExpressInstrumentation(),
    // MongoDB instrumentation
    new MongoDBInstrumentation(),
    // Prisma instrumentation
    new PrismaInstrumentation({ middleware: true })
];

registerInstrumentations({
    tracerProvider: provider,
    instrumentations
});

provider.register();

export const opentelemetrySdk = new NodeSDK({
    traceExporter: new ConsoleSpanExporter(),
    textMapPropagator: new SentryPropagator(),
    instrumentations: [getNodeAutoInstrumentations()]
});

opentelemetrySdk.start()
    .then(() => console.log('Tracing initialized'))
    .catch((error) => console.log('Error initializing tracing', error));

process.on('SIGTERM', () => {
    opentelemetrySdk
        .shutdown()
        .then(() => console.log('Tracing terminated'))
        .catch((error) => console.log('Error terminating tracing', error))
        .finally(() => process.exit(0));
});


// import process from 'process';
// import { NodeSDK } from '@opentelemetry/sdk-node';
// import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
// import { ConsoleSpanExporter } from '@opentelemetry/sdk-trace-base';
// import { Resource } from '@opentelemetry/resources';
// import { SemanticResourceAttributes } from '@opentelemetry/semantic-conventions';

// // configure the SDK to export telemetry data to the console
// // enable all auto-instrumentations from the meta package
// const traceExporter = new ConsoleSpanExporter();
// export const opentelemetrySdk = new NodeSDK({
//     resource: new Resource({
//         [SemanticResourceAttributes.SERVICE_NAME]: 'my-service'
//     }),
//     traceExporter,
//     instrumentations: [getNodeAutoInstrumentations()]
// });

// // initialize the SDK and register with the OpenTelemetry API
// // this enables the API to record telemetry
// opentelemetrySdk.start()
//     .then(() => console.log('Tracing initialized'))
//     .catch((error) => console.log('Error initializing tracing', error));

// // gracefully shut down the SDK on process exit
// process.on('SIGTERM', () => {
//     opentelemetrySdk.shutdown()
//         .then(() => console.log('Tracing terminated'))
//         .catch((error) => console.log('Error terminating tracing', error))
//         .finally(() => process.exit(0));
// });