
import Express from "express";
import HTTPS from "https";
import FileSystem from "fs";
import WebSocket from "ws";

import EventListener from "./utils/EventListener";
import JsonDatabase from "./model/JsonDatabase";

import ArtistAspect from "./api/ArtistAspect";
import BaseAspect from "./api/BaseAspect";
import FileAspect from "./api/FileAspect";
import LogAspect from "./api/LogAspect";
import ModificationAspect from "./api/ModificationAspect";
import TrackAspect from "./api/TrackAspect";
import UserAspect from "./api/UserAspect";
import ViewAspect from "./api/ViewAspect";

const configuration = JSON.parse(FileSystem.readFileSync("configuration/configuration.json", "utf8"));
let credentials = {};

if (!configuration.DEBUG) {
    const privateKey = FileSystem.readFileSync("melophony.ddns.net/privkey.pem", "utf8");
    const certificate = FileSystem.readFileSync("melophony.ddns.net/cert.pem", "utf8");
    const ca = FileSystem.readFileSync("melophony.ddns.net/chain.pem", "utf8");
    credentials = { key: privateKey, cert: certificate, ca: ca };
}
const App = Express();

App.use(Express.text());
App.use(Express.json());

App.use(function(request, response, next) {
    response.header("Access-Control-Allow-Origin", "*");
    response.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    response.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    next();
});

const PORT = 1789;
const HTTPS_PORT = 1804;

global.eventListener = new EventListener();

const db = new JsonDatabase(
    BaseAspect.USERS,
    BaseAspect.ARTISTS,
    BaseAspect.TRACKS,
    BaseAspect.FILES,
    BaseAspect.MODIFIED_TRACKS
);

new ViewAspect(App, db);
new LogAspect(App, db);
new ModificationAspect(App, db);
new UserAspect(App, db);
new ArtistAspect(App, db);
new TrackAspect(App, db);
new FileAspect(App, db);

/* FALLBACK */

App.get("/*", (request, response) => {
    response.send({ status: "Nothing to do" });
});

if (configuration.DEBUG) {
    server.listen(PORT, function () {
        console.log(`Example app listening on port ${PORT}`)
    });
} else {
    const server = HTTPS.createServer(credentials, App);
    const wsServer = new WebSocket.Server({ server });

    wsServer.on("connection", ws => {
        global.eventListener.on("trackAdded", track => ws.send(JSON.stringify({ event: "trackAdded", track: track })));
        global.eventListener.on("downloadProgress", (id, value) => ws.send(JSON.stringify({ event: "progress", id: id, progress: value })));
    });

    server.listen(HTTPS_PORT, function () {
        console.log(`Example app listening on port ${HTTPS_PORT}`)
    });
}
