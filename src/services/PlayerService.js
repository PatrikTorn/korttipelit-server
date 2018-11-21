import { PlayerModel as Player } from "../models";

async function createPlayer(params) {
  return await Player.create(params);
}

async function getPlayers() {
  return await Player.find();
}

async function findPlayer(params) {
  return await Player.findOne(params);
}

async function updatePlayer(player) {
  return await Player.findByIdAndUpdate(
    player.uuid,
    {
      money: player.money,
      gamesPlayed: player.gamesPlayed,
      highestHand: player.highestHand,
      tasks: player.tasks,
      games: player.games,
      experience: player.experience,
      level: player.level,
    },
    { new: false }
  );
}

async function updateNotificationToken(player) {
  return await Player.findByIdAndUpdate(
    player.uuid,
    {
      notificationToken: player.notificationToken,
    },
    { new: false }
  );
}

async function checkPlayer(name) {
  const foundUser = await findPlayer({ name });
  if (foundUser) {
    return foundUser;
  } else {
    return await createPlayer({ name });
  }
}

async function removeAll() {
  Player.remove();
}

export {
  checkPlayer,
  createPlayer,
  findPlayer,
  updatePlayer,
  updateNotificationToken,
  getPlayers,
  removeAll,
};
