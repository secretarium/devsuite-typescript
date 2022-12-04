import { StrictMode } from 'react';
import * as ReactDOM from 'react-dom/client';
import './app/utils/sentry';

import App from './app/Router';

const root = ReactDOM.createRoot(
    document.getElementById('root') as HTMLElement
);

root.render(
    <StrictMode>
        <App />
    </StrictMode>
);
