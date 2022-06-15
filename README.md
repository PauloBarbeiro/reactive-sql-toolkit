# Reactive-sql-toolkit

Library with a toolkit for using SQLite (wasm) on React apps. The tools are:
- Hooks: read, and write from the database :heavy_check_mark:
- Functions to execute queries on the database for multiple purposes :heavy_check_mark:
- API to create schemas for the database :heavy_check_mark:
- API to sync and backup the data. :construction:

Simple React Hook that enables use of SQLite on React apps.
This hook enables reactive behavior with sql.js library.

## Usage

1. Install sql.js and reactive-sql-toolkit
```shell
# For javascript projects
npm install sql.js reactive-sql-toolkit

# For Typescript projects
npm install sql.js @types/sql.js reactive-sql-toolkit
```

2. Export the wasm file from SQL.js folder to your distribution folder.
With WebPack you can use the CopyPlugin
   1. You can also use the wasm files available on sql.js CDN.
```javascript
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
    // ...
    resolve: {
        // Tip: disable the follwing fallback on WebPack 5+
        fallback: { "crypto":false, "path": false, "fs": false }
    },
    plugins: [
        new CopyWebpackPlugin({
            patterns: [
                // Also possible to fetch the Wasm file from CDN. Check options bellow.
                {from: 'node_modules/sql.js/dist/sql-wasm.wasm', to: 'sql-wasm.wasm'},
            ]
        })
    ],
    // ...
};
```
```
CDN link
https://cdnjs.com/libraries/sql.js

Prod: 'https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.6.1/sql-wasm.wasm',
Debug: 'https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.6.1/sql-wasm-debug.wasm',
```
3. Define your database schema and execute the createSQL function before the hooks are used in your app.
   1. The schema is a dictionary of your tables, with the table fields, and initial values to be inserted in the database;
   2. The example bellow will create the 'beatles' table with columns id, age and name;
   3. The values are optional. If given they will be used in a query 
      "INSERT INTO table_name (fields, ...fieldN) VALUES (value, ...valueN);"
```typescript jsx
const schema: Schema = {
    tables: {
       beatles: {
          fields: {id: 'INTEGER', age: 'INTEGER', name: 'TEXT'},
          values: [{id: 1, age: 20, name: 'Ringo'}, {id: 2, age: 18, name: 'Paul'}]
       } 
    }
}

// Creates the SQLite instance and build the tables
await createSQL('http://localhost:3030/sql-wasm.wasm', schema)
```

4. In your components you can use the 'useQuery' hook. It will give you the results of the query, and a 'writeQueryFn'.
   The result is always the result of your query, and the 'writeQueryFn' you can use write in the database, and grant the
   reactive behavior in your components.
```typescript jsx
const { result, writeQueryFn } = useQuery("SELECT age,name FROM beatles")
```

## Examples

### Demo apps

Live examples: https://paulobarbeiro.github.io/react-sql-samples/

The code for the demo apps you find in our special repo https://github.com/PauloBarbeiro/react-sql-samples.

### Implementation Basics

```typescript jsx
import { createRoot } from 'react-dom/client';
import React, {FC} from 'react';
import createSQL, { useQuery } from 'reactive-sql-toolkit'

// Defines a database schema
const schema: Schema = {
   tables: {
      beatles: {
         fields: { id: 'INTEGER', age: 'INTEGER', name: 'TEXT' },
         values: [{id: 1, age: 20, name: 'Ringo'}, {id: 2, age: 18, name: 'Paul'}]
      }
   }
}

// Creates the SQLite instance and build the tables
await createSQL('http://localhost:3030/sql-wasm.wasm', schema)
    .then((db) => {
       // The database must be initialized before it is used.
       const container = document.getElementById('root');
       const root = createRoot(container);
       root.render(<App />)
    })

const App: FC = () => {
   const { result, writeQueryFn } = useQuery("SELECT age,name FROM beatles")

   const handleAddLennon = () => {
      writeQueryFn("INSERT INTO beatles VALUES (3, 22, 'John');")
   }

   const handleAddGeorge = () => {
      writeQueryFn("INSERT INTO beatles VALUES (4, 25, 'George');")
   }

   if(!result || result.length === 0) {
      return (
              <p>No data available</p>
      )
   }

   const [data] = result

   return (
           <>
              <h1>Add a beatle</h1>
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
              <button onClick={handleAddGeorge}>Add Harrison</button>
           </>
   )
}
```

## Documentation

### Schema

Represent the structure of your database, its initial data, and optionally an ArrayBuffer generated from a SQLite file.
The `tables` property holds the tables definitions. Each child of `tables` will generate a table with the same name; 
The **fields** are used to build the table using the SQL CREATE command. The **values** will be used to INSERT INTO the table.

Note that if the **values** do not follow the **fields** configuration/definition, an SQL error will be thrown.

Bellow you can see the schema definition.
```typescript
export type TableDefinitions = {
    fields: Record<string, SqlDataType>
    values?: Array<Record<string, string | number | ValueFunction>>
}

export interface Schema {
    tables: Record<string, TableDefinitions>,
    dataBuffer?: ArrayBuffer
}
```

