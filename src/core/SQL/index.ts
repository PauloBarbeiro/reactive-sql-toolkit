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

export const createQueryFromSchema = (schema: Schema): [string, Array<string>] => {
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

    return [query, tables]
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

const tables: Array<string> = []

export type Recorder = Record<string, Array<WeakRef<(t:number) => void>>>
const recorder: Recorder = {}

export const createSQL = async (path: string, schema: Schema) => {
    try {
        const SQL = await initSqlJs({
            locateFile: () => path
        })

        const db: SqlLite = new SQL.Database()
        database.setInstance(db)

        const [query, tablesList] = createQueryFromSchema(schema)
        tables.push(...tablesList)
        db.exec(query)

        return db
    } catch (e) {
        console.error(e)
    }
    return
}

export const getDatabase = (): SqlLite | null => database.getInstance()

export const registerQueryListeners = (updateState: (time: number) => void, query: string, tables: Array<string>, recorder: Recorder):void => {
    const readRegEx = new RegExp(`^(SELECT).+(?<table>${tables.join('|')})`)
    const readRes = query.match(readRegEx)
    // const writeRegEx = new RegExp(`^(INSERT INTO).+(?<table>${tables.join('|')})`)
    // const writeRes = query.match(writeRegEx)

    const table = readRes?.groups?.table

    if(readRes && table) {
        if(!recorder[table]) {
            recorder[table] = []
        }

        recorder[table].push(new WeakRef<(t: number) => void>(updateState))
    }
}

export const triggerActuators = (query: string, tables: Array<string>, recorder: Recorder):void => {
    const writeRegEx = new RegExp(`^(INSERT INTO).+(?<table>${tables.join('|')})`)
    const writeRes = query.match(writeRegEx)

    const table = writeRes?.groups?.table

    if(writeRes && table) {
        const timestamp = Date.now()
        if(!recorder[table]) {
            return
        }

        new Promise((resolve, reject) => {
            try{
                recorder[table].forEach(weakRef => {
                    const fnRef = weakRef.deref()
                    fnRef && fnRef(timestamp)
                })
                resolve(1)
            } catch (err) {
                console.error('UPDATE ERROR: ', err)
                reject()
            }
        })
    }
}

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

export const queryPipeline = (
    updateStateFn: (time: number) => void,
    query: string,
    params?: BindParams,
): Array<QueryExecResult> | undefined => {
    registerQueryListeners(updateStateFn, query, tables, recorder)
    const result = executeQuery(query, params)
    if(result) {
        triggerActuators(query, tables, recorder)
    }
    return result
}

export default {
    createQueryFromSchema,
    createSQL,
    // getDatabase,
    queryPipeline
}