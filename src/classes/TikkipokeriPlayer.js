import { io } from "../config";
import { rankPokerHand } from "../tools/tikkipokeriTools";
import Card from "./Card";
import Socket from "./Socket";
import * as PlayerService from "../services/PlayerService";

export default class TikkipokeriPlayer extends Socket {
  constructor(props) {
    super(props);
    this.socketType = "tikkipokeriplayer";

    // game
    this.cards = [];
    this.table = [];
    this.cardsChanged = false;
    this.cardTabled = false;
    this.points = 0;
    this.firstTableCard = null;
    this.shouldRevealHand = false;
    this.cardTaken = false;
  }

  getSelf() {
    return {
      room: {
        id: this.room.id,
        type: this.room.type,
        gameType: this.room.gameType,
        name: this.room.name,
      },
      name: this.name,
      uuid: this.uuid,
      id: this.id,
      type: this.type,
      money: this.money,
      cards: this.cards.sort((a, b) => b.rank - a.rank),
      table: this.table,
      cardsChanged: this.cardsChanged,
      cardTabled: this.cardTabled,
      points: this.points,
      hand: this.getHand(),
      firstTableCard: this.firstTableCard,
      shouldRevealHand: this.shouldRevealHand,
      gamesPlayed: this.gamesPlayed,
      highestHand: this.highestHand,
      cardTaken: this.cardTaken,
    };
  }

  getRooms() {
    return Object.values(this.rooms).map((room) => room.getSelf());
  }

  setStats() {
    const handRank = this.getHand().rank;
    if (handRank > this.highestHand) {
      this.highestHand = handRank;
    }
    this.gamesPlayed = this.gamesPlayed + 1;
    this.persistPlayer();
  }

  earnMoney(player) {
    const bet = player.room.bet;
    const exchange = (this.points - player.points) * bet;
    player.giveMoney(exchange);
    this.money = this.money + exchange;
    this.persistPlayer();
  }

  giveMoney(amount) {
    this.money = this.money - amount;
    this.persistPlayer();
  }

  persistPlayer() {
    PlayerService.updatePlayer(this.getSelf());
  }

  exitGame() {
    this.joinRoom(this.rooms.lobby, () => {
      this.cards = [];
      this.table = [];
      this.cardsChanged = false;
      this.cardTabled = false;
      this.points = 0;
      this.firstTableCard = null;
      this.shouldRevealHand = false;
      this.emitAll();
      this.resetGame();
    });
  }

  initPlayer({ name, _id, money, gamesPlayed, highestHand }) {
    this.name = name;
    this.uuid = _id;
    this.money = money;
    this.highestHand = highestHand;
    this.gamesPlayed = gamesPlayed;
  }

  revealHand() {
    this.shouldRevealHand = true;
    this.broadcastGame();
  }

  hideHand() {
    this.shouldRevealHand = false;
  }

  getHand() {
    const hand = [...this.cards, ...this.table];
    this.hand = rankPokerHand(hand.map((card) => card.cardNo));
    return { ...this.hand, hand };
  }

  disableCardTabled() {
    this.cardTabled = false;
  }

  disableCardsChanged() {
    this.cardsChanged = false;
    this.table = [];
    this.firstTableCard = null;
  }

  addPoints(points) {
    this.points = this.points + points;
  }

  getFirstTable() {
    return this.table[this.table.length - 1];
  }

  findCard(card) {
    return this.cards.find((c) => c.id === card.id);
  }

  deleteCard(card) {
    this.cards = this.cards.filter((c) => c.id !== card.id);
  }

  checkEnabledCards(roomLand) {
    // User does not have any room lands in hand
    if (this.cards.every((card) => card.land !== roomLand)) {
      this.cards.map((card) => card.enableCard());
    } else {
      this.cards.map((card) => {
        if (card.land === roomLand) {
          card.enableCard();
        } else {
          card.disableCard();
        }
      });
    }
  }

  selectCard(card) {
    const thisCard = this.findCard(card);
    thisCard.selected = !thisCard.selected;
  }

  enableCards() {
    this.cards.map((card) => card.enableCard());
  }

  PH_clickCard(cardObj) {
    const card = this.findCard(cardObj);
    const sameCards = this.cards.filter((c) => c.rank === card.rank);
    if (card.value === "10" || card.value === "A") {
      this.PH_trashTable(card);
    } else if (sameCards.length > 1 && card.value !== "2") {
      this.PH_selectMultipleCards(card);
    } else {
      this.PH_changeCards([card]);
    }
  }

