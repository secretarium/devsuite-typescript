import { Suspense } from 'react';
import { Await, useLoaderData, useOutlet } from 'react-router-dom';
import { AuthProvider } from './AuthProvider';
import Header from './partials/Header';
import Footer from './partials/Footer';

export const AuthLayout = () => {
    const outlet = useOutlet();
    const { userPromise } = useLoaderData() as { userPromise: any };

    return (
        <Suspense fallback={<div className="flex flex-col min-h-screen overflow-hidden">
            <Header />
            <main className="flex-grow">
                <div id="error-page">
                    <div className="max-w-6xl mx-auto px-4 sm:px-6">
                        <div className="pt-12 pb-12 md:pt-20 md:pb-20">
                            <div className="text-center pb-12 md:pb-16">
                                <br />
                                <div className='pb-5' >
                                    <h1 className='text-xl font-bold'>Loading...</h1>
                                </div>
                                <div className='relative h-[300px]'>
                                    <p>Give us one moment</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
            <Footer />
        </div>}>
            <Await
                resolve={userPromise}
                errorElement={<div className="flex flex-col min-h-screen overflow-hidden">
                    <Header />
                    <main className="flex-grow">
                        <div id="error-page">
                            <div className="max-w-6xl mx-auto px-4 sm:px-6">
                                <div className="pt-12 pb-12 md:pt-20 md:pb-20">
                                    <div className="text-center pb-12 md:pb-16">
                                        <br />
                                        <div className='pb-5' >
                                            <h1 className='text-xl font-bold'>Oops!</h1>
                                        </div>
                                        <div className='relative h-[300px]'>
                                            <p>Something went wrong!</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </main>
                    <Footer />
                </div>
                }
                children={(user) =>
                    <AuthProvider userData={user}>
                        <div className="flex flex-col min-h-screen overflow-hidden">
                            <Header />
                            <main className="flex-grow">
                                {outlet}
                            </main>
                            <Footer />

                        </div>
                    </AuthProvider>
                }
            />
        </Suspense>
    );
};