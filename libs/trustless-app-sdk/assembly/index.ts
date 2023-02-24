/**
 * Environment definitions for compiling Klave Trustless Application.
 * @module trustless/sdk
 */

@external("env", "add_user_query")
declare function runtime_add_user_query(s: ArrayBuffer): void;
@external("env", "add_user_transaction")
declare function runtime_add_user_transaction(s: ArrayBuffer): void;
@external("env", "notify")
declare function runtime_notify(s: ArrayBuffer): i32;
@external("env", "read_ledger")
declare function runtime_read_ledger_raw(table: ArrayBuffer, key: ArrayBuffer, key_size: i32, value: ArrayBuffer, value_size: i32): i32;
@external("env", "write_ledger")
declare function runtime_write_ledger_raw(table: ArrayBuffer, key: ArrayBuffer, key_size: i32, value: ArrayBuffer, value_size: i32): i32;

export class Router {
    static addQuery(queryFunctionName: ArrayBuffer): void {
        return runtime_add_user_query(queryFunctionName);
    }
    static addTransaction(transactionFunctionName: ArrayBuffer): void {
        return runtime_add_user_transaction(transactionFunctionName);
    }
}

export class Table {
    tableName: ArrayBuffer;
    constructor(table: ArrayBuffer) {
        this.tableName = table;
    }
    get(key: ArrayBuffer): i32 {
        const value = new ArrayBuffer(64);
        const result = Ledger.readFromTableIntoBuffer(this.tableName, key, value);
        return result;
    }
    set(key: ArrayBuffer, value: ArrayBuffer): i32 {
        return runtime_write_ledger_raw(this.tableName, key, key.byteLength, value, value.byteLength);
    }
}

export class Ledger {
    static readFromTableIntoBuffer(table: ArrayBuffer, key: ArrayBuffer, value: ArrayBuffer): i32 {
        return runtime_read_ledger_raw(table, key, key.byteLength, value, value.byteLength);
    }
    static writeToTable(table: ArrayBuffer, key: ArrayBuffer, value: ArrayBuffer): i32 {
        return runtime_write_ledger_raw(table, key, key.byteLength, value, value.byteLength);
    }
    static getTable(table: ArrayBuffer): Table {
        return new Table(table);
    }
}

export class Notifier {
    static notify(message: ArrayBuffer): i32 {
        return runtime_notify(message);
    }
}


// @external("env", "notify")
// export declare function notify(s: ArrayBuffer): i32;
// @external("env", "add_user_query")
// export declare function addUserQuery(s: ArrayBuffer): void;
// @external("env", "add_user_transaction")
// export declare function addUserTransaction(s: ArrayBuffer): void;

// /**
//  * The execution context of an operation
//  */
// export declare type Context = {
//     // entropy: Uint8Array;
//     // dcapp: string;
//     // function: string;
//     request_id: string;
//     args: Map<string, Uint8Array>;
//     env: Map<string, Uint8Array>;
//     trusted_time: i64;
//     // branch_name: string;
//     // command_type: i32;
//     // associations: Uint32Array;
//     caller: string;
//     sender: string;
//     // seed: Uint8Array;
//     // index: i32;
//     // application_id: i64;
//     // scheduling_term: i64;
//     // scheduling_index: i64;
//     // client_key: Uint8Array;
//     // initiating_node: Uint8Array;
// }

// /**
//  * Definition of a readable table interface
//  */
// export declare type ReadableTable = {
//     /**
//      * Read a value from a table at the provided key
//      *
//      * @param key - The key of the value
//      */
//     get: (key: string) => Uint8Array
// }

// /**
//  * Definition of a writable table interface
//  */
// export declare type WritableTable = ReadableTable & {
//     /**
//      * Write a value into a table at the provided key
//      *
//      * @param key - The key of the value
//      * @param value - The content to write in the table
//      */
//     set: (key: string, value: Uint8Array) => boolean
// }

// /**
//  * Definition of a readable ledger interface
//  */
// export declare type ReadableLedger<T = ReadableTable> = {
//     /**
//      * Get a table in the attached ledger
//      *
//      * @remarks
//      * A Writable ledger will automatically create a non-existant table upon request
//      *
//      * @param tableName - The name of the table to retreive
//      */
//     getTable: (tableName: string) => T
// }

