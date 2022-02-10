import { StrictMode } from 'react';
import * as ReactDOM from 'react-dom';

import App from './app/App';
import Providers from './app/Providers';

const containerElement = document.getElementById('root');
const applicationElement = (
    <StrictMode>
        <Providers>
            <App />
        </Providers>
    </StrictMode>
);

// We check for React 18 first
if ((ReactDOM as any).createRoot) {
    const container = (ReactDOM as any).createRoot(containerElement);
    container.render(applicationElement);
} else
    ReactDOM.render(applicationElement, containerElement);
