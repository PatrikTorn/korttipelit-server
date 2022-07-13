import Queue from "../classes/rooms/Queue";
import { rooms } from "../common";

export class RoomController {
  constructor(socket) {
    this.socket = socket;
  }

  joinRoom = (roomName) => {
    const newRoom = rooms[roomName];
    this.socket.joinRoom(newRoom, () => {
      this.socket.emitAll();
    });
  };

  exitGame = () => {
    this.socket.exitGame();
  };

  createRoom = ({ id, name, playersAmount, bet, pointLimit, gameType }) => {
    if (id in rooms) {
      this.socket.joinRoom(rooms[id], () => {
        this.socket.emitRooms();
        this.socket.emitSocket();
      });
    } else {
      rooms[id] = new Queue(id, name, {
        playersAmount,
        bet,
        pointLimit,
        gameType,
        createdByUser: true,
      });
      this.socket.joinRoom(rooms[id], () => {
        this.socket.emitRooms();
        this.socket.emitSocket();
      });
    }
  };

  playOffline = () => {
    this.socket.room &&
      this.socket.room.playOffline &&
      this.socket.room.playOffline();
  };
}
