import {
    readingQueryMatch,
    tableFromReadQuery,
    tableFromWritingQuery,
    writingQueryMatch,
} from "./index";

describe('RegEx Helpers', () => {
    describe('readingQueryMatch', () => {
        it('should return null for writing query', () => {
            const regEx = readingQueryMatch(
                "INSERT INTO test VALUES ($id1, :age1, @name1);",
                ['test', 'table1', 'table2'],
            )

            expect(regEx).toEqual(null)
        })

        it('should return the match result for an reading query', () => {
            const regEx = readingQueryMatch(
                "SELECT age,name FROM test WHERE id=$id1",
                ['test', 'table1', 'table2'],
            )

            expect(JSON.stringify(regEx)).toEqual(JSON.stringify(["SELECT age,name FROM test", "SELECT", "test"]))
        })
    })

    describe('writingQueryMatch', () => {
        it('should return the match for a writing query', () => {
            const regEx = writingQueryMatch(
                "INSERT INTO test VALUES ($id1, :age1, @name1);",
                ['test', 'table1', 'table2'],
            )

            expect(JSON.stringify(regEx)).toEqual(JSON.stringify(["INSERT INTO test", "INSERT INTO", "test"]))
        })

        it('should return null for an reading query', () => {
            const regEx = writingQueryMatch(
                "SELECT age,name FROM test WHERE id=$id1",
                ['test', 'table1', 'table2'],
            )

            expect(regEx).toEqual(null)
        })
    })

    describe('tableFromReadQuery', () => {
        it('should return null for writing query', () => {
            const table = tableFromReadQuery(
                "INSERT INTO test VALUES ($id1, :age1, @name1);",
                ['test', 'table1', 'table2'],
            )

            expect(table).toEqual(null)
        })

        it('should return the table name in a reading query', () => {
            const table = tableFromReadQuery(
                "SELECT age,name FROM test WHERE id=$id1",
                ['test', 'table1', 'table2'],
            )

            expect(table).toEqual("test")
        })
    })

    describe('tableFromWritingQuery', () => {
        it('should return the table name in a writing query', () => {
            const table = tableFromWritingQuery(
                "INSERT INTO test VALUES ($id1, :age1, @name1);",
                ['test', 'table1', 'table2'],
            )

            expect(table).toEqual("test")
        })

        it('should return null in a reading query', () => {
            const table = tableFromWritingQuery(
                "SELECT age,name FROM test WHERE id=$id1",
                ['test', 'table1', 'table2'],
            )

            expect(table).toEqual(null)
        })
    })
})