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
