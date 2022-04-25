import { StrictMode } from 'react';
import { render } from 'react-dom';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';

import App from './app/App';

const containerElement = document.getElementById('root') as HTMLElement;
const applicationElement = (
    <StrictMode>
        <BrowserRouter>
            <App />
        </BrowserRouter>
    </StrictMode>
);

// We check for React 18 first
if (createRoot) {
    const container = createRoot(containerElement);
    container.render(applicationElement);
} else {
    render(applicationElement, containerElement);
}