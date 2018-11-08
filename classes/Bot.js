import Socket from './Socket';

export default class Bot extends Socket{
    constructor(socket, rooms){
        super(socket, rooms);
        this.id = socket.id;
        this.type = "bot";
        this.name = `Bot-${parseFloat(Math.random(), 3)}`;
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
    //     this.cardTabled = true;
    //     console.log('should table');
    //     console.log(this.cards);

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
        // this.socket.emit('get socket', this.getSocket());
    }

    emitGame(game = this.room.getRoom()){
        // this.socket.emit('get game', game);
    }

    
    resetGame(){
        // this.socket.emit('reset game');
    }
}
