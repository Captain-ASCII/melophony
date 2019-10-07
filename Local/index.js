
import HTTP from "http";
import HTTPS from "https";
import Express from "express";
import FileSystem from "fs";
import fetch from "node-fetch";
import Path from "path";
import WebSocket from "ws";

const HandleBars = require("express-handlebars");

var handlebars = HandleBars.create({
    defaultLayout: false,
    helpers: {
        formatDuration: function(t) { return `${Math.floor(parseInt(t)/60)}:${parseInt(t)%60}`; }
    }
});

const App = Express();
const commonPath = Path.join(__dirname, "..", "Common", "Views");

const PORT = 1958;

const SERVER_ADDRESS = "https://melophony.ddns.net";
const TRACKS = "data/tracks.json";
const ARTISTS = "data/artists.json";
const TRACKS_DIR = "tracks";
const IMAGES_DIR = "images";

let tracks = {};
let artists = {};
let configuration = {
    localMode: true
};

try {
    download(`${SERVER_ADDRESS}/tracks`, TRACKS, _ => {
        tracks = JSON.parse(FileSystem.readFileSync(TRACKS, "utf8"));
    });
    download(`${SERVER_ADDRESS}/artists`, ARTISTS, _ => {
        artists = JSON.parse(FileSystem.readFileSync(ARTISTS, "utf8"));
    });
} catch (error) {}

App.use(Express.text());
App.use(Express.json());

App.engine("handlebars", handlebars.engine);
App.set("view engine", "handlebars");
App.set("views", Path.join(commonPath, "views"));
App.use("/public", Express.static(Path.join(commonPath, "public")));

App.use("/custom", Express.static("custom"));
App.use("/images", Express.static("images"));
App.use("/files", Express.static("files"));

App.get("/configuration", (request, response) => {
    response.send(configuration);
});

App.get("/availableTracks", (request, response) => {
    response.send(tracks);
});

App.get("/artists", (request, response) => {
    response.send(artists);
});

App.get("/artists/tracks", (request, response) => {
    response.send(Object.values(getTracksByArtist(tracks)));
});

App.get("/", (request, response) => {
    response.render("App", { tracks: Object.values(tracks).sort((a, b) => new Date(b.creationDate) - new Date(a.creationDate)) });
});

App.put("/:type/:id", async (request, response) => {
    let data = await json(await fetch(`${SERVER_ADDRESS}/${request.params.type}/${request.params.id}`, {
        method: "PUT",
        body: JSON.stringify(request.body),
        headers: { "Content-Type": "application/json" }
    }));

    let collection = getCollection(request.params.type);

    collection[request.params.id] = request.body;
    response.send({ "status": "done" });
    save();
});

App.delete("/:type/:id", async (request, response) => {
    let data = await json(await fetch(`${SERVER_ADDRESS}/${request.params.type}/${request.params.id}`, { method: "DELETE" }));

    let collection = getCollection(request.params.type);

    delete collection[request.params.id];
    response.send({ "status": "done" });
    save();
});

App.post("/file/:videoId", async (request, response) => {
    fetch(`${SERVER_ADDRESS}/file/${request.params.videoId}`, { method: "POST" });

    response.send({ "status": "done" });
});

App.post("/artist", async (request, response) => {
    let artist = await json(await fetch(`${SERVER_ADDRESS}/artist`, {
        method: "POST",
        body: JSON.stringify({ value: request.body }),
        headers: { "Content-Type": "application/json" }
    }));

    artists[artist.id] = artist;
    response.send(artist);
});


/* Redirect distant API calls */

// App.get("/api/:request((([^/]+/)*[^/]+))", async (request, response) => {
//     let data = await json(await fetch(`${SERVER_ADDRESS}/${request.params.request}`));
//     response.send(data);
// });

// App.put("/api/:request((([^/]+/)*[^/]+))", async (request, response) => {
//     let data = await json(await fetch(`${SERVER_ADDRESS}/${request.params.request}`, {
//         method: "PUT",
//         headers: {
//             "Content-Type": "application/json",
//         },
//         body: JSON.stringify(request.body)
//     }));
//     response.send(data);
// });

// App.delete("/api/:request((([^/]+/)*[^/]+))", async (request, response) => {
//     let data = await json(await fetch(`${SERVER_ADDRESS}/${request.params.request}`, { method: "DELETE" }));
//     response.send(data);
// });

/* Screens */

App.get("/screen/track/modify/:id", (request, response) => {
    let track = tracks[request.params.id];
    response.render("TrackModificationScreen", {
        track: track,
        artist: get(artists[track.artist], { name: "Unknown"}).name,
        artists: Object.values(artists)
    });
});

App.get("/screen/artist/:id", (request, response) => {
    response.render("ArtistScreen", {
        artist: get(artists[request.params.id], { id: "", name: "Unknown"}),
        tracks: getTracksByArtist()[request.params.id].tracks
    });
});

