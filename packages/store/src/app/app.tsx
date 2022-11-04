import { PropsWithChildren } from 'react';
import { Providers } from './Providers';

export const App: React.FC<PropsWithChildren<unknown>> = () => {
    return <Providers />;
};

export default App;
