import { createSQL, getDatabase, WasmSources } from "./index";

describe('Create Database to initialise the library', function () {
    it('should initialize a database instance', async () => {
        const db = await createSQL(WasmSources.test)

        expect(db).toBeTruthy()
        expect(db).toHaveProperty('exec')
    }, 5000)

    it('should execute a SQL query', async () => {
        const db = await createSQL(WasmSources.test)

        const result = db.exec(
            "DROP TABLE IF EXISTS test;\n"
            + "CREATE TABLE test (id INTEGER, age INTEGER, name TEXT);"
            + "INSERT INTO test VALUES ($id1, :age1, @name1);"
            + "INSERT INTO test VALUES ($id2, :age2, @name2);"
            + "SELECT id FROM test;"
            + "SELECT age,name FROM test WHERE id=$id1",
            {
                "$id1": 1, ":age1": 1, "@name1": "Ling",
                "$id2": 2, ":age2": 18, "@name2": "Paul"
            }
        );

        expect(result).toEqual([
            {columns:['id'],values:[[1],[2]]},
            {columns:["age","name"],values:[[1,"Ling"]]},
        ])
    }, 5000)

});