App.get("/screen/artist/modify/:id", (request, response) => {
    response.render("ArtistModificationScreen", {
        artist: get(artists[request.params.id], { id: "", name: "Unknown"}),
    });
});

App.get("/screen/:type([^/]+/?[^/]+)/filter/:text*?", (request, response) => {
    let filteredTracks = tracks;
    if (request.params.text) {
        filteredTracks = Object.filter(tracks, track => {
            return `${get(artists[track.artist], { name: "Unknown"}).name}.${track.title}`.toUpperCase().indexOf(request.params.text.toUpperCase()) > -1;
        });
    }
    switch (request.params.type) {
        case "artists/tracks": { response.render("partials/TracksByArtist", { artists: Object.values(getTracksByArtist(filteredTracks)) }); break; };
        default: { response.render("partials/Tracks", { tracks: Object.values(filteredTracks) }); break; };
    }
});

App.get("/screen/tracks", (request, response) => {
    response.render("partials/TracksScreen", { tracks: Object.values(tracks).sort((a, b) => new Date(b.creationDate) - new Date(a.creationDate)) });
});

App.get("/screen/artists/tracks", (request, response) => {
    response.render("partials/TracksScreen", { artists: Object.values(getTracksByArtist(tracks)) });
});

App.get("/screen/artists", (request, response) => {
    response.render("ArtistsScreen", { artists: Object.values(artists).sort((a, b) => a.name.localeCompare(b.name)) });
});

App.get("/screen/track/add", (request, response) => {
    response.render("AddTrackScreen", {});
});


/* Synchronization */

App.get("/synchronize", (request, response) => {
    download(`${SERVER_ADDRESS}/tracks`, TRACKS, _ => {
        tracks = JSON.parse(FileSystem.readFileSync(TRACKS, "utf8"));
        response.send("ok");
    });
});

App.get("/download/:videoId", (request, response) => {
    download(
        `${SERVER_ADDRESS}/file/${request.params.videoId}`,
        `files/${request.params.videoId}.m4a`,
        _ => response.send("ok")
    );
});




/* Start API */

const server = HTTP.createServer(App);
const wsServer = new WebSocket.Server({ server });

wsServer.on("connection", ws => {
    if (!configuration.localMode) {
        const connection = new WebSocket("wss://melophony.ddns.net");

        connection.onmessage = function (event) {
            let data = JSON.parse(event.data);
            if (data.event == "trackAdded") {
                tracks[data.track.id] = data.track;
            }
            ws.send(event.data);
        };
    }
});

server.listen(PORT, _ => console.log(`App started [Port: ${PORT}]`));





Object.filter = function (object, filter) {
    let result = {};
    for (let key in object) {
        if (filter(object[key])) {
            result[key] = object[key];
        }
    }
    return result;
}

async function json(response) {
    const body = await response.text();
    try {
        return JSON.parse(body);
    } catch (err) {
        console.error("Error:", err);
        console.error("Response body:", body);

        throw Error(response, err.message, 500);
    }
}

function getCollection(type) {
    let collection;
    switch (type) {
        case "artist": { collection = artists; break } ;
        case "track": { collection = tracks; break } ;
        default: { collection = tracks; break } ;
    }

    return collection;
}

function save() {
    FileSystem.writeFile(TRACKS, JSON.stringify(tracks), "utf8", _ => false);
    FileSystem.writeFile(ARTISTS, JSON.stringify(artists), "utf8", _ => false);
}

function toArray(object) {
    let result = [];
    for (let k in object) {
        result.push({ key: k, value: object });
    }
    return result;
}

// function getTracksByArtist(tr) {
//     return Object.values(artists).map(a => { return { ...a, tracks: Object.values(tr).filter(t => t.artist == a.id) } }).filter(a => a.tracks.length > 0);
// }

function getTracksByArtist(currentTracks = tracks) {
    let result = { "unknown": { name: "Unknown", tracks: [] }};
    for (let i in currentTracks) {
        let artistFound = false;
        for (let j in artists) {
            if (j == currentTracks[i].artist) {
                if (!result[j]) {
                    result[j] = artists[j];
                    result[j].tracks = [];
                }
                result[j].tracks.push(currentTracks[i]);
                artistFound = true;
                break;
            }
        }
        if (!artistFound) {
            result["unknown"].tracks.push(currentTracks[i]);
        }
    }
    return result;
}

function download(url, fileName, callback) {
    var file = FileSystem.createWriteStream(fileName);

    var request = HTTPS.get(url, response => {
        response.pipe(file);
        file.on("finish", _ => file.close(callback));
    }).on("error", error => FileSystem.unlink(fileName));
}

function get(v, defaultValue) {
    return v || defaultValue;
}