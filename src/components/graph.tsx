import { useEffect, useState } from "react"
import {Node, Edge, Size} from "../types";

interface GraphProps {
    nodes: Array<Node>;
    edges: Array<Edge>;
    count: number;
    radiusSeed: number;

    redraw: boolean;
    recreateGraph: boolean;

    setNodes(node:Array<Node>): void;
}


export const Graph = ({nodes, edges,count, radiusSeed,  redraw, recreateGraph, setNodes}:GraphProps) => {

  const [canvasSize, setCanvasSize] = useState({width: 500, height:500})

  useEffect(() => showGraph(),[canvasSize, nodes, redraw])
  useEffect(() => createGraph(), [recreateGraph])

  const min_space = 10
  const max_space = 200

  /**
   * Build the nodes out randomly but aligned to a rough grid
   */
  const createGraph = () => {
	const increment = (radiusSeed * 2) + min_space
	let centreX = increment, centreY = increment, current = 0, max_height = 0, max_width = 0
	const random_variable = max_space - min_space, theseNodes = []
	const mod = parseInt(Math.sqrt(count).toFixed())
	let lineY = increment
    for (let node_index = 0; node_index < count; node_index++){
      theseNodes[node_index] = {
        name: 'N'+ node_index,
        color: 'rgb('+ (Math.random() * 256).toFixed(0) + ',' + (Math.random() * 256).toFixed(0) + ',' +(Math.random() * 256).toFixed(0) + ')',
		centreX: centreX,
		centreY: centreY,
		radius: radiusSeed + radiusSeed*Math.random()
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
	setNodes(theseNodes)
	setCanvasSize({height: max_height + increment + max_space, width: max_width + increment+ max_space})
  }


    /** show the graph based on the way we have set it up */
  function showGraph() {
	const canvas:HTMLCanvasElement|null = document.getElementById('graph_paper') as HTMLCanvasElement
	const context = canvas.getContext('2d')
	if (context){

		context.rect(0,0,canvasSize.width,canvasSize.height)
		context.fillStyle = '#fff'
		context.fill()

		context.reset()
		// Add all the edges first so they do not cover the circles
		for (const edge of edges) {
			const fromNode = nodes[edge.from_node]
			const toNode = nodes[edge.to_node]
			if (fromNode && toNode) {
				context.beginPath();
				context.moveTo(fromNode.centreX, fromNode.centreY)
				context.lineTo(toNode.centreX,toNode.centreY)
				context.lineWidth = 1;
				context.strokeStyle = '#abc';
				context.stroke();
			}
		}
		
		const cir = 2 * Math.PI
		for (const node of nodes) {
			context.beginPath();
			context.arc(node.centreX, node.centreY, node.radius, 0, cir, false);
			
			context.fillStyle = node.color;
			context.fill();
			context.lineWidth = 1;
			context.strokeStyle = '#333';
			context.stroke();
		}
		
	}
  }

  return (
    <>
    <h2>{redraw ? 'Redraw' : 'Not Set'}</h2>
      <canvas id='graph_paper' height={canvasSize.height} width={canvasSize.width }>
        All the nodes on paper
      </canvas>
      
    </>
  )
}