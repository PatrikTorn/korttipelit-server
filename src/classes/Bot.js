import Socket from './Socket';
import {botName} from '../gameTools'
export default class Bot extends Socket{
    constructor(socket, rooms){
        super(socket, rooms);
        this.id = socket.id;
        this.type = "bot";
        this.name = botName;
        this.room = null;
    }

    joinRoom(room){
        this.room = room;
        room.addPlayer(this, () => {

        });
    }

    leaveRoom(){

    }

    changeCards(){

    }

    // tableCard(){
    // }

    exitGame() {
        let {rooms} = require('../common');
        delete rooms[this.room]
    }

    emitAll(){
        this.emitSocket();
        this.emitSockets();
        this.emitRooms();
    }

    emitSocket(){
    }

    emitGame(game = this.room.getSelf()){
    }

    
    resetGame(){
    }
}
