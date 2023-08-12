import { expect, test } from 'vitest'
import {detectCollision, randomNode, moveNode, createNode} from '../../src/functions/nodes'
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

test('Node should be created correctly by create node', () => {
    const node = createNode(1,1, 1, 1, 'red')

    expect(node.centreX).toBe(1)
    expect(node.centreY).toBe(1)
    expect(node.radius).toBe(1)
    expect(node.index).toBe(1)
    expect(node.color).toBe('red')
    expect(node.name).toBe('N1')

    expect(node?.boundingBox?.left).toBe(0)
    expect(node?.boundingBox?.top).toBe(0)
    expect(node?.boundingBox?.bottom).toBe(2)
    expect(node?.boundingBox?.right).toBe(2)
})

test('Detect a collision between two nodes', () => {
    let node1 = createNode(1,1, 1, 1, 'red')
    let node2 = createNode(2,2, 2, 2, 'red')

    const collision = detectCollision(node2, node1)

    expect(collision.x).toBe(1)
    expect(collision.y).toBe(1)

    // Node moves outsided of the 
    node1 = createNode(1,6,6,1)

    const noCollision = detectCollision(node2, node1)

    expect(noCollision.x).toBe(0)
    expect(noCollision.y).toBe(0)

    node2 = createNode(2,5,5,1)

    const collide2 = detectCollision(node2, node1)

     expect(collide2.x).toBe(-1)
     expect(collide2.y).toBe(-1)
     node2 = createNode(2,7,5,1)
 
     const collide3 = detectCollision(node2, node1)
 
      expect(collide3.x).toBe(1)
      expect(collide3.y).toBe(-1)

      node2 = createNode(2,5,7,1)
  
      const collide4 = detectCollision(node2, node1)
  
       expect(collide4.x).toBe(-1)
       expect(collide4.y).toBe(1)
})

test('Move a node should change the mode', () => {

    const node1 = createNode(1,1, 1, 1)

    const newNode = moveNode(node1, {x:1,y:1}, {width:50, height: 50})

    expect(newNode.node.centreX).toBe(2)
    expect(newNode.node.centreY).toBe(2)
    expect(newNode.node?.boundingBox?.left).toBe(1)

})