import styles from './App.module.css';

import { useEffect } from 'react';
import { Route, Routes, Link } from 'react-router-dom';

export function App() {
    useEffect(() => {
        chrome.devtools.panels.create('Secretarium', '', 'panel.html', function (panel) {
            // code invoked on panel creation
            console.log('Welcome to Secretarium Endoscope');
        });
    });

    return (
        <>
            <div role="navigation">
                <ul>
                    <li className={styles['home']}>
                        <Link to="/" className="inline text-blue-600">
                            Devtool
                        </Link>
                    </li>
                </ul>
            </div>
            <Routes>
                <Route path="/" element={<h1>Inspect Secretarium connection</h1>} />
            </Routes>
        </>
    );
}

export default App;
