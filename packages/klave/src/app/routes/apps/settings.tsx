import { FC } from 'react';
import { useParams } from 'react-router-dom';
import { UilSpinner } from '@iconscout/react-unicons';
import api from '../../utils/api';
import { useZodForm } from '../../utils/useZodForm';
import z from 'zod';

export const AppListing: FC = () => {

    const { appId } = useParams();
    const { data: application, isLoading } = api.v0.applications.getById.useQuery({ appId: appId || '' });
    const utils = api.useContext().v0.applications;
    const mutation = api.v0.applications.update.useMutation({
        onSuccess: async () => {
            await utils.getById.invalidate();
        }
    });

    const methods = useZodForm({
        schema: z.object({
            homepage: z.string()
        }),
        values: {
            homepage: application?.homepage || ''
        }
    });

    if (isLoading || !application)
        return <>
            We are fetching data about your application.<br />
            It will only take a moment...<br />
            <br />
            <UilSpinner className='inline-block animate-spin' />
        </>;

    return <div className="flex w-full items-center mb-7">
        <form
            onSubmit={methods.handleSubmit(async (data) => {
                await mutation.mutateAsync({ appId: appId || '', data });
                methods.reset();
            })}
            className="space-y-2"
        >
            <div>
                <label>
                    Homepage
                    <br />
                    <input {...methods.register('homepage')} className="border" />
                </label>

                {methods.formState.errors.homepage?.message && (
                    <p className="text-red-700">
                        {methods.formState.errors.homepage?.message}
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
        </form>
    </div>;
};

export default AppListing;