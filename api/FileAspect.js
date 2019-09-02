
import FileSystem from "fs";
import Path from "path";
import Track from "./../Track";

import BaseAspect from "./BaseAspect";
import * as ServerUtils from "./ServerUtils";

export default class FileAspect extends BaseAspect {

    constructor(app, db) {
        super(app, db);

        this.files = db.get(BaseAspect.FILES);
        this.tracks = db.get(BaseAspect.TRACKS);
        this.modifiedTracks = db.get(BaseAspect.MODIFIED_TRACKS);
        this.artists = db.get(BaseAspect.ARTISTS);

        this.app.put('/:videoId', (request, response) => {
            response.send(ServerUtils.downloadTrack(
                request.params.videoId,
                this.files,
                this.tracks,
                this.artists,
                this.modifiedTracks,
                this.db
            ));
        });

        this.app.get("/state/:videoId", (request, response) => {
            let progress = 0;

            if (this.files[request.params.videoId]) {
                if (FileSystem.existsSync(`${ServerUtils.FILE_DIR}/${request.params.videoId}.m4a`)) {
                    const fileSize = FileSystem.statSync(`${ServerUtils.FILE_DIR}/${request.params.videoId}.m4a`).size;
                    progress = fileSize / this.files[request.params.videoId].size;
                }
                response.send({
                    id: this.files[request.params.videoId].id,
                    state: this.files[request.params.videoId].state,
                    progress: Math.round(progress * 100)
                });
            } else {
                response.send({ error: "id not found" });
            }
        });

        this.app.get("/status/:videoId", (request, response) => {
            response.send({
                state: (!this.files[request.params.videoId] || this.files[request.params.videoId].state != Track.AVAILABLE) ? Track.UNAVAILABLE : Track.AVAILABLE
            });
        });

        this.app.use("/get/:videoId", (request, response) => {
            if (FileSystem.existsSync(Path.join(__dirname, ServerUtils.FILE_DIR, `${request.params.videoId}.m4a`))) {
                response.sendFile(Path.join(__dirname, ServerUtils.FILE_DIR, `${request.params.videoId}.m4a`));
            } else {
                response.send({ error: `Could not get ${request.params.videoId}.m4a, file does not exist` });
            }
        });

        this.app.get("/manifest", (request, response) => {
            response.send(this.files);
        });

        this.app.get("/fileDir", (request, response) => {
            ServerUtils.checkFilesDir();
            response.send(FileSystem.readdirSync(ServerUtils.FILE_DIR));
        });
    }
}