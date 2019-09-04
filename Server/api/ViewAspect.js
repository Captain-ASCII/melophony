
import Express from "express";
import Path from "path";
const Squirrelly = require("squirrelly");

import BaseAspect from "./BaseAspect";

Squirrelly.defineFilter("duration", function (durationString) {
    let duration = parseInt(durationString);
    return `${Math.floor(duration/60)}:${duration%60}`;
});

const commonPath = Path.join(__dirname, "..", "..", "Common", "Views");

export default class ViewAspect extends BaseAspect {

    constructor(app, db) {
        super(app, db);

        this.tracks = db.get(BaseAspect.TRACKS);

        this.app.set("view engine", "squirrelly");
        this.app.set("views", Path.join(commonPath, "views"));

        this.app.use("/custom", Express.static("custom"));
        this.app.use("/public", Express.static(Path.join(commonPath, "public")));

        this.app.get("/screen/home", (request, response) => {
            response.render("App", { artists: this.getTracksByArtist() });
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
            response.render("TracksScreen", { artists: this.getTracksByArtist() });
        });

        this.app.get("/screen/artists", (request, response) => {
            response.render("ArtistsScreen", { artists: this.artists });
        });
    }

    getTracksByArtist() {
        let result = { "unknown": { name: "Unknown", tracks: [] }};
        for (let i in this.tracks) {
            let artistFound = false;
            for (let j in this.artists) {
                if (j == this.tracks[i].artist) {
                    if (!result[j]) {
                        result[j] = this.artists[j];
                        result[j].tracks = [];
                    }
                    result[j].tracks.push(this.tracks[i]);
                    artistFound = true;
                    break;
                }
            }
            if (!artistFound) {
                result["unknown"].tracks.push(this.tracks[i]);
            }
        }
        return result;
    }

    get(v, defaultValue) {
        return v || defaultValue;
    }
}