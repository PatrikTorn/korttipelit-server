const Room = require('./Room');
const Game = require('./Game');

class Queue extends Room {
    constructor(name, id, playersAmount){
        super(name, id, playersAmount);
        this.type = "queue";
        this.players = {};
        this.playersAmount = playersAmount;
    }

    addPlayer(player, cb){
        this.players[player.id] = player;
        cb();
        if(this.playersCount() === this.playersAmount){
            this.startGame()
        }
    }

    startGame(){
        const gameId = Math.random();
        const newGame = new Game(gameId, `Peli-${parseFloat(gameId, 3)}`, this.players, this.playersAmount);
        rooms[gameId] = newGame;
        for(let player in this.players){
            const thisPlayer = this.players[player];
            thisPlayer.joinRoom(newGame, () => {
                thisPlayer.emitGame();
                thisPlayer.emitSocket();
            });
        }
    }
}

module.exports = Queue;