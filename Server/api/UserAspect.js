
import BaseAspect from "./BaseAspect";

export default class UserAspect extends BaseAspect {

    constructor(app, db) {
        super(app, db);

        this.users = db.get(BaseAspect.USERS);

        this.app.get("/users", (request, response) => {
            response.send(this.users);
        });

        this.app.get("/user/:id", (request, response) => {
            response.send(this.users[request.params.id]);
        });

        this.app.put("/user/:id", (request, response) => {
            this.users[request.params.id] = request.body;
            response.send({ status: "done" });
            this.users._save();
        });
    }
}