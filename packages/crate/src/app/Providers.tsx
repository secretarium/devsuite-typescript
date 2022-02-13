import { BrowserRouter } from 'react-router-dom';
import { RecoilRoot } from 'recoil';
import { SecretariumConnector } from '@secretarium/connector';
import { SecretariumProvider } from '@secretarium/react';

const connector = new SecretariumConnector({
    connections: process.env['NX_SECRETARIUM_GATEWAYS']
});

export const Providers: React.FC = ({ children }) => {
    return <RecoilRoot>
        <BrowserRouter>
            <SecretariumProvider connector={connector}>
                {children}
            </SecretariumProvider>
        </BrowserRouter>
    </RecoilRoot>;
};

export default Providers;
