import localforage from 'localforage';
import { matchSorter } from 'match-sorter';
import sortBy from 'sort-by';

export type Contact = {
    id: string;
    first: string;
    last: string;
    avatar?: string;
    twitter?: string;
    notes?: string;
    createdAt: number;
    favorite?: boolean;
}

export async function getContacts(query?: string): Promise<Array<Contact>> {
    let contacts = await localforage.getItem<Array<Contact>>('contacts');
    if (!contacts)
        contacts = [];
    if (query) {
        contacts = matchSorter(contacts, query, { keys: ['first', 'last'] });
    }
    return contacts.sort(sortBy('last', 'createdAt'));
}

export async function createContact() {
    const id = Math.random().toString(36).substring(2, 9);
    const contact: Partial<Contact> = { id, createdAt: Date.now() };
    const contacts = await getContacts();
    contacts.unshift(contact as Contact);
    await set(contacts);
    return contact;
}

export async function getContact(id?: string) {
    const contacts = await localforage.getItem<Array<Contact>>('contacts');
    const contact = contacts?.find(contact => contact.id === id);
    return contact ?? null;
}

export async function updateContact(id?: string, updates?: Partial<Contact>) {
    const contacts = await localforage.getItem<Array<Contact>>('contacts');
    const contact = contacts?.find(contact => contact.id === id);
    if (!contacts || !contact)
        throw new Error('No contact found for');
    Object.assign(contact, updates);
    await set(contacts);
    return contact;
}

export async function deleteContact(id?: string) {
    const contacts = await localforage.getItem<Array<Contact>>('contacts');
    const index = contacts?.findIndex(contact => contact.id === id) ?? null;
    if (contacts && index !== null && index > -1) {
        contacts.splice(index, 1);
        await set(contacts);
        return true;
    }
    return false;
}

function set(contacts: Array<Contact>) {
    return localforage.setItem('contacts', contacts);
}
