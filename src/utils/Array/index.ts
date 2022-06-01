/**
 * Returns an array with uniq values of the input array.
 *
 * @param array Array with duplicated elements
 */
export const uniq = (array: RegExpMatchArray): Array<string | number> => {
    const final: Array<string | number> = []
    const cache: Record<string | number, boolean> = {}
    array.forEach(n=> {
        if(!cache[n]){
            cache[n] = true
            final.push(n)
        }
    })
    return final;
}