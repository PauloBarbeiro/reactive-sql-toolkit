
export enum WasmSources {
    prod = 'https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.6.1/sql-wasm.wasm',
    debug = 'https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.6.1/sql-wasm-debug.wasm',
    test = 'node_modules/sql.js/dist/sql-wasm.wasm'
}

export type SqlValue = string | number | null | Uint8Array

export interface  QueryExecResult {
    columns: Array<string>
    values: Array<Array<SqlValue>>
}

export type BindParams = Array<SqlValue> | Record<string, SqlValue> | null

export interface SqlLite {
    exec: (query:string, params?: BindParams) => Array<QueryExecResult>
}

/**
 * Defines the Singleton holding the database instance.
 */
export interface DatabaseHolder {
    // The database instance
    instance: SqlLite | null
    // Setter of the instance
    setInstance: (bd: SqlLite) => void
    // Getter of the instance
    getInstance: () => SqlLite | null
    // Instance destructor
    destroy: () => void
}

export type SqlDataType =
    | 'INTEGER'
    | 'INT'
    | 'TEXT'

export interface Schema {
    [tableName: string]: {
        fields: Record<string, SqlDataType>
        values?: Array<Record<string, string | number>>
    }
}

/**
 * Defines the Recorder type.
 * Each string in the Record is associated with a table.
 * Each weakRef item is connected to a 'reactive' function that must be fired
 * after an insert query.
 */
export type Recorder = Record<string, Array<WeakRef<(t:number) => void>>>