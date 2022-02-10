import { render } from '@testing-library/react';

import { SecretariumProvider } from './SecretariumProvider';

describe('React', () => {
    it('should render successfully', () => {
        const { baseElement } = render(<SecretariumProvider>SP</SecretariumProvider>);
        expect(baseElement).toBeTruthy();
    });
});
