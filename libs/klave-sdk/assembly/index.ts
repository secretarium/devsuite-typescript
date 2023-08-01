/**
 * Environment definitions for compiling Klave Trustless Applications.
 * @module klave/sdk
 */

import { encode as b64encode } from 'as-base64/assembly';
import uuid from "as-uuid/assembly";
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
// @ts-ignore: decorator
@external("env", "key_exists")
declare function key_exists(key_name: ArrayBuffer): boolean;
// @ts-ignore: decorator
@external("env", "generate_encryption_key")
declare function generate_encryption_key(key_name: ArrayBuffer): i32;
// @ts-ignore: decorator
@external("env", "encrypt")
declare function encrypt_raw(key_name: ArrayBuffer, clear_text: ArrayBuffer, clear_text_size: i32, cipher_text: ArrayBuffer, cipher_text_size: i32): i32;
// @ts-ignore: decorator
@external("env", "decrypt")
declare function decrypt_raw(key_name: ArrayBuffer, cipher_text: ArrayBuffer, cipher_text_size: i32, clear_text: ArrayBuffer, clear_text_size: i32): i32;
// @ts-ignore: decorator
@external("env", "generate_signing_key")
declare function generate_signing_key(key_name: ArrayBuffer): i32;
// @ts-ignore: decorator
@external("env", "get_public_key")
declare function get_public_key_raw(key_name: ArrayBuffer, result: ArrayBuffer, result_size: i32): i32;
// @ts-ignore: decorator
@external("env", "sign")
declare function sign_raw(key_name: ArrayBuffer, clear_text: ArrayBuffer, clear_text_size: i32, cipher_text: ArrayBuffer, cipher_text_size: i32): i32;
// @ts-ignore: decorator
@external("env", "verify")
declare function verify_raw(key_name: ArrayBuffer, cipher_text: ArrayBuffer, cipher_text_size: i32, clear_text: ArrayBuffer, clear_text_size: i32): i32;
// @ts-ignore: decorator
@external("env", "digest")
declare function digest_raw(text: ArrayBuffer, text_size: i32, digest: ArrayBuffer, digest_size: i32): i32;
// @ts-ignore: decorator
@external("env", "get_random_bytes")
declare function get_random_bytes_raw(bytes: ArrayBuffer, size: i32): i32;


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

class PublicKey {

    bytes: u8[];

    constructor(bytes: u8[]) {
        this.bytes = bytes;
    }

    getPem(): string {
        // this is the "fixed part" of the public key, including the curve identification (secp256r1)
        const asn1_header = [48, 89, 48, 19, 6, 7, 42, 134, 72, 206, 61, 2, 1, 6, 8, 42, 134, 72, 206, 61, 3, 1, 7, 3, 66, 0, 4];
        let buffer = new Uint8Array(asn1_header.length + this.bytes.length);
        buffer.set(asn1_header);
        buffer.set(this.bytes, asn1_header.length);
        const pem = `-----BEGIN PUBLIC KEY-----
        ${b64encode(buffer)}
        -----END PUBLIC KEY-----`;
        return String.UTF8.encode(pem, true);
    }
}

class Key {

    name: string;

    constructor(keyName?: string) {
        if (keyName !== undefined)
            this.name = keyName;
        else
            this.name = uuid();
    }

    encrypt(data: string): u8[] {
        let k = String.UTF8.encode(this.name, true);
        let t = String.UTF8.encode(data, false);
        let value = new Uint8Array(64);
        let result = encrypt_raw(k, t, t.byteLength, value.buffer, value.byteLength);
        let ret: u8[] = []
        if (result < 0)
            return ret; // todo : report error
        if (result > value.byteLength) {
            // buffer not big enough, retry with a properly sized one
            value = new Uint8Array(result);
            result = encrypt_raw(k, t, t.byteLength, value.buffer, value.byteLength);
            if (result < 0)
                return ret; // todo : report error
        }
        for (let i = 0; i < result; ++i)
            ret[i] = value[i];
        return ret;
    }

