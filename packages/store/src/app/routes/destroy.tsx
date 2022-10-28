import { ActionFunction, redirect } from 'react-router-dom';
import { deleteContact } from '../data/contacts';

export const action: ActionFunction = async ({ params }) => {
    await deleteContact(params['contactId']);
    return redirect('/');
};