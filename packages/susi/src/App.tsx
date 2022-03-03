import React from 'react';
import { Route, Routes } from './router/Router';
import Settings from './components/Settings';
import Home from './components/Home';
import Scanner from './components/Scanner';

export const App: React.FC = () => {

    return (
        <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/scanner" element={<Scanner />} />
        </Routes>
    );
};

export default App;
