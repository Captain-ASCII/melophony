
import BaseAspect from "./BaseAspect";

export default class ModificationAspect extends BaseAspect {

    constructor(app, db) {
        super(app, db);

        this.modifiedTracks = db.get(BaseAspect.MODIFIED_TRACKS);

        this.app.get("/modification/tracks", (request, response) => {
            response.send(this.modifiedTracks);
        });

        this.app.delete("/modification/tracks", (request, response) => {
            this.modifiedTracks = this.db.clear(this.modifiedTracks);
            response.send({ status: "done" });
        });
    }
}