import cors from 'cors';
import express from 'express'
import http from 'http'
import socketIo from 'socket.io'

const app = express();
app.use(cors());
const server = http.Server(app);
const io = socketIo(server);

export {
    app,
    server,
    io
};