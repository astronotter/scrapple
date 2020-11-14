const express = require('express')
const cors = require('cors')
const { Sequelize, DataTypes } = require('sequelize')

const PORT = process.env.PORT || 3000
const HOSTNAME = process.env.HOSTNAME || 'localhost'

const RACK_SIZE = 7
const POOL_SIZE = 500

randomLetter = () => ('ABCDEFGHIJKLMNOPQRSTUVWXYZ'[Math.floor(Math.random() * 26)])

const sequelize = new Sequelize('sqlite::memory:')
const Game = sequelize.define('Games', {
    maxPlayers: DataTypes.NUMBER,
    pool: DataTypes.TEXT,
    status: DataTypes.ENUM('pending','playing','done'),
    board: DataTypes.TEXT,
    nextMove: DataTypes.NUMBER,
    nextPlayer: DataTypes.NUMBER,
})
const Player = sequelize.define('Players', {
    order: DataTypes.NUMBER,
    rack: DataTypes.TEXT,
    score: DataTypes.NUMBER,
})
const Move = sequelize.define('Moves', {
    order: DataTypes.NUMBER,
    placements: DataTypes.TEXT,
    score: DataTypes.NUMBER,
})

Game.hasMany(Player)
Player.belongsTo(Game)
Player.hasMany(Move)
Game.hasMany(Move)
Move.belongsTo(Game)
Move.belongsTo(Player)

;(async () => {
    await sequelize.sync({ force: true })
})()

function isConnected(board) {
    const n = Math.sqrt(board.length)
    const k = Math.floor(board.length/2)
    const color = Array(board.length).fill(false)
    const queue = []

    if (board[k] !== ' ')
        queue.push(k)

    while (queue.length) {
        const top = queue.pop()
        if (top-1 >= 0 && board[top-1] !== ' ' && !color[top-1])
            queue.push(top-1)
        if (top+1 < board.length && board[top+1] !== ' ' && !color[top+1])
            queue.push(top+1)
        if (top-n >= 0 && board[top-n] !== ' ' && !color[top-n])
            queue.push(top-n)
        if (top+n < board.length && board[top+n] !== ' ' && !color[top+n])
            queue.push(top+n)
        color[top] = true
    }
    for (let i = 0; i < board.length; i++)
        if (board[i] !== ' ' && !color[i])
            return false
    return true
}

function applyMove(board, placements, rack) {
    for (let i = 0; i < Math.floor(placements.length/2)*2; i += 2) {
        const pos = Number(placements[i])
        const letter = placements[i+1]
        const k = rack.indexOf(letter)

        if (k === -1)
            throw new Error('Player does not have letter ' + letter)
        else if (pos < 0 || pos >= board.length)
            throw new Error('Position is out of bounds')
        else if (board[pos] !== ' ')
            throw new Error('Trying to overwrite piece')

        rack[k] = ' '
        board[pos] = letter
    }
}

function tallyScore(placements, board) {
    const n = Math.sqrt(board.length)
    const color = Array(board.length).fill(3)
    const dict = { 'CAB':1 }

    let score = 0
    for (let i = 0; i < Math.floor(placements.length/2)*2; i += 2) {
        const pos = Number(placements[i])
        const letter = placements[i+1]

        let across = '' + letter
        for (let k = pos-1;
            k >= 0 && board[k] !== ' ' && (color[k] & 1) === 1;
            color[k] &= 2, k--)
            across = board[k] + across
        for (let k = pos+1;
            k < board.length && board[k] !== ' ' && (color[k] & 1) === 1;
            color[k] &= 2, k++)
            across = across + board[k]
        if (across.length > 1) {
            if (!dict[across])
                throw new Error('Unknown word ' + across)
            color[pos] &= 2
            score++
        }
        let down = '' + letter
        for (let k = pos-n;
            k >= 0 && board[k] !== ' ' && (color[k] & 2) === 2;
            color[k] &= 1, k-=n)
            down = board[k] + down
        for (let k = pos+n;
            k < board.length && board[k] !== ' ' && (color[k] & 2) === 2;
            color[k] &= 1, k+=n)
            down = down + board[k]
        if (down.length > 1) {
            console.log('down: ' + down)
            if (!dict[down])
                throw new Error('Unknown word ' + down)
            color[pos] &= 1
            score++
        }
    }
    return score
}

