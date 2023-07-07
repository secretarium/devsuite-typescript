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
// @ts-ignore: decorator
@external("env", "load_lightgbm_model")
declare function runtime_load_lightgbm_model(name: ArrayBuffer, model: ArrayBuffer): i32;
// @ts-ignore: decorator
@external("env", "unload_lightgbm_model")
declare function runtime_unload_lightgbm_model(name: ArrayBuffer): i32;
// @ts-ignore: decorator
@external("env", "infer_from_lightgbm_model")
declare function runtime_infer_from_lightgbm_model(name: ArrayBuffer, data: ArrayBuffer, data_size: i32, result: ArrayBuffer, result_size: i32): i32;

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

    getArrayBuffer(key: string): ArrayBuffer {
        let k = String.UTF8.encode(key, true);
        let value = new ArrayBuffer(1);
        let result = runtime_read_ledger_raw(this.table, k, k.byteLength, value, value.byteLength);
        if (result < 0)
            return new ArrayBuffer(0); //TODO: Report error (or not found ?)
        if (result > value.byteLength) {
            value = new ArrayBuffer(result);
            result = runtime_read_ledger_raw(this.table, k, k.byteLength, value, value.byteLength);
            if (result < 0)
                return new ArrayBuffer(0); //TODO: Report errors
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
        let value = new ArrayBuffer(1);
        let result = runtime_query_context_raw(k, value, value.byteLength);
        if (result < 0)
            return new ArrayBuffer(0); //TODO: Report error (or not found ?)
        if (result > value.byteLength) {
            value = new ArrayBuffer(result);
            result = runtime_query_context_raw(k, value, value.byteLength);
            if (result < 0)
                return new ArrayBuffer(0); //TOTO: Report errors
        }
        return value;
    }

    static get(variable: string): string {
        return String.UTF8.decode(Context.getArrayBuffer(variable), true);
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

export class ML {

    static loadLightGBMModel(name: string, model: string): i32 {
        // work around json-as bug : an invalid json with a "real" line feed in a string field would be parsed,
        // but not if the string is properly formed with the two-characters escape sequence '\' followed by 'n'
        // as we don't want to try to pass invalid json :
        let tmodel = model.replaceAll('\\n', '\n');
        let nameBuf = String.UTF8.encode(name, true);
        let modelBuf = String.UTF8.encode(tmodel, true);
        return runtime_load_lightgbm_model(nameBuf, modelBuf);
    }

    static unloadLightGBMModel(name: string): i32 {
        let nameBuf = String.UTF8.encode(name, true);
        return runtime_unload_lightgbm_model(nameBuf);
    }

    static inferLightGBMModel(name: string, data: Float64Array): Float64Array {
        let nameBuf = String.UTF8.encode(name, true);
        let value = new Float64Array(1);
        let result = runtime_infer_from_lightgbm_model(nameBuf, data, data.byteLength, value, value.byteLength);
        if (result < 0)
            return new Float64Array(0); //TODO: Report error (or not found ?)
        if (result > value.byteLength) {
            value = new Float64Array(result);
            result = runtime_infer_from_lightgbm_model(nameBuf, data, data.byteLength, value, value.byteLength);
            if (result < 0)
                return new Float64Array(0); //TODO: Report errors
        }
        return value;
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