import Room, { RoomType } from "./Room";
import Card from "../Card";
import { io } from "../../config";
import { CLIENT_ACTIONS } from "../../socketActions";
import { SocketType } from "../sockets/Socket";

export default class Game extends Room {
  constructor(id, name, players, playersAmount) {
    super(id, name, players, playersAmount);
    this.type = RoomType.Game;
    this.playersAmount = playersAmount;
    this.cards = [];
    this.table = [];
    this.turn = players[0];
    this.shuffleDeck();
    this.setTimer();
  }

  getSelf() {
    return {
      id: this.id,
      name: this.name,
      type: this.type,
      deck: this.deck,
      trash: this.trash,
      cards: this.cards,
      players: this.formatPlayers(),
      turn: this.turn.id,
      timer: this.timer,
    };
  }

  setTimer() {
    this.duration = 10000;
    this.timer = {
      turnEnds: new Date().getTime() + this.duration,
      duration: this.duration,
    };
  }

  findCard(card) {
    return this.cards.find((c) => c.id === card.id);
  }

  deleteCard(card) {
    this.cards = this.cards.filter((c) => c.id !== card.id);
  }

  getNextPlayer() {
    // const playerId = this.turn;
    // const thisPlayers = this.players.map(player => player.id);
    const thisIndex = this.players.findIndex((p) => p.id === this.turn.id);
    this.setTimer();

    if (this.turn.id === this.players[this.players.length - 1].id) {
      return this.players[0];
    } else {
      return this.players[thisIndex + 1];
    }
  }

  removePlayer(player) {
    let { rooms } = require("../../common");
    this.players = this.players.filter((p) => p.id !== player.id);
    if (this.playersCount() === 1) {
      this.players[0].exitGame();
      delete rooms[this.id];
    } else if (this.players.every((p) => p.type === SocketType.Bot)) {
      delete rooms[this.id];
    } else {
      this.players.map((player) => {
        player.emitGame();
      });
    }
  }

  addPlayer(player, cb) {
    this.players.push(player);
    cb();
    if (this.playersCount() === this.playersAmount) {
      this.deal();
      this.broadcastGame();
    }
  }

  receiveCard(card) {
    this.table.push(card);
  }

  giveCard() {
    if (this.cards.length > 0) {
      const givenCard = this.cards[0];
      this.deleteCard(givenCard);
      return givenCard;
    } else {
      return null;
    }
  }

  shuffleDeck() {
    const deck = [];
    // Create deck
    for (let land = 0; land < 4; land++) {
      for (let i = 0; i < 13; i++) {
        deck.push(new Card(land, i));
      }
    }

    // Shuffle
    for (let i = deck.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [deck[i], deck[j]] = [deck[j], deck[i]];
    }
    this.cards = deck;
  }

  deal() {
    this.players.map((player) => {
      for (let i = 0; i < 5; i++) {
        player.receiveCard(this.giveCard());
      }
    });
  }

  broadcastGame() {
    io.sockets.in(this.id).emit(CLIENT_ACTIONS.GET_GAME, this.getSelf());
  }
}
