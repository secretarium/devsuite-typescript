import { createRoutesFromElements, Route, RouterProvider, defer } from 'react-router-dom';
import { sentryCreateBrowserRouter } from './utils/sentry';
import Root, { loader as rootLoader } from './routes/root';
import Project, { loader as projectLoader, action as projectAction } from './routes/project/view';
import NewProject, { action as newProjectAction } from './routes/project/new';
import AuthCodeReception, { loader as authLoader } from './routes/auth';
import Index from './routes/index';
import ErrorPage from './ErrorPage';
import Activity from './routes/activity';
import { AuthLayout } from './AuthLayout';
import { ProtectedLayout } from './ProtectedLayout';
import Login from './routes/login';

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
                path="/login"
                element={<Login />}
            />
            <Route element={<ProtectedLayout />}>
                <Route
                    path="/"
                    element={<Root />}
                    loader={rootLoader}
                >
                    <Route errorElement={<ErrorPage />}>
                        <Route index element={<Index />} />
                        <Route
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
                        />
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

export function Router() {
    return <RouterProvider router={router} />;
}

export default Router;
