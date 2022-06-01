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
            const regExResult = readingQueryMatch(
                "SELECT age,name FROM test WHERE id=$id1",
                ['test', 'table1', 'table2'],
            )

            expect(regExResult).toEqual([ "test"])
        })

        it('should return a match result for an reading query using JOIN', () => {
            const regExResult = readingQueryMatch(
                "SELECT test.OrderID FROM test INNER JOIN table1 ON test.CustomerID=table1.CustomerID;",
                ['test', 'table1', 'table2'],
            )

            expect(regExResult).toEqual(["test", "table1"])
        })

        it('should return a match result for an reading query using simple JOIN', () => {
            const regExResult = readingQueryMatch(
                "SELECT b.id, b.title, a.first_name, a.last_name\n" +
                "FROM books b\n" +
                "INNER JOIN authors a\n" +
                "ON b.author_id = a.id\n" +
                "ORDER BY b.id;",
                ['test', 'books', 'author'],
            )

            expect(regExResult).toEqual(["books", "author"])
        })

        it('should return a match result for an reading query using multiple LEFT JOIN', () => {
            const regExResult = readingQueryMatch(
                "SELECT b.id, b.title, b.type, a.last_name AS author,\n" +
                " t.last_name AS translator\n" +
                "FROM books b\n" +
                "LEFT JOIN authors a\n" +
                "ON b.author_id = a.id\n" +
                "LEFT JOIN translators t\n" +
                "ON b.translator_id = t.id\n" +
                "ORDER BY b.id;",
                ['test', 'books', 'author', 'translators'],
            )

            expect(regExResult).toEqual(["books", "author", "translators"])
        })

        it('should return a match result for an reading query using multiple FULL JOIN', () => {
            const regExResult = readingQueryMatch(
                "SELECT b.id, b.title, a.last_name AS author, e.last_name AS editor,\n" +
                "    t.last_name AS translator\n" +
                "FROM books b\n" +
                "FULL JOIN authors a\n" +
                "ON b.author_id = a.id\n" +
                "FULL JOIN editors e\n" +
                "ON b.editor_id = e.id\n" +
                "FULL JOIN translators t\n" +
                "ON b.translator_id = t.id\n" +
                "ORDER BY b.id;",
                ['test', 'books', 'author', 'translators', 'editors'],
            )

            expect(regExResult).toEqual(["books", "author", "editors", "translators"])
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

            expect(table).toEqual(["test"])
        })

        it('should return multiple tables when a reading query uses JOIN', () => {
            const table = tableFromReadQuery(
                "SELECT age,name FROM test INNER JOIN table1 WHERE id=$id1",
                ['test', 'table1', 'table2'],
            )

            expect(table).toEqual(["test", "table1"])
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