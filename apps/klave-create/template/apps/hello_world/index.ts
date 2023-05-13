import { Notifier, Router } from '@klave/sdk';

export function my_query(arg: ArrayBuffer): void {
    const s = String.UTF8.decode(arg, true);
    Notifier.notify(String.UTF8.encode('Hello ' + s, true));
};

export function my_transaction(arg: ArrayBuffer): void {
    const s = String.UTF8.decode(arg, true);
    Notifier.notify(String.UTF8.encode('Hello ' + s, true));
};

export function register_routes(): void {
    Router.addQuery(String.UTF8.encode('my_query', true));
    Router.addTransaction(String.UTF8.encode('my_transaction', true));
}
