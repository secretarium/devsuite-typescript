import { NativeRouter, Routes, Route } from 'react-router-native';
import Root from './routes/root';
import Index from './routes/index';
import Scanner from './routes/scanner';
import ErrorPage from './ErrorPage';
import { Fence } from './components/Fence';

export function Router() {
    return <NativeRouter>
        <Fence>
            <Routes>
                <Route
                    path="/"
                    element={<Root />}
                >
                    <Route errorElement={<ErrorPage />}>
                        <Route index element={<Index />} />
                        <Route
                            path="scan/"
                            element={<Scanner />}
                        />
                    </Route>
                </Route>
            </Routes>
        </Fence>
    </NativeRouter>;
}

export default Router;
