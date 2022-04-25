import { json, LoaderFunction } from '@remix-run/node';
import { Link, NavLink, useLoaderData } from '@remix-run/react';
import { getOrganisationListItems } from '~/models/organisation.server';
import { requireUserId } from '~/session.server';

type LoaderData = {
    organisationListItems: Awaited<ReturnType<typeof getOrganisationListItems>>;
};

export const loader: LoaderFunction = async ({ request }) => {
    const userId = await requireUserId(request);
    const organisationListItems = await getOrganisationListItems({ userId });
    return json<LoaderData>({ organisationListItems });
};

export default function NoteIndexPage() {

    const data = useLoaderData() as LoaderData;

    return <div className="h-full w-full">
        No organisation selected.Select a organisation on the left, or{' '}

        <Link to="new" className="block p-4 text-xl text-blue-500">
            + New Organisation
        </Link>

        <hr />

        {data.organisationListItems.length === 0 ? (
            <p className="p-4">No organisations yet</p>
        ) : (
            <ol>
                {data.organisationListItems.map((organisation) => (
                    <li key={organisation.id}>
                        <NavLink
                            className={({ isActive }) =>
                                `block border-b p-4 text-xl ${isActive ? 'bg-white' : ''}`
                            }
                            to={organisation.id}
                        >
                            <span role="img" aria-label="Organisation">📝</span> {organisation.name}
                        </NavLink>
                    </li>
                ))}
            </ol>
        )}
    </div>;
}