    decrypt(cipher: u8[]): string {
        let k = String.UTF8.encode(this.name, true);
        let buffer = new Uint8Array(cipher.length);
        for (let i = 0; i < cipher.length; ++i)
            buffer[i] = cipher[i];
        let value = new ArrayBuffer(64);
        let result = decrypt_raw(k, buffer.buffer, buffer.byteLength, value, value.byteLength);
        if (result < 0)
            return ""; // todo : report error
        if (result > value.byteLength) {
            // buffer not big enough, retry with a properly sized one
            value = new ArrayBuffer(result);
            result = decrypt_raw(k, buffer.buffer, buffer.byteLength, value, value.byteLength);
            if (result < 0)
                return ""; // todo : report error
        }
        return String.UTF8.decode(value.slice(0, result), false);
    }

    sign(text: string): u8[] {
        let k = String.UTF8.encode(this.name, true);
        let t = String.UTF8.encode(text, false);
        let value = new Uint8Array(64);
        let result = sign_raw(k, t, t.byteLength, value.buffer, value.byteLength);
        let ret: u8[] = []
        if (result < 0)
            return ret; // todo : report error
        if (result > value.byteLength) {
            // buffer not big enough, retry with a properly sized one
            value = new Uint8Array(result);
            result = sign_raw(k, t, t.byteLength, value.buffer, value.byteLength);
            if (result < 0)
                return ret; // todo : report error
        }
        for (let i = 0; i < result; ++i)
            ret[i] = value[i];
        return ret;
    }

    verify(data: string, signature: u8[]): boolean {
        let k = String.UTF8.encode(this.name, true);
        let t = String.UTF8.encode(data, false);
        let buffer = new Uint8Array(signature.length);
        for (let i = 0; i < signature.length; ++i)
            buffer[i] = signature[i];
        return verify_raw(k, t, t.byteLength, buffer.buffer, buffer.byteLength) != 0;
    }

    getPublicKey(): PublicKey {
        let k = String.UTF8.encode(this.name, true);
        let value = new Uint8Array(64);
        let result = get_public_key_raw(k, value.buffer, value.byteLength);
        let ret: u8[] = []
        if (result < 0)
            return new PublicKey(ret); // todo : report error
        if (result > value.byteLength) {
            // buffer not big enough, retry with a properly sized one
            value = new Uint8Array(result);
            result = get_public_key_raw(k, value.buffer, value.byteLength);
            if (result < 0)
                return new PublicKey(ret); // todo : report error
        }
        for (let i = 0; i < result; ++i)
            ret[i] = value[i];
        return new PublicKey(ret);
    }

}

export class Crypto {

    static getKey(keyName: string): Key | null {
        let nameBuf = String.UTF8.encode(keyName, true);
        if (key_exists(nameBuf))
            return new Key(keyName);
        return null
    }

    static generateEncryptionKey(keyName?: string): Key {
        const key = new Key(keyName);
        let nameBuf = String.UTF8.encode(key.name, true);
        generate_encryption_key(nameBuf);
        return key;
    }

    static generateSigningKey(keyName: string): Key {
        const key = new Key(keyName);
        let nameBuf = String.UTF8.encode(keyName, true);
        generate_signing_key(nameBuf);
        return key;
    }

    static digest(data: string): u8[] {
        let t = String.UTF8.encode(data, false);
        let value = new Uint8Array(32);
        let result = digest_raw(t, t.byteLength, value.buffer, value.byteLength);
        let ret: u8[] = []
        if (result < 0)
            return ret; // todo : report error
        if (result > value.byteLength) {
            // buffer not big enough, retry with a properly sized one
            value = new Uint8Array(result);
            result = digest_raw(t, t.byteLength, value.buffer, value.byteLength);
            if (result < 0)
                return ret; // todo : report error
        }
        for (let i = 0; i < result; ++i)
            ret[i] = value[i];
        return ret;
    }

    static getRandomValues(size: i32): u8[] {
        let value = new Uint8Array(size);
        let result = get_random_bytes_raw(value.buffer, value.byteLength);
        let ret: u8[] = []
        if (result < 0)
            return ret; // todo : report error
        for (let i = 0; i < size; ++i)
            ret[i] = value[i];
        return ret;
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