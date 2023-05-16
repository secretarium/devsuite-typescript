import { type FC } from 'react';
import { createRoutesFromElements, Route, RouterProvider, defer } from 'react-router-dom';
import { sentryCreateBrowserRouter } from './utils/sentry';
import AuthCodeReception, { loader as authLoader } from './routes/auth';
import ErrorPage from './ErrorPage';
import Landing from './routes/landing';
import { AuthLayout } from './AuthLayout';
import AppLayout from './AppLayout';
import { ProtectedLayout } from './ProtectedLayout';
import Dashboard from './routes/dashboard';
import Login from './routes/login';
import Logout from './routes/logout';
import Deploy from './routes/deploy';
import RepoSelect from './routes/deploy/select';
import RepoSheet from './routes/deploy/repo';
import AppInfo from './routes/apps/index';
import AppActivity from './routes/apps/activity';
import AppDomains from './routes/apps/domains';
import AppDeployments from './routes/apps/deployments';
import AppDeploymentDetail from './routes/apps/deploymentDetail';
import AppEnvironment from './routes/apps/environment';
import AppListing from './routes/apps/listing';
import AppSettings from './routes/apps/settings';
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
                    path="logout"
                    element={<Logout />}
                />
                <Route
                    path="blocks"
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
            </Route>
            <Route
                path="auth"
                loader={authLoader}
                element={<AuthCodeReception />}
            />
            <Route path='home' element={<Landing />} />
            <Route element={<ProtectedLayout />}>
                <Route element={<Dashboard />} >
                    <Route index element={<AppInfo />} />
                    <Route
                        path="app"
                    >
                        <Route index element={<AppInfo />} />
                        <Route
                            path=":appId"
                            element={<AppInfo />}
                        >
                            <Route index element={<AppActivity />} />
                            <Route path="deployments">
                                <Route path=":deploymentId" element={<AppDeploymentDetail />} />
                                <Route index element={<AppDeployments />} />
                            </Route>
                            <Route path="environment" element={<AppEnvironment />} />
                            <Route path="domains" element={<AppDomains />} />
                            <Route path="listing" element={<AppListing />} />
                            <Route path="settings" element={<AppSettings />} />
                            <Route path="*" element={<AppActivity />} />
                        </Route>
                    </Route>
                </Route>
            </Route>
        </Route >
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
