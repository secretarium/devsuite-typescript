import { FC, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UilGithub, UilGitlab } from '@iconscout/react-unicons';
import { useAuth } from '../../AuthProvider';

export const Index: FC = () => {

    const { user } = useAuth();
    const navigate = useNavigate();
    const [hasRedirected, setHasRedirected] = useState(false);

    useEffect(() => {
        if (!hasRedirected && user.hasGithubToken) {
            setHasRedirected(true);
            navigate('/deploy/select');
        }
    }, [hasRedirected, navigate, user.hasGithubToken]);

    const state = JSON.stringify({
        source: 'github',
        redirectUri: '/deploy/select'
    });

    const githubAuth = new URL('https://github.com/login/oauth/authorize');
    githubAuth.searchParams.append('client_id', 'Iv1.6ff39dee83590f91');
    githubAuth.searchParams.append('scope', 'read:user,read:gpg_key,read:public_key,repo');
    githubAuth.searchParams.append('state', state);
    githubAuth.searchParams.append('redirect_uri', encodeURI('http://127.0.0.1:4220/auth'));

    const gitlabAuth = new URL('https://gitlab.com/oauth/authorize');
    githubAuth.searchParams.append('client_id', 'Iv1.6ff39dee83590f91');
    githubAuth.searchParams.append('response_type', 'code');
    githubAuth.searchParams.append('scope', 'read:user,read:gpg_key,read:public_key,repo');
    githubAuth.searchParams.append('state', state);
    githubAuth.searchParams.append('redirect_uri', encodeURI('http://127.0.0.1:4220/auth'));

    return <>
        <div className='pb-5'>
            <h1 className='text-xl font-bold'>Look for your code</h1>
        </div>
        <div className='relative h-[300px]'>
            <a href={githubAuth.toString()} className='a-like mb-3 rounded-full bg-black hover:bg-gray-900 text-white'><UilGithub color='white' />&nbsp;Connect to GitHub</a><br />
            <a href={gitlabAuth.toString()} className='a-like rounded-full bg-[#db7130] hover:bg-[#bb472d] text-white'><UilGitlab color='white' />&nbsp;Connect to GitHub</a>
        </div>
    </>;
};

export default Index;