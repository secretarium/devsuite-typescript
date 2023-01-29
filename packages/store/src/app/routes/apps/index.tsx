import { FC } from 'react';
import { Link } from 'react-router-dom';
import { UilSpinner } from '@iconscout/react-unicons';
import api from '../../utils/api';

export const AppListing: FC = () => {

    const { data: applicationList, isLoading } = api.v0.applications.getAll.useQuery();

    if (isLoading || !applicationList)
        return <>
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
        </>;

    return <>
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
    </>;
};

export default AppListing;