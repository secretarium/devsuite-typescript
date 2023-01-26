import { FC } from 'react';
import { Link } from 'react-router-dom';
import { UilSpinner } from '@iconscout/react-unicons';
import api, { httpApi } from '../../utils/api';
import { Domain } from '@prisma/client';

export const DomainListing: FC = () => {

    const { data: domainsList, isLoading } = api.v0.domains.getAll.useQuery();

    const validateDomain = (domainId: Domain['id']) => {
        httpApi.v0.domains.validateDomain.query({
            domainId
        });
    };

    if (isLoading || !domainsList)
        return <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <div className="pt-12 pb-12 md:pt-20 md:pb-20">
                <div className="text-center pb-12 md:pb-16">
                    <br />
                    <div className='pb-5' >
                        <h1 className='text-xl font-bold'>{isLoading ? 'Looking for your domains' : 'We could not find your domains'}</h1>
                    </div>
                    <div className='relative'>
                        {isLoading ? <>
                            We are fetch data about your domains.<br />
                            It will only take a moment...<br />
                            <br />
                            <UilSpinner className='inline-block animate-spin' />
                        </> : <>
                            We looked hard but could not find any domains.<br />
                            Head over to the apps page to try again<br />
                            <br />
                            <Link to="/apps" className='button-like disabled:text-gray-300'>Go to apps</Link>
                        </>}
                    </div>
                </div>
            </div>
        </div>;

    return <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="pt-12 pb-12 md:pt-20 md:pb-20">
            <div className="text-center pb-12 md:pb-16">
                <br />
                <div className='pb-5' >
                    <h1 className='text-xl font-bold'>Domains</h1>
                </div>
                <div className='relative'>
                    We found {domainsList.length ?? 0} registered domains.<br />
                    <br />
                    {domainsList.map(({ id, fqdn, verified }) => {
                        return <div key={id} onClick={() => validateDomain(id)}>{verified ? '✅' : '⛔'} {fqdn}</div>;
                    })}
                </div>
            </div>
        </div>
    </div >;
};

export default DomainListing;