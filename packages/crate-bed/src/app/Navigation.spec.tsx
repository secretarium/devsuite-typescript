import { render } from '@testing-library/react';

import { BrowserRouter } from 'react-router-dom';

import Navigation from './Navigation';

describe('App', () => {
    it('should render successfully', () => {
        const { baseElement } = render(
            <BrowserRouter>
                <Navigation />
            </BrowserRouter>
        );

        expect(baseElement).toBeTruthy();
    });

    // it('should have a greeting as the title', () => {
    //     const { getByText } = render(
    //         <BrowserRouter>
    //             <Navigation />
    //         </BrowserRouter>
    //     );

    //     expect(getByText(/Welcome crate-bed/gi)).toBeTruthy();
    // });
});
