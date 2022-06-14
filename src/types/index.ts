import { Database } from "sql.js";

export enum WasmSources {
    prod = 'https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.6.1/sql-wasm.wasm',
    debug = 'https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.6.1/sql-wasm-debug.wasm',
    test = 'node_modules/sql.js/dist/sql-wasm.wasm'
}

/**
 * Defines the Singleton holding the database instance.
 */
export interface DatabaseHolder {
    // The database instance
    instance: Database | null
    // Setter of the instance
    setInstance: (bd: Database) => void
    // Getter of the instance
    getInstance: () => Database | null
    // Instance destructor
    destroy: () => void
}

export type SqlDataType =
    | 'NULL'
    | 'REAL'
    | 'INTEGER'
    | 'INT'
    | 'TEXT'
    | 'BLOB'
    | 'DATE'
    | 'TRUE'
    | 'FALSE'

/**
 * Type that defines a function callback to be used in the Schema values,
 * to generate the INSERT INTO commands. The function will receive the whole
 * value, plus its index in the values array.
 */
export interface ValueFunction {
    asFunc: boolean,
    value: string
}

/**
 * Structure that defines the schema definition of a table.
 * 'fields' will generate the table columns.
 * 'values' will generate INSERT INTO commands.
 */
export type TableDefinitions = {
    fields: Record<string, SqlDataType>
    values?: Array<Record<string, string | number | ValueFunction>>
}

/**
 * Structure that defines the database schema.
 * Each key of the 'Record' refers to a table name, and the TableDefinitions
 * defines the initial construction of the table.
 */
export type Schema = Record<string, TableDefinitions>

export type Function = (args: any) => any
export type Functions = Record<string, Function>

/**
 * Defines the Recorder type.
 * Each string in the Record is associated with a table.
 * Each weakRef item is connected to a 'reactive' function that must be fired
 * after an insert query.
 */
export type Recorder = Record<string, Array<WeakRef<(t:number) => void>>>