<script src="https://unpkg.com/react@17/umd/react.development.js"></script>
<script src="https://unpkg.com/react-dom@17/umd/react-dom.development.js"></script>
<script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
<script type="text/babel" src="client.jsx"></script>
<link rel="stylesheet" href="client.css"></style>

Scrapple
========
Scrapple is a multiplayer crossword building game (in Scrabble vein) with a simple twist: the letters are Hirigana. I have always had a fascination for Japanese culture, and to this end I hope my game will be useful not only to myself but others who are interested in trying to learn the language, to provide a fun way to study with friends. 

The rest of this article will describe the implementation details. In fact, in typical Literate Programming fashion this _is_ Scrapple, or rather the 'woven' source code for it. If you just want to play with the final tangled result, click [here]().

There are two distinct parts to the game. The client, which can be served as a static single page application, and the server which stores the actual game state. This separation allows for multiplayer, which is after all the whole point! Only the API must be shared between them and they are otherwise completely separate. Because of this we can even choose different languages which best fit their individual goals: ECMAscript for the client and Elixir for the server.

Client
------
First let's talk about React's components. We'll be using the new functional style of component, which I will briefly go over before diving in. The component is not an object like it would be in a more traditional object oriented setting, but is now a function which returns the component's current presentation. The current state is held by React, and can be queried when forming the DOM. The state must be mutated through callbacks provided to React, called _effects_. 

Let's start with a single Piece which needs no effects at all. Its state will be held by its parent components instead. The so called "lifting up" of state like this is a common practice in React applications which allows components to be reused. The piece can either be empty or contain a kana (Japanese character).

Since Pieces will always be stored in ordered groups, we provide the array and index of the piece, rather than the value itself. This will let us mutate the value when handling drag and drop.

When a piece is dragged over another, the two should swap. To handle this we create a closure for the source and destination which replaces the current value with a given one, and returns the previous one. The key here is that even though the drag and drop events might happen in different groupings, the closure will store enough state that a swap can still be performed. We also use a callback to notify the parent that a change has been made so that the state can be mutated to reflect this.

```{.jsx file=client.jsx}
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
```

A nice thing about using a literate style of programming here is that we can group the relevant CSS class for our `Piece` with the component itself, which is the best of both worlds in the debate over inline vs. separate style.

```{.css file=client.css}
.piece {
    display: inline-block;
    margin: 2px;
    width: 80px; height: 80px;
    text-align: center;
    vertical-align: top;
    line-height: 80px;
    cursor: pointer;
    background-color: #eee;
}
```

Another really cool thing is that we can embed a test right here to see what it will look like by abusing the fact that our documentation uses HTML just like our compiled client will. If we embed `<Piece els={['ね']} index={0} />` in the documentation we will get:

<div id='example-38'></div>
<script type='text/babel'>
ReactDOM.render(
    <Piece els={['ね']} index={0} />,
    document.getElementById('example-38')
)
</script>

A piece in isolation is not so interesting: we need to be able to deal with them in groups of rows and columns. The player should be able to drag a piece from their rack to the board, so this implies that the state should be held at a higher level like with the piece, _but_ we will need to receive drag messages, so we handle those here and call a callback provided to us by our parent component.

```{.jsx file=client.jsx}
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
```

Again let's test to make sure everything is working. We'll just use an alert to handle the drag events for now since we don't have anywhere to store state yet.

<div id='example-61'></div>
<script type='text/babel'>
const arr = [null,null,null, null,'ね',null, null,null,null]
ReactDOM.render(
    <Grid rows={3} cols={3} els={arr} onDrop={() => alert('onDrop called')} />,
    document.getElementById('example-61')
)
</script>

We have all the main components, it is time to implement the actual game. We'll make use of dependency inversion by passing a connection object to our component which abstracts away the detail of talking to the server. This will also allow us to switch out with a single player version for testing. We'll also assume that the game we are provided has been created and joined.

```{.jsx file=client.jsx}
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
    <<apply-turn>>
    <<hilight>>
    return (
        <div>
        <Grid rows={game.width} cols={game.width} onDrop={drop} els={board} flags={flags} />
        <Grid rows={1} cols={7} onDrop={drop} els={rack} />
        <input type='button' disabled={!game.player.isTurn} onClick={submit} />
        </div>
    )
}
```

The `useInterval` hook is taken from [this article](https://overreacted.io/making-setinterval-declarative-with-react-hooks/). It allows us to update the game on a variable time interval, which lets us stop polling when it's the player's turn, and resume when it is not.

```{.jsx file=client.jsx}
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
```

```{.css file=client.css}
.hilight {
    opacity: 0.5;
}
```
```{.jsx #hilight}
const queue = [Math.floor(flags.length / 2)]
while (queue.length) {
    const top = queue.pop()
    flags[top] |= 1
    if (board[top] || game.prev[top])
        for (let k of [top+game.width, top-game.width, top+1, top-1])
            if (k >= 0 && k < flags.length && !(flags[k] & 1))
                queue.push(k)
}
```

```{.css file=client.css}
.pulse {
    animation-name: pulse;
    animation-duration: 0.25s;
    animation-timing-function: ease-in-out;
}
@keyframes pulse {
    from, to {
        background-color: #eee;
    }
    50% {
        background-color: #fbb;
    }
}
```
```{.jsx #apply-turn}
for (let k = 0; k < game.width * game.width; k++)
    if (board[k] != game.prev[k])
        flags[k] |= 2
```

Now to test the game so far let's create a simple test connection.

```{.jsx file=client.jsx}
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
```

<div id='example-128'></div>
<script type='text/babel'>
ReactDOM.render(
    <Scrapple connection={new SingleplayerConnection()}></Scrapple>,
    document.getElementById('example-128')
)
</script>

We glossed over exactly how we communicate with the server, but now this will serve as our transition from talking about the client to server. We will use GraphQL as our communication protocol, so let's begin by looking at the schema we will be using.

```{.jsx}
const GetGame = `{
    game(id: $gameID) {
        status
        width
        board
        player(id: $playerID) {
            isTurn
            score
            rack
        }
        moves {
            position
            horizontal
            length
            score
        }
    }
}`
const UpdateGame = `{

}`
const SetGame = `{

}`
```

```{.gql }
type Player {
    id: ID!
    isTurn: Boolean
    score: Number
    order: Number
    rack: [String]
}
type Game {
    id: ID!
    status: String
    width: Number
    board: [String]
    players: [Player]
    turns: [Turn]
}
type Move {
    position: Number
    horizontal: Boolean
    length: Number
    score: Number
}
type Turn {
    game: Game
    player: Player
    order: Number
    moves: [Move]
}
type Subscription {
    turnTaken(gameID: ID!, playerID: ID!): Turn
}
```

