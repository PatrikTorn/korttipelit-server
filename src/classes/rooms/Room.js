export const RoomType = {
  Lobby: "lobby",
  Game: "game",
  Paskahousu: "paskahousu",
  Tikkipokeri: "tikkipokeri",
  Queue: "queue",
};
export default class Room {
  constructor(id, name) {
    this.type = RoomType.Lobby;
    this.id = id;
    this.name = name;
    this.players = [];
  }

  getSelf() {
    return {
      id: this.id,
      name: this.name,
      type: this.type,
      players: this.formatPlayers(),
    };
  }

  formatPlayers() {
    return this.players
      .filter((player) => player.name)
      .map((player) => player.getSelf());
  }

  playersCount() {
    return this.players.length;
  }

  addPlayer(player, cb) {
    this.players.push(player);
    cb();
  }

  findPlayer(playerId) {
    const foundPlayer = this.players.find((p) => p.id === playerId);
    return foundPlayer;
  }

  removePlayer(player) {
    this.players = this.players.filter((p) => p.id !== player.id);
  }
}
