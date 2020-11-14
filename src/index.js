import React, { useState, useEffect, useRef } from 'react'
import ReactDOM from 'react-dom'
import { BrowserRouter as Router, Route,
    Switch, useParams, useHistory } from 'react-router-dom'
import Container from 'react-bootstrap/Container'
import Col from 'react-bootstrap/Col'
import Row from 'react-bootstrap/Row'
import Button from 'react-bootstrap/Button'
import Form from 'react-bootstrap/Form'
import { StyleSheet, css } from 'aphrodite'


const get = async (url) => {
    let res = await fetch(url, { method:'GET' });
    return await res.json()
}
const post = async (url, body) => {
    let res = await fetch(url, {
        method:'POST',
        headers: {'Content-Type': 'application/json'},
        body: body? JSON.stringify(body) : ''
    });
    return await res.json()
}
const HOSTNAME = 'otterspace.ca'
const PORT = 3000

const joinGame = (game) => post(`https://${HOSTNAME}:${PORT}/players?game=${game}`)
const getGame = (game, player) => get(`https://${HOSTNAME}:${PORT}/games/${game}?player=${player}`)
const takeTurn = (move, game, player, placements) => post(`https://${HOSTNAME}:${PORT}/moves/${move}?game=${game}&player=${player}`, { placements:placements })
const createGame = () => post(`https://${HOSTNAME}:${PORT}/games`, { size:15, maxPlayers:2 })

// Taken from
// https://overreacted.io/making-setinterval-declarative-with-react-hooks/
function useInterval(callback, delay) {
    const savedCallback = useRef();

    // Remember the latest callback.
    useEffect(() => {
        savedCallback.current = callback;
    }, [callback]);

    // Set up the interval.
    useEffect(() => {
        function tick() {
            savedCallback.current();
        }
        if (delay !== null) {
            let id = setInterval(tick, delay);
            return () => clearInterval(id);
        }
    }, [delay]);
}

function Piece(props) {
    const { style, value, ...other } = props
    return (
        <div {...other}
            style={{
                width: '80px',
                height: '80px',
                lineHeight: '80px',
                display: 'inline-block',
                cursor: 'pointer',
                backgroundColor: '#eee',
                verticalAlign: 'middle',
                textAlign: 'center',
                margin: '2px',
                ...style
            }
        }>{value}</div>
    )
}

function placeable(board, placements) {
    const n = Math.sqrt(board.length)
    const color = Array(board.length).fill(0)
    const pending = []
    
    pending.push(Math.floor(board.length/2))
    while (pending.length > 0) {
        const k = pending.pop()
        if (board[k] ===' ' && !placements.includes(k)) {
            color[k] = 2
            continue
        }
        else
            color[k] = 1
        
        if (k-1 >= 0 && !color[k-1])
            pending.push(k-1)
        if (k+1 < board.length && !color[k+1])
            pending.push(k+1)
        if (k-n >= 0 && !color[k-n])
            pending.push(k-n)
        if (k+n < board.length && !color[k+n])
            pending.push(k+n)
    }
    return color
}

