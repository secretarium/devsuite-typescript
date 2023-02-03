import * as Klave from '@secretarium/trustless-app';

export const my_query: Klave.Query = (arg) => {
    const s = String.UTF8.decode(arg, true);
    Klave.notify(String.UTF8.encode('Hello ' + s, true));
};

export const my_transaction: Klave.Transaction = (arg) => {
    const s = String.UTF8.decode(arg, true);
    console.warn('plop');
    Klave.notify(String.UTF8.encode('Hello ' + s, true));
};

export function register_routes(): void {
    Klave.addUserQuery(String.UTF8.encode('my_query', true));
    Klave.addUserTransaction(String.UTF8.encode('my_transaction', true));
}
