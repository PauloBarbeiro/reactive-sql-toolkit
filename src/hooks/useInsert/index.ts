import {useCallback} from 'react'
import {insertQueryPipeline} from '../../core/SQL'

/**
 * Hook that provide write-only access to the database
 *
 */
export function useInsert() {
    return useCallback((query: string) => {
        insertQueryPipeline(query)
    }, [])
}
