class Room {
    constructor(name){
        this.name = name;
        this.players = {};
    }

    getRoom(){
        return {
            name:this.name,
            players:this.formatPlayers()
        }
    }

    formatPlayers(){
        return Object.values(this.players).map(player => player.getSocket())
    }

    playersCount(){
        return Object.keys(this.players).length;
    }

    addPlayer(player, cb){
        this.players[player.id] = player;
        cb();
    }

    removePlayer(player){
        delete this.players[player.id]
    }
}

module.exports = Room;