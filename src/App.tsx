import { useEffect, useState } from 'react'
import { randomNode } from './functions/nodes';
import { Graph } from './components/graph';
import './App.css'
import {Node, Edge, Size} from "./types";

function App() {
  // Number of nodes
  const [count, setCount] = useState(20)
  // Chance of connection 
  const [chance, setChance] = useState(0.1)
  const [radius, setRadius] = useState(20)
  const [nodes, setNodes] = useState([] as Array<Node>)
  const [edges, setEdges] = useState([] as Array<Edge>)

  const [redraw, setRedraw] = useState(false)
  const [recreateGraph, setRecreateGraph] = useState(false)

  useEffect(()=> linkNodes(),[chance])
  useEffect(() => setRecreateGraph(r => !r), [radius, count])

  /**
   * Create a list of options for the % of chance of a connection
   * @returns ReactDOMNode
   */
  const getChances = () => {
	const options = []
	for (let n = 0; n < 10; n++)
		options[n] = n/10;
	return (
		options.map(n => <option value={n} key={n}>{n * 100}%</option>)
	)
  }


  /** Randomly connect the nodes to each other */
  const linkNodes = () => {
	const maxConnections = count * chance
	const new_edges: Array<Edge> = []
	const updated_nodes = []
	for (const this_node in nodes) {
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
		
		nodes[from_node].links = node_connections
		updated_nodes[from_node] = nodes[from_node]
	}
	setNodes(updated_nodes)
	setEdges(new_edges)
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
				setChance(parseFloat(event?.target.value))
			}}>
				{getChances()}
			</select>
        </div>
		<div className="input_group">
			<label htmlFor="radius">Radius base size</label>
			<input type="range" name="radius" id="radius" value={radius} 
				onInput={(event) => {
					setRadius(parseFloat(event?.target.value))
				}}
				min="20" max="100"
			/>
        </div>
		<div >Radius {radius}</div>
         <button type="button" title="Build Graph" onClick={() => setRecreateGraph(true)}>Build Graph</button>
		 <button type="button" title="Add Links" onClick={() => linkNodes()}>Add Links</button>
      </div>
	  <Graph 
	  		nodes={nodes} 
			edges={edges} 
			count={count}
			radiusSeed={radius}

			setNodes={setNodes}
			redraw={redraw}
			recreateGraph={recreateGraph}/>
    </>
  )
}

export default App
