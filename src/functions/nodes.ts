import { Node, Size, Vector, Edge, BoundingBox, NodeVector, NodeVectorAmplitude } from "../types"
import { randomLetter } from "./util"

const cir = 2 * Math.PI

/**
 * 
 * @param index The index in the node array of this item
 * @param centreX The centre point horizontally of the node
 * @param centreY The centre point vertically of the node
 * @param radius The radius of the circle 
 * @param color Optional colour if not specified will be random
 * @param name the name of the node if not specified will be N and the index
 */
export const createNode = (index:number, centreX:number, centreY:number, radius: number, color?:string, name?:string):Node => {
	const box: BoundingBox = {
		left: centreX - radius,
		top: centreY - radius,
		right: centreX + radius,
		bottom: centreY + radius
	}
	const thisNode = {
		index: index,
		name: (name) ? name : randomLetter(),
		color: color ?? 'rgb('+ (Math.random() * 128).toFixed(0) + ',' + (Math.random() * 128).toFixed(0) + ',' +(Math.random() * 128).toFixed(0) + ')',
		centreX: centreX,
		centreY: centreY,
		radius: radius,
		boundingBox: box
	}
	return thisNode
}

/**
 * Return a node at random so we can link nodes 
 * @param index The index of the node in the current map
 * @param current The current set of links, from this node
 * @param count The total number of nodes
 * @param tries Because we are recursively trying we need a counter to stop us looping indefinitely
 * @returns a randomg index of a node not currently connected or a random number if we have exceeded the tries
 */
export const randomNode = (index: number, current: Map<number, number>, count:number, tries = 0):number  => {
	const rand = Math.floor(Math.random() * count)
    
	if ((current.has(rand) || rand == index) &&  tries < count)
		return randomNode(index, current,count, tries+1)
	else {
		// We may weight verticies at some point
		current.set(rand, 1)
		return rand
	}
}

/**
 * 
 * @param point The position on the canvas which has been clicked
 * @param nodes The array of nodes to check
 * @returns A node if matched to click location or null if none found
 */
export const checkNodeClick = (point: Vector, nodes: Array<Node>): Node|null => {
	for(const node of nodes) {
		let matched = false
		if (node.boundingBox) {

			if (point.x >= node?.boundingBox?.left &&
				point.x <= node?.boundingBox?.right)
				matched = true
			else 
				continue
			
			if (point.y >= node?.boundingBox?.top &&
				point.y <= node?.boundingBox?.bottom)
				return node
		}
	}
	return null
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
		vector.x = -1

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
		vector.y = -1

	if (vector.y != 0)
		return vector
	else 
		return {x:0,y:0}

}

/**
 * Move a node by the amount specified bouncing back off the edges of the canvas
 * @param node The node to check
 * @param vector the direction we want to move the node in
 * @param canvasSize The total area of the graph
 * @param factor If specified multiply the movement by this factor 
 * @returns A node with a direction of travel
 */
