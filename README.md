# Reactive-sql

Simple React Hook that enables use of SQLite on React apps.
This hook enables reactive behavior with sql.js library.

## Usage

1. Install sql.js and reactive-sql
```shell
npm install sql.js @paulobarbeiro/reactive-sql
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
    beatles: {
        fields: {id: 'INTEGER', age: 'INTEGER', name: 'TEXT'},
        values: [{id: 1, age: 20, name: 'Ringo'}, {id: 2, age: 18, name: 'Paul'}]
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

## Example

Check for more details in the [samples folder](https://github.com/PauloBarbeiro/reactive-sql/tree/main/samples)

```typescript jsx
import { createRoot } from 'react-dom/client';
import React, {FC} from 'react';
import createSQL, { useQuery } from '@paulobarbeiro/reactive-sql'

// Defines a database schema
const schema: Schema = {
    beatles: {
        fields: { id: 'INTEGER', age: 'INTEGER', name: 'TEXT' },
        values: [{id: 1, age: 20, name: 'Ringo'}, {id: 2, age: 18, name: 'Paul'}]
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

Road Map:
- Fix types export
- Support Views
- Improve documentation