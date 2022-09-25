import { StrictMode } from 'react';
import * as ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';

import Navigation from './app/Navigation';

const containerElement = document.getElementById('root');
const applicationElement = (
    <StrictMode>
        <BrowserRouter>
            <Navigation />
        </BrowserRouter>
    </StrictMode>
);

const container = (ReactDOM as any).createRoot(containerElement);
container.render(applicationElement);
