import cors from "cors";
import express from "express";
import http from "http";
import socketIo from "socket.io";
import dotenv from "dotenv";

dotenv.config();

const app = express();

app.use(cors());

const server = http.Server(app);
const io = socketIo(server, {
  pingInterval: 2000,
  pingTimeout: 3000,
});

const port = process.env.PORT || 4000;

export { app, server, io, port };
