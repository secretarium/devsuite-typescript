import styles from './App.module.css';

import { Route, Routes } from 'react-router';
import { Nav, Alert } from './_components';
import { Home, Users, Account } from './_pages';

export { App };

function App() {
    return <div role="navigation" className={styles['home']}>
        <Nav />
        <Alert />
        <Routes>
            <Route path="/" element={<Home />} />
            <Route path="users" element={<Users />} />
            <Route path="account" element={<Account />} />
        </Routes>
    </div>;
}

export default App;
