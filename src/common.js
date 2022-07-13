import Room, { RoomType } from "./classes/rooms/Room";

let sockets = {};
let rooms = {
  lobby: new Room(RoomType.Lobby, "Aula"),
};

export { rooms, sockets };
