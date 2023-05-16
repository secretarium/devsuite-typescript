import { FC, useState } from 'react';
import { useParams } from 'react-router-dom';
import * as AlertDialog from '@radix-ui/react-alert-dialog';
import { UilCheckCircle, UilGlobe, UilPlus, UilSpinner, UilTimesCircle, UilTrash } from '@iconscout/react-unicons';
import api from '../../utils/api';
import { Domain } from '@prisma/client';
import { useZodForm } from '../../utils/useZodForm';
import z from 'zod';
import { formatTimeAgo } from '../../utils/formatTimeAgo';

type DomainContextProps = {
    domain: Domain
}

const DomainDeletion: FC<DomainContextProps> = ({ domain: { id } }) => {

    const utils = api.useContext().v0.domains;
    const mutation = api.v0.domains.delete.useMutation({
        onSuccess: async () => {
            await utils.getByApplication.invalidate();
            await utils.getAll.invalidate();
        }
    });

    const deleteDomain = async (domainId: Domain['id']) => {
        await mutation.mutateAsync({ domainId });
    };

    return <AlertDialog.Root>
        <AlertDialog.Trigger asChild>
            <button title='Delete' className="h-8 inline-flex items-center justify-center font-normal text-red-400 mt-auto">
                <UilTrash className='inline-block h-full' />
            </button>
        </AlertDialog.Trigger>
        <AlertDialog.Portal>
            <AlertDialog.Overlay className="AlertDialogOverlay" />
            <AlertDialog.Content className="AlertDialogContent">
                <AlertDialog.Title className="AlertDialogTitle">Are you absolutely sure?</AlertDialog.Title>
                <AlertDialog.Description className="AlertDialogDescription">
                    This action cannot be undone. This will permanently delete this domain validation.
                </AlertDialog.Description>
                <div style={{ display: 'flex', gap: 25, justifyContent: 'flex-end' }}>
                    <AlertDialog.Cancel asChild>
                        <button className="Button">Cancel</button>
                    </AlertDialog.Cancel>
                    <AlertDialog.Action asChild>
                        <button className="Button bg-red-700 text-white" onClick={() => deleteDomain(id)}>Yes, delete domain</button>
                    </AlertDialog.Action>
                </div>
            </AlertDialog.Content>
        </AlertDialog.Portal>
    </AlertDialog.Root>;
};

type DomainRecordProps = {
    domain: Domain
}

const DomainRecord: FC<DomainRecordProps> = ({ domain }) => {

    const { id, fqdn, verified, updatedAt } = domain;
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
            <div className='flex flex-row flex-nowrap justify-end'>
                <button className="h-8 inline-flex items-center justify-center font-normal text-gray-400 ml-auto" onClick={() => validate(id)}>
                    {mutation.isLoading ? <UilSpinner className='inline-block animate-spin h-4' /> : 'Revalidate'}
                </button>
                &nbsp;&nbsp;
                <DomainDeletion domain={domain} />
            </div>
        </td>
    </tr>;
};

type DomainAddBoxProps = {
    onClose(): void
}

const DomainAddBox: FC<DomainAddBoxProps> = ({ onClose }) => {

    const { appId } = useParams();
    const utils = api.useContext().v0.domains;
    const createMutation = api.v0.domains.add.useMutation({
        onSuccess: async () => {
            await utils.getAll.invalidate();
            await utils.getByApplication.invalidate();
        }
    });

    const verifyMutation = api.v0.domains.validate.useMutation({
        onSuccess: async () => {
            await utils.getByApplication.invalidate();
        }
    });

    const validate = async (domainId: Domain['id']) => {
        await verifyMutation.mutateAsync({ domainId });
    };

    const methods = useZodForm({
        schema: z.object({
            fqdn: z.string()
        })
    });

    if (!appId)
        return null;

    if (createMutation.data)
        return <div>
            <div className='mb-4' onClick={() => navigator.clipboard.writeText(createMutation.data.token)}>
                <span className='block'>To verify ownership of the domain please create a TXT record for <b>.{createMutation.data.fqdn}</b> on your DNS.</span>
                <span className='block rounded-md font-mono cursor-pointer px-1 py-2 bg-slate-200 dark:bg-slate-800 border hover:border-slate-500'>{createMutation.data.token}</span>
            </div>
            <button
                type="submit"
                disabled={createMutation.isLoading}
                className="border bg-primary-500 p-2"
                onClick={() => validate(createMutation.data.id)}
            >
                {createMutation.isLoading ? 'Loading' : 'Verify'}
            </button>
            &nbsp;&nbsp;&nbsp;
            <button
                type="reset"
                onClick={onClose}
                className="border bg-primary-500 p-2"
            >
                Cancel
            </button>
        </div>;

    return <form
        onSubmit={methods.handleSubmit(async (data) => {
            await createMutation.mutateAsync({
                applicationId: appId,
                ...data
            });
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
            disabled={createMutation.isLoading}
            className="border bg-primary-500 p-2"
        >
            {createMutation.isLoading ? 'Loading' : 'Submit'}
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