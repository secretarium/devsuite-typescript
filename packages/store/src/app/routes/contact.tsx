import { FC } from 'react';
import { Form, LoaderFunction, useLoaderData, useFetcher, ActionFunction } from 'react-router-dom';
import { Contact, getContact, updateContact } from '../data/contacts';

export const loader: LoaderFunction = async ({ params }) => {
    const contact = await getContact(params['contactId']);
    if (!contact) {
        throw new Response('', {
            status: 404,
            statusText: 'Not Found'
        });
    }
    return contact;
};

export const action: ActionFunction = async ({ request, params }) => {
    const formData = await request.formData();
    return updateContact(params['contactId'], {
        favorite: formData.get('favorite') === 'true'
    });
};

export const ContactItem: FC = () => {
    const contact = useLoaderData() as Contact;

    return <div id="contact">
        <div>
            <img
                alt={contact.first}
                key={contact.avatar}
                src={contact.avatar}
            />
        </div>

        <div>
            <h1>
                {contact.first || contact.last ? (
                    <>
                        {contact.first} {contact.last}
                    </>
                ) : (
                    <i>No Name</i>
                )}{' '}
                <Favorite contact={contact} />
            </h1>

            {contact.twitter && (
                <p>
                    <a
                        target="_blank"
                        href={`https://twitter.com/${contact.twitter}`} rel="noreferrer"
                    >
                        {contact.twitter}
                    </a>
                </p>
            )}

            {contact.notes && <p>{contact.notes}</p>}

            <div>
                <Form action="edit">
                    <button type="submit">Edit</button>
                </Form>
                <Form
                    method="post"
                    action="destroy"
                    onSubmit={(event) => {
                        if (
                            // eslint-disable-next-line no-restricted-globals
                            !confirm(
                                'Please confirm you want to delete this record.'
                            )
                        ) {
                            event.preventDefault();
                        }
                    }}
                >
                    <button type="submit">Delete</button>
                </Form>
            </div>
        </div>
    </div>;
};

const Favorite: FC<{ contact: Contact }> = ({ contact }) => {
    const fetcher = useFetcher();
    let favorite = contact.favorite;
    if (fetcher.formData) {
        favorite = fetcher.formData.get('favorite') === 'true';
    }
    return (
        <fetcher.Form method="post">
            <button
                name="favorite"
                value={favorite ? 'false' : 'true'}
                aria-label={
                    favorite
                        ? 'Remove from favorites'
                        : 'Add to favorites'
                }
            >
                {favorite ? '★' : '☆'}
            </button>
        </fetcher.Form>
    );
};

export default ContactItem;