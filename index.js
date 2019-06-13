import Express from "express";
import FileSystem from "fs";
import { exec } from "child_process";

const App = Express();

const PORT = 1789;
const FILE = "file.m4a";

App.use("/get", Express.static(FILE));

App.get("/clear", function (request, response) {
    FileSystem.unlinkSync(FILE);
    response.send({ state: "deleted" });
});

App.get('/:videoId', function (request, response) {
    console.log(request.params.videoId);
    exec(`ytdl -i https://www.youtube.com/watch?v=${request.params.videoId} | grep m4a`, (error, stdout, stderr) => {
        if (error || typeof stdout != "string") {
            response.send(`Error: ${error}`);
            return;
        }
        let quality = stdout.match(/[0-9]+/);
        console.warn(quality);
        exec(`ytdl -q ${quality[0]} https://www.youtube.com/watch?v=${request.params.videoId} > ${FILE}`, (error, stdout, stderr) => {
            if (error) {
                response.send(`Error: ${error}`);
            }
            response.send({ done: true });
        });
    });
});

App.get("/.*", (request, response) => {
    response.send("Fallback");
});

App.listen(process.env.PORT || PORT, function () {
    console.log(`Example app listening on port ${process.env.PORT || PORT}`)
});