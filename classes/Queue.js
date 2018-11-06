import {Game, Room, Bot} from './';

export default class Queue extends Room {
    constructor(name, id, playersAmount){
        super(name, id, playersAmount);
        this.type = "queue";
        this.players = {};
        this.playersAmount = playersAmount;
        this.online = false;
    }

    addPlayer(player, cb){
        let {rooms} = require('../common');
        this.players[player.id] = player;
        cb();
        if(!this.online){
            for(let i=1;i<this.playersAmount;i++){
                const newBot = new Bot({id:Math.random().toString()}, rooms);
                this.players[newBot.id] = newBot;
            }
            this.startGame()
        }else{
            if(this.playersCount() === this.playersAmount){
                this.startGame()
            }
        }

    }

    startGame(){
        const gameId = Math.random();
        const newGame = new Game(gameId, `Peli-${parseFloat(gameId, 3)}`, this.players, this.playersAmount);
        let {rooms} = require('../common')
        rooms[gameId] = newGame;
        // addRoom(newGame)
        for(let player in this.players){
            const thisPlayer = this.players[player];
            thisPlayer.joinRoom(newGame, () => {
                thisPlayer.emitGame();
                thisPlayer.emitSocket();
            });
        }
    }
}
