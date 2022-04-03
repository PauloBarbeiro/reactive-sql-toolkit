import initSqlJs from 'sql.js'

export enum WasmSources {
    prod = 'https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.6.1/sql-wasm.wasm',
    debug = 'https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.6.1/sql-wasm-debug.wasm',
    test = 'node_modules/sql.js/dist/sql-wasm.wasm'
}

const database = {
    instance: null,
    setInstance: function(db) {
        this.instance = db
    },
    getInstance: function() {
        return this.instance
    }
}

export const createSQL = async (path: string, name?: string) => {
    try{
        const SQL = await initSqlJs({
            locateFile: () => path
        })

        const db = new SQL.Database()
        database.setInstance(db)
        return db
    } catch (e) {
        console.error(e)
    }

}

export const getDatabase = () => database.getInstance()

export default {
    createSQL,
    getDatabase
}