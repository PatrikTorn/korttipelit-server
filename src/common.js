
import {Room, Queue} from './classes';

let sockets = {};
let rooms = {
    lobby: new Room("lobby", "Aula"),
    "queue-2-paska": new Queue("queue-2-paska", "Paskahousu", {playersAmount:2, gameType:"paskahousu"}),
    "queue-2": new Queue("queue-2", "Tikkipokeri", {playersAmount:2, bet:50, pointLimit:1, gameType:"tikkipokeri"}),
    "queue-2-mustamaija": new Queue("queue-2-mustamaija", "Mustamaija", {playersAmount:2, gameType:"mustamaija"}),
    // "queue-3": new Queue("queue-3", "Kolminpeli", 3, false),
    // "queue-4": new Queue("queue-4", "Nelinpeli", 4, false),
    // "queue-5": new Queue("queue-5", "Viisinpeli", 5, false),
    // "queue-6": new Queue("queue-6", "Kuusinpeli", 6, false)
};

export {
    rooms,
    sockets
}