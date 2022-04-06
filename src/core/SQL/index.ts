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
    exec: (query:string, params?: BindParams) => Array<QueryExecResult>
}

export interface DatabaseHolder {
    instance: SqlLite | null
    setInstance: (bd: SqlLite) => void
    getInstance: () => SqlLite | null
    destroy: () => void
}

type SqlDataType =
    | 'INTEGER'
    | 'INT'
    | 'TEXT'

export interface Schema {
    [tableName: string]: {
        fields: Record<string, SqlDataType>
        values?: Array<Record<string, string | number>>
    }
}

export const createQueryFromSchema = (schema: Schema): string => {
    const tables = Object.keys(schema)

    const createTable = "CREATE TABLE"

    let query = ""

    tables.forEach(table => {
        const { fields, values } = schema[table]

        const fieldsPart = Object.keys(fields).reduce((acc, field, idx, keys) => {
            return acc + `${field} ${fields[field]}` + (idx < keys.length - 1 ? ', ' : '')
        }, '')

        const insertPart = values
            ? values.map((data) => {
                const dataPart = Object.keys(data).reduce((acc, key, idx, keys) => {
                    const value = data[key]
                    return acc += (typeof value === "string" ? `'${value}'` : `${value}`) + ((idx < keys.length - 1 ? ', ' : ''))
                }, '')

                return `INSERT INTO ${table} VALUES (${dataPart});`
            }).join('')
            : []

        query += `${createTable} ${table} (${fieldsPart});${insertPart}`
    })

    return query
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

export const createSQL = async (path: string, schema: Schema) => {
    try {
        const SQL = await initSqlJs({
            locateFile: () => path
        })

        const db: SqlLite = new SQL.Database()
        database.setInstance(db)

        const query = createQueryFromSchema(schema)
        db.exec(query)

        return db
    } catch (e) {
        console.error(e)
    }
    return
}

export const getDatabase = (): SqlLite | null => database.getInstance()

export const executeQuery = (query: string, params?: BindParams): Array<QueryExecResult> | undefined => {
    let db = getDatabase()

    if(!db) {
        console.error('SQL-lite instance not initiated! \nRun createSQL function to initialize the service.')
        return;
    }

    try {
        return db.exec(query, params)
        // @ts-ignore
    } catch (error: Error) {
        console.error(`SQL-lite Error: ${error.message}`)
        return
    }
}

export default {
    createQueryFromSchema,
    createSQL,
    // getDatabase,
    executeQuery
}