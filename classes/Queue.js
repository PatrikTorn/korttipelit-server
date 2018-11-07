import {Game, Room, Bot} from './';

export default class Queue extends Room {
    constructor(name, id, playersAmount){
        super(name, id, playersAmount);
        this.type = "queue";
        this.players = [];
        this.playersAmount = playersAmount;
        this.online = true;
    }

    addPlayer(player, cb){
        this.players.push(player);
        cb();
        if(this.online){
            if(this.playersCount() === this.playersAmount)
                this.startGame();
        }
    }

    playOffline(){
        let {rooms} = require('../common');
        while(this.players.length !== this.playersAmount){
            const newBot = new Bot({id:Math.random().toString()}, rooms);
            this.players.push(newBot);
        }
        this.startGame()
    }

    startGame(){
        const gameId = Math.random();
        const newGame = new Game(gameId, `Peli-${parseFloat(gameId, 3)}`, this.players, this.playersAmount);
        let {rooms} = require('../common')
        rooms[gameId] = newGame;
        this.players.map(player => {
            player.joinRoom(newGame, () => {
                player.emitGame();
                player.emitSocket();
            });
        });
        this.players = [];
    }
}
