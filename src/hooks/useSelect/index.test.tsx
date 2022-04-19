import React from "react";
import {getByText, render, fireEvent, waitFor, act} from '@testing-library/react'
import {Schema, WasmSources} from '../../types'
import {createSQL, insertQueryPipeline} from '../../core/SQL'
import {useSelect} from "./index";

const TestComponent = () => {
    const result = useSelect("SELECT age,name FROM test")

    if(!result || result.length === 0) {
        return (
            <p>No data available</p>
        )
    }

    const [data] = result

    return (
        <>
            <table>
                <caption>Table results</caption>
                <thead>
                <tr>
                    {data.columns.map((column, index) => (<th scope="col" key={index}>{column}</th>))}
                </tr>
                </thead>
                <tbody>
                {data.values.map(([age, name], index) => (
                    <tr key={index}>
                        <th scope="row">{name}</th>
                        <td>{age}</td>
                    </tr>
                ))}
                </tbody>
            </table>
        </>
    )
}

describe('useSelect', function () {
    beforeAll(async () => {
        const schema: Schema = {
            test: {
                fields: {id: 'INTEGER', age: 'INTEGER', name: 'TEXT'},
                values: [{id: 1, age: 17, name: 'Ringo'}, {id: 2, age: 18, name: 'Paul'}]
            }
        }

        await createSQL(WasmSources.test, schema)
    })

    it('should execute a query and return some data', () => {
        const { container, getByText } = render(<TestComponent />)
        expect(container).toMatchSnapshot()
        expect(getByText('Ringo')).toBeTruthy()
        expect(getByText('Paul')).toBeTruthy()
    })

    it('should react to a change in the queried table (add John Lennon)', async () => {
        const { container, getByText } = render(<TestComponent />)

        expect(container).toMatchSnapshot()

        act(() => {
            insertQueryPipeline("INSERT INTO test VALUES (3, 22, 'John');")
        })

        await waitFor(() => {
            expect(getByText('John')).toBeTruthy()
        })
    })
});
