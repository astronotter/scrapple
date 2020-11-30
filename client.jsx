function Piece({ dragDomain, flags, draggable, index, els, children, onDrop }) {
    const drag = e =>
        window.dragged = (val) => { let temp = els[index]; els[index] = val; return temp }
    const drop = e => {
        e.preventDefault()
        let dropped = (val) => { let temp = els[index]; els[index] = val; return temp }
        dropped(window.dragged(dropped()))
        onDrop && onDrop()
    }
    const style = 'piece' + ((flags & 1)? ' hilight' : '')
                          + ((flags & 2)? ' pulse' : '')
    return (
        <div className={style} data-key={index}
             onDragStart={e => drag(e)} onDrop={e => drop(e)}
             onDragOver={e => e.preventDefault()}
             draggable={draggable}>
        {els[index]}
        </div>
    )
}
function Grid({ onDrop, flags, rows, cols, els }) {
    return (
        <div>{Array(rows).fill(0).map((_, j) => (
        <div>{Array(cols).fill(0).map((_, i) => {
            let k = j*cols+i
            return (
                <Piece draggable={true} key={k} els={els} index={k}
                       onDrop={onDrop} flags={flags && flags[k]} />
            )
        })}</div>
        ))}</div>
    )
}
function Scrapple({ connection }) {
    const [game, setGame] = React.useState(null)
    const merge = (newGame) => {
        newGame.prev = game? game.board : []
        newGame = { ...game, ...newGame }
        setGame(newGame)
    }
    const submit = () => connection.set(game).then(merge)
    const update = () => connection.get().then(merge)
    useInterval(update, game && game.player.isTurn? null : 3000)

    if (!game)
        return <p>Loading...</p>

    const board = { ...game.board }
    const rack = { ...game.player.rack }
    const drop = () => {
        const newGame = { ...game }
        newGame.board = board
        newGame.player.rack = rack
        setGame(newGame)
    }
    const flags = Array(game.width * game.width).fill(0)
    for (let k = 0; k < game.width * game.width; k++)
        if (board[k] != game.prev[k])
            flags[k] |= 2
    const queue = [Math.floor(flags.length / 2)]
    while (queue.length) {
        const top = queue.pop()
        flags[top] |= 1
        if (board[top] || game.prev[top])
            for (let k of [top+game.width, top-game.width, top+1, top-1])
                if (k >= 0 && k < flags.length && !(flags[k] & 1))
                    queue.push(k)
    }
    return (
        <div>
        <Grid rows={game.width} cols={game.width} onDrop={drop} els={board} flags={flags} />
        <Grid rows={1} cols={7} onDrop={drop} els={rack} />
        <input type='button' disabled={!game.player.isTurn} onClick={submit} />
        </div>
    )
}
function useInterval(callback, delay) {
    const savedCallback = React.useRef();

    // Remember the latest callback.
    React.useEffect(() => {
        savedCallback.current = callback;
    }, [callback]);

    // Set up the interval.
    React.useEffect(() => {
        function tick() {
            savedCallback.current();
        }
        if (delay !== null) {
            let id = setInterval(tick, delay);
            return () => clearInterval(id);
        }
    }, [delay]);
}
function SingleplayerConnection() {
    this.game = {
        width: 5,
        board: Array(5*5).fill(null),
        player: {
            isTurn: true,
            rack: ['a','b','c','d','e','f','g'],
        }
    }
}
SingleplayerConnection.prototype.get = function() {
    return new Promise((res, err) => res(this.game))
}
SingleplayerConnection.prototype.set = function(newGame) {
    return new Promise((res, err) => {
        this.game = newGame
        this.game.player.isTurn = !this.game.player.isTurn
        if (!this.game.player.isTurn)
            setTimeout(() => {
                const k = Math.floor(Math.random() * this.game.width * this.game.width)
                const board = {...this.game.board}
                board[k] = 'A'
                this.game.board = board
                this.game.player.isTurn = true
            }, 5000)
        res(this.game)
    })
}