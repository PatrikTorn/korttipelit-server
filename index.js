import {server, io, app} from './config';
import {Socket} from './classes';
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
    const thisSocket = addSocket(socket);

    socket.on('set name', async(name) => {
        try{
            const data = await checkPlayer(name);
            thisSocket.initPlayer(data);
            thisSocket.emitAll();
        }catch(e){
            console.log(e);
        }
    })

    socket.on('join room', (roomName) => {
        thisSocket.joinRoom(rooms[roomName], () => {
            thisSocket.emitAll();
        });
    });

    socket.on('play offline', () => {
        thisSocket.room.playOffline();
        // thisSocket.emitAll();
        // thisSocket.broadcastGame();
        console.log(thisSocket.room);
    });

    socket.on('change cards', (cards) => {
        thisSocket.changeCards(cards);
        thisSocket.room.setNextTurn();
        thisSocket.broadcastGame();
    });

    socket.on('miss turn', () => {
        thisSocket.room.moveBot(thisSocket);
    })

    socket.on('select card', (card) => {
        thisSocket.selectCard(card);
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