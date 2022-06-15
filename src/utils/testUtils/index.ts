import { createSQL} from "../../core";
import { Schema, WasmSources } from "../../types";

/**
 * Returns an ArrayBuffer from a database using the input schema.
 *
 * Data collected as exemplified in: https://sql.js.org/#/?id=write-a-database-to-the-disk
 */
export const getArrayBufferForTest = (schema: Schema) =>
    createSQL(WasmSources.test, schema)
        .then(db => {
            if(!db) {
                console.error('getArrayBufferForTest ERROR: database not created!')
                return
            }

            const data = db.export();
            db.close()
            return Buffer.from(data)
        })
        .catch(error => {
            console.error('getArrayBufferForTest ERROR: ', error)
        })