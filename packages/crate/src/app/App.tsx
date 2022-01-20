import styles from './App.module.css';

import { Route, Routes, Link } from 'react-router-dom';

export function App() {
    return (
        <>
            <div role="navigation">
                <ul>
                    <li className={styles['home']}>
                        <Link to="/" className="inline text-blue-600">
                            Crate
                        </Link>
                    </li>
                </ul>
            </div>
            <Routes>
                <Route path="/" element={<h1>Connect with Secretarium</h1>} />
            </Routes>
        </>
    );
}

export default App;
