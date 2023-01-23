/* eslint-disable @typescript-eslint/ban-ts-comment */
// import 'assemblyscript/std/assembly/index';

// import '../../../node_modules/assemblyscript/std/assembly';

declare type i32 = number;
// eslint-disable-next-line
declare namespace i32 { }

// @ts-ignore
@external("env", "notify") export declare function notify(s: ArrayBuffer): i32;

// @ts-ignore
@external("env", "add_user_query") export declare function add_user_query(s: ArrayBuffer): void;

// @ts-ignore
@external("env", "add_user_transaction") export declare function add_user_transaction(s: ArrayBuffer): void;

export declare type Query = (arg: ArrayBuffer) => void
export declare type Transaction = (arg: ArrayBuffer) => void