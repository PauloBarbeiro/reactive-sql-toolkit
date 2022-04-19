/**
 * Module with helper functions to execute Regular Expressions
 */

/**
 * Returns the result of the String.match method against the RegEx:
 * `^(SELECT).+(?<table>${tables.join('|')})`
 *
 * @param query     Query to be tested
 * @param tables    List of database tables
 * @return the result of query.match method
 */
export const readingQueryMatch = (query: string, tables: Array<string>): RegExpMatchArray | null => {
    const readRegEx = new RegExp(`^(SELECT).+(?<table>${tables.join('|')})`)
    return query.match(readRegEx)
}

/**
 * Returns the result of the String.match method against the RegEx:
 * `^(INSERT INTO).+(?<table>${tables.join('|')})`
 *
 * @param query     Query to be tested
 * @param tables    List of database tables
 * @return the result of query.match method
 */
export const writingQueryMatch = (query: string, tables: Array<string>): RegExpMatchArray | null => {
    const readRegEx = new RegExp(`^(INSERT INTO).+(?<table>${tables.join('|')})`)
    return query.match(readRegEx)
}

/**
 * Returns the table on which the query was SELECTing data from.
 *
 * @param query     Query to be tested
 * @param tables    List of database tables
 * @return The table name, or null
 */
export const tableFromReadQuery = (query: string, tables: Array<string>): string | null => {
    const regExRes = readingQueryMatch(query, tables)
    const table = regExRes?.groups?.table
    if(table) {
        return table
    }

    return null
}

/**
 * Returns the table on which the query was INSERTing data to.
 *
 * @param query     Query to be tested
 * @param tables    List of database tables
 * @return The table name, or null
 */
export const tableFromWritingQuery = (query: string, tables: Array<string>): string | null => {
    const regExRes = writingQueryMatch(query, tables)
    const table = regExRes?.groups?.table
    if(table) {
        return table
    }

    return null
}