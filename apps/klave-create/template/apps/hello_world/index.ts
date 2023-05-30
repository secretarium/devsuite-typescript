import { Notifier, Ledger, Utils, JSON } from '@klave/sdk';
@json
class ErrorMessage {
    success!: boolean;
    message!: string;
}

@json
class FetchInput {
    key!: string;
}

@json
class FetchOutput {
    success!: boolean;
    value!: string;
}

const myTableName = "my_storage_table";

/**
 * @query
 * @param arg - a pointer to a null-terminated c string located in linear memory
 */
export function fetchValue(arg: i32): void {

    const inputString = Utils.pointerToString(arg);
    if (inputString.length === 0)
        Notifier.sendJson<ErrorMessage>({
            success: false,
            message: `No input was provided`
        });

    const input = JSON.parse<FetchInput>(inputString);
    let value = Ledger.getTable(myTableName).get(input.key);
    if (value.length === 0) {
        Notifier.sendJson<ErrorMessage>({
            success: false,
            message: `key '${input.key}' not found in table`
        });
    } else {
        Notifier.sendJson<FetchOutput>({
            success: true,
            value
        });
    }
}

@json
class StoreInput {
    key!: string;
    value!: string;
}

@json
class StoreOutput {
    success!: boolean;
}

/**
 * @transaction
 * @param arg - a pointer to a null-terminated c string located in linear memory
 */
export function storeValue(arg: i32): void {

    const inputString = Utils.pointerToString(arg);
    if (inputString.length === 0)
        Notifier.sendJson<ErrorMessage>({
            success: false,
            message: `No input was provided`
        });

    const input = JSON.parse<StoreInput>(inputString);
    if (input.key && input.value) {
        Ledger.getTable(myTableName).set(input.key, input.value);
        Notifier.sendJson<StoreOutput>({
            success: true
        });
        return;
    }

    Notifier.sendJson<ErrorMessage>({
        success: false,
        message: `Missing value arguments`
    });
}
