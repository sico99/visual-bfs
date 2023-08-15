import { useEffect, useState } from 'react'
import './App.css'

import { Graph } from './components/graph';
import { Navbar } from './components/navbar';
import { MainMenu } from './components/mainMenu';

import {Node, Edge} from "./types";

function App() {

  // Number of nodes
  const [count, setCount] = useState(2)
  // Chance of connection 
  const [chance, setChance] = useState(0.1)
  // radius of a node
  const [radius, setRadius] = useState(20)
  // collection of nodes and their edges
  const [nodes, setNodes] = useState([] as Array<Node>)
  const [edges, setEdges] = useState([] as Array<Edge>)
  
  // Show and hide graph and menu
  const [showMenu, setShowMenu] = useState(false) 
  const [recreateGraph, setRecreateGraph] = useState(false)

  return (
    <>
		<Navbar 
			showMenu={showMenu} 
			setShowMenu={setShowMenu}
			radius={radius}
			recreateGraph={setRecreateGraph}
		/>
		<MainMenu 
			setRecreateGraph={setRecreateGraph}
			showMenu={showMenu} 
			setShowMenu={setShowMenu}
			count={count}
			setCount={setCount}
			radius={radius}
			setRadius={setRadius}
			chance={chance}
			setChance={setChance}
		/>
		<div className='main-body w-9/10 m-auto'>
      <div className="card">
		
      </div>
	  <Graph 
	  		nodes={nodes} 
			edges={edges} 
			count={count}
			radiusSeed={radius}
			chance={chance}

			setNodes={setNodes}
			setEdges={setEdges}
			recreateGraph={recreateGraph}
			
			/>
			</div>
    </>
  )
}

export default App
