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

const container = (ReactDOM as any).createRoot(containerElement);
container.render(applicationElement);