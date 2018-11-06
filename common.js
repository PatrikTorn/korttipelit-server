
import {Room, Queue} from './classes';

let sockets = {};
let rooms = {
    lobby: new Room("lobby", "Aula"),
    "queue-2": new Queue("queue-2", "Kaksinpeli", 2, true),
    "queue-3": new Queue("queue-3", "Kolminpeli", 3, true),
    "queue-4": new Queue("queue-4", "Nelinpeli", 4, false),
    "queue-5": new Queue("queue-5", "Viisinpeli", 5, false),
    "queue-6": new Queue("queue-6", "Kuusinpeli", 6, false)
};

export {
    rooms,
    sockets
}