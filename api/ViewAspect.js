
import Express from "express";
const Squirrelly = require("squirrelly");

import BaseAspect from "./BaseAspect";

Squirrelly.defineFilter("duration", function (durationString) {
    let duration = parseInt(durationString);
    return `${Math.floor(duration/60)}:${duration%60}`;
});

export default class ViewAspect extends BaseAspect {

    constructor(app, db) {
        super(app, db);

        this.tracks = db.get(BaseAspect.TRACKS);

        this.app.set("view engine", "squirrelly");
        this.app.use("/source", Express.static("source"));

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
                return { ...track, artist: this.get(artists[track.artist], { name: "Unknown"}).name };
            });
            response.render("FilterScreen", { tracks: filteredTracks });
        });

        this.app.get("/screen/tracks", (request, response) => {
            response.render("TracksScreen", { artists: this.getTracksByArtist() });
        });

        this.app.get("/screen/artists", (request, response) => {
            response.render("ArtistsScreen", { artists: artists });
        });
    }

    getTracksByArtist() {
        let result = { "unknown": { name: "Unknown", tracks: [] }};
        for (let i in this.tracks) {
            let artistFound = false;
            for (let j in artists) {
                if (j == this.tracks[i].artist) {
                    if (!result[j]) {
                        result[j] = artists[j];
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