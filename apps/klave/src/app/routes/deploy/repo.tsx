import { FC } from 'react';
import { useForm, FieldValues } from 'react-hook-form';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { UilSpinner, UilExclamationTriangle } from '@iconscout/react-unicons';
import api from '../../utils/api';

export const Select: FC = () => {

    const navigate = useNavigate();
    const repoInfo = useParams() as { owner: string, name: string };
    const { data: deployableRepo, isLoading } = api.v0.repos.getDeployableRepo.useQuery(repoInfo);
    const { mutate, isLoading: isTriggeringDeploy, isSuccess: hasTriggeredDeploy, error: mutationError } = api.v0.applications.register.useMutation({
        onSuccess: () => navigate('/')
    });
    const { register, handleSubmit, watch } = useForm<{ applications: string[] }>();
    let appSelectionWatch = watch('applications');
    appSelectionWatch = (Array.isArray(appSelectionWatch) ? appSelectionWatch : [appSelectionWatch]).filter(Boolean);

    if (isLoading || !deployableRepo)
        return <>
            <div className='pb-5' >
                <h1 className='text-xl font-bold'>{isLoading ? 'Getting to know your repo' : 'We could not find your repo'}</h1>
            </div>
            <div className='relative'>
                {isLoading ? <>
                    We are fetching data about your repository.<br />
                    It will only take a moment...<br />
                    <br />
                    <UilSpinner className='inline-block animate-spin' />
                </> : <>
                    We looked hard but could not find this repo.<br />
                    Head over to the deployment section to find one.<br />
                    <br />
                    <Link to="/deploy" className='button-like disabled:text-gray-300'>Go to deploy</Link>
                </>}
            </div>
        </>;

    const registerApplication = ({ applications }: FieldValues) => {
        if (hasTriggeredDeploy)
            return;
        applications = (Array.isArray(applications) ? applications : [applications]).filter(Boolean);
        mutate({
            deployableRepoId: deployableRepo.id,
            applications
        });
    };

    const state = JSON.stringify({
        referer: window.location.origin,
        source: 'github',
        redirectUri: `/deploy/repo/${repoInfo.owner}/${repoInfo.name}`,
        repoFullName: deployableRepo.fullName
    });

    const githubAppInstall = new URL('https://github.com/apps/klave-network/installations/new');
    githubAppInstall.searchParams.append('state', state);

    return <>
        <div className='pb-5' >
            <h1 className='text-xl font-bold'>{`${deployableRepo.owner} / ${deployableRepo.name}`}</h1>
        </div>
        {!deployableRepo.isAvailableToKlave
            ? <div className='bg-yellow-200 p-5 mb-10 w-full text-center text-yellow-800'>
                <UilExclamationTriangle className='inline-block mb-3' /><br />
                <span>This repository doesn&apos;t have the Klave Github App installed</span><br />
                <a href={githubAppInstall.toString()} type="submit" className='button-like mt-5 bg-yellow-800 text-white'>Install it now !</a>
            </div>
            : null}
        <div className='relative'>
            <form onSubmit={handleSubmit(registerApplication)} >
                <div className={!deployableRepo.isAvailableToKlave ? 'opacity-40' : ''}>
                    We found {deployableRepo.config?.applications?.length ?? 0} applications to deploy.<br />
                    Make your selection and be ready in minutes<br />
                    <br />
                    {/* <pre className='text-left w-1/2 bg-slate-200 m-auto p-5'>{JSON.stringify(repoData.config ?? repoData.configError, null, 4)}</pre> */}
                    {(deployableRepo.config?.applications ?? []).map((app, index) => {
                        return <div key={index} className={`a-like rounded-full bg-slate-200 checked:bg-slate-500 mx-1 ${deployableRepo.isAvailableToKlave ? 'hover:bg-slate-300 cursor-pointer' : 'cursor-default'}`}>
                            <input disabled={!deployableRepo.isAvailableToKlave} id={`application-${index}`} type="checkbox" value={app.name} {...register('applications')} className='mr-3' />
                            <label htmlFor={`application-${index}`}>{app.name}</label>
                        </div>;
                    })}
                    <br />
                    <br />
                    {mutationError ? <>
                        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative w-1/2 mx-auto" role="alert">
                            <strong className="font-bold">Holy smokes!</strong>
                            <span className="block sm:inline"> {mutationError.message}</span>
                        </div>
                        <br />
                    </> : null}
                </div>
                <Link to="/deploy/select" className='button-like mr-5 disabled:text-gray-300'>Go back</Link>
                <button disabled={!appSelectionWatch.length || isTriggeringDeploy || hasTriggeredDeploy || !deployableRepo.isAvailableToKlave} type="submit" className='disabled:text-gray-300'>Enable</button>
            </form>
        </div>
    </>;
};

export default Select;