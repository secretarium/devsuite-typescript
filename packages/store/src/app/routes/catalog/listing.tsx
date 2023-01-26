import { FC, useState } from 'react';
import { Link } from 'react-router-dom';
import { UilSpinner } from '@iconscout/react-unicons';
import api from '../../utils/api';

export const Select: FC = () => {

    const [shouldRefresh, setShouldRefresh] = useState(false);
    const { data: deployables, isLoading, refetch } = api.v0.repos.deployables.useQuery({ refreshing: shouldRefresh }, {
        queryKey: ['v0.repos.deployables', { refreshing: shouldRefresh }],
        cacheTime: 0,
        retry: false,
        refetchOnWindowFocus: false,
        refetchOnMount: false
    });

    const rescanRepos = () => {
        if (shouldRefresh)
            refetch();
        else
            setShouldRefresh(true);
    };

    return <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="pt-12 pb-12 md:pt-20 md:pb-20">
            <div className="text-center pb-12 md:pb-16">
                <br />
                <div className='pb-5' >
                    <h1 className='text-xl font-bold'>{isLoading ? 'Looking for your best work' : deployables?.length ? 'We found some gems' : 'Nothing to see'}</h1>
                </div>
                <div className='relative'>
                    {isLoading ? <>
                        We are looking for repositories you can deploy on the Trustless network.<br />
                        It will only take a moment...<br />
                        <br />
                        <UilSpinner className='inline-block animate-spin' />
                    </> : deployables?.length ? <>
                        Here are the repositories we found could be deployed.<br />
                        Select one to continue...<br />
                        <br />
                        {deployables.map((repo) => {
                            const fullName = `${repo.owner}/${repo.name}`;
                            return <Link to={`/deploy/repo/${fullName}`} key={fullName} className='rounded-full bg-slate-200 hover:bg-slate-300'>{fullName}</Link>;
                        })}
                        <br />
                        <br />
                        <br />
                        Not finding what you are looking for ?<br />
                        Try rescanning your repositories.
                        <br />
                        <br />
                        <button disabled={isLoading} onClick={rescanRepos} className='disabled:text-gray-300'>Rescan</button>
                    </> : <>
                        We looked hard but could not find anyting to deploy.<br />
                        Perhaps try to rescan your repositories<br />
                        <br />
                        <button disabled={isLoading} onClick={rescanRepos} className='disabled:text-gray-300'>Rescan</button>
                    </>
                    }
                </div>
            </div>
        </div>
    </div>;
};

export default Select;