import { uniq } from "./index";

describe('uniq', () => {
    it('should return an array with uniq elements', () => {
        const result = uniq([1,2,2,3,1,4,5,4] as any)
        expect(result).toEqual([1,2,3,4,5])
    })
})