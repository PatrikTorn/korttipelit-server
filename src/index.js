import {server, io, app} from './config';
import {Socket, Queue} from './classes';
import {sockets, rooms} from './common'
import {checkPlayer} from './services/PlayerService';

const port = process.env.PORT || 4000;

function addSocket(socket){
    const sock = new Socket(socket, rooms);
    sock.joinRoom(rooms.lobby, () => {
        sock.emitAll();        
    });
    return sockets[socket.id] = sock;
}

function removeSocket(socket){
    socket.leaveRoom();
    delete sockets[socket.id];
}

io.on('connection', (socket) => {
    let thisSocket = addSocket(socket);
    socket.on('set name', async(name) => {
        try{
            const data = await checkPlayer(name);
            thisSocket.initPlayer(data);
            thisSocket.emitAll();
        }catch(e){
            console.log(e);
        }
    })

    socket.on('logout', () => {
        removeSocket(thisSocket);
        thisSocket.emitAll();
    })

    socket.on('join room', (roomName) => {
        const newRoom = rooms[roomName];
        thisSocket.joinRoom(newRoom, () => {
            thisSocket.emitAll();
        });
    });

    socket.on('create room', ({id, name, playersAmount, bet, pointLimit, gameType}) => {
        if(id in rooms){
            thisSocket.joinRoom(rooms[id], () => {
                thisSocket.emitAll();
            });
        }else{
            rooms[id] = new Queue(id, name, {playersAmount, bet, pointLimit, gameType, createdByUser:true});
            thisSocket.joinRoom(rooms[id], () => {
                thisSocket.emitRooms();
                thisSocket.emitSocket();
            });
        }

    })

    socket.on('play offline', () => {
        thisSocket.room.playOffline();
    });

    // Paskahousu emits

    socket.on('PH click card', (card) => {
        thisSocket.room.PH_clickCard(card);
    });

    socket.on('PH change cards', (cards) => {
        thisSocket.room.PH_changeCards(cards);
    });

    socket.on('PH take card', () => {
        thisSocket.room.PH_takeCard();
    });

    socket.on('PH take table', () => {
        thisSocket.room.giveTable(thisSocket);
    });

    socket.on('MM click card', (card) => {
        thisSocket.room.clickCard(card);
    });

    socket.on('MM change cards', (cards) => {
        thisSocket.room.changeCards(cards);
    });

    // Tikkipokeri emits

    socket.on('change cards', (cards) => {
        thisSocket.room.changeCards(cards);
        thisSocket.room.setNextTurn();
        thisSocket.broadcastGame();
    });

    socket.on('miss turn', () => {
        thisSocket.room.moveBot(thisSocket);
    })

    socket.on('select card', (card) => {
        thisSocket.room.selectCard(card);
        thisSocket.emitGame();
    });

    socket.on('table card', (card) => {
        thisSocket.tableCard(card);
        thisSocket.room.setNextTurn();
        thisSocket.broadcastGame();
    });

    socket.on('disconnect', () => {
        removeSocket(thisSocket);
        thisSocket.emitAll();
    })
});

server.listen(port, () => console.log('listening on port 4000'));