import { useEffect, useState } from 'react'
import './App.css'

interface Node {
  name: string;
  color: string;
  centreX: number;
  centreY: number;
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

  const [canvasSize, setCanvasSize] = useState({width: 500, height:500})

  const edges: Array<Edge> = []

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

  const createGraph = () => {
	const increment = (radius * 2) + min_space
	let centreX = increment, centreY = increment, current = 0, max_height = 0, max_width = 0
	const random_variable = max_space - min_space, theseNodes = []
    for (let node_index = 0; node_index < count; node_index++){
      theseNodes[node_index] = {
        name: 'N'+ node_index,
        color: 'rgb('+ (Math.random() * 256).toFixed(0) + ',' + (Math.random() * 256).toFixed(0) + ',' +(Math.random() * 256).toFixed(0) + ')',
		centreX: centreX,
		centreY: centreY
	  }
	  current++
	  if (current % 5) {
		  centreX += increment + (random_variable * Math.random())
		  centreY += (random_variable * Math.random())
	  } else {
		  centreX = increment+ (random_variable * Math.random())
		  centreY += increment+ (random_variable * Math.random())
	  }
	  if (centreY > max_height)
		  max_height = centreY
	  if (centreX > max_width)
		  max_width = centreX
    } 
	setNodes(theseNodes)
	 setCanvasSize(oldsize => {
	 	return {height: max_height + increment + max_space, width: max_width + increment+ max_space}
	 })
  }

  function showGraph() {
	const canvas:HTMLCanvasElement|null = document.getElementById('graph_paper') as HTMLCanvasElement
	const context = canvas.getContext('2d')
	if (context){
		console.log('Contxt! ' + canvasSize.width);

		console.log(nodes.length);
		
		
		for (const node of nodes) {
			context.beginPath();
			context.arc(node.centreX, node.centreY, radius, 0, 2 * Math.PI, false);
			console.log(node.centreX + "," + node.centreY);
			
			context.fillStyle = node.color;
			context.fill();
			context.lineWidth = 1;
			context.strokeStyle = '#333';
			context.stroke();
		}
		console.log('drawn ' + canvasSize.height);
		
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
		 <button type="button" title="Show Graph" onClick={() => showGraph()}>Draw Graph</button>
      </div>
      <canvas id='graph_paper' height={canvasSize.height} width={canvasSize.width }>
        All the nodes on paper
      </canvas>
    </>
  )
}

export default App
