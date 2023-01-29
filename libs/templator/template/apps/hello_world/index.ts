import '@secretarium/trustless-app';

export const my_query: Query = (arg) => {
    const s = String.UTF8.decode(arg, true);
    notify(String.UTF8.encode('Hello ' + s, true));
};

export const my_transaction: Transaction = (arg) => {
    const s = String.UTF8.decode(arg, true);
    notify(String.UTF8.encode('Hello ' + s, true));
};

export function register_routes(): void {
    add_user_query(String.UTF8.encode('my_query', true));
    add_user_transaction(String.UTF8.encode('my_transaction', true));
}
