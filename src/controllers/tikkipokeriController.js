export class TikkipokeriController {
  constructor(socket) {
    this.socket = socket;
  }

  changeCards = (cards) => {
    console.log("!! change cards");
    this.socket.room.changeCards(cards);
    this.socket.room.setNextTurn();
    this.socket.broadcastGame();
  };

  missTurn = () => {
    this.socket.room.moveBot(this.socket);
  };

  selectCard = (card) => {
    this.socket.room.selectCard(card);
    this.socket.emitGame();
  };

  tableCard = (card) => {
    this.socket.tableCard(card);
    this.socket.room.setNextTurn();
    this.socket.broadcastGame();
  };
}
