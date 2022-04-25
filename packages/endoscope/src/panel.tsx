import { StrictMode } from 'react';
import { render } from 'react-dom';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';

import { DevtoolMainPanel } from './app/DevtoolMainPanel';

const containerElement = document.getElementById('root') as HTMLElement;
const applicationElement = (
    <StrictMode>
        <BrowserRouter>
            <DevtoolMainPanel />
        </BrowserRouter>
    </StrictMode>
);

// We check for React 18 firstrender
if (createRoot) {
    const container = createRoot(containerElement);
    container.render(applicationElement);
} else {
    render(applicationElement, containerElement);
}