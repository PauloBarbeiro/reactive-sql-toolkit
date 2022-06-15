import {Schema} from "../../types";

import {createQueryFromSchema} from "./index";

describe('createQueryFromSchema', () => {
    it('should create a "CREATE TABLE" query', () => {
        const schema: Schema = {
            tables: {
                test: {
                    fields: {id: 'INTEGER', age: 'INTEGER', name: 'TEXT'},
                }
            }
        }

        const [query] = createQueryFromSchema(schema)

        expect(query).toEqual(
            "CREATE TABLE test (id INTEGER, age INTEGER, name TEXT);"
        )
    })

    it('should create a "CREATE TABLE IF NOT EXISTS" query', () => {
        const schema: Schema = {
            tables: {
                test: {
                    fields: {id: 'INTEGER', age: 'INTEGER', name: 'TEXT'},
                }
            },
            dataBuffer: Symbol('dataBuffer') as unknown as ArrayBuffer
        }

        const [query] = createQueryFromSchema(schema)

        expect(query).toEqual(
            "CREATE TABLE IF NOT EXISTS test (id INTEGER, age INTEGER, name TEXT);"
        )
    })

    it('should create a "CREATE TABLE" and "INSERT INTO" query', () => {
        const schema: Schema = {
            tables:{
                test: {
                    fields: {id: 'INTEGER', age: 'INTEGER', name: 'TEXT'},
                    values: [{id: 1, age: 10, name: 'Ling'}, {id: 2, age: 18, name: 'Paul'}]
                }
            }
        }

        const [query] = createQueryFromSchema(schema)

        expect(query).toEqual(
            "CREATE TABLE test (id INTEGER, age INTEGER, name TEXT);"
            + "INSERT INTO test VALUES (1, 10, 'Ling');"
            + "INSERT INTO test VALUES (2, 18, 'Paul');"
        )
    })

    it('should create a "CREATE TABLE IF NOT EXISTS" and "INSERT INTO" query', () => {
        const schema: Schema = {
            tables:{
                test: {
                    fields: {id: 'INTEGER', age: 'INTEGER', name: 'TEXT'},
                    values: [{id: 1, age: 10, name: 'Ling'}, {id: 2, age: 18, name: 'Paul'}]
                }
            },
            dataBuffer: Symbol('dataBuffer') as unknown as ArrayBuffer
        }

        const [query] = createQueryFromSchema(schema)

        expect(query).toEqual(
            "CREATE TABLE IF NOT EXISTS test (id INTEGER, age INTEGER, name TEXT);"
            + "INSERT INTO test VALUES (1, 10, 'Ling');"
            + "INSERT INTO test VALUES (2, 18, 'Paul');"
        )
    })

    it('should create a "CREATE TABLE" and "INSERT INTO" query with functions', () => {
        const schema: Schema = {
            tables: {
                test: {
                    fields: {id: 'INTEGER', age: 'INTEGER', name: 'TEXT'},
                    values: [
                        {id: 1, age: { asFunc: true, value: 'plusFive(10)'}, name: 'Ling'},
                        {id: 2, age: { asFunc: true, value: 'plusFive(20)'}, name: 'Paul'}]
                }
            }
        }

        const [query] = createQueryFromSchema(schema)

        expect(query).toEqual(
            "CREATE TABLE test (id INTEGER, age INTEGER, name TEXT);"
            + "INSERT INTO test VALUES (1, plusFive(10), 'Ling');"
            + "INSERT INTO test VALUES (2, plusFive(20), 'Paul');"
        )
    })
});