function refillRack(pool, rack) {
    for (let i = 0; i < RACK_SIZE; i++)
        if (rack[i] == ' ' && pool.length > 0)
            rack[i] = pool.pop()
}


async function takeTurn(req, res) {
    const game = await Game.findByPk(req.query.game)
    const player = await Player.findByPk(req.query.player)
    const move = Move.build({
        GameId: game.id,
        PlayerId: player.id,
        order: req.params.move,
        placements: req.body.placements
    })

    if (game.nextMove != move.id)
        throw new Error('Not next turn')
    if (game.nextPlayer != player.order)
        throw new Error('Not player\'s turn')

    const board = game.board.split(',')
    const pool = game.pool.split(',')
    const placements = move.placements.split(',')
    const rack = player.rack.split(',')

    applyMove(board, placements, rack)
    if (!isConnected(board))
        throw new Error('Not connected')
    move.score = tallyScore(placements, board)
    refillRack(pool, rack)

    player.rack = rack.join(',')
    player.score += move.score
    game.board = board.join(',')
    game.pool = pool.join(',')
    game.nextMove++
    game.nextPlayer = (game.nextPlayer + 1) % game.maxPlayers
    move.placements = placements.join(',')

    await move.save()
    await game.save()
    await player.save()

    res.json({
        player: {
            rack: player.rack,
        },
        game: {
            status: game.status,
            nextMove: game.nextMove,
            nextPlayer: game.nextPlayer
        }
    })
}

async function createGame(req, res) {
    console.log(req.body)
    const n = req.body.size
    const game = await Game.create({
        maxPlayers: req.body.maxPlayers,
        status: 'pending',
        pool: Array(POOL_SIZE).fill().map(_ => randomLetter()).join(','),
        board: Array(n*n).fill(' ').join(','),
        nextMove: 0,
        nextPlayer: 0,
    })
    res.json({ id: game.id }).end()
}

async function joinGame(req, res) {
    const game = await Game.findByPk(req.query.game)
    const player = Player.build({
        GameId: game.id,
        order: game.nextPlayer,
    })

    if (game.status != 'pending')
        throw new Error('Game has already started')
    
    const pool = game.pool.split(',')
    const rack = Array(RACK_SIZE).fill(' ')

    refillRack(pool, rack)

    player.rack = rack.join(',')
    game.pool = pool.join(',')
    game.nextPlayer++
    if (game.nextPlayer == game.maxPlayers) {
        game.nextPlayer = 0
        game.status = 'playing'
        console.log('playing!')
    }

    await game.save()
    await player.save()

    res.json({
        id: player.id,
        order: player.order,
        rack: player.rack
    })
}

async function getGame(req, res) {
    const player = await Player.findByPk(req.query.player)
    const game = await Game.findByPk(req.params.game)
    if (player.GameId !== game.id)
        throw new Error('Player not part of game')
    res.json({
        size: game.size,
        board: game.board,
        status: game.status,
        nextMove: game.nextMove,
        nextPlayer: game.nextPlayer,
    })
}

async function getMove(req, res) {
    const move = await Move.findOne({ where: {
        GameId: req.query.game,
        order: req.params.move
    }})
    req.json({ placements: move.placements })
}

const app = express()
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended:true }))
app.post('/games', createGame)
app.get('/games/:game', getGame)
app.post('/players', joinGame)
app.get('/moves/:move', getMove)
app.post('/moves/:move', takeTurn)
app.listen(PORT, HOSTNAME, () => console.log(`Serving ${HOSTNAME}:${PORT}`))
