import Express from "express";
import { exec } from "child_process";

const App = Express();

const PORT = 1789;

App.get('/:videoId', function (request, response) {
    console.log(request.params.videoId);
    exec(`ytdl -i https://www.youtube.com/watch?v=${request.params.videoId} | grep m4a`, (error, stdout, stderr) => {
        if (error) {
            response.send(`Error: ${error}`);
            return;
        }
        exec(`ytdl -q 140 --print-url https://www.youtube.com/watch?v=${request.params.videoId}`, (error, stdout, stderr) => {
            if (error) {
                response.send(`Error: ${error}`);
            }
            response.send({ url: stdout });
        });
    });
});

App.get("/.*", (request, response) => {
    response.send("Fallback");
});

App.listen(process.env.PORT || PORT, function () {
    console.log(`Example app listening on port ${process.env.PORT || PORT}`)
});