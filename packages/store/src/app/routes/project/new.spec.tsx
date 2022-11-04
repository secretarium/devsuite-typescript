import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { BrowserRouter } from 'react-router-dom';
import New from './new';

describe('App', () => {
    it('should render successfully', async () => {
        render(<New />, { wrapper: BrowserRouter });
        const user = userEvent.setup();

        // verify page content for default route
        // expect(screen.getByText(/you are home/i)).toBeInTheDocument();

        // verify page content for expected route after navigating
        await user.click(screen.getByText(/material/i));
        expect(screen.getByText(/Secretarium CC/i)).toBeTruthy();
    });
});
