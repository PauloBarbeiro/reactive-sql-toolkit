import {Schema, ValueFunction} from "../../types";

/**
 * Create a SQL query from the input schema model.
 *
 * @param schema    Schema for the database
 *
 * @return A tuple with the query string and a list of the tables.
 */
export const createQueryFromSchema = (schema: Schema): [string, Array<string>] => {
    const { tables, dataBuffer } = schema
    const cautionMode: boolean = !!dataBuffer
    const tablesList = Object.keys(tables)

    const createTable = cautionMode
        ? "CREATE TABLE IF NOT EXISTS"
        : "CREATE TABLE"

    let query = ""

    tablesList.forEach(table => {
        const { fields, values } = tables[table]

        const fieldsPart = Object.keys(fields).reduce((acc, field, idx, keys) => {
            return acc + `${field} ${fields[field]}` + (idx < keys.length - 1 ? ', ' : '')
        }, '')

        const insertPart = values
            ? values.map((data) => {
                const dataPart = Object.keys(data).reduce((acc, key, idx, keys) => {
                    const value = typeof data[key] === "string"
                        ? `'${data[key]}'`
                        : (data[key] as ValueFunction).asFunc
                            ? `${(data[key] as ValueFunction).value}`
                            : `${data[key]}`

                    return acc + (value) + ((idx < keys.length - 1 ? ', ' : ''))
                }, '')

                return `INSERT INTO ${table} VALUES (${dataPart});`
            }).join('')
            : []

        query += `${createTable} ${table} (${fieldsPart});${insertPart}`
    })

    return [query, tablesList]
}