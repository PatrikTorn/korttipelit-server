import Game from "./Game";
import Card from "../Card";
import { getPokerWinner } from "../../tools/tikkipokeriTools";
import { SocketType } from "../sockets/Socket";
import { RoomType } from "./Room";

export default class Tikkipokeri extends Game {
  constructor(id, name, players, config) {
    super(id, name, players);
    this.gameType = RoomType.Tikkipokeri;
    // this.playersAmount = playersAmount;

    this.pointLimit = config.pointLimit;
    this.bet = config.bet;
    this.playersAmount = config.playersAmount;

    this.cards = [];
    this.turn = players[0];
    this.shuffleDeck();
    this.land = null;
    this.leader = {
      playerId: null,
      cardRank: null,
    };
    this.tikkiStarted = false;
    this.tikkiRoundWinner = null;
    this.tikkiWinner = null;
    this.pokerWinner = null;
    this.gameWinner = null;
    this.moneyExchange = null;
    this.gameLeader = players[0];
  }

  getSelf() {
    return {
      id: this.id,
      name: this.name,
      type: this.type,
      gameType: this.gameType,
      cards: this.cards,
      bet: this.bet,
      pointLimit: this.pointLimit,
      players: this.formatPlayers(),
      turn: this.turn.id,
      land: this.land,
      tikkiStarted: this.tikkiStarted,
      tikkiRoundWinner: this.tikkiRoundWinner,
      tikkiWinner: this.tikkiWinner && this.tikkiWinner.getSelf(),
      pokerWinner: this.pokerWinner && this.pokerWinner.getSelf(),
      gameWinner: this.gameWinner,
      moneyExchange: this.getMoneyExchange(),
      gameLeader: {},
      timer: this.timer,
    };
  }

  selectCard(card) {
    const thisCard = this.turn.findCard(card);
    thisCard.selected = !thisCard.selected;
  }

  changeCards(cards) {
    (cards || []).map((card) => {
      const newCard = new Card(card.landId, card.rank);
      this.turn.giveCard(newCard);
      this.turn.receiveCard(this.giveCard());
    });
    this.turn.cardsChanged = true;
  }

  revealHands() {
    this.players.map((player) => {
      player.revealHand();
    });
  }

  hideHands() {
    this.players.map((player) => {
      player.hideHand();
    });
    this.broadcastGame();
  }

  setLand(land) {
    this.land = land;
    this.players.map((player) => {
      player.checkEnabledCards(land);
    });
  }

  setLeader(playerId, card) {
    if (this.leader.playerId) {
      if (card.rank > this.leader.cardRank && card.land === this.land) {
        this.leader = {
          playerId,
          cardRank: card.rank,
        };
      }
    } else {
      this.leader = {
        playerId,
        cardRank: card.rank,
      };
    }
  }

  getWinner() {
    this.tikkiWinner = this.players.find(
      (player) => player.id === this.leader.playerId
    );
    let tikkiPoints;
    if (this.leader.cardRank === 0) tikkiPoints = 4;
    else tikkiPoints = 2;
    this.tikkiWinner.addPoints(tikkiPoints);
    this.pokerWinner = getPokerWinner(this.players);
    this.pokerWinner.addPoints(this.pokerWinner.hand.points);
    this.broadcastGame();
    this.revealHands();
  }

  resetGame() {
    this.tikkiStarted = false;
    this.tikkiRoundWinner = null;
    this.tikkiWinner = null;
    this.pokerWinner = null;
    this.hideHands();
    this.players.map((player) => player.disableCardsChanged());
    this.shuffleDeck();
    this.deal();
    while (
      this.players.find((player) => player.id === this.turn.id).type !==
      SocketType.Human
    ) {
      this.turn = this.getNextPlayer();
    }
    this.broadcastGame();
  }

  getGameLeader() {
    return this.players.sort((a, b) => b.points - a.points)[0];
  }

  getMoneyExchange() {
    return this.players.map((player) => ({
      name: player.name,
      money: (this.getGameLeader().points - player.points) * this.bet,
      points: player.points,
    }));
  }

  finishGame() {
    const winner = this.getGameLeader();
    this.gameWinner = winner.getSelf();
    this.moneyExchange = this.getMoneyExchange();
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
  }

  setNextTurn() {
    const cardsChanged = this.players.every((player) => player.cardsChanged);
    const cardsTabled = this.players.every((player) => player.cardTabled);
    const cardsEnded = this.players.every(
      (player) => player.cards.length === 0
    );
    if (cardsChanged && cardsTabled) {
      // Tikki round has finished
      if (cardsEnded) {
        this.getWinner();
        if (
          this.tikkiWinner.points > this.pointLimit ||
          this.pokerWinner.points > this.pointLimit
        ) {
          return this.finishGame();
        }
        setTimeout(() => {
          this.resetGame();
        }, 5000);
      }
      this.turn = this.findPlayer(this.leader.playerId);

      this.setTimer();
      this.tikkiRoundWinner = this.leader.playerId;
      this.setLand(null);
      this.leader = {
        playerId: null,
        cardValue: null,
      };
      this.players.map((player) => player.disableCardTabled());
    } else {
      if (cardsChanged && !cardsTabled) {
        this.tikkiStarted = true;
        if (
          this.tikkiRoundWinner &&
          this.turn.id === this.findPlayer(this.tikkiRoundWinner).id
        ) {
          this.players
            .filter((player) => player.id !== this.turn.id)
            .map((player) => player.tableCard(null));
        }
      }
      this.turn = this.getNextPlayer();
    }
    // const nextPlayer = this.findPlayer(this.turn.id)
    const isBotTurn = this.turn.type === SocketType.Bot;
    if (isBotTurn && !cardsEnded) {
      this.moveBot(this.turn);
    }
  }

  getBotCardsToChange(bot) {
    // Set Joker card rank to biggest (Spade, Club 2)
    const cards = bot.cards.map((card) => ({
      ...card,
      rank:
        card.value === "2" && (card.land === "S" || card.land === "C")
          ? 14
          : card.rank,
    }));
    const hand = bot.getHand();
    switch (hand.rank) {
      case 1: // Hai
      case 2: // Pari
      case 3: // Kaksi paria
      case 4: // Kolmoset
      case 8: // Neloset
        return cards.filter(
          (c) => !(hand.rankCards.includes(c.value) || c.rank === 14)
        );
      default:
        return null;
    }
  }

  getBotCardToTable(bot) {
    const allowedCards = bot.cards.filter((card) => card.enabled);
    if (allowedCards.every((c) => c.land !== this.land)) {
      // Not same land with game
      return allowedCards.sort((a, b) => a.rank - b.rank)[0];
    } else {
      const winningCards = allowedCards
        .filter((card) => card.land === this.land)
        .filter((card) => card.rank > this.leader.cardRank)
        .sort((a, b) => a.rank - b.rank);
      if (winningCards.length > 0) {
        return winningCards[0];
      } else {
        return allowedCards.sort((a, b) => a.rank - b.rank)[0];
      }
    }
  }

  moveBot(bot) {
    setTimeout(
      () => {
        if (!bot.cardsChanged) {
          const cardsToChange = this.getBotCardsToChange(bot);
          cardsToChange && this.changeCards(cardsToChange);
          bot.cardsChanged = true;
        } else if (!bot.cardTabled) {
          const cardToTable = this.getBotCardToTable(bot);
          bot.tableCard(cardToTable);
        }
        this.setNextTurn();
        this.broadcastGame();
      },
      bot.type === SocketType.Bot ? 2500 : 0
    );
  }
}