function Game(props) {
    const [player, setPlayer] = useState(null)
    const [game, setGame] = useState(null)
    const [placements, setPlacements] = useState(Array(7).fill(null))
    const [dragged, setDragged] = useState(null)
    const scrollView = useRef(null)
    const params = useParams()
    const isOurTurn = game && player && game.nextPlayer === player.order

    useEffect(() => {
        (async () => {
            if (!player)
                setPlayer(await joinGame(params.game))
            else if (!game)
                setGame(await getGame(params.game, player.id))
        })()
    }, [player, game, params])

    useInterval(() => {
        (async () => {
            setGame(await getGame(params.game, player.id))
            scrollView.current.scrollTo({
                left: scrollView.current.scrollLeftMax/2,
                top: scrollView.current.scrollTopMax/2,
                behavior: 'smooth'
            })
        })()
    }, isOurTurn? null : 3000)

    if (!game || !player)
        return <div>Loading...</div>

    const rack = player.rack.split(',')
    const board = game.board.split(',')

    async function submit(e) {
        const A = []
        for (let i = 0; i < placements.length; i++)
            if (placements[i] !== null) {
                A.push(placements[i])
                A.push(rack[i])
            }
        const res = await takeTurn(game.nextMove, params.game, player.id, A.join(','))
        setPlacements(Array(7).fill(null))
        setPlayer({...player,...res.player})
        setGame({...game,...res.game})

        scrollView.current.scrollTo({
            left: scrollView.current.scrollLeftMax/2,
            top: scrollView.current.scrollTopMax/2,
            behavior: 'smooth'
        })
    }
        
    const styles = StyleSheet.create({
        game: {
            display: 'flex',
            flexFlow: 'column',
            height: '100vh'
        },
        board: {
            overflow: 'scroll',
            scrollbarWidth: 'none',
            flexGrow: '1',
            flexShrink: '1',
            scrollSnapAlign: 'center',
        },
        row: {
            whiteSpace: 'nowrap'
        },
    })

    const n = Math.sqrt(board.length)
    const color = placeable(board, placements)
    const Board = (props) => (
        <div className={css(styles.board)} >
        {Array(n).fill(0).map((_, j) =>
        <div className={css(styles.row)}>
            {Array(n).fill(0).map((_, i) =>
            placements.includes(j*n+i)
            ?   <Piece
                    key={j*n+i}
                    draggable={isOurTurn}
                    onDrag={e => { e.preventDefault(); setDragged(placements.indexOf(j*n+i)) }}
                    onDragOver={e => e.preventDefault()}
                    value={rack[placements.indexOf(j*n+i)]}>
                </Piece>
            :   <Piece
                    style={{ opacity: (color[j*n+i] !== 0)? 1.0 : 0.5 }}
                    key={j*n+i}
                    draggable={false}
                    onDragOver={e => e.preventDefault()}
                    onDrop={e => { placements[dragged] = j*n+i; setPlacements(placements); setDragged(null) }}
                    value={board[j*n+i]}>
                </Piece>
            )}
        </div>
        )}
        </div>
    )

    return (
        <div className={css(styles.game)}>
            <Board board={board} placements={placements} ref={scrollView} isOurTurn={isOurTurn} />
            <div className={css(styles.row)}>
                {rack.map((el, i) => (
                    <Piece
                        key={i}
                        draggable={isOurTurn}
                        onDrag={e => { e.preventDefault(); setDragged(i) }}
                        onDragOver={e => e.preventDefault()}
                        onDrop={e => { placements[dragged] = null; setPlacements(placements); setDragged(null)} }
                        value={placements[i] === null? el : ' ' }>
                    </Piece>
                ))}
            <Button disabled={!isOurTurn} onClick={submit}>End Turn</Button>
            </div>
        </div>
    )
}

function NewGameForm() {
    const history = useHistory()
    const submit = async (e) => {
        e.preventDefault()
        const game = await createGame()
        history.push(`/games/${game.id}`)
    }
    return (
        <Container fluid>
        <Row><Col>
        <Form onSubmit={submit}>
        <Form.Group>
        <Form.Label>Number of Players</Form.Label>
        <Form.Control as="select">
            <option>2</option>
            <option>3</option>
            <option>4</option>
        </Form.Control>
        </Form.Group>
        <Form.Group>
        <Form.Label>Board size</Form.Label>
        <Form.Control as="select">
            <option>13</option>
            <option>15</option>
            <option>17</option>
        </Form.Control>
        </Form.Group>
        <Button variant="primary" type="submit">
            New Game
        </Button>
        </Form>
        </Col></Row>
        </Container>
    )
}

ReactDOM.render(
    <Router>
        <link
        rel="stylesheet"
        href="https://maxcdn.bootstrapcdn.com/bootstrap/4.5.0/css/bootstrap.min.css"
        integrity="sha384-9aIt2nRpC12Uk9gS9baDl411NQApFmC26EwAOH8WgZl5MYYxFfc+NcPb1dKGj7Sk"
        crossorigin="anonymous"
        />
        <Switch>
            <Route path='/games/:game' component={Game} />
            <Route path='/' component={NewGameForm} />
        </Switch>
    </Router>,
    document.getElementById('root')
)