import { FC } from 'react';
import { Link, NavLink, Outlet } from '@remix-run/react';
import { Globe, Grid, HelpCircle, Home, Icon, Layers, LogOut, Settings, Users } from 'react-feather';
import classNames from 'classnames';
import gravatar from 'gravatar';
import { useOptionalUser } from '~/utils';
import Logo from './Logo';

type MainMenuButtonProps = {
    icon: Icon;
    title: string;
    to: string;
}

const MainMenuButton: FC<MainMenuButtonProps> = ({ icon, title, to }) => {
    const Icon = icon;
    return <NavLink to={to} className={({ isActive }) => classNames('flex items-center pl-3 py-3 pr-4 text-gray-50 rounded overflow-hidden', { 'bg-indigo-500 hover:bg-indigo-400': isActive, 'hover:bg-gray-900': !isActive })}>
        {({ isActive }) => <>
            <span className="inline-block mr-3">
                <Icon className={classNames({ 'text-gray-600': !isActive })} />
            </span>
            <span>{title}</span>
            {/*
            <span className="flex justify-center items-center ml-auto bg-indigo-500 w-6 h-6 text-xs rounded-full">4</span>
            <span className="inline-block ml-auto">
                <ChevronDown className='w-5 h-5' />
            </span>
            */}
        </>}
    </NavLink>;
};

export default () => {

    const user = useOptionalUser();

    return <div className="antialiased w-full h-full flex flex-col content-center">
        <header className='flex z-50 w-full bg-slate-100 items-start px-6'>
            <Link to="/" className='h-full mr-6'>
                <Logo />
            </Link>
            <div className="grow flex items-center h-full p-6">
                <div className="flex items-center mr-auto">
                    {/* <button className="flex items-center text-sm hover:text-gray-800">
                        <Home className='text-indigo-500 p-1' /><span>Start</span>
                    </button>
                    <ChevronRight className='text-indigo-500 p-1 mx-1' />
                    <button className="flex items-center text-sm hover:text-gray-800">
                        <List className='text-indigo-500 p-1' /><span>Main Tasks</span>
                    </button> */}
                </div>
                {/* <ul className="flex items-center space-x-6 mr-6">
                    <li>
                        <button title='Search' className="text-gray-300 hover:text-gray-400">
                            <Search />
                        </button>
                    </li>
                    <li>
                        <button title='Notifications' className="text-gray-300 hover:text-gray-400">
                            <Bell />
                        </button>
                    </li>
                </ul> */}
                <div className="block">
                    <Link to="/account" className="flex items-center text-right">
                        <div className="mr-3">
                            <p className="text-sm">{user?.email}</p>
                            <p className="text-sm text-gray-500">Developer</p>
                        </div>
                        <div className="mr-2">
                            <img className="w-10 h-10 rounded-full object-cover object-right" src={gravatar.url(`${user?.email}`, { default: 'identicon', size: '80' })} alt="" />
                        </div>
                        {/* <span>
                            <ChevronDown className='text-gray-400' />
                        </span> */}
                    </Link>
                </div>
            </div>
        </header>
        <div className="grow flex flex-row">
            <nav className="flex flex-col w-80 sm:max-w-xs pt-6 pb-8 bg-gray-800 overflow-y-auto">
                <div className="px-4 pb-6">
                    <h3 className="mb-2 text-xs uppercase text-gray-500 font-medium">Projects</h3>
                    <ul className="mb-8 text-sm font-medium">
                        <li><MainMenuButton icon={Home} title="Dashboard" to="/" /></li>
                        <li><MainMenuButton icon={Globe} title="Projects" to="/projects" /></li>
                        <li><MainMenuButton icon={Grid} title="Organisations" to="/organisations" /></li>
                        <li><MainMenuButton icon={Users} title="Users" to="/users" /></li>
                        <li><MainMenuButton icon={Layers} title="Applications" to="/applications" /></li>
                    </ul>
                    <h3 className="mb-2 text-xs uppercase text-gray-500 font-medium">Other</h3>
                    <ul className="text-sm font-medium">
                        <li><MainMenuButton icon={HelpCircle} title="Support Center" to="/help" /></li>
                        <li><MainMenuButton icon={Settings} title="Settings" to="/settings" /></li>
                        <li><MainMenuButton icon={LogOut} title="Log Out" to="/logout" /></li>
                    </ul>
                </div>
            </nav>
            <main className='grow px-6 py-8'>
                <Outlet />
            </main>
        </div >
    </div >;
};