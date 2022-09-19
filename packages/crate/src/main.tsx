import { StrictMode } from 'react';
import * as ReactDOM from 'react-dom/client';

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

const container = (ReactDOM as any).createRoot(containerElement);
container.render(applicationElement);