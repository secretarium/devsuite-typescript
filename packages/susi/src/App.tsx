import React, { useEffect } from 'react';
import { Route, Routes } from './router/Router.native';
import Settings from './components/Settings';
import Home from './components/Home';
import Scanner from './components/Scanner';
import { biometricCheck } from './utils';

export const App: React.FC = () => {

    useEffect(() => {
        biometricCheck();
    }, []);

    return (
        <Routes>
            <Route path="/" element={<Home />} />
            <Route path="settings" element={<Settings />} />
            <Route path="scanner" element={<Scanner />} />
        </Routes>
    );
};

export default App;
