
import Express from "express";
import HTTPS from "https";
import FileSystem from "fs";
import Path from "path";
import YTDL from "ytdl-core";
import { exec } from "child_process";

import Track from "./Track";
import JsonDatabase from "./JsonDatabase";

const privateKey = FileSystem.readFileSync("melophony.ddns.net/privkey.pem", "utf8");
const certificate = FileSystem.readFileSync("melophony.ddns.net/cert.pem", "utf8");
const ca = FileSystem.readFileSync("melophony.ddns.net/chain.pem", "utf8");
const credentials = { key: privateKey, cert: certificate, ca: ca };
const App = Express();

App.use(Express.json());

const PORT = 1789;
const HTTPS_PORT = 1804;
const FILE_DIR = "files";
const LOGS_FILE = "logs.txt";

const USERS = "users";
const ARTISTS = "artists";
const TRACKS = "tracks";
const FILES = "files";
const MODIFIED_TRACKS = "modifiedTracks";

const State = {
    UNAVAILABLE: "unavailable",
    DOWNLOADING: "downloading",
    AVAILABLE  : "available",
    DELETED    : "deleted",
};

const db = new JsonDatabase(USERS, ARTISTS, TRACKS, FILES, MODIFIED_TRACKS);

let users = db.get(USERS);
let artists = db.get(ARTISTS);
let tracks = db.get(TRACKS);
let files = db.get(FILES);
let modifiedTracks = db.get(MODIFIED_TRACKS);

function checkFilesDir() {
    if (!FileSystem.existsSync(FILE_DIR)) {
        FileSystem.mkdirSync(FILE_DIR);
    }
}

function deleteFile(id) {
    if (FileSystem.existsSync(`${FILE_DIR}/${id}.m4a`)) {
        FileSystem.unlinkSync(`${FILE_DIR}/${id}.m4a`);
    }
}

function checkFileDir() {
    if (!FileSystem.existsSync(FILE_DIR)) {
        FileSystem.mkdirSync(FILE_DIR);
    }
}

function downloadTrack(videoId, response) {
    if (!files[videoId] || files[videoId].state == State.DELETED) {
        files[videoId] = {
            id: videoId,
            size: 1,
            state: State.UNAVAILABLE
        };

        files._save();
        console.log(`Add ${videoId} to files`);

        YTDL.getInfo(`https://www.youtube.com/watch?v=${videoId}`, {}, (error, info) => {
            if (error) {
                console.log(`Error YTDL info: ${error}`);
                return `Error: ${error}`;
            }

            for (let i in info.formats) {
                if (info.formats[i].container == "m4a") {
                    let format = info.formats[i];
                    console.log(`Found information for ${videoId}: [ itag: ${format.itag}, length: ${format.clen} ]`);

                    files[videoId].size = format.clen;
                    files[videoId].state = State.DOWNLOADING;

                    let track = new Track(info.title, videoId);
                    tracks[track.id] = track;
                    modifiedTracks[track.id] = track;

                    db.save();
                    checkFilesDir();
                    exec(`ytdl -q ${format.itag} https://www.youtube.com/watch?v=${videoId} > ${FILE_DIR}/${videoId}.m4a`, (error, stdout, stderr) => {
                        if (error) {
                            console.log(`Error YTDL download: ${error}`);
                            return `Error: ${error}`;
                        }
                        files[videoId].state = State.AVAILABLE;
                        files._save();
                        console.log(`Download done for ${videoId}`);
                    });
                }
            }
        });
        return { added: videoId };
    } else {
        return { status: `already added`, track: Object.values(tracks).find(track => track.videoId == videoId) };
    }
}

App.use("*", function (request, response, next) {
    let now = new Date();
    let log = `${now.toLocaleDateString("fr-FR")} ${now.toLocaleTimeString("fr-FR")}: Received request [${request.originalUrl}]`;
    console.log(log);
    FileSystem.writeFile(LOGS_FILE, log, _ => false);
    next();
});

/* USER */

App.get("/users", function (request, response) {
    response.send(users);
});

