import { useState } from 'react'
import { queryPipeline } from '../../core/SQL'

/**
 * Hook that provide read-only access to the database
 *
 * @param query     Query to be executed
 * @param depths
 */
export function useSelect(query: string, depths?: Array<string | number| boolean | undefined | null>) {
    const [updatedAt, setUpdatedAt] = useState<number>()

    return  queryPipeline(setUpdatedAt, query)
}
