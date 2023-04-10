import { FC } from 'react';
import { useParams } from 'react-router-dom';
import { UilSpinner } from '@iconscout/react-unicons';
import api from '../../utils/api';
import { formatTimeAgo } from '../../utils/formatTimeAgo';
import { DeploymentPromotion, DeploymentDeletion } from './deployments';
import RunCommand from '../../components/RunCommand';

export const AppDeploymentDetail: FC = () => {

    const { deploymentId } = useParams();
    const { data: deployment, isLoading: isLoadingDeployments } = api.v0.deployments.getById.useQuery({ deploymentId: deploymentId || '' }, {
        refetchInterval: 5000
    });

    if (isLoadingDeployments || !deployment)
        return <>
            We are fetching data about your deployment.<br />
            It will only take a moment...<br />
            <br />
            <UilSpinner className='inline-block animate-spin' />
        </>;


    const { id, createdAt, life, status, version, build } = deployment;

    return <div className="flex flex-col w-full mb-7">
        <div className="flex w-full justify-between">
            <div className='mb-10'>
                <h2 className='font-bold mb-3'>Addresses of the trustless application</h2>
                <span className='font-mono inline-block rounded dark:text-slate-400 dark:bg-slate-800 text-slate-900 bg-slate-100 px-2 py-1 mb-1 whitespace-nowrap'>{id.split('-').pop()}.sta.klave.network</span><br />
                <span className={`rounded inline-block text-xs px-1 py-0 mr-2 text-white ${life === 'long' ? 'bg-green-600' : 'bg-slate-500'}`}>{life === 'long' ? 'Production' : 'Preview'}</span>
                <span className={`rounded inline-block text-xs px-1 py-0 text-white ${status === 'errored' ? 'bg-red-700' : status === 'deployed' ? 'bg-blue-500' : 'bg-stone-300'}`}>{status}</span>
            </div>
            <div className='mb-10'>
                <h2 className='font-bold mb-3'>Version</h2>
                <div className="flex items-center">
                    <div className="sm:flex hidden flex-col">
                        <span className='block'>{version ?? '-'}</span>
                        {build ? <span className={'block text-xs text-slate-500'}>{build}</span> : null}
                    </div>
                </div>
            </div>
            <div className='mb-10'>
                <h2 className='font-bold mb-3'>Creation time</h2>
                <div className="flex items-center">
                    <div className="sm:flex hidden flex-col">
                        <span className='block' title={createdAt.toDateString()}>{formatTimeAgo(createdAt)}</span>
                        {life === 'short' ? <span className={'block text-xs text-slate-500'}>Expires {formatTimeAgo(new Date(createdAt.getTime() + 1000 * 60 * 60 * 24 * 15))}</span> : <span></span>}
                    </div>
                </div>
            </div>
        </div>
        <div className='mb-10'>
            {status === 'deployed' && life !== 'long' ? <>
                <DeploymentPromotion deployment={deployment} />
                &nbsp;&nbsp;
            </> : null}
            <DeploymentDeletion deployment={deployment} />
        </div>
        <div>
            <RunCommand address={`${id.split('-').pop()}.sta.klave.network`} />
        </div>
    </div >;
};

export default AppDeploymentDetail;