// /**
//  * Definition of a writable ledger interface
//  */
// export declare type WritableLedger<T = WritableTable> = ReadableLedger<T>;

// export declare type EmailOptions = unknown;
// export declare type HTTPSOptions = unknown;
// export declare type HTTPSResponse = unknown;
// export declare type SMSOptions = unknown;

// export declare type Communication = {
//     email: (options: EmailOptions) => boolean;
//     https: (options: HTTPSOptions, response: HTTPSResponse) => boolean;
//     sms: (options: SMSOptions) => boolean;
//     notify: (message: string | Uint8Array) => boolean;
// };

// export declare type Effect = unknown;

// /**
//  * Definition of kit shape for queries
//  */
// export declare type QueryKit<L = ReadableLedger> = {
//     context: Context;
//     ledger: L;
//     communication: Communication;
// }

// /**
//  * Definition of function interface for queries
//  */
// export declare type QueryFunction = {
//     (this: QueryKit, ...args: never): void
// }

// /**
//  * Definition of lamba interface for queries
//  *
//  * @remarks
//  * Lambda implementation are not guaranteed to the implemented in the runtime
//  * Only use in development environment
//  *
//  * @alpha
//  */
// export declare type QueryLambda = {
//     /**
//      * Provide query interface as a lamba
//      *
//      * @remarks
//      * Lambda implementation are not guaranteed to the implemented in the runtime
//      * Only use in development environment
//      *
//      * @param kit - The runtime SDK interface
//      * @alpha
//      */
//     (kit: QueryKit): void
// }

// /**
//  * Definition of a query interface
//  *
//  * @remarks
//  * Lambda implementation are not guaranteed to the implemented in the runtime
//  * Only use in development environment
//  *
//  */
// export declare type Query = QueryFunction & QueryLambda

// /**
//  * Definition of kit shape for transactions
//  */
// export declare type TransactionKit<L = WritableLedger> = QueryKit<L> & {
//     /**
//      * Adds an asynchronsous effect to the outcome of a transaction on success
//      * @param effect - An {@link Effect} implementation to be executed after success of the transaction
//      */
//     addEffect: (effect: Effect) => void;
//     /**
//      * Adds a synchronsous effect to the outcome of a transaction on success
//      * @param effect - An {@link Effect} implementation to be executed after success of the transaction
//      */
//     addEffectSync: (effect: Effect) => void;
// }

// /**
//  * Definition of function interface for transactions
//  */
// export declare type TransactionFunction = {
//     /**
//      * Provide transation interface as a function
//      */
//     (this: TransactionKit, ...args: never): void
// }

// /**
//  * Definition of lamba interface for transactions
//  *
//  * @remarks
//  * Lambda implementation are not guaranteed to the implemented in the runtime
//  * Only use in development environment
//  *
//  * @alpha
//  */
// export declare type TransactionLambda = {
//     /**
//      * Provide transation interface as a lamba
//      *
//      * @remarks
//      * Lambda implementation are not guaranteed to the implemented in the runtime
//      * Only use in development environment
//      *
//      * @param kit - The runtime SDK interface
//      * @alpha
//      */
//     (kit: TransactionKit): void
// }

// /**
//  * Definition of a transaction interface
//  *
//  * @remarks
//  * Lambda implementation are not guaranteed to the implemented in the runtime
//  * Only use in development environment
//  *
//  */
// export declare type Transaction = TransactionFunction & TransactionLambda

// export function loggedMethod(headMessage = 'LOG:') {
//     return function actualDecorator<This, Args extends any[], Return>(
//         target: (this: This, ...args: Args) => Return,
//         context: ClassMethodDecoratorContext<This, (this: This, ...args: Args) => Return>
//     ) {
//         const methodName = String(context.name);
//         // .filter just got smarter!
//         const filteredArray = [1, 2, undefined].filter(Boolean); // number[]
//         const result = JSON.parse('{}'); // unknown

//         function replacementMethod(this: This, ...args: Args): Return {
//             console.log(`${headMessage}: Entering method '${methodName}'.`);
//             const result = target.call(this, ...args);
//             console.log(`${headMessage}: Exiting method '${methodName}'.`);
//             return result;
//         }

//         return replacementMethod;
//     };
// }