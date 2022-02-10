import { StrictMode } from 'react';
import * as ReactDOM from 'react-dom';
import { BrowserRouter } from 'react-router-dom';

import { DevtoolMainPanel } from './app/DevtoolMainPanel';

const containerElement = document.getElementById('root');
const applicationElement = (
    <StrictMode>
        <BrowserRouter>
            <DevtoolMainPanel />
        </BrowserRouter>
    </StrictMode>
);

// We check for React 18 first
if ((ReactDOM as any).createRoot) {
    const container = (ReactDOM as any).createRoot(containerElement);
    container.render(applicationElement);
} else
    ReactDOM.render(applicationElement, containerElement);
