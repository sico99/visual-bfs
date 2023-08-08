import { Node, Size, Vector, NodePair, Edge } from "../types"

const cir = 2 * Math.PI

export const randomNode = (index: number, current: Map<number, number>, count:number, tries = 0):number  => {
	const rand = parseInt((Math.random() * count).toFixed(0))
    
	if ((current.has(rand) || rand == index) &&  tries < count)
		return randomNode(index, current,count, tries+1)
	else {
		// We may weight verticies at some point
		current.set(rand, 1)
		return rand
	}
  }

  /**
   * Test if two nodes collide
   * @param {Node} movingNode A node to test 
   * @param {Node} staticNode A second node to test if collided
   * @returns {Vector} True if a collision has occurred
   */
export const detectCollision = (movingNode: Node, staticNode: Node):Vector  => {
	if (movingNode.boundingBox === undefined || staticNode.boundingBox === undefined)
		return {x: 0, y:0}

	let vector = {x:0, y:0}

	
	// Horizontally 
	if (movingNode?.boundingBox?.left >= staticNode?.boundingBox?.left
		&& movingNode?.boundingBox?.left <= staticNode?.boundingBox?.right)
		vector.x = 1
	else if (movingNode?.boundingBox?.right >= staticNode?.boundingBox?.left
		&& movingNode?.boundingBox?.right <= staticNode?.boundingBox?.right)
		vector.x = -1
	else if (movingNode?.boundingBox?.left < staticNode?.boundingBox?.left
		&& movingNode?.boundingBox?.right > staticNode?.boundingBox?.right)
		vector.x = (Math.random() > .5 ? 1 : -1)

	// We need to collide in both dimensions otherwise we have not collided
	if (vector.x == 0)
		return vector

	//Vertically
	if (movingNode?.boundingBox?.top >= staticNode?.boundingBox?.top
		&& movingNode?.boundingBox?.top <= staticNode?.boundingBox?.bottom)
		vector.y = 1
	else if (movingNode?.boundingBox?.bottom >= staticNode?.boundingBox?.top
		&& movingNode?.boundingBox?.bottom <= staticNode?.boundingBox?.bottom)
		vector.y = -1
	else if (movingNode?.boundingBox?.top < staticNode?.boundingBox?.top
		&& movingNode?.boundingBox?.bottom > staticNode?.boundingBox?.bottom)
		vector.y = (Math.random() > .5 ? 1 : -1)

	return vector

}
interface NodeVector {
	node: Node;
	vector: Vector
}

export const moveNode = (node: Node, vector: Vector, canvasSize: Size): NodeVector => {
	const bb = node.boundingBox
	const newVector = {...vector}
	if (bb) {
		// If the update will move the box out of bounds try to preserve the movement but redirect it
		if (bb.left + vector.x <= 0){
			bb.left += 1
			bb.right +=1
			node.centreX += 1

			newVector.x = 1
		} else if (bb.right + vector.x >= canvasSize.width) {
			bb.left -= 1
			bb.right -=1
			node.centreX -= 1

			newVector.x = -1
		} else {
			bb.left += vector.x
			bb.right += vector.x
			node.centreX += vector.x

			newVector.x = vector.x
			
		}
		if (bb.top + vector.y <= 0){
			bb.top += 1
			bb.bottom +=1
			node.centreY += 1

			newVector.y = 1
		} else if (bb.bottom + vector.y >= canvasSize.height) {
			bb.top -= 1
			bb.bottom -=1
			node.centreY -= 1

			newVector.y = -1
		} else {

			bb.top += vector.y
			bb.bottom += vector.y
			node.centreY += vector.y

			newVector.y = vector.y
		}
	}
	node.boundingBox = bb
	return {node: node, vector: newVector}
} 

/**
 * Nodes which are not moving can be rendered each time, we ignore the moving ones and save rendering the whole canvas each frame
 * @param canvas 
 * @param nodes 
 * @param edges 
 * @param movingNodes 
 * @param canvasSize 
 * @returns 
 */
export const renderNodes = (canvas: OffscreenCanvas, nodes: Array<Node>, edges: Array<Edge>, movingNodes: Map<number,NodePair>, canvasSize: Size ): OffscreenCanvas => {
	
	canvas.height = canvasSize.height
	canvas.width = canvasSize.width
	const context = canvas.getContext('2d')


	if (context) {

		context.clearRect(0,0,canvasSize.width, canvasSize.height)

		// Add all the edges first so they do not cover the circles
		for (const edge of edges) {
			if (!movingNodes.has(edge.from_node) && !movingNodes.has(edge.to_node)){
				const fromNode = nodes[edge.from_node]
				const toNode = nodes[edge.to_node]
				if (fromNode && toNode) {
					drawEdge(context, fromNode, toNode)
				}
			}
		}
			
		for (const index in nodes) {
			if (!movingNodes.has(parseInt(index))) {
				const node = nodes[index]
				drawNode(context, node)
			}
		}
	}
	
	return canvas

}

export const drawNode = (context: CanvasRenderingContext2D|OffscreenCanvasRenderingContext2D,node: Node): void => {

	context.beginPath();
	context.arc(node.centreX, node.centreY, node.radius, 0, cir, false);
	context.fillStyle = node.color;
	context.fill();
	context.lineWidth = 1;
	context.strokeStyle = '#333';
	context.strokeText(node.name, node.centreX,  node.centreY)
	context.stroke();
}

export const drawEdge = (context: CanvasRenderingContext2D|OffscreenCanvasRenderingContext2D, fromNode: Node, toNode: Node) => {
	context.beginPath();
	context.moveTo(fromNode.centreX, fromNode.centreY)
	context.lineTo(toNode.centreX,toNode.centreY)
	context.lineWidth = 1;
	context.strokeStyle = '#abc';
	context.stroke();
}

export const invertVector = (vetor: Vector): Vector => {
	return {x: vetor.x * -1, y: vetor.y * -1}
}