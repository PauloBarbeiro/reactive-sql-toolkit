import initSqlJs, { Database, BindParams, QueryExecResult } from 'sql.js'

// Types
import {
    DatabaseHolder, Functions,
    Recorder,
    Schema,
} from "../../types";

// Utils
import { createQueryFromSchema } from "../Schema";
import {
    tableFromReadQuery,
    tableFromWritingQuery,
    writingQueryMatch
} from "../RegEx";

/**
 * Object that holds the database instance, and provides basic instance
 * management.
 */
export const database: DatabaseHolder = {
    instance: null,
    setInstance: function(db) {
        this.instance = db
    },
    getInstance: function() {
        return this.instance
    },
    destroy: function () {
        this.instance?.close()
        this.instance = null
    }
}

/**
 * Getter interface to the database.
 */
export const getDatabase = (): Database | null => database.getInstance()

/**
 * Public interface to destroy the database.
 * It executes the db.close() function, and remove it from the singleton holder.
 */
export const destroyDatabase = (): void => {
    database.destroy()
}

/**
 * List of the tables of the database.
 * Used to identify the Read/Write queries.
 */
const tables: Array<string> = []

/**
 * Object holding the weakRefs "listeners".
 */
const GlobalRecorder: Recorder = {}

/**
 * Create SQLite instance using sql.js, from the input 'path' to the wasm file,
 * and schema definition.
 *
 *
 * @param path      Path to the wasm file
 * @param schema    Schema definition to create the database
 * @param functions Functions map to be added to the database
 * @return database or undefined
 */
export const createSQL = async (path: string, schema: Schema, functions?: Functions) => {
    try {
        const buffer = schema.dataBuffer
            ? new Uint8Array(schema.dataBuffer)
            : undefined

        const SQL = await initSqlJs({
            locateFile: () => path
        })

        const db: Database = new SQL.Database(buffer)
        database.setInstance(db)

        if(functions) {
            Object.keys(functions).forEach(name => {
                db.create_function(name, functions[name])
            })
        }

        const [query, tablesList] = createQueryFromSchema(schema)
        tables.push(...tablesList)
        db.exec(query)

        return db
    } catch (e) {
        console.error(e)
    }
    return
}

/**
 * Registers the input 'updateState' function in the 'recorder' object
 * for the related table.
 *
 * - The table's name is selected from the query;
 * - The table, and/or the 'updateState' function, are added to the Recorder
 *
 * @param updateState   Function to be recorder as Actuator
 * @param query         SQL query that was executed
 * @param tables        List of tables of the database
 * @param recorder      Recorder object containing the weakRefs
 * @return void
 */
export const registerQueryListeners = (
    updateState: (time: number) => void,
    query: string,
    tables: Array<string>,
    recorder: Recorder,
):void => {
    const foundTables = tableFromReadQuery(query, tables)

    if(foundTables) {
        foundTables.forEach(table => {
            if(!recorder[table]) {
                recorder[table] = []
            }

            recorder[table].push(new WeakRef<(t: number) => void>(updateState))
        })
    }
}

/**
 * Execute a call to all actuators registered to a certain table.
 *
 * - The table used for the query is selected;
 * - A timestamp is generated;
 * - All actuators, related to the selected table, are executed
 *   asynchronously with the timestamp.
 *
 * @param query     SQL query that was executed
 * @param tables    List of tables of the database
 * @param recorder  Recorder object containing the weakRefs
 * @return void
 */
export const triggerActuators = (
    query: string,
    tables: Array<string>,
    recorder: Recorder,
): void => {
    const table = tableFromWritingQuery(query, tables)

    if(table) {
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

/**
 * Execute the input 'query' with its 'params' in the database instance
 * using the 'exec' interface.
 *
 * @param query     SQL query to be executed
 * @param params    The BindParams to be used in the exec method.
 * @return the database result or undefined.
 */
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

/**
 * Executes a SQL query for SELECT purpose, and returns its result.
 *
 * - The updateStateFn is register among the listeners;
 * - The Query is executed;
 * - The Actuators are triggered;
 * - the query result is returned.
 *
 * @param updateStateFn     The updater function to register in the GlobalRecorder
 * @param query             SQL query with the INSERT command
 * @param params            BindParams for the query
 * @return The result from 'executeQuery' function (Array<QueryExecResult> | undefined)
 */
export const queryPipeline = (
    updateStateFn: (time: number) => void,
    query: string,
    params?: BindParams,
): Array<QueryExecResult> | undefined => {
    registerQueryListeners(updateStateFn, query, tables, GlobalRecorder)
    const result = executeQuery(query, params)
    triggerActuators(query, tables, GlobalRecorder)

    return result
}

/**
 * Executes a SQL query for INSERT purpose, and returns its result.
 *
 * - The query containing the INSERT command is validated;
 * - The Query is executed;
 * - The Actuators are triggered;
 * - the query result is returned.
 *
 * @param query     SQL query with the INSERT command
 * @param params    BindParams for the query
 * @param recorder  Recorder object (GlobalRecorder as default)
 * @return The result from 'executeQuery' function (Array<QueryExecResult> | undefined)
 */
export const insertQueryPipeline = (
    query: string,
    params?: BindParams,
    recorder: Recorder = GlobalRecorder
): Array<QueryExecResult> | undefined => {
    const regExRes = writingQueryMatch(query, tables)
    if(!regExRes) {
        return
    }

    const result = executeQuery(query, params)
    triggerActuators(query, tables, recorder)
    return result
}

/**
 * Functions to be exposed to the API.
 */
export default {
    createSQL,
    destroyDatabase,
    queryPipeline,
    insertQueryPipeline,
}