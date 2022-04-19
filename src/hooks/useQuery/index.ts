import {useCallback, useState} from 'react'
import {insertQueryPipeline, queryPipeline} from '../../core/SQL'

export function useQuery(query: string, depths?: Array<string | number| boolean | undefined | null>) {
    const [updatedAt, setUpdatedAt] = useState<number>()

    const writeQueryFn = useCallback((query: string) => {
        insertQueryPipeline(/*setUpdatedAt,*/ query)
    }, [])

    return {
        result: queryPipeline(setUpdatedAt, query),
        writeQueryFn
    }
}
