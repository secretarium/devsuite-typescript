import { render } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import DevtoolMainPanel from './DevtoolMainPanel';

describe('DevtoolMainPanel', () => {
    it('should render successfully', () => {
        const { baseElement } = render(
            <BrowserRouter>
                <DevtoolMainPanel />
            </BrowserRouter>
        );

        expect(baseElement).toBeTruthy();
    });

    it('should have a greeting as the title', () => {
        const { getByText } = render(
            <BrowserRouter>
                <DevtoolMainPanel />
            </BrowserRouter>
        );

        expect(getByText(/Current connected versions/i)).toBeTruthy();
    });
});
