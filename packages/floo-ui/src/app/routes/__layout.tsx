import { Link } from '@remix-run/react';
import Dashboard from '~/components/Dashboard';
import Logo from '~/components/Logo';

import { useOptionalUser } from '~/utils';

export function CatchBoundary() {
    return (
        <div>
            <h2>We couldn't find that page!</h2>
        </div>
    );
}

export default function Index() {
    const user = useOptionalUser();

    if (user)
        return <Dashboard />;

    return (
        <main className="flex min-h-full flex-col justify-center">
            <div className="mx-auto w-full max-w-md px-8">
                <Link to="/">
                    <Logo />
                </Link>
                <h1 className="text-center tracking-tight sm:text-2xl lg:text-3xl">
                    <span className="block">
                        Secretarium Store ...
                    </span>
                </h1>
                <p className="mt-4 mb-6 text-center justify-center">
                    Welcome to the Secretarium Store.<br />
                    From here you can access your secure application's source code, control permissions and manage their deployement.
                </p>
                <div className="mx-auto mt-10 max-w-sm sm:flex sm:max-w-none sm:justify-center">
                    <div className="space-y-4 sm:mx-auto sm:inline-grid sm:grid-cols-2 sm:gap-5 sm:space-y-0">
                        <Link
                            to="/join"
                            className="w-full text-center rounded bg-white py-2 px-4 hover:decoration-transparent"
                        >
                            Sign up
                        </Link>
                        <Link
                            to="/login"
                            className="w-full  text-center rounded bg-blue-500 py-2 px-4 text-white hover:text-white hover:decoration-transparent hover:bg-blue-600 focus:bg-blue-400"
                        >
                            Log In
                        </Link>
                    </div>
                </div>
            </div>
        </main>
    );
}
