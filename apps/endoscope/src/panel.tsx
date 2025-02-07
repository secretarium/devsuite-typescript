import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';

import { DevtoolMainPanel } from './app/DevtoolMainPanel';

const rootElement = document.getElementById('root');
if (rootElement && !rootElement?.innerHTML) {
    const root = createRoot(rootElement, {
        onCaughtError(error, errorInfo) {
            console.error('Caught error', error, errorInfo.componentStack);
        },
        onUncaughtError(error, errorInfo) {
            console.error('Uncaught error', error, errorInfo.componentStack);
        },
        onRecoverableError(error, errorInfo) {
            console.error('Recoverable error', error, errorInfo.componentStack);
        }
    });
    root.render(
        <StrictMode>
            <BrowserRouter>
                <DevtoolMainPanel />
            </BrowserRouter>
        </StrictMode>
    );
}