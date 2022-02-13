// import { Link } from 'react-router-dom';
import { CachePolicies, useConnector, useQuery } from '@secretarium/react';
import { useRecoilValue } from 'recoil';

import { authAtom } from '../_state';

export const Home = () => {

    const auth = useRecoilValue(authAtom);
    const connector = useConnector();
    const [dataA, loadingA, errorA] = useQuery({
        app: 'sfx',
        route: 'version'
    }, {
        cachePolicy: CachePolicies.CACHE_AND_NETWORK
    }, [connector]);

    // const { data, loading, error } = useQuery({
    //     app: 'sfx',
    //     route: 'version'
    // }, {}, []);

    return (
        <div className="p-4">
            <div className="container">
                <h1>Hi {auth?.firstName}!</h1>
                <p>You're using Secretarium Connector v{connector?.version} ({connector?.isConnected ? 'connected' : 'disconnected'})</p>
                {/* <p>Map: The version of SFX is {loading ? 'loading' : error ? `unknown with error: ${error}` : `v${data}`} </p> */}
                <p>Arr: The version of SFX is {loadingA ? 'loading' : errorA ? `unknown with error: ${errorA}` : `v${dataA}`} </p>
                {/* <p><Link to="/users">Manage Users</Link></p> */}
            </div>
        </div>
    );
};

export default Home;