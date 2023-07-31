import { expect, test } from 'vitest'
import {randomNode} from '../../src/functions/nodes'

test('Nodes should be able to be generated at random', () => {
    const count = 10
    const index = 1
    const current = new Map()

    const newNode = randomNode(index, current, count)
    
    expect(newNode).to.be.greaterThan(-1)
    expect(newNode).not.toBe(index)


    for (let i = 0; i < count; i++)
     randomNode(index, current, count)

    expect(current.size === count -1)
    expect(current.has(index)).toBe(false)

    console.log(current);
    
})