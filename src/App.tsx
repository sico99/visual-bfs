import { useEffect, useState } from 'react'
import './App.css'

interface Node {
  name: string;
  color: string;
  centreX: number;
  centreY: number;
  radius: number;
  links?: Map<number,number>
}
interface Edge {
  from_node: number;
  to_node: number;
}
interface Size {
	width: number;
	height: number;
}

function App() {
  // Number of nodes
  const [count, setCount] = useState(2)
  // Chance of connection 
  const [chance, setChance] = useState(0.5)
  const [radius, setRadius] = useState(20)
  const [nodes, setNodes] = useState([] as Array<Node>)
  const [edges, setEdges] = useState([] as Array<Edge>)

  const [canvasSize, setCanvasSize] = useState({width: 500, height:500})

  const min_space = 50
  const max_space = 200

  useEffect(() => showGraph(),[canvasSize, nodes])

  const getChances = () => {
	const options = []
	for (let n = 0; n < 10; n++)
		options[n] = n/10;
	return (
		options.map(n => <option value={n} key={n}>{n}</option>)
	)
  }

  /**
   * Build the nodes out randomly but aligned to a rough grid
   */
  const createGraph = () => {
	const increment = (radius * 2) + min_space
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
		radius: radius + radius*Math.random()
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


  function showGraph() {
	const canvas:HTMLCanvasElement|null = document.getElementById('graph_paper') as HTMLCanvasElement
	const context = canvas.getContext('2d')
	if (context){
		
		const cir = 2 * Math.PI
		for (const node of nodes) {
			context.beginPath();
			context.arc(node.centreX, node.centreY, node.radius, 0, cir, false);
			
			context.fillStyle = node.color;
			context.fill();
			context.lineWidth = 1;
			context.strokeStyle = '#333';
			context.stroke();

			// Draw any links starting at the centre to the centre for the moment
			if (node.links){
				for (const index in node.links){
					const to_node = parseInt(index)
					context.lineTo(nodes[to_node].centreX,nodes[to_node].centreY)
					context.lineWidth = 1;
					context.strokeStyle = '#000';
					context.stroke();
				}
			}
		}
		
	}
  }

  /** Randomly connect the nodes to each other */
  const linkNodes = () => {
	const maxConnections = 10
	const new_edges: Array<Edge> = []
	const updated_nodes = []
	for (const this_node in nodes) {
		const from_node = parseInt(this_node)
		const node_connections:Map<number, number> = new Map()
		for (let connect = 0; connect < maxConnections; connect++){
			if (Math.random() > .5){
				// Add an edge from this node to another at random, we won't double connections up#
				const to_node = randomNode(from_node, node_connections)
				new_edges.push({
					from_node: from_node,
					to_node: to_node
				})
			}
		}
		nodes[from_node].links = node_connections
		updated_nodes[from_node] = nodes[from_node]
	}
	setNodes(updated_nodes)
	setEdges(new_edges)
  }

  function randomNode(index: number, current: Map<number, number>, tries = 0):number {
	const rand = parseInt((Math.random() * count).toFixed(0))
	if (current.has(rand) && tries < count)
		return randomNode(index, current)
	else {
		// We may weight verticies at some point
		current.set(rand, 1)
		return rand
	}
  }

  return (
    <>
      <h1>BFS</h1>
      <div className="card">
		<div className="input_group">
			<label htmlFor="count">Number of nodes</label>
			<input type="number" name="count" id="count" value={count} onChange={(event) => {
				const thisinput = event.target
				setCount(parseInt(thisinput.value))
			}}/>
        </div>
		<div className="input_group">
			<label htmlFor="chance">Chance of connection</label>
			<select name="chance" id="chance" value={chance} onChange={(event) => {
				const thisinput = event.target
				setChance(parseInt(thisinput.value))
			}}>
				{
					getChances()
					}
			</select>
        </div>
		<div >Nodes {nodes.length}</div>
         <button type="button" title="Build Graph" onClick={() => createGraph()}>Build Graph</button>
		 <button type="button" title="Add Links" onClick={() => linkNodes()}>Add Links</button>
      </div>
      <canvas id='graph_paper' height={canvasSize.height} width={canvasSize.width }>
        All the nodes on paper
      </canvas>
    </>
  )
}

export default App
