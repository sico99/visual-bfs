interface NavbarProps {
    showMenu: boolean;
    radius: number;

    setShowMenu(showMenu:boolean) : void;
    recreateGraph: React.Dispatch<React.SetStateAction<boolean>>;
}

export const Navbar = ( {showMenu, setShowMenu, radius, recreateGraph}: NavbarProps) => {

    return (
        <>
            <nav className="w-fill flex bg-slate-200 shadow-sm">
                <div className="menu w-12 flex-none" onClick={(event) => setShowMenu(!showMenu)}>
                    <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <circle cx="12" cy="12" r="6" fill={showMenu ? 'red' : 'green'} />
                    </svg>
                </div>
                <h1 className="flex-1 text-lg">Node tests</h1>
                <div className="flex-none text-end">
                    <button
                        type="button"
                        name="recreateGraph"
                        onClick={event => recreateGraph((r:boolean) => !r)}
                        className="rounded shaodow bg-green text-lg">
                            Build Graph
                    </button>
                </div>
		        <div className="flex-1 text-end" >Radius {radius}</div>
            </nav>
        </>
    )
}