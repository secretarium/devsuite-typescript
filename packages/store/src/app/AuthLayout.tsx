import { Suspense } from 'react';
import { Await, useLoaderData, useOutlet } from 'react-router-dom';
import { AuthProvider } from './AuthProvider';

export const AuthLayout = () => {
    const outlet = useOutlet();
    const { userPromise } = useLoaderData() as { userPromise: any };

    return (
        <Suspense fallback={<>Loading ...</>}>
            <Await
                resolve={userPromise}
                errorElement={<>Something went wrong!</>}
                children={(user) =>
                    <AuthProvider userData={user}>{outlet}</AuthProvider>
                }
            />
        </Suspense>
    );
};