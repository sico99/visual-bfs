import { expect, test } from 'vitest'
import {detectCollision, randomNode, moveNode} from '../../src/functions/nodes'
import { Node } from '../../src/types'

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
    
})

test('Detect a collision between two nodes', () => {
    const node1:Node = {
        name: 'Node 1',
        color: 'red',
        centreX: 1,
        centreY: 1,
        radius: 1,
        boundingBox: {
            left:0,
            right:2,
            top: 0,
            bottom: 2
        }
    } 

    const node2:Node = {
        name: 'Node 1',
        color: 'red',
        centreX: 2,
        centreY: 2,
        radius: 1,
        boundingBox: {
            left:1,
            right:3,
            top: 1,
            bottom: 3
        }
    } 

    const collision = detectCollision(node2, node1)

    expect(collision.x).toBe(1)
    expect(collision.y).toBe(1)

    // Node moves to the left then we should reverse the x
    node1.centreX = 5
    node1.centreY = 5
    node1.boundingBox = {
        left:4,
        top: 4,
        right: 6,
        bottom: 6
    }

    const noCollision = detectCollision(node2, node1)

    expect(noCollision.x).toBe(0)
    expect(noCollision.y).toBe(0)
})

test('Move a node should change the mode', () => {

    const node1:Node = {
        name: 'Node 1',
        color: 'red',
        centreX: 1,
        centreY: 1,
        radius: 1,
        boundingBox: {
            left:0,
            right:2,
            top: 0,
            bottom: 2
        }
    } 

    const newNode = moveNode(node1, {x:1,y:1}, {width:50, height: 50})

    expect(newNode.node.centreX).toBe(2)
    expect(newNode.node.centreY).toBe(2)
    expect(newNode.node?.boundingBox?.left).toBe(1)

})