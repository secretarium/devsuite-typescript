type ReturnCode = number;

export type ReadableStorage = {
    get<T extends string = unknown>(key: string): T
}

export type WritableStorage = ReadableStorage & {
    set(key: string, value: string): void
}

export type Context = {
    env: Record<string, string>;
}

export type TransactionContext = Context & {
    ledger: WritableStorage
}

export type QueryContext = Context & {
    ledger: ReadableStorage
}

export type Handler<C> = (ctx: C) => ReturnCode

export type ContractRoutes<C> = Record<string, Handler<C>>

export interface ContractBundle {
    transactions?: ContractRoutes<TransactionContext>;
    queries?: ContractRoutes<QueryContext>;
}