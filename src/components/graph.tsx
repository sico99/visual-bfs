import { useEffect, useState } from "react"
import {Node, Edge, NodeVectorAmplitude, Vector} from "../types";

import { detectCollision, drawNode, moveNode, renderNodes, invertVector, createNode, checkNodeClick, randomNode} from "../functions/nodes";

interface GraphProps {
    nodes: Array<Node>;
    edges: Array<Edge>;
    count: number;
    radiusSeed: number;
	chance: number;

    recreateGraph: boolean;

    setNodes(node:Array<Node>): void;
	setEdges(edges: Array<Edge>): void
}

export const Graph = ({nodes, edges,count, radiusSeed, chance, recreateGraph, setNodes, setEdges}:GraphProps) => {

  const [canvasSize, setCanvasSize] = useState({width: 500, height:500})
  const [offscreenCanvas, createCanvas] = useState(new OffscreenCanvas( 500, 500))
  const [movingNodes, setMovingNodes] = useState(new Map() as Map<number, NodeVectorAmplitude>)
  const [selectedNodes, setSelected] = useState(new Set() as Set<number>)

  const elasticForce = 10

  // If the nodes, moving nodes, offscreen canvas or selected nodes change redraw the graph
  useEffect(() => {
		if (nodes.length > 0){
			
			window.requestAnimationFrame(showGraph)
  		}
		return 
``	},[movingNodes, offscreenCanvas, selectedNodes])

  useEffect(() => {
		
		createGraph()
	}, [recreateGraph, radiusSeed, count])

	useEffect(() => {
		console.log('Recreate Static');
		

		// Create the static context
		createCanvas(renderNodes(offscreenCanvas,nodes,edges,movingNodes, canvasSize))
	}, [nodes,edges])

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
		const radius = radiusSeed + Math.floor(radiusSeed*Math.random())
		const newNode = createNode(node_index,centreX, centreY, radius)
		
		theseNodes[node_index] = newNode
		current++

		// We align to roughly a grid
		if (current % mod) {
			centreX += increment + Math.floor(random_variable * Math.random())
			centreY = lineY+ Math.floor(random_variable * Math.random())
		} else {
			centreX = increment+ Math.floor(random_variable * Math.random())
			lineY += increment
		}

		if (newNode.boundingBox.bottom > max_height)
			max_height = newNode.boundingBox.bottom
		if (newNode.boundingBox.right > max_width)
			max_width = newNode.boundingBox.right
    } 
	
	// Now given the nodes we have start moving them and link them up
	setNodes(
		distributeNodes(
			linkNodes(theseNodes)
			)
	)
	const newSize = {height: max_height + max_space, width: max_width + max_space}
	setCanvasSize(newSize)
  }


  /** Randomly connect the nodes to each other */
  const linkNodes = (oldNodes: Array<Node>) => {
	const maxConnections = count * chance
	const new_edges: Array<Edge> = []
	const updated_nodes = [...oldNodes]
	for (const this_node in oldNodes) {
		const from_node = parseInt(this_node)
		const node_connections:Map<number, number> = new Map()
		for (let connect = 0; connect < maxConnections; connect++){
			if (Math.random() > .5){
				// Add an edge from this node to another at random, we won't double connections up#
				const to_node = randomNode(from_node, node_connections, count)
				new_edges.push({
					from_node: from_node,
					to_node: to_node
				})
			}
		}
		
		updated_nodes[from_node].links = node_connections
	}
	
	setEdges(new_edges)
	return updated_nodes
  }
  

  /** 
   * Find all colliding nodes and set them in motion, we will need to do this multiple times
   * for each node can collide with each other after being moved away from current collision
   */
  function distributeNodes(theseNodes: Array<Node>):Array<Node> {
	const newMoving:Map<number,NodeVectorAmplitude> = new Map()
	for(let index =0; index < theseNodes.length; index++) {
		const staticNode = theseNodes[index]

		for(let i =0; i < theseNodes.length; i++ ){
			if (i != index) {
				const movingNode = theseNodes[i]
				const collisionVector = detectCollision(movingNode, staticNode)
				if (collisionVector.x !== 0 || collisionVector.y !== 0){
					// Move the node
					const moved = moveNode(movingNode,collisionVector,canvasSize,elasticForce)
					// Add them to the moving queue 
					newMoving.set(i,{
						node: moved.node,
						vector: collisionVector,
						amplitude: elasticForce})
					theseNodes[moved.node.index] = moved.node
					
					const invertedVector =invertVector( collisionVector )
					const saticMoved = moveNode(staticNode,invertedVector,canvasSize,elasticForce)
					// Add them to the moving queue 
					newMoving.set(index,{
						node: saticMoved.node,
						vector: invertedVector,
						amplitude: elasticForce
					})
					theseNodes[index] = saticMoved.node
				}
			}
		}

		// If we are moving this node i.e. amplitude is non-zero then we do that here and keep it in the moving nodes array 
		if (movingNodes.has(index) && !newMoving.has(index)){
			const movingNode = movingNodes.get(index)
			if (movingNode && movingNode.amplitude > 0) {
				const moved = moveNode(movingNode.node,movingNode.vector,canvasSize,movingNode.amplitude)
				newMoving.set(index,{
					node: moved.node,
					vector: movingNode.vector,
					amplitude: movingNode.amplitude - 1})
				theseNodes[index] = moved.node
			}
		}
	}

	// If we have nodes moving or there were before set them now
	if (newMoving.size||movingNodes.size ) {

		setMovingNodes(newMoving)
		createCanvas(renderNodes(offscreenCanvas,theseNodes,edges,newMoving, canvasSize))
		
	}
	return theseNodes
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
		for (const [_index, node] of movingNodes) {
			drawNode(context,node.node,true)
		}

		// Draw the moving nodes...
		for (const index of selectedNodes) {
			const node = nodes[index]
			const selectedColour = node.color
			node.color = '#abc'
			node.name = 'selected'
			drawNode(context,node)
			node.color = selectedColour
		}

		
	}
	
	setNodes(distributeNodes(nodes))
  }

  function checkClick(event: React.MouseEvent<HTMLCanvasElement, MouseEvent>) {
	const position:Vector = {x:event.clientX, y: event.clientY}
	const outside = (event.target as HTMLCanvasElement).getBoundingClientRect() 
	position.x = position.x - outside.left
	position.y = position.y - outside.top
	const nodeClicked = checkNodeClick(position, nodes)
	if (nodeClicked){
		setSelected(originalNodes => {
			const newNodes = new Set(originalNodes)
			// If we click we toggle being selected
			if (newNodes.has(nodeClicked.index))
				newNodes.delete(nodeClicked.index)
			else
				newNodes.add(nodeClicked.index)
			return newNodes
		})
	}
  }

  return (
    <>
      <canvas 
	  		className="m-auto border shadow-lg" 
			id='graph_paper' 
			height={canvasSize.height} 
			width={canvasSize.width } 
			onClick={event => checkClick(event)}>
        All the nodes on paper
      </canvas>
      
    </>
  )
}