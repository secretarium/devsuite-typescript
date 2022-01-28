import { StrictMode } from 'react';
import * as ReactDOM from 'react-dom';
import { BrowserRouter } from 'react-router-dom';

ReactDOM.render(
    <StrictMode>
        <BrowserRouter>
            <div>Coucou !</div>
        </BrowserRouter>
    </StrictMode>,
    document.getElementById('root')
);
