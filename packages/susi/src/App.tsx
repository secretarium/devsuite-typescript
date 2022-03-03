import React from 'react';
// import { SafeAreaProvider } from 'react-native-safe-area-context';
import Settings from './components/Settings';
import Root from './components/Root';
import { Route, Routes } from './router/Router';

export const App: React.FC = () => {

    return (
        <Routes>
            <Route path="/" element={<Root />} />
            <Route path="/settings" element={<Settings />} />
        </Routes>
    );
};

export default App;
