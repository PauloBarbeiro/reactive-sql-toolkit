import React from "react";
import {getByText, render, fireEvent, waitFor} from '@testing-library/react'
import { createSQL, WasmSources } from '../../core/SQL'
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
        const db = await createSQL(WasmSources.test)

        db!.exec(
            "DROP TABLE IF EXISTS test;\n"
            + "CREATE TABLE test (id INTEGER, age INTEGER, name TEXT);"
            + "INSERT INTO test VALUES ($id1, :age1, @name1);"
            + "INSERT INTO test VALUES ($id2, :age2, @name2);",
            {
                "$id1": 1, ":age1": 17, "@name1": "Ringo",
                "$id2": 2, ":age2": 18, "@name2": "Paul"
            }
        );
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
