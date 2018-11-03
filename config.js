const cors = require('cors');
const app = require('express')();
// app.use(cors());
const server = require('http').Server(app);
const io = require('socket.io')(server);

module.exports = {
    app,
    server,
    io
};