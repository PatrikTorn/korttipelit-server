export const ACTIONS = {
  AUTH: {
    SET_NAME: "set name",
    LOGIN: "login",
    REGISTER: "register",
    SET_NOTIFICATION_TOKEN: "set notification token",
  },
  ROOM: {
    JOIN_ROOM: "join room",
    EXIT_GAME: "exit game",
    CREATE_ROOM: "create room",
    PLAY_OFFLINE: "play offline",
  },
  GAME: {
    MISS_TURN: "miss turn",
  },
  PASKAHOUSU: {
    CLICK_CARD: "PH click card",
    CHANGE_CARDS: "PH change cards",
    TAKE_CARD: "PH take card",
    TAKE_TABLE: "PH take table",
  },
  TIKKIPOKERI: {
    CHANGE_CARDS: "change cards",
    SELECT_CARD: "select card",
    TABLE_CARD: "table card",
  },
  RECONNECT_ATTEMPT: "reconnect_attempt",
  DISCONNECT: "disconnect",
  CONNECTION: "connection",
};

export const CLIENT_ACTIONS = {
  GET_GAME: "get game",
  GET_SOCKET: "get socket",
  GET_SOCKET: "get sockets",
  RESET_GAME: "reset game",
  GET_ROOMS: "get rooms",
  DISCONNECT: "disconnect",
};
