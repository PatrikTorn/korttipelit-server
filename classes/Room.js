export default class Room {
    constructor(id, name){
        this.type = "lobby";
        this.id = id;
        this.name = name;
        this.players = [];
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
        return this.players.filter(player => player.name).map(player => player.getSocket())
    }

    playersCount(){
        return this.players.length;
    }

    addPlayer(player, cb){
        this.players.push(player);
        cb();
    }

    findPlayer(player){
        return this.players.find(p => p.id === player.id);
    }

    removePlayer(player){
        this.players = this.players.filter(p => p.id !== player.id);
    }
}
