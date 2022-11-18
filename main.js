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
};
const DDoS = new Map();
const temp = new Map();
const maxRequest = 50;
const inTime = 5000;
const DDoS_Check = (ip, res, callback) => {
    if (DDoS.has(ip)) return;
    let data = temp.get(ip);

    if (data?.count >= maxRequest) {
        if (data.count === maxRequest) res.sendStatus(403);
        return DDoS.set(ip);
    } else {
        if (!data) data = { count: 0, Timeout: null };
        data.count++;
        data.Timeout = setTimeout(() => {
            clearTimeout(data.Timeout);
        }, inTime);
        clearTimeout(data.Timeout);
        temp.set(ip, data);

        callback();
    };
}

app
    .set("view engine", "ejs")
    .enable("trust proxy")
    .get("/", (req, res) => {
        DDoS_Check(req.ip, res, () => {
            res.render(path.join(__dirname + "/views/home.ejs"));
        });
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