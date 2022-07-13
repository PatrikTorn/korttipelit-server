// These actions are common between games.
export class GameController {
  constructor(socket) {
    this.socket = socket;
  }

  missTurn = () => {
    this.socket.room.moveBot(this.socket);
  };
}
