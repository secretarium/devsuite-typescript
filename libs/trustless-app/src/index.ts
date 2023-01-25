/* eslint-disable @typescript-eslint/ban-ts-comment */

declare type i32 = number;
// eslint-disable-next-line
declare namespace i32 { }

// @ts-ignore: decorator
@external("env", "notify") export declare function notify(s: ArrayBuffer): i32;

// @ts-ignore: decorator
@external("env", "add_user_query") export declare function add_user_query(s: ArrayBuffer): void;

// @ts-ignore: decorator
@external("env", "add_user_transaction") export declare function add_user_transaction(s: ArrayBuffer): void;

export declare type Query = (arg: ArrayBuffer) => void
export declare type Transaction = (arg: ArrayBuffer) => void