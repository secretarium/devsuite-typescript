import { createBrowserRouter, createRoutesFromElements, Route, RouterProvider } from 'react-router-dom';
import Root, { loader as rootLoader } from './routes/root';
import Contact, { loader as contactLoader, action as contactAction } from './routes/contact';
import EditContact, { action as editAction } from './routes/edit';
import NewProject, { action as newProjectAction } from './routes/project/new';
import { action as destroyAction } from './routes/destroy';
import Index from './routes/index';
import ErrorPage from './ErrorPage';
import Activity from './routes/activity';

const router = createBrowserRouter(
    createRoutesFromElements(
        <Route
            path="/"
            element={<Root />}
            loader={rootLoader}
            errorElement={<ErrorPage />}
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
    )
);

export function Router() {
    return <RouterProvider router={router} />;
}

export default Router;
