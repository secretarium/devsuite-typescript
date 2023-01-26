import { FC } from 'react';
import { Link } from 'react-router-dom';
import { UilSpinner } from '@iconscout/react-unicons';
import api from '../../utils/api';

export const AppListing: FC = () => {

    // const navigate = useNavigate();
    const { data: applicationList, isLoading } = api.v0.applications.getAll.useQuery();
    // const { mutate, isLoading: isTriggeringDeploy, isSuccess: hasTriggeredDeploy, error: mutationError } = api.v0.repos.deployApplications.useMutation({
    //     onSuccess: () => navigate('/apps')
    // });
    // const { register, handleSubmit, watch } = useForm<{ applications: string[] }>();
    // const appSelectionWatch = watch('applications', []);

    if (isLoading || !applicationList)
        return <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <div className="pt-12 pb-12 md:pt-20 md:pb-20">
                <div className="text-center pb-12 md:pb-16">
                    <br />
                    <div className='pb-5' >
                        <h1 className='text-xl font-bold'>{isLoading ? 'Looking for your apps' : 'We could not find your apps'}</h1>
                    </div>
                    <div className='relative'>
                        {isLoading ? <>
                            We are fetch data about your applications.<br />
                            It will only take a moment...<br />
                            <br />
                            <UilSpinner className='inline-block animate-spin' />
                        </> : <>
                            We looked hard but could not find any applications.<br />
                            Head over to the deployment section to start again.<br />
                            <br />
                            <Link to="/deploy" className='button-like disabled:text-gray-300'>Go to deploy</Link>
                        </>}
                    </div>
                </div>
            </div>
        </div>;

    // const startDeploy = ({ applications }: FieldValues) => {
    //     if (hasTriggeredDeploy)
    //         return;
    //     mutate({
    //         repoId: repoData.id,
    //         appications: applications
    //     });
    // };

    return <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="pt-12 pb-12 md:pt-20 md:pb-20">
            <div className="text-center pb-12 md:pb-16">
                <br />
                <div className='pb-5' >
                    <h1 className='text-xl font-bold'>Applications</h1>
                </div>
                <div className='relative'>
                    We found {applicationList.length ?? 0} registered applications.<br />
                    <br />
                    {applicationList.map((app, index) => {
                        return <div key={index}>{app.id}</div>;
                    })}
                </div>
            </div>
        </div>
    </div >;
};

export default AppListing;