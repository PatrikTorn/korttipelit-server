import {
  checkPlayer,
  createPlayer,
  findPlayer,
} from "../services/PlayerService";

export class AuthController {
  constructor(socket) {
    this.socket = socket;
  }

  setName = async (name) => {
    try {
      const data = await checkPlayer(name);
      this.socket.initPlayer(data);
      this.socket.emitAll();
    } catch (e) {
      console.log("Failed to set name", e);
    }
  };

  login = async ({ name, password, fbId, notificationToken }) => {
    try {
      let data;
      if (fbId) {
        const foundUser = await findPlayer({ fbId });
        if (foundUser) {
          data = foundUser;
        } else {
          data = await createPlayer({ name, fbId });
        }
      } else {
        data = await findPlayer({ name, password });
      }
      this.socket.initPlayer(data);
      this.socket.emitAll();
    } catch (e) {
      console.log("Failed to login", e);
    }
  };

  async register({ name, password }) {
    try {
      const data = await createPlayer({ name, password });
      this.socket.initPlayer(data);
      this.socket.emitAll();
    } catch (e) {
      console.log("Failed to register", e);
    }
  }

  setNotificationToken = (token) => {
    this.socket.setNotificationToken(token);
  };
}
