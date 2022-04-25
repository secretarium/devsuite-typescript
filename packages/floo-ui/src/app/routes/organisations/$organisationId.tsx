import type { ActionFunction, LoaderFunction } from '@remix-run/node';
import { json, redirect } from '@remix-run/node';
import { Form, useCatch, useLoaderData } from '@remix-run/react';
import type { Organisation } from '~/models/organisation.server';
import { deleteOrganisation } from '~/models/organisation.server';
import { getOrganisation } from '~/models/organisation.server';
import { requireUserId } from '~/session.server';

type LoaderData = {
    organisation: Organisation;
};

export const loader: LoaderFunction = async ({ request, params }) => {
    const userId = await requireUserId(request);
    if (!params.organisationId)
        throw new Response('organisationId not found', { status: 400 });

    const organisation = await getOrganisation({ userId, id: params.organisationId });
    if (!organisation) {
        throw new Response('Not Found', { status: 404 });
    }
    return json<LoaderData>({ organisation });
};

export const action: ActionFunction = async ({ request, params }) => {
    const userId = await requireUserId(request);
    if (!params.organisationId)
        throw new Response('organisationId not found', { status: 400 });

    await deleteOrganisation({ userId, id: params.organisationId });

    return redirect('/organisations');
};

export default function OrganisationDetailsPage() {
    const data = useLoaderData() as LoaderData;

    return (
        <div>
            <h3 className="text-2xl font-bold">{data.organisation.name}</h3>
            <p className="py-6">{data.organisation.slug}</p>
            <hr className="my-4" />
            <Form method="post">
                <button
                    type="submit"
                    className="rounded bg-blue-500  py-2 px-4 text-white hover:bg-blue-600 focus:bg-blue-400"
                >
                    Delete
                </button>
            </Form>
        </div>
    );
}

export function ErrorBoundary({ error }: { error: Error }) {
    console.error(error);

    return <div>An unexpected error occurred: {error.message}</div>;
}

export function CatchBoundary() {
    const caught = useCatch();

    if (caught.status === 404) {
        return <div>Organisation not found</div>;
    }

    throw new Error(`Unexpected caught response with status: ${caught.status}`);
}
