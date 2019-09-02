
import Express from "express";
import HTTPS from "https";
import FileSystem from "fs";

import JsonDatabase from "./model/JsonDatabase";

import BaseAspect from "./api/BaseAspect";
import LogAspect from "./api/LogAspect";
import ModificationAspect from "./api/ModificationAspect";
import UserAspect from "./api/UserAspect";
import ArtistAspect from "./api/ArtistAspect";
import TrackAspect from "./api/TrackAspect";
import FileAspect from "./api/FileAspect";

const DEBUG = true;

if (!DEBUG) {
    const privateKey = FileSystem.readFileSync("melophony.ddns.net/privkey.pem", "utf8");
    const certificate = FileSystem.readFileSync("melophony.ddns.net/cert.pem", "utf8");
    const ca = FileSystem.readFileSync("melophony.ddns.net/chain.pem", "utf8");
    const credentials = { key: privateKey, cert: certificate, ca: ca };
}
const App = Express();

App.use(Express.json());

const PORT = 1789;
const HTTPS_PORT = 1804;

const db = new JsonDatabase(
    BaseAspect.USERS,
    BaseAspect.ARTISTS,
    BaseAspect.TRACKS,
    BaseAspect.FILES,
    BaseAspect.MODIFIED_TRACKS
);

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

if (DEBUG) {
    App.listen(PORT, function () {
        console.log(`Example app listening on port ${PORT}`)
    });
} else {
    HTTPS.createServer(credentials, App).listen(HTTPS_PORT, function () {
        console.log(`Example app listening on port ${HTTPS_PORT}`)
    });
}
