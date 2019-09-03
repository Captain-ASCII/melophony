
import FileSystem from "fs";

export default class LogAspect {

    static LOGS_FILE = "logs.txt";

    constructor(app, db) {
        this.app = app;

        this.app.use("*", (request, response, next) => {
            let now = new Date();
            let log = `${now.toLocaleDateString("fr-FR")} ${now.toLocaleTimeString("fr-FR")}: Received request [${request.originalUrl}]`;
            console.log(log);
            FileSystem.writeFile(LogAspect.LOGS_FILE, log, _ => false);
            next();
        });
    }
}