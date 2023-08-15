
interface MainMenuProps {
    showMenu: boolean;
    count: number;
    radius: number;
    chance: number;

    setShowMenu(showMenu: boolean):void;
    setCount(count: number): void;
    setRadius(radius: number): void;
    setChance(chance: number) : void;

    setRecreateGraph: React.Dispatch<React.SetStateAction<boolean>>;
}


export const MainMenu = ( {setRecreateGraph, showMenu, setShowMenu,count, setCount, radius, setRadius, chance, setChance}: MainMenuProps ) => {
   
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
   
    return (
        <>
            <ul className={(showMenu ? '' : 'hidden') + ' absolute h-full bg-white w-1/4'}>
                <li>

                    <button type="button" title="Build Graph" onClick={() => {
                        setRecreateGraph((r:boolean) => !r)
                        setShowMenu(false)
                    }}>Build Graph</button>
                </li>
                <li>
                    <div className="input_group">
                        <label htmlFor="count">Number of nodes</label>
                        <input className="border rounded shadow" type="number" name="count" id="count" value={count} onChange={(event) => {
                            const thisinput = event.target
                            setCount(parseInt(thisinput.value))
                            
                        }}
                            onBlur={event => setShowMenu(false)}/>
                    </div>
                </li>
                <li>
                    <div className="input_group">
                        <label htmlFor="radius">Radius base size</label>
                        <input type="range" name="radius" id="radius" value={radius} 
                            onInput={(event) => {
                                const input = event.target as HTMLInputElement
                                setRadius(parseFloat(input.value))
                                setShowMenu(false)
                            }}
                            min="20" max="100"
                        />
                    </div>
                </li>
                <li>
                    <div className="input_group">
                        <label htmlFor="chance">Chance of connection</label>
                        <select name="chance" id="chance" value={chance} onChange={(event) => {
                            setChance(parseFloat(event?.target.value))
                            setShowMenu(false)
                        }}>
                            {getChances()}
                        </select>
                    </div>
                </li>
            </ul>
        </>
    )
}