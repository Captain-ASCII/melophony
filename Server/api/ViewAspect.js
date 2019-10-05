
import Express from "express";
import Path from "path";

import BaseAspect from "./BaseAspect";

const HandleBars = require("express-handlebars");

var handlebars = HandleBars.create({
    defaultLayout: false,
    helpers: {
        formatDuration: function(t) { return `${Math.floor(parseInt(t)/60)}:${parseInt(t)%60}`; }
    }
});

const commonPath = Path.join(__dirname, "..", "..", "Common", "Views");

export default class ViewAspect extends BaseAspect {

    constructor(app, db) {
        super(app, db);

        this.tracks = db.get(BaseAspect.TRACKS);
        this.artists = db.get(BaseAspect.ARTISTS);
        this.users = db.get(BaseAspect.USERS);

        this.app.engine("handlebars", handlebars.engine);
        this.app.set("view engine", "handlebars");
        this.app.set("views", Path.join(commonPath, "views"));

        this.app.use("/custom", Express.static("custom"));
        this.app.use("/public", Express.static(Path.join(commonPath, "public")));

        this.app.get("/screen/home", (request, response) => {
            response.render("App", {
                tracks: Object.values(this.tracks).sort((a, b) => new Date(b.creationDate) - new Date(a.creationDate)),
                configuration: this.users[0].configuration
            });
        });

        this.app.get("/screen/modify/track/:id", (request, response) => {
            let track = this.tracks[request.params.id];
            response.render("ModificationScreen", {
                track: track,
                artist: this.get(artists[track.artist], { name: "Unknown"}).name
            });
        });

        this.app.get("/screen/filter/tracks/:text", (request, response) => {
            let filteredTracks = Object.values(this.tracks).filter(track => {
                return `${this.get(artists[track.artist], { name: "Unknown"}).name}.${track.title}`.toUpperCase().indexOf(request.params.text.toUpperCase()) > -1;
            }).map(track => {
                return { ...track, artist: this.get(this.artists[track.artist], { name: "Unknown"}).name };
            });
            response.render("FilterScreen", { tracks: filteredTracks });
        });

        this.app.get("/screen/tracks", (request, response) => {
            response.render("partials/TracksScreen", { tracks: Object.values(this.tracks).sort((a, b) => new Date(b.creationDate) - new Date(a.creationDate)) });
        });

        this.app.get("/screen/artists/tracks", (request, response) => {
            response.render("partials/TracksScreen", { artists: Object.values(this.getTracksByArtist(this.tracks)) });
        });

        this.app.get("/screen/artists", (request, response) => {
            response.render("ArtistsScreen", { artists: Object.values(this.artists).sort((a, b) => a.name.localeCompare(b.name)) });
        });

        this.app.get("/screen/track/add", (request, response) => {
            response.render("AddTrackScreen", {});
        });
    }

    getTracksByArtist(currentTracks = this.tracks) {
        let result = { "unknown": { name: "Unknown", tracks: [] }};
        for (let i in currentTracks) {
            let artistFound = false;
            for (let j in this.artists) {
                if (j == currentTracks[i].artist) {
                    if (!result[j]) {
                        result[j] = this.artists[j];
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

    get(v, defaultValue) {
        return v || defaultValue;
    }
}