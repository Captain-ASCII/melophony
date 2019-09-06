
import FileSystem from "fs";

import BaseAspect from "./BaseAspect";
import * as ServerUtils from "./ServerUtils";

export default class TrackAspect extends BaseAspect {

    constructor(app, db) {
        super(app, db);

        this.files = db.get(BaseAspect.FILES);
        this.tracks = db.get(BaseAspect.TRACKS);
        this.modifiedTracks = db.get(BaseAspect.MODIFIED_TRACKS);
        this.artists = db.get(BaseAspect.ARTISTS);

        this.app.get("/tracks", (request, response) => {
            response.send(this.tracks);
        });

        this.app.get("/track/:id", (request, response) => {
            response.send(this.tracks[request.params.id] ? this.tracks[request.params.id] : {});
        });

        this.app.put("/track/:id", (request, response) => {
            if (this.tracks[request.params.id] && this.tracks[request.params.id].videoId != request.body.videoId) {
                ServerUtils.downloadTrack(request.body.videoId, this.files, this.tracks, this.modifiedTracks, this.db);
            }

            this.tracks[request.params.id] = request.body;
            this.modifiedTracks[request.params.id] = request.body;
            response.send({ status: "done" });

            this.tracks._save();
            this.modifiedTracks._save();
        });

        this.app.delete("/track/:id", (request, response) => {
            if (this.tracks[request.params.id]) {
                let videoId = this.tracks[request.params.id].videoId;

                // deleteFile(videoId);
                // files[request.params.id].state = Track.DELETED;

                delete this.tracks[request.params.id];
                this.modifiedTracks[request.params.id] = { deleted: true };
            }

            response.send({ status: "deleted" });
            this.db.save();
        });
    }
}