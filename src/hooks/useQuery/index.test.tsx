import React from "react";
import {getByText, render, fireEvent, waitFor} from '@testing-library/react'
import {Schema, WasmSources} from '../../types'
import {createSQL} from '../../core/SQL'
import {useQuery} from "./index";

const double = (x: number): number => x + x

const TestComponent = () => {
    const {result, writeQueryFn } = useQuery("SELECT age, name, double(age) as older FROM test")

    const handleAddLennon = () => {
        writeQueryFn("INSERT INTO test VALUES (3, 22, 'John');")
    }

    const handleAddGeorge = () => {
        writeQueryFn("INSERT INTO test VALUES (4, 25, 'George');")
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
                {data.values.map(([age, name, older], index) => (
                    <tr key={index}>
                        <th scope="row">{name}</th>
                        <td data-testid={`age-${name}`}>{age}</td>
                        <td data-testid={`older-${name}`}>{older}</td>
                    </tr>
                ))}
                </tbody>
            </table>
            <button onClick={handleAddLennon}>Add Lennon</button>
            <button onClick={handleAddGeorge}>Add Harrison</button>
        </>
    )
}

describe('useQuery', function () {
    beforeAll(async () => {
        const schema: Schema = {
            tables: {
                test: {
                    fields: {id: 'INTEGER', age: 'INTEGER', name: 'TEXT'},
                    values: [{id: 1, age: 17, name: 'Ringo'}, {id: 2, age: 18, name: 'Paul'}]
                }
            }
        }

        const functions = {
            double
        }

        await createSQL(WasmSources.test, schema, functions)
    })

    it('should execute a query and return some data', () => {
        const { container, getByText, getByTestId } = render(<TestComponent />)
        expect(container).toMatchSnapshot()
        expect(getByText('Ringo')).toBeTruthy()
        expect(getByText('Paul')).toBeTruthy()
        expect(getByTestId('age-Ringo')).toMatchSnapshot()
        expect(getByTestId('age-Paul')).toMatchSnapshot()
    })

    it('should react to a change in the queried table (add John Lennon)', async () => {
        const { container, getByText } = render(<TestComponent />)
        expect(container).toMatchSnapshot()

        const addJohnBtn = getByText('Add Lennon')

        fireEvent.click(addJohnBtn)

        await waitFor(() => {
            expect(getByText('John')).toBeTruthy()
        })
    })

    it('should react to a change in the queried table (add George Harrison)', async () => {
        const { container, getByText } = render(<TestComponent />)
        expect(container).toMatchSnapshot()

        const addJohnBtn = getByText('Add Harrison')

        fireEvent.click(addJohnBtn)

        await waitFor(() => {
            expect(getByText('George')).toBeTruthy()
        })
    })
});
