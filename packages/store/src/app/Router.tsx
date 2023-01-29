import { type FC } from 'react';
import { createRoutesFromElements, Route, RouterProvider, defer } from 'react-router-dom';
import { sentryCreateBrowserRouter } from './utils/sentry';
import AuthCodeReception, { loader as authLoader } from './routes/auth';
import ErrorPage from './ErrorPage';
import Landing from './routes/landing';
import { AuthLayout } from './AuthLayout';
import AppLayout from './AppLayout';
// import { ProtectedLayout } from './ProtectedLayout';
import Login from './routes/login';
import Deploy from './routes/deploy';
import RepoSelect from './routes/deploy/select';
import RepoSheet from './routes/deploy/repo';
import AppListing from './routes/apps/index';
import DomainListing from './routes/domains/index';
import Catalog from './routes/catalog';
import CatalogListing from './routes/catalog/listing';
import Providers from './Providers';

const getUserData = () => fetch('/api/whoami', { method: 'GET' })
    .then(res => res.json());

const router = sentryCreateBrowserRouter(
    createRoutesFromElements(
        <Route
            element={<AuthLayout />}
            loader={() => defer({ userPromise: getUserData() })}
            errorElement={<ErrorPage />}
        >
            <Route
                element={<AppLayout />}
            >
                <Route
                    path="login"
                    element={<Login />}
                />
                <Route
                    path="store"
                >
                    <Route index element={<Catalog />} />
                    <Route
                        path="app/:slug"
                        element={<CatalogListing />}
                    />
                </Route>
                <Route
                    path="deploy"
                >
                    <Route index element={<Deploy />} />
                    <Route
                        path="select"
                        element={<RepoSelect />}
                    />
                    <Route
                        path="repo/:owner/:name"
                        element={<RepoSheet />}
                    />
                </Route>
                <Route
                    path="apps"
                >
                    <Route index element={<AppListing />} />
                    <Route
                        path=":appId"
                        element={<AppListing />}
                    />
                </Route>
                <Route
                    path="domains"
                >
                    <Route index element={<DomainListing />} />
                    <Route
                        path=":domainId"
                        element={<DomainListing />}
                    />
                </Route>
            </Route>
            <Route
                path="auth"
                loader={authLoader}
                element={<AuthCodeReception />}
            />
            <Route
                path="/"
                element={<Landing />}
            />
            {/*
            <Route element={<ProtectedLayout />}>
            </Route>
             */}
        </Route>
    )
);

export const Router: FC = () => {
    return (
        <Providers>
            <RouterProvider router={router} />
        </Providers>
    );
};

export default Router;
