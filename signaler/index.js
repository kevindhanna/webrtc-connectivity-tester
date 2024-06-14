"use strict";

const ws = require("ws");
const http = require("http");
const express = require("express");
const path = require("path");
const fs = require("fs");
const { v4 } = require("uuid");
const uuid = v4;

const router = express.Router();
router.get("/*", (req, res) => {
    console.log("req", req.url);
    switch (req.url) {
        case "/": {
            res.status(200);
            res.sendFile(path.join(__dirname, "../client/index.html"));
        }
        default: {
            const filename = path.join(__dirname, `../client${req.url}`);
            if (fs.existsSync(filename)) {
                res.status(200);
                res.sendFile(filename);
            } else {
                res.sendStatus(404);
            }
        }
    }
});
const app = express();
app.use(router);
const server = http.createServer(app);
const wss = new ws.WebSocketServer({ noServer: true });
server.on("upgrade", (req, socket, head) => {
    wss.handleUpgrade(req, socket, head, (ws) => wss.emit("connection", ws, req));
});
server.listen(3000);
console.log("WSS listening on 3000");

const configs = [
    {
        polite: true,
        iceServers: [
            // add stun/turn servers here
        ],
    },
    {
        polite: false,
        iceServers: [
            // and here
        ],
    },
];

let clients = [];
class Client {
    constructor(ws, config) {
        this.config = config;
        this.ws = ws;
        this.id = uuid();
        this.ready = false;
        this.peers = [];
    }
    addPeer(peer) {
        this.peers.push(peer);
    }
    removePeer(peer) {
        this.peers = this.peers.filter((p) => p.id !== peer.id);
    }
    broadcast(data) {
        console.log("broadcasting", this.id, this.peers);
        this.peers.forEach((p) => p.send(data));
    }

    send(json) {
        console.log("sending", this.id, json.type);
        this.ws.send(JSON.stringify(json));
    }
    on(event, fn) {
        this.ws.on(event, fn);
    }
}

wss.on("connection", function connection(ws) {
    if (configs.length < 1) {
        ws.close();
    }
    let client = new Client(ws, configs.pop());
    clients.forEach((c) => {
        c.addPeer(client);
        client.addPeer(c);
    });
    clients.push(client);
    console.log("new client", client.id);
    client.send({ type: "config", payload: client.config });

    client.on("message", function message(data) {
        const parsed = JSON.parse(data.toString());
        console.log("received", client.id, parsed.type);

        if (parsed.type === "ready") {
            client.ready = true;

            if (clients.length > 1 && clients.every((p) => p.ready)) {
                console.log("starting");
                client.send({ type: "command", payload: "start" });
            }
            return;
        }
        client.broadcast(parsed);
    });
    client.on("close", () => {
        console.log(`${client.id} closed`);
        configs.push(client.config);
        clients = clients.filter((p) => p.id !== client.id);
        clients.forEach((c) => c.removePeer(client));
        client = undefined;
    });
});