The `dataBuffer` is optional. If passed it will be converted to an Uint8Array, and passed to the SQL.Database constructor,
as demonstrated in the [SQL.js documentation](https://sql.js.org/#/?id=loading-a-database-from-a-server)

#### Examples

Bellow you have a schema example, and the SQL queries that will be executed.
```typescript
const schema: Schema = {
   tables: {
      beatles: {
         fields: { id: 'INTEGER', age: 'INTEGER', name: 'TEXT' },
         values: [{id: 1, age: 22, name: 'Ringo'}, {id: 2, age: 20, name: 'Paul'}]
      }
   },
}
```
Executed command
```SQL
CREATE TABLE beatles (id INTEGER, age INTEGER, name TEXT);
INSERT INTO beatles VALUES (1, 22, 'Ringo');
INSERT INTO beatles VALUES (2, 20, 'Paul');
```

If a schema is passed if the `dataBuffer`, the create command will use `CREATE TABLE IF NOT EXISTS`.

### Functions

It is possible to add custom functions to be used in the SQL queries, as described in the SQL.js documentation. There are
two ways to add the functions:

1. Use the sql.js `create_function` function from the dq instance;
2. Pass a dictionary of functions to the `createSQL` function (Recommended);

#### Using the Reactive-sql-toolkit API

Using the second method you can use the function right in the schema object. Check the example bellow:

```typescript
const schema: Schema = {
    beatles: {
        fields: { id: 'INTEGER', age: 'INTEGER', name: 'TEXT', famousWith: 'INTEGER' },
        values: [
           {id: 1, age: 22, name: 'Ringo', famousWith: {asFunc: true, value: 'makeOlder(22)'}}, 
           {id: 2, age: 20, name: 'Paul', famousWith: {asFunc: true, value: 'makeOlder(20)'}},
        ]
    }
}

const functions = {
    makeOlder: (x: number): number => x + 10
}

createSQL('http://localhost:3030/sql-wasm.wasm', schema, functions)
```
It will execute the INSERT command as:
```SQL
CREATE TABLE beatles (id INTEGER, age INTEGER, name TEXT, famousWith INTEGER);
INSERT INTO beatles VALUES (1, 22, 'Ringo', makeOlder(22));
INSERT INTO beatles VALUES (2, 20, 'Paul', makeOlder(20));
```
Later the functions can be used in the SELECT queries:
```typescript
const { result, writeQueryFn } = useQuery("SELECT name, makeOlder(age) as older FROM beatles")
```

#### Using the SQL.js API

Alternatively, it is also possible to use the sql.js create_function API. Here is an example:

```typescript jsx
const schema = {
   beatles: {
      fields: { id: "INTEGER", age: "INTEGER", name: "TEXT" },
      values: [
         { id: 1, age: 20, name: "Ringo" },
         { id: 2, age: 18, name: "Paul" }
      ]
   }
};

const TestComponent = () => { 
    useEffect(() => {
        createSQL(sqlWasm, schema)
            .then((database) => {
               if (!!database) {
                  // You can also use JavaScript functions inside your SQL code.
                  // Create the js function you need.
                  // Specifies the SQL function's name, the number of it's arguments, and the js function to use
                  dataBase.create_function("double", double);
               }
            })
    }, []);

    const { result } = useQuery("SELECT name, age, double(age) FROM beatles");

   // return (...)
}
```

### createSQL

Asynchronous function that starts the whole SQLite toolkit. Its execution must be concluded before any query is executed
to the database.

As inputs, the function will get the path for the SQLite wasm file and a `schema` object as mandatory parameters (the 
`functions` dictionary is optional). And return a database (new SQL.Database() from sql.js) object instance. Queries 
executed directly to the database instance, will not have any reactive effect. 
It is recommended to use the Reactive-sql-toolkit API.

```typescript
createSQL('http://localhost:3030/sql-wasm.wasm', schema, functions)
```

### useQuery [React Hook]

Hook a component to a particular SQL query. It enables a listener that will rerender a component on every 
change/update of the table in the query.

Returns an object containing **result** and **writeQueryFn**. The **result** hold information of the resulting data 
(headers and data itself). The **writeQueryFn** is an auxiliar function where "writing" queries can be executed granting
the desired react[ish] behavior.

```typescript jsx
const { result, writeQueryFn } = useQuery("SELECT age,name FROM beatles")

const handleAddLennon = () => {
   writeQueryFn("INSERT INTO beatles VALUES (3, 23, 'John');")
}

const [data] = result

return (
   <table>
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
)
```

### useSelect [React Hook]

Hook a component to a read-only SQL query. It enables a listener that will rerender a component on every
change/update of the table in the query.

Returns the **result** information of the resulting data (headers and data itself).

```typescript jsx
const result = useSelect("SELECT age,name FROM beatles")

const [data] = result

return (
   <table>
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
)
```

### useInsert [React Hook]

Returns a function that enables write-only access to the database.

Returns a **insertFunction** to enable "write-only" queries to be executed.

```typescript jsx
const insertFunction = useInsert()
const { result, writeQueryFn } = useQuery("SELECT age,name FROM beatles")

const handleAddLennon = () => {
   insertFunction("INSERT INTO beatles VALUES (3, 23, 'John');")
}

const [data] = result

return (
   <>
      <button onClick={handleAddLennon}>Add Lennon</button>
      <table>
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
```

## Roadmap
- Implement functions to support uses in Redux middlewares, Mobex and Recoil
- Improve documentation
- Fix types export
- Add "dependencies" for hooks
- Implement API to add SQL functions
- Support SQL Views
- Synchronization with server databases