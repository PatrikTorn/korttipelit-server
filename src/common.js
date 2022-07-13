import { Room, Queue } from "./classes";

let sockets = {};
let rooms = {
  lobby: new Room("lobby", "Aula"),
  "queue-2-paska": new Queue("queue-2-paska", "Paskahousu", {
    playersAmount: 6,
    gameType: "paskahousu",
  }),
  "queue-2": new Queue("queue-2", "Tikkipokeri", {
    playersAmount: 6,
    bet: 50,
    pointLimit: 1,
    gameType: "tikkipokeri",
  }),
  // "queue-3": new Queue("queue-3", "Kolminpeli", 3, false),
  // "queue-4": new Queue("queue-4", "Nelinpeli", 4, false),
  // "queue-5": new Queue("queue-5", "Viisinpeli", 5, false),
  // "queue-6": new Queue("queue-6", "Kuusinpeli", 6, false)
};

// const tempRooms = (gameType, playersAmount) => [
//     {
//         gameType,
//         bet:50,
//         pointLimit:10,
//         name:"Hervanta",
//         color:'green',
//         playersAmount
//     },
//       {
//         gameType,
//         bet:100,
//         pointLimit:15,
//         name:"Otanniemi",
//         color:'orange',
//         playersAmount
//       },
//       {
//         gameType,
//         bet:200,
//         pointLimit:20,
//         name:"Eira",
//         color:'purple',
//         playersAmount
//       }
//     ];
//     const tpRooms = tempRooms("tikkipokeri",2)
//     const tpRooms2 = tempRooms("tikkipokeri",4)
//     tpRooms.map(r => {
//         rooms[`${r.gameType}-${r.bet}-${r.pointLimit}`] = new Queue(`${r.gameType}-${r.bet}-${r.pointLimit}`, r.name, r)
//     })
export { rooms, sockets };
