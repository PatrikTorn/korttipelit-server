export default class Room {
    constructor(id, name){
        this.type = "lobby";
        this.id = id;
        this.name = name;
        this.players = {};
    }

    getRoom(){
        return {
            id: this.id,
            name:this.name,
            type:this.type,
            players:this.formatPlayers()
        }
    }

    formatPlayers(){
        return Object.values(this.players).filter(player => player.name).map(player => player.getSocket())
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
