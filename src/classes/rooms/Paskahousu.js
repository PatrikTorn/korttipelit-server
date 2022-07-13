import Game from "./Game";
import Card from "../Card";
import { RoomType } from "./Room";
import { SocketType } from "../sockets/Socket";

export default class Paskahousu extends Game {
  constructor(id, name, players, config) {
    super(id, name, players, config);
    this.bet = config.bet;
    this.gameType = RoomType.Paskahousu;
    this.playersAmount = config.playersAmount;
    this.turn = players[0];
    this.cards = [];
    this.table = [];
    this.trash = [];
    this.firstTableCard = null;
    this.shuffleDeck();
  }

  getSelf() {
    return {
      id: this.id,
      name: this.name,
      type: this.type,
      gameType: this.gameType,
      trash: this.trash,
      cards: this.cards,
      table: this.table,
      firstTableCard: this.firstTableCard && this.firstTableCard,
      players: this.formatPlayers(),
      turn: this.turn.id,
      bet: this.bet,
      playersAmount: this.playersAmount,
    };
  }

  trashTable() {
    this.trash = [...this.trash, ...this.table];
    this.table = [];
    this.firstTableCard = null;
  }

  receiveCard(card) {
    this.table.push(card);
    this.firstTableCard = card;
  }

  finishGame(winner) {
    this.players.map((player) => {
      player.cards = [];
    });
    this.cards = [];
    this.table = [];
    this.trash = [];
    this.firstTableCard = null;
    this.gameLeader = winner;
    winner.points += 1;
    this.players.map((player) => {
      winner.earnMoney(player);
      player.setStats();
    });
    this.broadcastGame();

    setTimeout(() => {
      this.players.map((player) => {
        player.exitGame();
      });
    }, 5000);
    // this.shuffleDeck();
    // this.deal();
    // this.broadcastGame();
  }

  setNextTurn() {
    const nowPlayer = this.findPlayer(this.turn.id);
    if (nowPlayer.cards.length === 0) {
      return this.finishGame(nowPlayer);
    }
    nowPlayer.cardTaken = false;
    this.turn = this.getNextPlayer();
    if (this.firstTableCard) this.PH_checkHandAgainstTable();
    else this.turn.enableCards();
    // if(nextPlayer.cards.every(c => !c.enabled)){
    //     this.giveTable(nextPlayer);
    //     nextPlayer.enableCards();
    // }
    this.broadcastGame();
    if (this.turn.type === SocketType.Bot) {
      this.moveBot(this.turn);
    }
  }

  moveBot(bot) {
    setTimeout(() => {
      const allowedCards = bot.cards.filter((c) => c.enabled);
      if (allowedCards.length > 0) {
        const bestSort = ["3", "4", "5", "6", "7", "8", "9", "J", "Q", "K"];
        const bestTrashSort = ["10", "A", "2"];
        const bestSmallestCards = allowedCards
          .filter((card) => bestSort.includes(card.value))
          .sort((a, b) => bestSort.indexOf(a.value) - bestSort.indexOf(b.value))
          .filter((card, index, self) => card.value === self[0].value);
        const bestTrashCards = allowedCards
          .filter((c) => bestTrashSort.includes(c.value))
          .sort(
            (a, b) =>
              bestTrashSort.indexOf(a.value) - bestTrashSort.indexOf(b.value)
          );

        // console.log('all', bot.cards.map(c => c.value));
        // console.log('best', bestSmallestCards.map(c => c.value));
        // console.log('trash', bestTrashCards.map(c => c.value));
        if (bestSmallestCards.length > 0) {
          this.PH_changeCards(bestSmallestCards);
        } else if (bestTrashCards.length > 0) {
          const trashCard = bestTrashCards[0];
          if (
            trashCard.value === "2" &&
            this.table.length < 6 &&
            this.cards.length > 0
          ) {
            this.giveTable(bot);
          } else {
            // while(trashCard.value !== "10" || trashCard.value !== "A"){
            this.PH_clickCard(trashCard);
            // }
          }
        } else {
          this.giveTable(bot);
        }
      } else {
        this.giveTable(bot);
      }
    }, 2000);
  }

  giveTable(player) {
    player.cards = [...this.table, ...player.cards];
    player.enableCards();
    this.table = [];
    this.firstTableCard = null;
    this.setNextTurn();
  }

  PH_clickCard(cardObj) {
    const card = this.turn.findCard(cardObj);
    const sameCards = this.turn.cards.filter((c) => c.rank === card.rank);
    if (card.value === "10" || card.value === "A") {
      this.PH_trashTable(card);
    } else if (sameCards.length > 1 && card.value !== "2") {
      this.PH_selectMultipleCards(card);
    } else {
      this.PH_changeCards([card]);
    }
  }

  PH_trashTable(card) {
    if (this.table.length === 0 && this.players.length > 2) {
      this.trashTable();
      this.getNextPlayer().receiveCard(this.turn.giveCard(card));
      this.turn.receiveCard(this.giveCard());
      this.broadcastGame();
      this.setNextTurn();
    } else {
      this.turn.enableCards();
      this.turn.deleteCard(card);
      this.turn.receiveCard(this.giveCard());
      this.broadcastGame();
      if (this.turn.type === SocketType.Bot) {
        this.moveBot(this.turn);
      }
    }
  }

  PH_selectMultipleCards(card) {
    if (card.selected) {
      if (this.turn.cards.filter((c) => c.selected).length > 1) {
        this.turn.cards
          .filter((c) => c.rank === card.rank)
          .map((c) => c.enableCard());
      } else {
        this.PH_checkHandAgainstTable();
      }
    } else {
      this.turn.cards.map((c) => {
        if (c.rank === card.rank) {
          c.enableCard();
        } else {
          c.disableCard();
        }
      });
    }
    card.selected = !card.selected;
    this.turn.emitGame();
  }

  PH_checkHandAgainstTable() {
    const firstTableCard = this.firstTableCard;
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
      this.turn.cards.map((card) => card.disableCard());
      this.turn.cards
        .filter((card) => a[firstTableCard.value].includes(card.value))
        .map((c) => c.enableCard());
    } else {
      this.turn.enableCards();
    }
  }

  PH_changeCards(cards) {
    const all = [...cards, ...this.table.reverse()];
    const fourCardsSame =
      all.length >= 4 &&
      all.filter((c, i, s) => i < 4).every((c) => c.rank === all[0].rank);
    cards.map((card) => {
      const newCard = new Card(card.landId, card.rank);
      this.turn.giveCard(newCard);
      this.turn.cards.length < 5 && this.turn.receiveCard(this.giveCard());
    });
    this.turn.enableCards();
    if (fourCardsSame) {
      this.trashTable();
      this.broadcastGame();
      this.turn.type === SocketType.Bot && this.moveBot(this.turn);
    } else {
      this.setNextTurn();
    }
  }

  PH_takeCard() {
    this.turn.receiveCard(this.giveCard());
    this.turn.cardTaken = true;
    this.PH_checkHandAgainstTable();
    this.turn.emitGame();
  }

  revealHands() {}

  hideHands() {}

  setLand(land) {}

  setLeader(playerId, card) {}

  getWinner() {}

  resetGame() {}
}
