import { createRoutesFromElements, Route, RouterProvider, defer } from 'react-router-dom';
import { sentryCreateBrowserRouter } from './utils/sentry';
import Root, { loader as rootLoader } from './routes/root';
import Contact, { loader as contactLoader, action as contactAction } from './routes/contact';
import EditContact, { action as editAction } from './routes/edit';
import NewProject, { action as newProjectAction } from './routes/project/new';
import { action as destroyAction } from './routes/destroy';
import Index from './routes/index';
import ErrorPage from './ErrorPage';
import Activity from './routes/activity';
import { AuthLayout } from './AuthLayout';
import { ProtectedLayout } from './ProtectedLayout';
import Login from './routes/login';
// import { localForage } from './useLocalStorage';

const getUserData = () => fetch('/api/whoami', { method: 'GET' })
    .then(res => res.json());
// .then(data => data.me);
// new Promise((resolve) =>
//     setTimeout(() => {
//         const user: any = localForage.getItem('user');
//         resolve(user);
//     }, 3000)
// );

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
                            path="contacts/:contactId"
                            element={<Contact />}
                            loader={contactLoader}
                            action={contactAction}
                        />
                        <Route
                            path="contacts/:contactId/edit"
                            element={<EditContact />}
                            loader={contactLoader}
                            action={editAction}
                        />
                        <Route
                            path="contacts/:contactId/destroy"
                            action={destroyAction}
                        />
                        <Route
                            path="project/new"
                            element={<NewProject />}
                            action={newProjectAction}
                        />
                        <Route
                            path="activity"
                            element={<Activity />}
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
