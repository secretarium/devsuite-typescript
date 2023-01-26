import { type FC } from 'react';
import { createRoutesFromElements, Route, RouterProvider, defer } from 'react-router-dom';
import { sentryCreateBrowserRouter } from './utils/sentry';
import Root, { loader as rootLoader } from './routes/root';
// import Project, { loader as projectLoader, action as projectAction } from './routes/project/view';
// import NewProject, { action as newProjectAction } from './routes/project/new';
import AuthCodeReception, { loader as authLoader } from './routes/auth';
import Index from './routes/index';
import ErrorPage from './ErrorPage';
// import Activity from './routes/activity';
import Landing from './routes/landing';
import { AuthLayout } from './AuthLayout';
import { ProtectedLayout } from './ProtectedLayout';
import Login from './routes/login';
import Deploy from './routes/deploy';
import RepoSelect from './routes/deploy/select';
import RepoSheet from './routes/deploy/repo';
import AppListing from './routes/apps/index';
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
                path="auth"
                loader={authLoader}
                element={<AuthCodeReception />}
            />
            <Route
                path="/"
                element={<Landing />}
            />
            <Route element={<ProtectedLayout />}>
                <Route
                    path="/dashboard"
                    element={<Root />}
                    loader={rootLoader}
                >
                    <Route errorElement={<ErrorPage />}>
                        <Route index element={<Index />} />
                        {/* <Route
                            path="projects/new"
                            element={<NewProject />}
                            action={newProjectAction}
                        />
                        <Route
                            path="projects/:projectId"
                            loader={projectLoader}
                            action={projectAction}
                            element={<Project />}
                        />
                        <Route
                            path="activity"
                            element={<Activity />}
                        /> */}
                        <Route
                            path="auth"
                            loader={authLoader}
                            element={<AuthCodeReception />}
                        />
                    </Route>
                </Route>
            </Route>
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
