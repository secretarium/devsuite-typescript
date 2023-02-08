import { FC } from 'react';
import { useForm, FieldValues } from 'react-hook-form';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { UilSpinner } from '@iconscout/react-unicons';
import api from '../../utils/api';

export const Select: FC = () => {

    const navigate = useNavigate();
    const repoInfo = useParams() as { owner: string, name: string };
    const { data: repoData, isLoading } = api.v0.repos.getRepo.useQuery(repoInfo);
    const { mutate, isLoading: isTriggeringDeploy, isSuccess: hasTriggeredDeploy, error: mutationError } = api.v0.applications.register.useMutation({
        onSuccess: () => navigate('/')
    });
    const { register, handleSubmit, watch } = useForm<{ applications: string[] }>();
    const appSelectionWatch = watch('applications', []);

    if (isLoading || !repoData)
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
        mutate({
            repoId: repoData.id,
            applications
        });
    };

    return <>
        <div className='pb-5' >
            <h1 className='text-xl font-bold'>{`${repoData.owner} / ${repoData.name}`}</h1>
        </div>
        <div className='relative'>
            We found {repoData.config?.applications?.length ?? 0} applications to deploy.<br />
            Make your selection and be ready in minutes<br />
            <br />
            {/* <pre className='text-left w-1/2 bg-slate-200 m-auto p-5'>{JSON.stringify(repoData.config ?? repoData.configError, null, 4)}</pre> */}
            <form onSubmit={handleSubmit(registerApplication)} >
                {(repoData.config?.applications ?? []).map((app, index) => {
                    return <div key={index} className='a-like rounded-full bg-slate-200 hover:bg-slate-300 checked:bg-slate-500 mx-1'>
                        <input id={`application-${index}`} type="checkbox" value={app.name} {...register('applications')} className='mr-3' />
                        <label htmlFor={`application-${index}`} className='cursor-pointer '>{app.name}</label>
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
                <button disabled={!appSelectionWatch.length || isTriggeringDeploy || hasTriggeredDeploy} type="submit" className='disabled:text-gray-300'>Deploy</button>
            </form>
        </div>
    </>;
};

export default Select;