import { FC } from 'react';
import { LoaderFunction, useLoaderData } from 'react-router-dom';
import qs from 'query-string';

export const loader: LoaderFunction = async ({ request }) => {
    const { search } = new URL(request.url);
    const queryParams = qs.parse(search);
    const response = await fetch(`/api/get_token?code=${queryParams['code']}&redirect_uri=${encodeURIComponent('http://localhost:4022/auth')}`, {
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        }
    });
    const data = await response.json();
    return { data, queryParams };
};

export const Index: FC = () => {
    const { data, queryParams }: { data: any, queryParams?: qs.ParsedQuery<string> } = useLoaderData() as any;

    return <>
        <p id="zero-state">
            Please be patient while we are gathering your Git info...
        </p>
        <pre>{JSON.stringify(data, null, 4)}</pre>
        <pre>{JSON.stringify(queryParams, null, 4)}</pre>
    </>;
};

export default Index;