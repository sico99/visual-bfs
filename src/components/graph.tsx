import { useEffect, useState } from "react"
import {Node, Edge, BoundingBox, NodePair} from "../types";

import { detectCollision, drawNode, moveNode, renderNodes, invertVector} from "../functions/nodes";

interface GraphProps {
    nodes: Array<Node>;
    edges: Array<Edge>;
    count: number;
    radiusSeed: number;

    recreateGraph: boolean;
	move: boolean;

    setNodes(node:Array<Node>): void;
}

export const Graph = ({nodes, edges,count, radiusSeed,  recreateGraph,move, setNodes}:GraphProps) => {

  const [canvasSize, setCanvasSize] = useState({width: 500, height:500})
  const [offscreenCanvas, createCanvas] = useState(new OffscreenCanvas( 500, 500))
  const [movingNodes, setMovingNodes] = useState(new Map() as Map<number, NodePair>)


  useEffect(() => {
		if (nodes.length > 0){
			console.log('Frame');
			
			window.requestAnimationFrame(showGraph)
  		}
		return 
``	},[nodes, movingNodes, offscreenCanvas])
  useEffect(() => {
		createGraph()
	}, [recreateGraph])

  useEffect(() => moveNodes(),[move])

  const min_space = 10
  const max_space = 200

  /**
   * Build the nodes out randomly but aligned to a rough grid
   */
  const createGraph = () => {
	const increment = (radiusSeed * 2) + min_space
	let centreX = increment, centreY = increment, current = 0, max_height = 0, max_width = 0
	const random_variable = max_space - min_space, theseNodes: Array<Node> = []
	const mod = parseInt(Math.sqrt(count).toFixed())
	let lineY = increment
    for (let node_index = 0; node_index < count; node_index++){
		const radius = radiusSeed + radiusSeed*Math.random()
		const box: BoundingBox = {
			left: centreX - radius,
			top: centreY - radius,
			right: centreX + radius,
			bottom: centreY + radius
		}
      theseNodes[node_index] = {
		index: node_index,
        name: 'N'+ node_index,
        color: 'rgb('+ (Math.random() * 256).toFixed(0) + ',' + (Math.random() * 256).toFixed(0) + ',' +(Math.random() * 256).toFixed(0) + ')',
		centreX: centreX,
		centreY: centreY,
		radius: radius,
		boundingBox: box
	  }
	  current++
	  if (current % mod) {
		  centreX += increment + (random_variable * Math.random())
		  centreY = lineY+ (random_variable * Math.random())
	  } else {
		  centreX = increment+ (random_variable * Math.random())
		  lineY += increment
	  }
	  if (centreY > max_height)
		  max_height = centreY
	  if (centreX > max_width)
		  max_width = centreX
    } 
	
	setNodes(distributeNodes(theseNodes))
	const newSize = {height: max_height + increment + max_space, width: max_width + increment+ max_space}
	setCanvasSize(newSize)
	// Create the static context
	createCanvas(renderNodes(offscreenCanvas,theseNodes,edges,movingNodes, newSize))
  }

  /** 
   * Find all colliding nodes and set them in motion, we will need to do this multiple times
   * for each node can collide with each other after being moved away from current collision
   */
  function distributeNodes(theseNodes: Array<Node>):Array<Node> {
	const newMoving = new Map()
	for(let index =0; index < theseNodes.length; index++) {
		const staticNode = theseNodes[index]
		for(let i =0; i < theseNodes.length; i++ ){
			if (i != index) {
				const movingNode = theseNodes[i]
				const collisionVector = detectCollision(staticNode,movingNode)
				if (collisionVector.x !== 0 || collisionVector.y !== 0){
					if (!newMoving.has(movingNode.index))
						// Add them to the moving queue 
						newMoving.set(index,{
								staticNode: staticNode,
								movingNode: movingNode,
								vector: collisionVector
							})
					
				}
			}
		}
	}
	if (newMoving.size) {
		setMovingNodes(newMoving)
	}
	return theseNodes
  }

  /**
   * If we have nodes to move calculate their new positions, we move a small amount until there is 
   * no collision, the nodes wil be in pairs
   */
  function moveNodes() {
	const newMove = new Map(movingNodes)
	let totalNodes = movingNodes.size
	const newNodes = [...nodes]

	console.log('Moving ' + newNodes.length);
	

	for (const [index, pair] of movingNodes) {
		const less = pair.movingNode.index > index
		if (!movingNodes.has(pair.movingNode.index) || less) {
			console.log(pair.movingNode.centreX);
			
			const {node, vector} = moveNode(pair.movingNode, pair.vector, canvasSize)
			pair.movingNode = node
			pair.vector = vector 
			console.log(pair.movingNode.centreX);

			const newStatic = moveNode(pair.staticNode, invertVector(pair.vector), canvasSize)
			pair.staticNode = newStatic.node

			// If the nodes are no longer colliding we can now remove them from the list (allowing a little space)
			const collisionVector = detectCollision(pair.staticNode, pair.movingNode)
			if (collisionVector.x === 0 && collisionVector.y === 0){
				newNodes[pair.staticNode.index] = pair.staticNode
				newNodes[pair.movingNode.index] = pair.movingNode
				newMove.delete(index)
				totalNodes--
			} 
		} else if (movingNodes.has(pair.movingNode.index))
			newMove.delete(index)
		
	}
	console.log('Moving ' + newNodes.length);
	setMovingNodes(newMove)
	// If a node has become static we need to redraw it to the background
	createCanvas(renderNodes(offscreenCanvas,newNodes, edges,newMove, canvasSize))
	setNodes(newNodes)
	
  }

    /** show the graph based on the way we have set it up */
  function showGraph() {
	const canvas:HTMLCanvasElement|null = document.getElementById('graph_paper') as HTMLCanvasElement
	const context = canvas.getContext('2d',{ alpha: false })
	if (context){
		
		context.fillStyle = '#fff'
		context.fillRect(0,0,canvasSize.width,canvasSize.height)
		context.fill()

		context.drawImage(offscreenCanvas,0,0)

		// Draw the moving nodes...
		for (const [_index, pair] of movingNodes) {
			const col = pair.movingNode.color
			pair.movingNode.color = pair.staticNode.color
			drawNode(context,pair.movingNode)
			drawNode(context,pair.staticNode)
			pair.movingNode.color = col
		}
	}
	 if (movingNodes.size)
	 	moveNodes()
	 else 
		setNodes(distributeNodes(nodes))
  }

  return (
    <>
      <canvas id='graph_paper' height={canvasSize.height} width={canvasSize.width }>
        All the nodes on paper
      </canvas>
      
    </>
  )
}