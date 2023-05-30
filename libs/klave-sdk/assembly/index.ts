/**
 * Environment definitions for compiling Klave Trustless Applications.
 * @module klave/sdk
 */


import { JSON } from "json-as/assembly";
export { JSON }

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
// @ts-ignore: decorator
@external("env", "query_context")
declare function runtime_query_context_raw(key: ArrayBuffer, value: ArrayBuffer, value_size: i32): i32;

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

    getArrayBuffer(key: string): i32 {
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
        return value
    }

    get(key: string): string {
        return String.UTF8.decode(this.getArrayBuffer(key), true);
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

export class Context {

    static getArrayBuffer(key: string): ArrayBuffer {
        let k = String.UTF8.encode(key, true);
        let value = new ArrayBuffer(64);
        let result = runtime_query_context_raw(k, value, value.byteLength);
        if (result < 0)
            return new ArrayBuffer(0); // todo : report error (or not found ?)
        if (result > value.byteLength) {
            // buffer not big enough, retry with a properly sized one
            value = new ArrayBuffer(result);
            result = runtime_query_context_raw(k, value, value.byteLength);
            if (result < 0)
                return new ArrayBuffer(0); // todo : report errors
        }
        return value;
    }

    static get(variable: string): string {
        const value = Context.getArrayBuffer(variable);
        return String.UTF8.decode(value);
    }
}

export class Notifier {

    static notify(message: ArrayBuffer): i32 {
        return runtime_notify(message);
    }

    static sendArrayBuffer(message: ArrayBuffer): i32 {
        return runtime_notify(message);
    }

    static sendString(message: string): i32 {
        let buf = String.UTF8.encode(message, true);
        return runtime_notify(buf);
    }

    static sendJson<T = unknown>(message: T): i32 {
        let buf = String.UTF8.encode(JSON.stringify<T>(message), true);
        return runtime_notify(buf);
    }
}

export class Utils {

    static pointerToString(ptr: i32): string {
        let len = 0;
        while (load<u8>(ptr + len) != 0)
            len++;
        let buf = new ArrayBuffer(len + 1);
        memory.copy(changetype<usize>(buf), ptr, len + 1);
        return String.UTF8.decode(buf, true);
    }

    static stringToPointer(str: string): i32 {
        let buf = String.UTF8.encode(str, true);
        let ptr = changetype<usize>(buf);
        return ptr;
    }

}