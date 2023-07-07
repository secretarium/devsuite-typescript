/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { atob, btoa } from 'js-base64';
import crypto from './secretarium.crypto';

export function xor(a: Uint8Array, b: Uint8Array): Uint8Array {
    if (a.length !== b.length) throw new Error();
    return a.map((x, i) => x ^ b[i]!);
}

export function incrementBy(src: Uint8Array, offset: Uint8Array): Uint8Array {
    const inc = Uint8Array.from(src),
        szDiff = src.length - offset.length;

    for (let j = offset.length - 1; j >= 0; j--) {
        for (let i = j + szDiff, o = offset[j]; i >= 0; i--) {
            if (inc[i]! + o! > 255) {
                inc[i] = inc[i]! + o! - 256;
                o = 1;
            } else {
                inc[i] = inc[i]! + o!;
                break;
            }
        }
    }

    return inc;
}

export function sequenceEqual(a: Uint8Array, b: Uint8Array): boolean {
    if (a.length !== b.length) return false;

    for (let i = 0; i !== a.length; i++) {
        if (a[i] !== b[i]) return false;
    }
    return true;
}

export function toBase64(src: Uint8Array, urlSafeMode = false): string {
    let binary = '';
    const len = src.byteLength;
    for (let i = 0; i < len; i++) {
        const code = src[i];
        if (code !== undefined)
            binary += String.fromCharCode(code);
    }
    const x = btoa(binary);
    return urlSafeMode ? x.replace(/\+/g, '-').replace(/\//g, '_') : x;
}

export function fromBase64(enc: string): Uint8Array {
    const x = enc.replace(/-/g, '+').replace(/_/g, '/');
    const str = atob(x);
    const len = str.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
        bytes[i] = str.charCodeAt(i);
    }
    return bytes;
}

const byteToHex = new Array(256).fill(0).map((_, n) => n.toString(16).padStart(2, '0'));
export function toHex(src: Uint8Array, delimiter = ''): string {
    return Array.from(src).map((n) => byteToHex[n]).join(delimiter);
}

export function getRandomBytes(size = 32): Uint8Array {
    const a = new Uint8Array(size);
    crypto.getRandomValues(a);
    return a;
}

export function concatBytes(a: Uint8Array, b: Uint8Array): Uint8Array {
    const c = new Uint8Array(a.length + b.length);
    c.set(a, 0);
    c.set(b, a.length);
    return c;
}

export function concatBytesArrays(arrays: Array<Uint8Array>): Uint8Array {
    let length = 0;
    for (let i = 0; i < arrays.length; i++) {
        length += arrays[i]!.length;
    }
    const c = new Uint8Array(length);
    for (let i = 0, j = 0; i < arrays.length; i++) {
        c.set(arrays[i]!, j);
        j += arrays[i]!.length;
    }
    return c;
}

export function decode(octets: Uint8Array, ignoreException = false): string {
    let string = '';
    let i = 0;
    while (i < octets.length) {
        let octet = octets[i]!;
        let bytesNeeded = 0;
        let codePoint = 0;
        if (octet <= 0x7f) {
            bytesNeeded = 0;
            codePoint = octet & 0xff;
        } else if (octet <= 0xdf) {
            bytesNeeded = 1;
            codePoint = octet & 0x1f;
        } else if (octet <= 0xef) {
            bytesNeeded = 2;
            codePoint = octet & 0x0f;
        } else if (octet <= 0xf4) {
            bytesNeeded = 3;
            codePoint = octet & 0x07;
        }
        if (octets.length - i - bytesNeeded > 0) {
            let k = 0;
            while (k < bytesNeeded) {
                octet = octets[i + k + 1]!;
                codePoint = (codePoint << 6) | (octet & 0x3f);
                k += 1;
            }
        } else {
            codePoint = 0xfffd;
            bytesNeeded = octets.length - i;
        }
        if (ignoreException)
            try {
                string += String.fromCodePoint(codePoint);
            } catch (e) {
                /* NOOP */
            }
        else string += String.fromCodePoint(codePoint);
        i += bytesNeeded + 1;
    }
    return string;
}

export function encode(s: string): Uint8Array {
    const length = s.length;
    const octets = new Array<number>();
    let i = 0;
    while (i < length) {
        const codePoint = s.codePointAt(i);
        if (!codePoint) return new Uint8Array(octets);
        let c = 0;
        let bits = 0;
        if (codePoint <= 0x0000007f) {
            c = 0;
            bits = 0x00;
        } else if (codePoint <= 0x000007ff) {
            c = 6;
            bits = 0xc0;
        } else if (codePoint <= 0x0000ffff) {
            c = 12;
            bits = 0xe0;
        } else if (codePoint <= 0x001fffff) {
            c = 18;
            bits = 0xf0;
        }
        octets.push(bits | (codePoint >> c));
        c -= 6;
        while (c >= 0) {
            octets.push(0x80 | ((codePoint >> c) & 0x3f));
            c -= 6;
        }
        i += codePoint >= 0x10000 ? 2 : 1;
    }
    return new Uint8Array(octets);
}

export function getRandomString(size = 32): string {
    const a = getRandomBytes(size);
    let final;
    while (!final) {
        final = decode(a, true);
    }
    return final;
}

export async function hash(data: Uint8Array): Promise<Uint8Array> {
    return new Uint8Array(await crypto.subtle!.digest({ name: 'SHA-256' }, data));
}

export async function hashBase64(s: string, urlSafeMode = false): Promise<string> {
    return toBase64(await hash(encode(s)), urlSafeMode);
}
