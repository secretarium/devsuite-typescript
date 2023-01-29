/**
 * Environment definitions for compiling Klave Trustless Application.
 * @module trustless/sdk
 *//***/

/// <reference no-default-lib="true"/>

// Types
declare type Query = {
    (msg: ArrayBuffer): void;
}
declare type Transaction = {
    (msg: ArrayBuffer): void;
}

// Global functions
declare export function notify(msg: ArrayBuffer): i32;
declare export function add_user_query(msg: ArrayBuffer): void;
declare export function add_user_transaction(msg: ArrayBuffer): void;

export default {};