import { hash } from './index'

describe('hash', function () {
    it('should create a basic predictable hash', () => {
        const result = hash("SELECT id FROM test;")

        expect(result).toMatchSnapshot()
        expect(result).toEqual(-1631577509)
    })

    it("should create a complex predictable hash", () => {
        const result = hash(
            "DROP TABLE IF EXISTS test;\n"
            + "CREATE TABLE test (id INTEGER, age INTEGER, name TEXT);"
            + "INSERT INTO test VALUES (1, 18, 'Liu');"
            + "INSERT INTO test VALUES (2, 20, 'Paul');"
            + "SELECT id FROM test;"
            + "SELECT age,name FROM test WHERE id=1"
        )

        expect(result).toMatchSnapshot()
        expect(result).toEqual(-1367929158)
    })
});