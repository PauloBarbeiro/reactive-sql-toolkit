import { createSQL, executeQuery, WasmSources, database } from "./index";

describe('Create Database to initialise the library', function () {
    describe('createSQL', () => {
        it('should initialize a database instance', async () => {
            const db = await createSQL(WasmSources.test)

            expect(db).toBeTruthy()
            expect(db).toHaveProperty('exec')
        }, 5000)

        it('should execute a SQL query', async () => {
            const db = await createSQL(WasmSources.test)

            const result = db!.exec(
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
    })

    describe('executeQuery', function () {
        beforeAll(() => {
            jest.resetAllMocks()
            database.destroy()
        })

        afterEach(() => {
            jest.resetAllMocks()
        })

        it('should log and error because db was not initialized', () => {
            const test = jest.fn()
            const spyOnLogError = jest.spyOn(console, 'error')
            const result = executeQuery('SELECT * FROM test')
            expect(spyOnLogError).toHaveBeenCalledWith('SQL-lite instance not initiated! \nRun createSQL function to initialize the service.')
            expect(result).toEqual(undefined)
        })

        it('should execute a simple query', async () => {
            const db = await createSQL(WasmSources.test)

            db!.exec(
                "DROP TABLE IF EXISTS test;\n"
                + "CREATE TABLE test (id INTEGER, age INTEGER, name TEXT);"
                + "INSERT INTO test VALUES (1, 10, 'Ling');"
                + "INSERT INTO test VALUES (2, 18, 'Paul');"
            );

            const spyOnLogError = jest.spyOn(console, 'error')
            const result = executeQuery('SELECT * FROM test')
            expect(spyOnLogError).not.toHaveBeenCalled()
            expect(result).toEqual([{"columns": ["id", "age", "name"], "values": [[1, 10, "Ling"], [2, 18, "Paul"]]}])
        })

        it('should execute a query with params', async () => {
            const db = await createSQL(WasmSources.test)

            db!.exec(
                "DROP TABLE IF EXISTS test;\n"
                + "CREATE TABLE test (id INTEGER, age INTEGER, name TEXT);"
                + "INSERT INTO test VALUES (1, 10, 'Ling');"
                + "INSERT INTO test VALUES (2, 18, 'Paul');"
            );

            const spyOnLogError = jest.spyOn(console, 'error')
            const result = executeQuery(
                "SELECT age,name FROM test WHERE id=$id1",
                {
                    "$id1": 2,
                })
            expect(spyOnLogError).not.toHaveBeenCalled()
            expect(result).toEqual([{"columns": ["age", "name"], "values": [[18, "Paul"]]}])
        })

        it('should return empty results', async () => {
            const db = await createSQL(WasmSources.test)

            const spyOnLogError = jest.spyOn(console, 'error')
            const result = executeQuery(
                "SELECT age,name FROM test",
                )
            expect(spyOnLogError).toHaveBeenCalledWith('SQL-lite Error: no such table: test')
            expect(result).toEqual(undefined)
        })
    });
});