App.get("/user/:id", function (request, response) {
    response.send(users[request.params.id]);
});

App.put("/user/:id", function (request, response) {
    users[request.params.id] = request.body;
    response.send({ status: "done" });
    users._save();
});

/* ARTIST */

App.get("/artists", function (request, response) {
    response.send(artists);
});

App.get("/artist/:id", function (request, response) {
    response.send(artists[request.params.id]);
});

App.put("/artist/:id", function (request, response) {
    artists[request.params.id] = request.body;
    response.send({ status: "done" });
    artists._save();
});

App.get("/artists/tracks", function (request, response) {
    let result = {};
    for (let i in artists) {
        for (let track of Object.values(tracks)) {
            if (i == track.artist) {
                if (!result[i]) {
                    result[i] = artists[i];
                    result[i].tracks = [];
                }
                result[i].tracks.push(track);
            }
        }
    }
    response.send(result);
});

/* TRACKS */

App.get("/tracks", function (request, response) {
    response.send(tracks);
});

App.get("/track/:id", function (request, response) {
    response.send(tracks[request.params.id] ? tracks[request.params.id] : {});
});

App.put("/track/:id", function (request, response) {
    if (tracks[request.params.id] && tracks[request.params.id].videoId != request.body.videoId) {
        downloadTrack(request.body.videoId);
    }

    tracks[request.params.id] = request.body;
    modifiedTracks[request.params.id] = request.body;
    response.send({ status: "done" });

    tracks._save();
    modifiedTracks._save();
});

App.delete("/track/:id", function (request, response) {
    let videoId = tracks[request.params.id].videoId;

    // deleteFile(videoId);
    // files[request.params.id].state = State.DELETED;

    delete tracks[request.params.id];
    modifiedTracks[request.params.id] = { deleted: true };

    response.send({ status: "deleted" });

    db.save();
});

/* FILES */

App.put('/:videoId', function (request, response) {
    response.send(downloadTrack(request.params.videoId));
});

App.get("/state/:videoId", function (request, response) {
    let progress = -1;

    if (files[request.params.videoId]) {
        if (FileSystem.existsSync(`${FILE_DIR}/${request.params.videoId}.m4a`)) {
            const fileSize = FileSystem.statSync(`${FILE_DIR}/${request.params.videoId}.m4a`).size;
            progress = fileSize / files[request.params.videoId].size;
        }
        response.send({
            id: files[request.params.videoId].id,
            state: files[request.params.videoId].state,
            progress: Math.round(progress * 100)
        });
    } else {
        response.send({ error: "id not found" });
    }
});

App.get("/status/:videoId", function (request, response) {
    response.send({
        state: (!files[request.params.videoId] || files[request.params.videoId].state != State.AVAILABLE) ? State.UNAVAILABLE : State.AVAILABLE
    });
});

App.use("/get/:videoId", function (request, response) {
    if (FileSystem.existsSync(Path.join(__dirname, FILE_DIR, `${request.params.videoId}.m4a`))) {
        response.sendFile(Path.join(__dirname, FILE_DIR, `${request.params.videoId}.m4a`));
    } else {
        response.send({ error: `Could not get ${request.params.videoId}.m4a, file does not exist` });
    }
});

App.get("/manifest", function (request, response) {
    response.send(files);
});

App.get("/fileDir", function (request, response) {
    checkFilesDir();
    response.send(FileSystem.readdirSync(FILE_DIR));
});

/* MODIFICATION */

App.get("/modification/tracks", function (request, response) {
    response.send(modifiedTracks);
});

App.delete("/modification/tracks", function (request, response) {
    modifiedTracks = {};
    response.send({ status: "done" });
    modifiedTracks._save();
});


/* FALLBACK */

App.get("/*", (request, response) => {
    response.send({ status: "Nothing to do" });
});

HTTPS.createServer(credentials, App).listen(HTTPS_PORT, function () {
    console.log(`Example app listening on port ${HTTPS_PORT}`)
});

// App.listen(PORT, function () {
//     console.log(`Example app listening on port ${PORT}`)
// });
