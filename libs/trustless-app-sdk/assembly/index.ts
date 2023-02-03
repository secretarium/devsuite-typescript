/**
 * Environment definitions for compiling Klave Trustless Application.
 * module trustless/sdk
 *//***/

/* eslint-disable @typescript-eslint/no-namespace */
// export namespace env {

@external("env", "notify")
    export declare function notify(s: ArrayBuffer): i32;
@external("env", "add_user_query")
    export declare function addUserQuery(s: ArrayBuffer): void;
@external("env", "add_user_transaction")
    export declare function addUserTransaction(s: ArrayBuffer): void;

// }

export declare interface Table {
    get(name: string): string;
}

export declare interface Ledger {
    getTable(name: string): Table;
}

export declare type Query = (arg: ArrayBuffer) => void;
export declare type Transaction = (arg: ArrayBuffer) => void;