import React from 'react';
import { Route, Routes, useLocation } from './router/Router.native';
import Settings from './components/Settings';
import Home from './components/Home';
import Scanner from './components/Scanner';

export const App: React.FC = () => {

    const location = useLocation();

    React.useEffect(() => {
        console.log(location);
    }, [location]);
    console.log('APP');
    return (
        <Routes>
            <Route path="/" element={<Home />} />
            <Route path="settings" element={<Settings />} />
            <Route path="scanner" element={<Scanner />} />
        </Routes>
    );
};

export default App;
