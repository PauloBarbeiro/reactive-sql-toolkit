import {Schema} from "../../types";

/**
 * Create a SQL query from the input schema model.
 *
 * @param schema    Schema for the database
 * @return A tuple with the query string and a list of the tables.
 */
export const createQueryFromSchema = (schema: Schema): [string, Array<string>] => {
    const tables = Object.keys(schema)

    const createTable = "CREATE TABLE"

    let query = ""

    tables.forEach(table => {
        const { fields, values } = schema[table]

        const fieldsPart = Object.keys(fields).reduce((acc, field, idx, keys) => {
            return acc + `${field} ${fields[field]}` + (idx < keys.length - 1 ? ', ' : '')
        }, '')

        const insertPart = values
            ? values.map((data) => {
                const dataPart = Object.keys(data).reduce((acc, key, idx, keys) => {
                    const value = data[key]
                    return acc += (typeof value === "string" ? `'${value}'` : `${value}`) + ((idx < keys.length - 1 ? ', ' : ''))
                }, '')

                return `INSERT INTO ${table} VALUES (${dataPart});`
            }).join('')
            : []

        query += `${createTable} ${table} (${fieldsPart});${insertPart}`
    })

    return [query, tables]
}