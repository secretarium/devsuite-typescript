import { lazy, Suspense } from 'react';
import { createRootRoute, Link, Outlet, MatchRoute } from '@tanstack/react-router';

const TanStackRouterDevtools = process.env.NODE_ENV === 'production'
    ? () => null // Render nothing in production
    : lazy(async () =>
        // Lazy load in development
        import('@tanstack/router-devtools').then((res) => ({
            default: res.TanStackRouterDevtools
            // For Embedded Mode
            // default: res.TanStackRouterDevtoolsPanel
        }))
    );

export const Route = createRootRoute({
    component: () => {
        return <>
            <div className="p-2 flex gap-2">
                <Link to="/" className="[&.active]:font-bold">
                    Home
                </Link>{' '}
                <Link to="/about" className="[&.active]:font-bold">
                    About
                </Link>
            </div>
            <hr />
            <Outlet />
            <div>
                <MatchRoute to="/">
                    <h3>Welcome Titi!</h3>
                </MatchRoute>
                <MatchRoute to="/about">
                    <h3>Hello from Tutu!</h3>
                </MatchRoute>
            </div>
            <Suspense>
                <TanStackRouterDevtools />
            </Suspense>
        </>;
    }
});