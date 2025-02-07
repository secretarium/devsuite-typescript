import { ConnectorTracing as ConnectorTracingV7 } from './v7/connectorTracing';
import { ConnectorTracing as ConnectorTracingV8 } from './v8/connectorTracing';

describe('ConnectorTracingV7', () => {
    it('should work', () => {
        expect(new ConnectorTracingV7()).toBeDefined();
    });
});

describe('ConnectorTracingV8', () => {
    it('should work', () => {
        expect(new ConnectorTracingV8()).toBeDefined();
    });
});
