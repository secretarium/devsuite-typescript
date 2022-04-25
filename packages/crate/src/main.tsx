import { StrictMode } from 'react';
import { render } from 'react-dom';
import { createRoot } from 'react-dom/client';

import App from './app/App';
import Providers from './app/Providers';

const containerElement = document.getElementById('root') as HTMLElement;
const applicationElement = (
    <StrictMode>
        <Providers>
            <App />
        </Providers>
    </StrictMode>
);

// We check for React 18 first
if (createRoot) {
    const container = createRoot(containerElement);
    container.render(applicationElement);
} else {
    render(applicationElement, containerElement);
}