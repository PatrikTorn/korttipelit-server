import Socket from './Socket';

export default class Bot extends Socket{
    constructor(socket, rooms){
        super(socket, rooms);
        this.type = "bot";
        this.name = `Bot-${parseFloat(Math.random(), 3)}`
    }

    leaveRoom(cb){
        // this.room.removePlayer(this);
    }


    joinRoom(room, cb){
        this.room = room;
            room.addPlayer(this, () => {
        });
    }

    changeCards(){
        setTimeout(() => {
            this.cardsChanged = true;
            this.room.setNextTurn();
            this.broadcastGame();
        }, 1000);
    }

    // tableCard(){
    //     this.cardTabled = true;
    //     console.log('should table');
    //     console.log(this.cards);

    // }

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
