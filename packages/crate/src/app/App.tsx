import styles from './App.module.css';

import { Route, Routes } from 'react-router';
import { Alert } from './_components';
import { Home, CodeAuth } from './_pages';

export const App = () => {

    return <div role="navigation" className={styles['home']}>
        {/* <Nav /> */}
        <Alert />
        <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/auth" element={<CodeAuth />} />
            {/* <Route path="users" element={<Users />} />
            <Route path="account" element={<Account />} /> */}
        </Routes>
    </div>;
};

export default App;
