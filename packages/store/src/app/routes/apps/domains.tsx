import { FC, useState } from 'react';
import { useParams } from 'react-router-dom';
import { UilCheckCircle, UilGlobe, UilPlus, UilSpinner, UilTimesCircle, UilTrash } from '@iconscout/react-unicons';
import api from '../../utils/api';
import { Domain } from '@prisma/client';
import { useZodForm } from '../../utils/useZodForm';
import z from 'zod';
import { formatTimeAgo } from '../../utils/formatTimeAgo';

type DomainRecordProps = {
    domain: Domain
}

const DomainRecord: FC<DomainRecordProps> = ({ domain: { id, fqdn, verified, updatedAt } }) => {

    const utils = api.useContext().v0.domains;
    const mutation = api.v0.domains.validate.useMutation({
        onSuccess: async () => {
            await utils.getByApplication.invalidate();
        }
    });

    const validate = async (domainId: Domain['id']) => {
        await mutation.mutateAsync({ domainId });
    };

    return <tr>
        <td className="sm:p-3 py-2 px-1 border-b border-gray-200 dark:border-gray-800 md:table-cell hidden">
            <div className="flex items-center">
                <UilGlobe className='inline-block h-5' />
            </div>
        </td>
        <td className="sm:p-3 py-2 px-1 border-b border-gray-200 dark:border-gray-800">{fqdn}</td>
        <td className={`sm:p-3 py-2 px-1 border-b border-gray-200 dark:border-gray-800 ${verified ? 'text-green-500' : 'text-red-500'}`}>{verified ? <UilCheckCircle className='h-5' /> : <UilTimesCircle className='h-5' />}</td>
        <td className="sm:p-3 py-2 px-1 border-b border-gray-200 dark:border-gray-800 md:table-cell hidden">
            <div className="flex items-center">
                <div className="sm:flex hidden flex-col" title={updatedAt.toDateString()}>
                    {formatTimeAgo(updatedAt)}
                    <div className="text-gray-400 text-xs">{updatedAt.toUTCString()}</div>
                </div>
            </div>
        </td>
        <td className="sm:p-3 py-2 px-1 border-b border-gray-200 dark:border-gray-800 text-right">
            <div className='flex align-middle'>
                <button className="h-8 inline-flex items-center justify-center font-normal text-gray-400 ml-auto" onClick={() => validate(id)}>
                    {mutation.isLoading ? <UilSpinner className='inline-block animate-spin h-4' /> : 'Revalidate'}
                </button>
                &nbsp;&nbsp;
                <button title='Delete' className="h-8 inline-flex items-center justify-center font-normal text-red-400 mt-auto" onClick={() => validate(id)}>
                    <UilTrash className='inline-block h-full' />
                </button>
            </div>
        </td>
    </tr>;
};

type DomainAddBoxProps = {
    onClose(): void
}

const DomainAddBox: FC<DomainAddBoxProps> = ({ onClose }) => {

    const utils = api.useContext().v0.domains;
    const mutation = api.v0.domains.add.useMutation({
        onSuccess: async () => {
            await utils.getByApplication.invalidate();
        }
    });

    const methods = useZodForm({
        schema: z.object({
            fqdn: z.string()
        })
    });

    return <form
        onSubmit={methods.handleSubmit(async (data) => {
            await mutation.mutateAsync(data);
            methods.reset();
        })}
        className="space-y-2"
    >
        <div>
            <label>
                Domain name
                <br />
                <input {...methods.register('fqdn')} className="border w-full" />
            </label>
            {methods.formState.errors.fqdn?.message && (
                <p className="text-red-700">
                    {methods.formState.errors.fqdn?.message}
                </p>
            )}
        </div>

        <button
            type="submit"
            disabled={mutation.isLoading}
            className="border bg-primary-500 p-2"
        >
            {mutation.isLoading ? 'Loading' : 'Submit'}
        </button>
        &nbsp;&nbsp;&nbsp;
        <button
            type="reset"
            onClick={onClose}
            className="border bg-primary-500 p-2"
        >
            Cancel
        </button>
    </form>;
};

export const DomainListing: FC = () => {

    const { appId } = useParams();
    const { data: domainsList, isLoading } = api.v0.domains.getByApplication.useQuery({ appId: appId || '' });
    const [addingDomain, setAddingDomain] = useState(false);

    if (isLoading || !domainsList)
        return <>
            We are fetching data about your domains.<br />
            It will only take a moment...<br />
            <br />
            <UilSpinner className='inline-block animate-spin' />
        </>;

    return <>
        <div className="flex flex-col w-full items-center mb-7">
            <div className='w-full mb-5'>
                <button onClick={() => setAddingDomain(true)} className="inline-flex mr-3 items-center h-8 pl-2.5 pr-2 rounded-md shadow text-white dark:text-gray-300 bg-blue-500 hover:bg-blue-400 dark:bg-blue-900 dark:hover:bg-blue-800 dark:border-gray-800 border border-gray-200 leading-none py-0">
                    <UilPlus className='inline-block h-5 text-white dark:text-gray-300' />Add a domain
                </button>
            </div>
            {addingDomain ?
                <div className='w-full'>
                    <DomainAddBox onClose={() => setAddingDomain(false)} />
                </div> : null}
        </div>
        <table className="w-full text-left">
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
                {domainsList.map(domain => <DomainRecord key={domain.id} domain={domain} />)}
            </tbody>
        </table>
    </>;
};

export default DomainListing;