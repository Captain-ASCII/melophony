
import BaseAspect from "./BaseAspect";

export default class ArtistAspect extends BaseAspect {

    constructor(app, db) {
        super(app, db);

        this.artists = db.get(BaseAspect.ARTISTS);
        this.tracks = db.get(BaseAspect.TRACKS);

        this.app.get("/artists", (request, response) => {
            response.send(this.artists);
        });

        this.app.get("/artist/:id", (request, response) => {
            response.send(this.artists[request.params.id]);
        });

        this.app.put("/artist/:id", (request, response) => {
            this.artists[request.params.id] = request.body;
            console.warn(request.body)
            response.send({ status: "done" });
            this.artists._save();
        });

        this.app.get("/artists/tracks", (request, response) => {
            let result = {};
            for (let i in this.artists) {
                for (let track of Object.values(this.tracks)) {
                    if (i == track.artist) {
                        if (!result[i]) {
                            result[i] = this.artists[i];
                            result[i].tracks = [];
                        }
                        result[i].tracks.push(track);
                    }
                }
            }
            response.send(result);
        });
    }
}