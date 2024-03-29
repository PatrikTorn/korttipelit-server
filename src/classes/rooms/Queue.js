import Room, { RoomType } from "./Room";
import Bot from "../sockets/Bot";
import Tikkipokeri from "./Tikkipokeri";
import Paskahousu from "./Paskahousu";
// import Tikkipokeri from './Tikkipokeri';

export default class Queue extends Room {
  constructor(name, id, config) {
    super(name, id, config);
    this.type = RoomType.Queue;
    this.players = [];
    this.playersAmount = config.playersAmount;
    this.online = true;
    this.config = {
      gameType: config.gameType || RoomType.Paskahousu,
      bet: config.bet || 50,
      playersAmount: config.playersAmount || 2,
      pointLimit: config.pointLimit || 1,
      createdByUser: config.createdByUser,
    };
  }

  getSelf() {
    return {
      id: this.id,
      name: this.name,
      type: this.type,
      players: this.formatPlayers(),
      config: this.config,
    };
  }

  addPlayer(player, cb) {
    this.players.push(player);
    cb();
    if (this.online) {
      if (this.playersCount() === this.playersAmount) this.startGame();
    }
  }

  playOffline() {
    let { rooms } = require("../../common");
    while (this.players.length !== this.playersAmount) {
      const newBot = new Bot({ id: Math.random().toString() }, rooms);
      this.players.push(newBot);
    }
    this.startGame();
  }

  removePlayer(player) {
    let { rooms } = require("../../common");
    if (this.players.length === 1 && this.config.createdByUser) {
      delete rooms[this.id];
    } else {
      this.players = this.players.filter((p) => p.id !== player.id);
    }
  }

  startGame() {
    const gameId = Math.random();
    const newGame = this.getNewGameByType();
    switch (this.config.gameType) {
    }

    let { rooms } = require("../../common");
    rooms[gameId] = newGame;
    this.players.map((player) => {
      player.joinRoom(newGame, () => {
        player.emitGame();
        player.emitSocket();
      });
    });
    this.config.createdByUser && delete rooms[this.id];
    this.players = [];
  }

  getNewGameByType() {
    switch (this.config.gameType) {
      case RoomType.Paskahousu:
        return new Paskahousu(
          gameId,
          `Peli-${parseFloat(gameId, 3)}`,
          this.players,
          this.config
        );
      case RoomType.Tikkipokeri:
        return new Tikkipokeri(
          gameId,
          `Peli-${parseFloat(gameId, 3)}`,
          this.players,
          this.config
        );
      default:
        throw new Exception(
          "No valid game type provided: #" + this.config.gameType
        );
    }
  }
}
