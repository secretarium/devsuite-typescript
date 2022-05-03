import { PropsWithChildren } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { RecoilRoot } from 'recoil';
import { SecretariumConnector } from '@secretarium/connector';
import { SecretariumProvider } from '@secretarium/react';

const connector = new SecretariumConnector({
    connections: {
        url: 'wss://swisscom-ch-zhh-2288-8.node.secretarium.org:443',
        trustKey: 'rliD_CISqPEeYKbWYdwa-L-8oytAPvdGmbLC0KdvsH-OVMraarm1eo-q4fte0cWJ7-kmsq8wekFIJK0a83_yCg=='
    }
});

export const Providers: React.FC<PropsWithChildren<unknown>> = ({ children }) => {
    return <RecoilRoot>
        <BrowserRouter>
            <SecretariumProvider connector={connector}>
                {children}
            </SecretariumProvider>
        </BrowserRouter>
    </RecoilRoot>;
};

export default Providers;
