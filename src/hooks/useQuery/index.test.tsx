import React from "react";
import {getByText, render, fireEvent, waitFor} from '@testing-library/react'
import {createSQL, Schema, WasmSources} from '../../core/SQL'
import {useQuery} from "./index";

// [{"columns": ["age", "name"], "values": [[18, "Paul"]]}]

const TestComponent = () => {
    const result = useQuery("SELECT age,name FROM test")

    const handleAddLennon = () => {
        console.log(' add Lennon')
    }

    const handleAddGeorge = () => {
        console.log(' add George')
    }

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
            <button onClick={handleAddLennon}>Add Lennon</button>
            <button onClick={handleAddGeorge}>Add George</button>
        </>
    )
}

describe('useQuery', function () {
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

    it('should react to a change in the queried table', async () => {
        const { container, getByText } = render(<TestComponent />)
        expect(container).toMatchSnapshot()

        const addJohnBtn = getByText('Add Lennon')

        fireEvent.click(addJohnBtn)

        await waitFor(() => {
            expect(getByText('John')).toBeTruthy()
        })
    })
});
