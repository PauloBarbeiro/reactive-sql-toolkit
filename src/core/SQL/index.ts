import initSqlJs from 'sql.js'

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
    exec: (query:string, params?: BindParams) => QueryExecResult
}

export interface DatabaseHolder {
    instance: SqlLite | null
    setInstance: (bd: SqlLite) => void
    getInstance: () => SqlLite | null
    destroy: () => void
}

export const database: DatabaseHolder = {
    instance: null,
    setInstance: function(db) {
        this.instance = db
    },
    getInstance: function() {
        return this.instance
    },
    destroy: function () {
        this.instance = null
    }
}

export const createSQL = async (path: string, name?: string) => {
    try{
        const SQL = await initSqlJs({
            locateFile: () => path
        })

        const db: SqlLite = new SQL.Database()
        database.setInstance(db)
        return db
    } catch (e) {
        console.error(e)
    }
    return
}

export const getDatabase = (): SqlLite | null => database.getInstance()

export const executeQuery = (query: string, params?: BindParams): QueryExecResult | undefined => {
    let db = getDatabase()

    if(!db) {
        console.error('SQL-lite instance not initiated! \nRun createSQL function to initialize the service.')
        return;
    }

    try {
        return db.exec(query, params)
    } catch (error) {
        console.error(`SQL-lite Error: ${error.message}`)
        return
    }
}

export default {
    createSQL,
    // getDatabase,
    executeQuery
}