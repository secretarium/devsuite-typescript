import { FC, useState, useEffect } from 'react';
import { LoaderFunction, useLoaderData, useNavigate } from 'react-router-dom';
import qs from 'query-string';

export const loader: LoaderFunction = async ({ request }) => {
    const { search } = new URL(request.url);
    const queryParams = qs.parse(search);
    const { code, state } = queryParams;
    let data = null;
    if (code) {
        const response = await fetch(`/api/log_in_github?code=${code}&state=${state}&redirect_uri=${encodeURIComponent('http://localhost:4220/auth')}`, {
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            }
        });
        data = await response.json();
    }
    return { data, state, queryParams };
};

export const Index: FC = () => {

    const navigate = useNavigate();
    const [hasRedirected, setHasRedirected] = useState(false);
    const { data, state, queryParams }: { data: any, state: string, queryParams?: qs.ParsedQuery<string> } = useLoaderData() as any;
    const { redirect_uri }: { redirect_uri: string } = state ? JSON.parse(state) : {};

    useEffect(() => {
        if (!hasRedirected && redirect_uri) {
            console.log(redirect_uri);
            setHasRedirected(true);
            navigate(redirect_uri);
        }
    }, [hasRedirected, navigate, redirect_uri]);

    return <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="pt-12 pb-12 md:pt-20 md:pb-20">
            <div className="text-center pb-12 md:pb-16">
                <br />
                <div>
                    <h1 className='text-xl font-bold'>Looking for you...</h1>
                </div>
                <div>
                    Please be patient while we are gathering your Git info...
                </div>
                <div className='text-left w-1/2 mx-auto' >
                    <pre>{JSON.stringify(data, null, 4)}</pre>
                    <pre>{JSON.stringify(queryParams, null, 4)}</pre>
                </div>
            </div>
        </div>
    </div>;
};

export default Index;