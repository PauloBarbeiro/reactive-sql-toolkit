import {useEffect, useState} from 'react'
import { executeQuery } from '../../core/SQL'
import { hash } from '../../core/hash'

export function useQuery(query: string, depths?: Array<string | number| boolean | undefined | null>) {
    const [updatedAt, setUpdatedAt] = useState()
    const [queryId, setQueryId] = useState<number | null>(null)
    /*
    const [currentDepth, setCurrentDepth] = useState(depths)
    if(currentDepth && currentDepth.length !== depths?.length) {
        throw new Error('useQuery Error: depths array must have the same length across the life cycle.')
    }
    // */

    useEffect(() => {
        const hashId = hash(query)
        setQueryId(hashId)
    }, [])

    return executeQuery(query)
}
