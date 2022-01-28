import { StrictMode } from 'react';
import * as ReactDOM from 'react-dom';
import { BrowserRouter } from 'react-router-dom';

import Navigation from './app/Navigation';

ReactDOM.render(
    <StrictMode>
        <BrowserRouter>
            <Navigation />
        </BrowserRouter>
    </StrictMode>,
    document.getElementById('root')
);
