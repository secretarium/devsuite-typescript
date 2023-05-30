/**
 * Environment definitions for compiling Klave Trustless Applications.
 * @module klave/sdk
 */


export { JSON } from "json-as/assembly";

// @ts-ignore: decorator
@external("env", "add_user_query")
declare function runtime_add_user_query(s: ArrayBuffer): void;
// @ts-ignore: decorator
@external("env", "add_user_transaction")
declare function runtime_add_user_transaction(s: ArrayBuffer): void;
// @ts-ignore: decorator
@external("env", "notify")
declare function runtime_notify(s: ArrayBuffer): i32;
// @ts-ignore: decorator
@external("env", "read_ledger")
declare function runtime_read_ledger_raw(table: ArrayBuffer, key: ArrayBuffer, key_size: i32, value: ArrayBuffer, value_size: i32): i32;
// @ts-ignore: decorator
@external("env", "write_ledger")
declare function runtime_write_ledger_raw(table: ArrayBuffer, key: ArrayBuffer, key_size: i32, value: ArrayBuffer, value_size: i32): i32;

export class Router {
    static addQuery(queryFunctionName: ArrayBuffer): void {
        runtime_add_user_query(queryFunctionName);
    }
    static addTransaction(transactionFunctionName: ArrayBuffer): void {
        runtime_add_user_transaction(transactionFunctionName);
    }
}

class Table {

    table: ArrayBuffer;
    constructor(table: string) {
        this.table = String.UTF8.encode(table, true);
    }

    get(key: string): string {
        let k = String.UTF8.encode(key, true);
        let value = new ArrayBuffer(64);
        let result = runtime_read_ledger_raw(this.table, k, k.byteLength, value, value.byteLength);
        if (result < 0)
            return ""; // todo : report error (or not found ?)
        if (result > value.byteLength) {
            // buffer not big enough, retry with a properly sized one
            value = new ArrayBuffer(result);
            result = runtime_read_ledger_raw(this.table, k, k.byteLength, value, value.byteLength);
            if (result < 0)
                return ""; // todo : report errors
        }
        return String.UTF8.decode(value, true);
    }

    set(key: string, value: string): i32 {
        let k = String.UTF8.encode(key, true);
        let v = String.UTF8.encode(value, true);
        return runtime_write_ledger_raw(this.table, k, k.byteLength, v, v.byteLength);
    }
}

export class Ledger {

    static getTable(table: string): Table {
        return new Table(table);
    }
}

export class Notifier {
    static notify(message: ArrayBuffer): i32 {
        return runtime_notify(message);
    }
}

export function ptr2string(ptr: i32): string {
    let len = 0;
    while (load<u8>(ptr + len) != 0)
        len++;
    let buf = new ArrayBuffer(len + 1);
    memory.copy(changetype<usize>(buf), ptr, len + 1);
    return String.UTF8.decode(buf, true);
}