
import HTTPS from "https";
import Express from "express";
import FileSystem from "fs";
import fetch from "node-fetch";
import Path from "path";

const Mustache = require("mustache-express");

const App = Express();
const commonPath = Path.join(__dirname, "..", "Common", "Views");

const PORT = 1958;

const TRACKS = "data/tracks.json";
const ARTISTS = "data/artists.json";
const TRACKS_DIR = "tracks";
const IMAGES_DIR = "images";

const tracks = JSON.parse(FileSystem.readFileSync(TRACKS, "utf8"));
const artists = JSON.parse(FileSystem.readFileSync(ARTISTS, "utf8"));

App.use(Express.json());

App.engine("mustache", Mustache());
App.set("view engine", "mustache");
App.set("views", Path.join(commonPath, "views"));
App.use("/public", Express.static(Path.join(commonPath, "public")));

App.use("/custom", Express.static("custom"));
App.use("/images", Express.static("images"));
App.use("/tracks", Express.static("tracks"));

App.get("/availableTracks", (request, response) => {
    response.send(tracks);
});

App.get("/artists", (request, response) => {
    response.send(artists);
});

App.get("/artists/tracks", (request, response) => {
    response.send(getTracksByArtist(tracks));
});

App.get("/", (request, response) => {
    response.render("App", { artists: getTracksByArtist(tracks) });
});

App.put("/track/:id", async (request, response) => {
    let data = await (await fetch(`https://melophony.ddns.net/track/${request.params.id}`, {
        method: "PUT",
        body: JSON.stringify(request.body),
        headers: { "Content-Type": "application/json" }
    })).json();

    tracks[request.params.id] = request.body;
    save();
    response.send({ "status": "done" });
});


/* Redirect distant API calls */

App.get("/api/:request((([^/]+/)*[^/]+))", async (request, response) => {
    let data = await (await fetch(`https://melophony.ddns.net/${request.params.request}`)).json();
    response.send(data);
});

App.put("/api/:request((([^/]+/)*[^/]+))", async (request, response) => {
    let data = await (await fetch(`https://melophony.ddns.net/${request.params.request}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(request.body)
    })).json();
    response.send(data);
});

App.delete("/api/:request((([^/]+/)*[^/]+))", async (request, response) => {
    let data = await (await fetch(`https://melophony.ddns.net/${request.params.request}`, { method: "DELETE" })).json();
    response.send(data);
});

/* Screens */

App.get("/", (request, response) => {
    response.render("App", { artists: (tracks, artists) });
});

App.get("/screen/modify/track/:id", (request, response) => {
    let track = tracks[request.params.id];
    response.render("ModificationScreen", {
        track: track,
        artist: get(artists[track.artist], { name: "Unknown"}).name,
        artists: Object.values(artists)
    });
});

App.get("/screen/tracks/filter/:text", (request, response) => {
    let filteredTracks = Object.values(tracks).filter(track => {
        return `${get(artists[track.artist], { name: "Unknown"}).name}.${track.title}`.toUpperCase().indexOf(request.params.text.toUpperCase()) > -1;
    });
    // .map(track => {
    //     return { ...track, artist: get(artists[track.artist], { name: "Unknown"}).name };
    // });
    response.render("Tracks", { artists: getTracksByArtist(filteredTracks), duration: formatDuration });
});

App.get("/screen/tracks", (request, response) => {
    response.render("TracksScreen", { artists: getTracksByArtist(tracks), duration: formatDuration });
});

App.get("/screen/artists", (request, response) => {
    response.render("ArtistsScreen", { artists: Object.values(artists) });
});

App.get("/screen/track/add", (request, response) => {
    response.render("AddTrackScreen", {});
});


/* Synchronization */

App.get("/synchronize", (request, response) => {
    download("https://melophony.ddns.net/tracks", TRACKS, _ => {
        tracks = JSON.parse(FileSystem.readFileSync(TRACKS, "utf8"));
        response.send("ok");
    });
});

App.get("/download/:videoId", (request, response) => {
    download(
        `https://melophony.ddns.net/get/${request.params.videoId}`,
        `tracks/${request.params.videoId}.m4a`,
        _ => response.send("ok")
    );
});




/* Start API */

App.listen(PORT, _ => console.log(`App started [Port: ${PORT}]`));






function formatDuration() {
    return function(t, render) {
        return `${parseInt(t)/60}:${parseInt(t)%60}`;
    };
}

function save() {
    FileSystem.writeFileSync(TRACKS, JSON.stringify(tracks), "utf8");
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

function getTracksByArtist() {
    let result = { "unknown": { name: "Unknown", tracks: [] }};
    for (let i in tracks) {
        let artistFound = false;
        for (let j in artists) {
            if (j == tracks[i].artist) {
                if (!result[j]) {
                    result[j] = artists[j];
                    result[j].tracks = [];
                }
                result[j].tracks.push(tracks[i]);
                artistFound = true;
                break;
            }
        }
        if (!artistFound) {
            result["unknown"].tracks.push(tracks[i]);
        }
    }
    return Object.values(result);
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