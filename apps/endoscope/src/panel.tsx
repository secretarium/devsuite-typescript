import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';

import { DevtoolMainPanel } from './app/DevtoolMainPanel';

const rootElement = document.getElementById('root');
if (rootElement && !rootElement?.innerHTML) {
    const root = createRoot(rootElement);
    root.render(
        <StrictMode>
            <BrowserRouter>
                <DevtoolMainPanel />
            </BrowserRouter>
        </StrictMode>
    );
}