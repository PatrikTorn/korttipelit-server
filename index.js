const path = require('path');
const express = require('express');
const {server, io, app} = require('./config');
const Socket = require('./Socket');
const {sockets, rooms} = require('./common');
const port = process.env.PORT || 4000;

// app.use(express.static(path.join(__dirname, '/client/build')));
function addSocket(socket){
    const sock = new Socket(socket);
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
    console.log('connected', Object.keys(sockets).length)
    const thisSocket = addSocket(socket);

    socket.on('set name', (name) => {
        thisSocket.setName(name);
        thisSocket.emitAll();
    })

    socket.on('join room', (roomName) => {
        thisSocket.joinRoom(rooms[roomName], () => {
            thisSocket.emitAll();
        });
    });

    socket.on('change cards', (cards) => {
        thisSocket.changeCards(cards);
        thisSocket.room.setNextTurn();
        thisSocket.broadcastGame();
    });

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
        console.log('disconnected', Object.keys(sockets).length)
        removeSocket(thisSocket);
        thisSocket.emitAll();
    })
});

server.listen(port, () => console.log('listening on port 4000'));