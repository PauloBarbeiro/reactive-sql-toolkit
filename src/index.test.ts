import createSQL from './index';
import {Schema, WasmSources} from "./types";

describe('createSQL', () => {
    it('should execute the createSQL function', async () => {
        const schema: Schema = {
            tables: {
                test: {
                    fields: {id: 'INTEGER', age: 'INTEGER', name: 'TEXT'},
                }
            }
        }

        const db = await createSQL(WasmSources.test, schema)

        expect(db).toBeTruthy()
    })
})