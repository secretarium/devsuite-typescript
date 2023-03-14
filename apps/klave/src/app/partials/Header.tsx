import { useState, useEffect, FC } from 'react';
import { Link, useLocation } from 'react-router-dom';
import api from '../utils/api';
import klaveLogo from '../images/klave-logo.svg';
import { UilBox } from '@iconscout/react-unicons';

const Header: FC = () => {

    const { pathname } = useLocation();
    const [top, setTop] = useState(true);
    const { data } = api.v0.auth.getSession.useQuery();

    // detect whether user has scrolled the page down by 10px
    useEffect(() => {
        const scrollHandler = () => {
            window.pageYOffset > 10 ? setTop(false) : setTop(true);
        };
        window.addEventListener('scroll', scrollHandler);
        return () => window.removeEventListener('scroll', scrollHandler);
    }, [top]);

    return (
        <header className={`fixed w-full z-30 md:bg-opacity-90 transition duration-300 ease-in-out ${!top && 'bg-white dark:bg-gray-900 backdrop-blur-sm shadow-lg'}`}>
            {data?.hasUnclaimedApplications ? <div className='text-white bg-red-500'>
                <div className="max-w-6xl mx-auto py-3 text-center ">
                    You have deployed a trustless app but are not logged in !<br />
                    You must sign in in order to save your work !
                </div>
            </div> : null}
            <div className="max-w-6xl mx-auto px-5 sm:px-6 dark:invert">
                <div className="flex items-center justify-between h-16 md:h-20">

                    {/* Site branding */}
                    <div className="flex-shrink-0 mr-4">
                        {/* Logo */}
                        <Link to={pathname === '/' && (data && (data.hasUnclaimedApplications || data.me)) ? '/home' : '/'} className="block ml-0" aria-label="Secretarium Platform">
                            <img alt='Secretarium' src={klaveLogo} width={40} className='inline-block' />
                            <span className='h-full px-6 font-bold text-lg'>
                                The Klave Network
                            </span>
                        </Link>
                    </div>

                    {/* Site navigation */}
                    <nav className="flex flex-grow">
                        <ul className="flex flex-grow justify-end flex-wrap items-center">
                            <li>
                                <Link to="/blocks" className="btn-sm text-gray-900 bg-gray-200 hover:bg-gray-300 ml-3 a-like">
                                    <span><UilBox className='inline-block h-5 font-normal' /> Klave Blocks</span>
                                </Link>
                            </li>
                            <li>
                                <Link to="/deploy" className="btn-sm text-gray-900 bg-gray-200 hover:bg-gray-300 ml-3 a-like">
                                    <span>Deploy now</span>
                                </Link>
                            </li>
                            <li>
                                <Link to="/login" className="btn-sm text-gray-200 bg-gray-900 hover:bg-gray-800 ml-3 a-like">
                                    <span>{data?.hasUnclaimedApplications ? 'Claim my work' : 'Sign in'}</span>
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
