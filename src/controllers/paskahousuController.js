export class PaskahousuController {
  constructor(socket) {
    this.socket = socket;
  }

  clickCard = (card) => {
    this.socket.room.PH_clickCard(card);
  };

  changeCards = (cards) => {
    this.socket.room.PH_changeCards(cards);
  };

  takeCard = () => {
    this.socket.room.PH_takeCard();
  };

  takeTable = () => {
    this.socket.room.giveTable(this.socket);
  };
}
