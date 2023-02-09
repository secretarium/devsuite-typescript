import { ConsoleSpanExporter, SimpleSpanProcessor } from '@opentelemetry/sdk-trace-base';
import { WebTracerProvider } from '@opentelemetry/sdk-trace-web';
import { DocumentLoadInstrumentation } from '@opentelemetry/instrumentation-document-load';
import { XMLHttpRequestInstrumentation } from '@opentelemetry/instrumentation-xml-http-request';
import { registerInstrumentations } from '@opentelemetry/instrumentation';
import { B3Propagator } from '@opentelemetry/propagator-b3';
import { CompositePropagator, W3CTraceContextPropagator } from '@opentelemetry/core';

const provider = new WebTracerProvider();
provider.addSpanProcessor(new SimpleSpanProcessor(new ConsoleSpanExporter()));
provider.register({
    propagator: new CompositePropagator({
        propagators: [
            new B3Propagator(),
            new W3CTraceContextPropagator()
        ]
    })
});

registerInstrumentations({
    instrumentations: [
        new DocumentLoadInstrumentation(),
        new XMLHttpRequestInstrumentation({
            ignoreUrls: [/localhost/, /127.0.0.1/],
            propagateTraceHeaderCorsUrls: [
                'http://localhost:3333',
                'http://127.0.0.1:3333'
            ]
        })
    ]
});