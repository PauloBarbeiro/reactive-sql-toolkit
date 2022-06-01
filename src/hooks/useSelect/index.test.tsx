import React from "react";
import {getByText, render, fireEvent, waitFor, act} from '@testing-library/react'
import {Schema, WasmSources} from '../../types'
import {createSQL, insertQueryPipeline} from '../../core/SQL'
import {useSelect} from "./index";

describe('useSelect', function () {
    describe('Simple Query', () => {
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
    })

    describe('Query with Join', () => {
        const TestComponent = () => {
            const result = useSelect(`
                SELECT 
                    orders.OrderID, customers.name, orders.OrderDate
                FROM orders
                INNER JOIN customers 
                ON orders.CustomerID=customers.id;
            `)

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
                        {data.values.map(([orderId, name, orderDate], index) => (
                            <tr key={index}>
                                <th scope="row">{orderId}</th>
                                <td>{name}</td>
                                <td>{orderDate}</td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </>
            )
        }

        beforeAll(async () => {
            const schema: Schema = {
                customers: {
                    fields: {id: 'INTEGER', name: 'TEXT'},
                    values: [{id: 1, name: 'Ringo'}, {id: 2, name: 'Paul'}]
                },
                orders: {
                    fields: {OrderID: 'INTEGER', CustomerID: 'INTEGER', OrderDate: 'DATE'},
                    values: [
                        {OrderID: 123, CustomerID: 1, OrderDate: '1996-09-18'},
                        {OrderID: 456, CustomerID: 2, OrderDate: '1996-09-19'}
                    ]
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
                insertQueryPipeline("INSERT INTO customers VALUES (3, 'John');")
                insertQueryPipeline("INSERT INTO orders VALUES (789, 3, '1996-09-20');")
            })

            await waitFor(() => {
                expect(getByText('John')).toBeTruthy()
                expect(container).toMatchSnapshot()
            })
        })
    })
});
