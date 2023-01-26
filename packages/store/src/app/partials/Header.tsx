import { useState, useEffect, FC } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';

const Header: FC = () => {

    const [top, setTop] = useState(true);
    const { data } = api.v0.auth.getSession.useQuery();
    const shouldDisplayEphemeralAlert = data && data.session.unclaimedApplications?.length && !data.user;

    // detect whether user has scrolled the page down by 10px
    useEffect(() => {
        const scrollHandler = () => {
            window.pageYOffset > 10 ? setTop(false) : setTop(true);
        };
        window.addEventListener('scroll', scrollHandler);
        return () => window.removeEventListener('scroll', scrollHandler);
    }, [top]);

    return (
        <header className={`fixed w-full z-30 md:bg-opacity-90 transition duration-300 ease-in-out ${!top && 'bg-white backdrop-blur-sm shadow-lg'}`}>
            {shouldDisplayEphemeralAlert ? <div className="max-w-6xl mx-auto py-3 text-center text-white bg-red-500">
                You have deployed a trustless app but are not logged in !<br />
                You must sign in in order to save your work !
            </div> : null}
            <div className="max-w-6xl mx-auto px-5 sm:px-6">
                <div className="flex items-center justify-between h-16 md:h-20">

                    {/* Site branding */}
                    <div className="flex-shrink-0 mr-4">
                        {/* Logo */}
                        <Link to="/" className="block" aria-label="Secretarium Platform">
                            <svg className="w-8 h-8" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
                                <defs>
                                    <radialGradient cx="21.152%" cy="86.063%" fx="21.152%" fy="86.063%" r="79.941%" id="header-logo">
                                        <stop stopColor="#4FD1C5" offset="0%" />
                                        <stop stopColor="#81E6D9" offset="25.871%" />
                                        <stop stopColor="#338CF5" offset="100%" />
                                    </radialGradient>
                                </defs>
                                <rect width="32" height="32" rx="16" fill="url(#header-logo)" fillRule="nonzero" />
                            </svg>
                        </Link>
                    </div>

                    {/* Site navigation */}
                    <nav className="flex flex-grow">
                        <ul className="flex flex-grow justify-end flex-wrap items-center">
                            <li>
                                <Link to="/store" className="btn-sm text-gray-900 bg-gray-200 hover:bg-gray-300 ml-3">
                                    <span>Store</span>
                                </Link>
                            </li>
                            <li>
                                <Link to="/deploy" className="btn-sm text-gray-900 bg-gray-200 hover:bg-gray-300 ml-3">
                                    <span>Deploy now</span>
                                </Link>
                            </li>
                            <li>
                                <Link to="/login" className="btn-sm text-gray-200 bg-gray-900 hover:bg-gray-800 ml-3">
                                    <span>Sign in</span>
                                    <svg className="w-3 h-3 fill-current text-gray-400 flex-shrink-0 ml-2 -mr-1" viewBox="0 0 12 12" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M11.707 5.293L7 .586 5.586 2l3 3H0v2h8.586l-3 3L7 11.414l4.707-4.707a1 1 0 000-1.414z" fillRule="nonzero" />
                                    </svg>
                                </Link>
                            </li>
                        </ul>

                    </nav>

                </div>
            </div>
        </header>
    );
};

export default Header;
