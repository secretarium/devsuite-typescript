import { PropsWithChildren } from 'react';
import { Router } from './Router';

export const Providers: React.FC<PropsWithChildren<unknown>> = () => {
    return <Router />;
};

export default Providers;
