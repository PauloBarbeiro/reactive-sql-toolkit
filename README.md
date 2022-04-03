# Reactive-sql

# [WIP] This library is under development!

Not ready to be used.

Requirements:

1. A component must be able to implement the useQuery hook;
2. The useQuery hook must support:
   1. Read from database
   2. Write in database
3. The component implementing a "read-query-hook" must be updated once the related table is changed;
4. The component implementing a "write-query-hook" must not repeat writing actions in the db;

The library must trigger updates in components once a "watched" table is updated.

## Hooks
useQuery
usePopulate [?]

## Others
1. Usage in middlewares
2. Usage in worker

## Plan
Architecture

1. Core: core wrappers
2. Hooks: to be used in components
3. Accessors: Api for middlewares/async functions.

## Notes

Start sql-wasm
- from where to download
- config needed?
- use a singleton access? or a simple access function?
- use enable a logger tool?