export const moveNode = (node: Node, vector: Vector, canvasSize: Size, factor:number = 1): NodeVector => {
	const bb = node.boundingBox
	const newVector = {...vector}
	if (bb) {
		// If the update will move the box out of bounds try to preserve the movement but redirect it
		if (bb.left + vector.x <= 0){
			bb.left += 1 *factor
			bb.right +=1 *factor
			node.centreX += 1 *factor

			newVector.x = 1*factor
		} else if (bb.right + vector.x >= canvasSize.width) {
			bb.left -= 1 *factor
			bb.right -=1*factor
			node.centreX -= 1*factor

			newVector.x = -1*factor
		} else {
			bb.left += vector.x*factor
			bb.right += vector.x*factor
			node.centreX += vector.x*factor

			newVector.x = vector.x  *factor
			
		}
		if (bb.top + vector.y <= 0){
			bb.top += 1*factor
			bb.bottom +=1*factor
			node.centreY += 1*factor

			newVector.y = 1*factor
		} else if (bb.bottom + vector.y >= canvasSize.height) {
			bb.top -= 1*factor
			bb.bottom -=1*factor
			node.centreY -= 1*factor

			newVector.y = -1*factor
		} else {

			bb.top += vector.y*factor
			bb.bottom += vector.y*factor
			node.centreY += vector.y*factor

			newVector.y = vector.y*factor
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
export const renderNodes = (canvas: OffscreenCanvas, nodes: Array<Node>, edges: Array<Edge>, movingNodes: Map<number,NodeVectorAmplitude>, canvasSize: Size ): OffscreenCanvas => {
	
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

/**
 * Draw a single node on the context
 * @param {CanvasRenderingContext2D|OffscreenCanvasRenderingContext2D} context 
 * @param {Node} node 
 * @param {boolean} showBox 
 */
export const drawNode = (context: CanvasRenderingContext2D|OffscreenCanvasRenderingContext2D,node: Node, showBox:boolean = false): void => {

	context.beginPath();
	context.arc(node.centreX, node.centreY, node.radius, 0, cir, false);

	shadeElement(context, 5, 3, 6)

	context.fillStyle = node.color;
	context.fill();

	// Turn off for the rest of the parts of the circle
	shadeElement(context)

	context.lineWidth = 1;
	context.strokeStyle = '#333';
	context.font = node.radius + 'px bold sanserif'
	context.fillStyle = 'white';
	context.fillText(node.name, node.centreX - node.radius/3,  node.centreY + node.radius/4)
	// If showing the bounding box as well add that now
	if (showBox && node.boundingBox)
		context.rect(node.boundingBox.left,node?.boundingBox?.top, node?.boundingBox?.right - node?.boundingBox?.left, node?.boundingBox?.bottom - node?.boundingBox?.top)

	context.stroke();
}

function shadeElement(context: CanvasRenderingContext2D|OffscreenCanvasRenderingContext2D, blur: number =0, x: number =0, y: number =0,color:string = '#ccc') {

	context.shadowColor = color
	context.shadowBlur = blur;
	context.shadowOffsetX = x
	context.shadowOffsetY = y
}

/**
 * 
 * @param context The canvas / offscreen canvas we are writing to
 * @param fromNode The node to extend from
 * @param toNode The node to go to
 */
export const drawEdge = 
	(
		context: CanvasRenderingContext2D|OffscreenCanvasRenderingContext2D, 
		fromNode: Node, 
		toNode: Node,
		width: number = 1,
		colour: string = '#000'
	) => {
		context.beginPath();
		context.moveTo(fromNode.centreX, fromNode.centreY)

		// work out the angle that the line makes with the end node
		const oposite = toNode.centreY - fromNode.centreY
		const adjacent = toNode.centreX - fromNode.centreX

		let angle = Math.atan(Math.abs(oposite / adjacent))

		//const hypotinuse = Math.sqrt( Math.pow(oposite,2) + Math.pow(adjacent,2) )

		// Now we have the angle we can work out the point on the circle we want
		const y =Math.sign(oposite) * Math.sin(angle) * toNode.radius
		const x =Math.sign(adjacent) * Math.cos(angle) * toNode.radius


		context.lineTo(toNode.centreX ,toNode.centreY)
		

		context.lineWidth = width;
		context.strokeStyle = colour;
		context.stroke();
		
		angle = (Math.sign(adjacent) * Math.sign(oposite) * angle) - ( Math.sign(adjacent) * Math.PI * .5)
		drawTriangle(context,10,angle,toNode.centreX - x, toNode.centreY-y)
}


function drawTriangle(	context: CanvasRenderingContext2D|OffscreenCanvasRenderingContext2D, length:number,angleR:number, x:number, y:number) {
	context.beginPath()
	//const angleR = angle * 
	context.moveTo(x, y)
	
	const pX1 = -length/2
	const pX2 =  length/2
	const pY  = -length
	
	const cosA = Math.cos(angleR)
	const sinA = Math.sin(angleR)
	
	const pX1r = (pX1 * cosA) - (pY * sinA) 
	const pY1r = (pY * cosA) + (pX1 * sinA) 
	
	const pX2r = (pX2 * cosA) - (pY * sinA) 
	const pY2r = (pY * cosA) + (pX2 * sinA) 
	
	context.lineTo(x+pX1r,y+ pY1r)
	context.lineTo(x+pX2r,y+ pY2r)
	
	context.fillStyle = 'black'
	context.fill()
	//ctx.stroke()
  }
  

/**
 * Take a vector (x,y) and invert the directon of each component
 * @param vetor The vector to inver
 * @returns An inverted vectpr
 */
export const invertVector = (vetor: Vector): Vector => {
	return {x: vetor.x * -1, y: vetor.y * -1}
}