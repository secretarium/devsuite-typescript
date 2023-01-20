// import './wdyr';
import './opentelemetry';
import './app/utils/sentry';
import * as ReactDOM from 'react-dom/client';

import App from './app/Router';

const root = ReactDOM.createRoot(
    document.getElementById('root') as HTMLElement
);

root.render(
    <StrictMode>
        <App />
    </StrictMode>
);
