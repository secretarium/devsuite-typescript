import React, { useEffect } from 'react';
import { Route, Routes } from 'react-router';
import Settings from './pages/Settings';
import Home from './pages/Home';
import Scanner from './pages/Scanner';
import Key from './pages/Key';
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
            <Route path="keys/:id" element={<Key />} />
        </Routes>
    );
};

export default App;
