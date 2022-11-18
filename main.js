require("dotenv").config();
require("colors");
const config = require("./config");

const express = require("express");
const path = require("path")
const app = express();
const http = require("http");
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server, { pingInterval: 10000, pingTimeout: 8000 });
const connection = {
    connected: 0
}

app
    .set("view engine", "ejs")
    .get("/", (req, res) => {
        res.render(path.join(__dirname + "/views/home.ejs"));
    })

io
    .on("connect", (socket) => {
        connection.connected++;

        socket
            .on("ping", (date, callback) => {
                socket.emit("pong", date);
                callback();
            })
            .on("disconnect", (reason) => {
                connection.connected--;
            })

    })

server.listen(config.port || 80, () => console.log(`Server is started (http://localhost:${config.port || 80})`.green))