  PH_trashTable(card) {
    this.room.trashTable();
    this.enableCards();
    this.deleteCard(card);
    this.receiveCard(this.room.giveCard());
    this.broadcastGame();
    const nowPlayer = this.room.findPlayer(this.room.turn.id);
    if (nowPlayer.type === "bot") {
      this.room.moveBot(nowPlayer);
    }
  }

  PH_selectMultipleCards(card) {
    if (card.selected) {
      if (this.cards.filter((c) => c.selected).length > 1) {
        this.cards
          .filter((c) => c.rank === card.rank)
          .map((c) => c.enableCard());
      } else {
        this.PH_checkHandAgainstTable();
      }
    } else {
      this.cards.map((c) => {
        if (c.rank === card.rank) {
          c.enableCard();
        } else {
          c.disableCard();
        }
      });
    }
    card.selected = !card.selected;
    this.emitGame();
  }

  PH_checkHandAgainstTable() {
    const firstTableCard = this.room.firstTableCard;
    const a = {
      2: ["2"],
      3: ["2", "3", "4", "5", "6", "7", "8", "9", "10"],
      4: ["2", "4", "5", "6", "7", "8", "9", "10"],
      5: ["2", "5", "6", "7", "8", "9", "10"],
      6: ["2", "6", "7", "8", "9", "10"],
      7: ["2", "7", "8", "9", "10", "J", "Q", "K"],
      8: ["2", "8", "9", "10", "J", "Q", "K"],
      9: ["2", "9", "10", "J", "Q", "K"],
      10: [],
      J: ["2", "J", "Q", "K", "A"],
      Q: ["2", "Q", "K", "A"],
      K: ["2", "K", "A"],
      A: [],
    };

    if (firstTableCard) {
      this.cards.map((card) => card.disableCard());
      this.cards
        .filter((card) => a[firstTableCard.value].includes(card.value))
        .map((c) => c.enableCard());
    } else {
      this.enableCards();
    }
  }

  PH_changeCards(cards) {
    const all = [...cards, ...this.room.table.reverse()];
    const fourCardsSame =
      all.length >= 4 &&
      all.filter((c, i, s) => i < 4).every((c) => c.rank === all[0].rank);
    cards.map((card) => {
      const newCard = new Card(card.landId, card.rank);
      this.giveCard(newCard);
      this.cards.length < 5 && this.receiveCard(this.room.giveCard());
    });
    this.enableCards();
    if (fourCardsSame) {
      this.room.trashTable();
      this.broadcastGame();
    } else {
      this.room.setNextTurn();
    }
  }

  PH_takeCard() {
    this.receiveCard(this.room.giveCard());
    this.cardTaken = true;
    this.PH_checkHandAgainstTable();
    this.emitGame();
  }

  giveCard(card) {
    // const givenCard = this.findCard(card);
    this.deleteCard(card);
    this.room.receiveCard(card);
  }

  changeCards(cards) {
    (cards || []).map((card) => {
      const newCard = new Card(card.landId, card.rank);
      this.giveCard(newCard);
      this.receiveCard(this.room.giveCard());
    });
    this.cardsChanged = true;
  }

  tableCard(card) {
    if (card) {
      const givenCard = this.findCard(card);
      this.firstTableCard = givenCard;
      this.table.push(givenCard);
      if (!this.room.land) {
        this.room.setLand(card.land);
      }
      this.room.setLeader(this.id, card);
      this.deleteCard(givenCard);
      this.cardTabled = true;
      this.cards.map((card) => card.enableCard());
    } else {
      this.firstTableCard = card;
    }
  }

  receiveCard(card) {
    if (card) this.cards.push(card);
  }

  joinRoom(room, cb) {
    this.leaveRoom(() => {
      this.room = room;
      room.addPlayer(this, () => {
        this.socket.join(room.id, cb);
      });
    });
  }

  leaveRoom(cb) {
    this.room.removePlayer(this);
    this.socket.leave(this.room, cb);
  }

  emitAll() {
    this.emitSocket();
    this.emitSockets();
    this.emitRooms();
  }

  emitSocket() {
    this.socket.emit("get socket", this.getSelf());
  }

  emitGame(game = this.room.getSelf()) {
    this.socket.emit("get game", game);
  }

  resetGame() {
    this.socket.emit("reset game");
  }

  emitSockets() {
    // io.sockets.emit('get sockets', getSockets());
  }

  emitRooms() {
    io.sockets.emit("get rooms", this.getRooms());
  }

  broadcastGame() {
    io.sockets.in(this.room.id).emit("get game", this.room.getSelf());
  }
}
