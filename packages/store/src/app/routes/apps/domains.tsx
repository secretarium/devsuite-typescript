import { FC } from 'react';
import { useParams } from 'react-router-dom';
import { UilCheckCircle, UilGlobe, UilSpinner, UilTimesCircle, UilTrash } from '@iconscout/react-unicons';
import api, { httpApi } from '../../utils/api';
import { Domain } from '@prisma/client';

export const DomainListing: FC = () => {

    const { appId } = useParams();
    const { data: domainsList, isLoading } = api.v0.domains.getByApplication.useQuery({ appId: appId || '' });

    const validateDomain = (domainId: Domain['id']) => {
        httpApi.v0.domains.validateDomain.query({
            domainId
        });
    };

    if (isLoading || !domainsList)
        return <>
            We are fetching data about your domains.<br />
            It will only take a moment...<br />
            <br />
            <UilSpinner className='inline-block animate-spin' />
        </>;

    return <table className="w-full text-left">
        <thead>
            <tr className="text-gray-400">
                <th className="font-normal px-3 pt-0 pb-3 border-b border-gray-200 dark:border-gray-800 hidden md:table-cell"></th>
                <th className="font-normal px-3 pt-0 pb-3 border-b border-gray-200 dark:border-gray-800">Domain</th>
                <th className="font-normal px-3 pt-0 pb-3 border-b border-gray-200 dark:border-gray-800">Status</th>
                <th className="font-normal px-3 pt-0 pb-3 border-b border-gray-200 dark:border-gray-800 hidden md:table-cell">Last update</th>
                <th className="font-normal px-3 pt-0 pb-3 border-b border-gray-200 dark:border-gray-800 sm:text-gray-400 text-white text-right">Action</th>
            </tr>
        </thead>
        <tbody className="text-gray-600 dark:text-gray-100">
            {domainsList.map(({ id, fqdn, verified, updatedAt }) => {
                return <tr key={id}>
                    <td className="sm:p-3 py-2 px-1 border-b border-gray-200 dark:border-gray-800 md:table-cell hidden">
                        <div className="flex items-center">
                            <UilGlobe className='inline-block h-full' />
                        </div>
                    </td>
                    <td className="sm:p-3 py-2 px-1 border-b border-gray-200 dark:border-gray-800">{fqdn}</td>
                    <td className={`sm:p-3 py-2 px-1 border-b border-gray-200 dark:border-gray-800 ${verified ? 'text-green-500' : 'text-red-500'}`}>{verified ? <UilCheckCircle /> : <UilTimesCircle />}</td>
                    <td className="sm:p-3 py-2 px-1 border-b border-gray-200 dark:border-gray-800 md:table-cell hidden">
                        <div className="flex items-center">
                            <div className="sm:flex hidden flex-col">
                                {updatedAt.toDateString()}
                                <div className="text-gray-400 text-xs">{updatedAt.toTimeString()}</div>
                            </div>
                        </div>
                    </td>
                    <td className="sm:p-3 py-2 px-1 border-b border-gray-200 dark:border-gray-800 text-right">
                        <button className="h-8 inline-flex items-center justify-center font-normal text-gray-400 ml-auto" onClick={() => validateDomain(id)}>
                            Revalidate
                        </button>
                        &nbsp;&nbsp;
                        <button title='Delete' className="h-8 inline-flex items-center justify-center font-normal text-red-400 mt-auto" onClick={() => validateDomain(id)}>
                            <UilTrash className='inline-block h-full' />
                        </button>
                    </td>
                </tr>;
            })}
        </tbody>
    </table >;
};

export default DomainListing;