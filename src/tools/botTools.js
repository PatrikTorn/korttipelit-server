import botNames from "../resources/botNames.json";

export const randomBotName =
  "Bot-" + botNames[Math.floor(Math.random() * botNames.length) - 1];
