import localtunnel from "localtunnel";
import Queue from "./classes/rooms/Queue";
import Socket from "./classes/sockets/Socket";
import { rooms, sockets } from "./common";
import { io, port, server } from "./config";
import { AuthController } from "./controllers/authController";
import { PaskahousuController } from "./controllers/paskahousuController";
import { RoomController } from "./controllers/roomController";
import { TikkipokeriController } from "./controllers/tikkipokeriController";
import { GameController } from "./controllers/GameController";
import { ACTIONS } from "./socketActions";

function createSocket(socket) {
  console.log("New socket connected: #", Object.values(sockets).length + 1);
  const sock = new Socket(socket, rooms);
  sock.joinRoom(rooms.lobby, () => {
    sock.emitAll();
  });
  return (sockets[socket.id] = sock);
}

function removeSocket(socket) {
  socket.leaveRoom();
  delete sockets[socket.id];
}

io.on(ACTIONS.CONNECTION, (socket) => {
  let thisSocket = createSocket(socket);
  const authController = new AuthController(thisSocket);
  const roomController = new RoomController(thisSocket);
  const paskahousuController = new PaskahousuController(thisSocket);
  const tikkipokeriController = new TikkipokeriController(thisSocket);
  const gameController = new GameController(thisSocket);

  // Auth emits
  socket.on(ACTIONS.AUTH.SET_NAME, authController.setName);
  socket.on(ACTIONS.AUTH.LOGIN, authController.login);
  socket.on(ACTIONS.AUTH.REGISTER, authController.register);
  socket.on(
    ACTIONS.AUTH.SET_NOTIFICATION_TOKEN,
    authController.setNotificationToken
  );

  // Room emits
  socket.on(ACTIONS.ROOM.JOIN_ROOM, roomController.joinRoom);
  socket.on(ACTIONS.ROOM.EXIT_GAME, roomController.exitGame);
  socket.on(ACTIONS.ROOM.CREATE_ROOM, roomController.createRoom);
  socket.on(ACTIONS.ROOM.PLAY_OFFLINE, roomController.playOffline);

  // Paskahousu emits
  socket.on(ACTIONS.PASKAHOUSU.CLICK_CARD, paskahousuController.clickCard);
  socket.on(ACTIONS.PASKAHOUSU.CHANGE_CARDS, paskahousuController.changeCards);
  socket.on(ACTIONS.PASKAHOUSU.TAKE_CARD, paskahousuController.takeCard);
  socket.on(ACTIONS.PASKAHOUSU.TAKE_TABLE, paskahousuController.takeTable);

  // Tikkipokeri emits
  socket.on(ACTIONS.TIKKIPOKERI.SELECT_CARD, tikkipokeriController.selectCard);
  socket.on(ACTIONS.TIKKIPOKERI.TABLE_CARD, tikkipokeriController.tableCard);
  socket.on(
    ACTIONS.TIKKIPOKERI.CHANGE_CARDS,
    tikkipokeriController.changeCards
  );

  // Game emits
  socket.on(ACTIONS.GAME.MISS_TURN, gameController.missTurn);

  // Connection emits
  socket.on(ACTIONS.RECONNECT_ATTEMPT, () => {
    console.log("Reconnect attempt");
    socket.io.opts.transports = ["polling", "websocket"];
  });
  socket.on(ACTIONS.DISCONNECT, (reason) => {
    console.log("disconnected", reason);
    removeSocket(thisSocket);
    thisSocket.emitAll();
  });
});

const LOCALTUNNEL_DOMAIN = "suomalaiset-korttipelit-server";
server.listen(port, async () => {
  console.log("Server listening on port", port);
  if (!process.env.PORT) {
    const tunnel = await localtunnel({ port, subdomain: LOCALTUNNEL_DOMAIN });
    console.log("Localtunnel listening on url", tunnel.url);
  }
});
