import { useRouteError } from 'react-router-dom';
import Header from './partials/Header';
import Footer from './partials/Footer';

export const ErrorPage = () => {
    const error: any = useRouteError();
    console.error(error);

    return <div className="flex flex-col min-h-screen overflow-hidden">

        {/*  Site header */}
        <Header />

        {/*  Page content */}
        <main className="flex-grow pt-24">
            <div id="error-page">
                <div className="max-w-6xl mx-auto px-4 sm:px-6">
                    <div className="pt-12 pb-12 md:pt-20 md:pb-20">
                        <div className="text-center pb-12 md:pb-16">
                            <br />
                            <div className='pb-5' >
                                <h1 className='text-xl font-bold'>Oops!</h1>
                            </div>
                            <div className='relative h-[300px]'>
                                <p>Sorry, an unexpected error has occurred.</p>
                                <p>
                                    <i>{error.statusText || error.message}</i>
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </main>

        <Footer />
    </div>;
};

export default ErrorPage;