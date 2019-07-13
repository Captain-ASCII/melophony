import Express from "express";
import FileSystem from "fs";
import Path from "path";
import YTDL from "ytdl-core";
import { exec } from "child_process";

const App = Express();

const PORT = 1789;
const DATA_FILE = "data.json";
const FILE_DIR = "files";

const State = {
    UNAVAILABLE: "unavailable",
    DOWNLOADING: "downloading",
    AVAILABLE  : "available",
    DELETED    : "deleted",
};

let files = {};
try {
    files = JSON.parse(FileSystem.readFileSync(DATA_FILE, "utf8"));
} catch (exception) {
    console.warn(`Unable to get previous data, restarting from zero`);
}

function checkFilesDir() {
    if (!FileSystem.existsSync(FILE_DIR)) {
        FileSystem.mkdirSync(FILE_DIR);
    }
}

function deleteFile(id) {
    if (FileSystem.existsSync(`${FILE_DIR}/${id}.m4a`)) {
        FileSystem.unlinkSync(`${FILE_DIR}/${id}.m4a`);
    }
}

function save() {
    FileSystem.writeFile(DATA_FILE, JSON.stringify(files), "utf8", _ => false);
}

App.put('/:videoId', function (request, response) {

    if (!files[request.params.videoId]) {
        files[request.params.videoId] = {
            id: request.params.videoId,
            size: 1,
            state: State.UNAVAILABLE
        };

        response.send({ added: request.params.videoId });

        save();
        console.log(`Add ${request.params.videoId} to files`);

        YTDL.getInfo(`https://www.youtube.com/watch?v=${request.params.videoId}`, {}, (error, info) => {
            if (error) {
                response.send(`Error: ${error}`);
            }

            for (let i in info.formats) {
                if (info.formats[i].container == "m4a") {
                    let format = info.formats[i];
                    console.log(`Found information for ${request.params.videoId}: [ itag: ${format.itag}, length: ${format.clen} ]`);

                    files[request.params.videoId].size = format.clen;
                    files[request.params.videoId].state = State.DOWNLOADING;
                    save();
                    checkFilesDir();
                    exec(`ytdl -q ${format.itag} https://www.youtube.com/watch?v=${request.params.videoId} > ${FILE_DIR}/${request.params.videoId}.m4a`, (error, stdout, stderr) => {
                        if (error) {
                            response.send(`Error: ${error}`);
                        }
                        files[request.params.videoId].state = State.AVAILABLE;
                        save();
                        console.log(`Download done for ${request.params.videoId}`);

                        setTimeout(_ => deleteFile(request.params.videoId), 300000);
                    });
                }
            }
        });
    } else {
        response.send({ state: `already added ${request.params.videoId}` });
    }
});

App.get("/state/:videoId", function (request, response) {
    let progress = -1;

    if (files[request.params.videoId]) {
        if (FileSystem.existsSync(`${FILE_DIR}/${request.params.videoId}.m4a`)) {
            const fileSize = FileSystem.statSync(`${FILE_DIR}/${request.params.videoId}.m4a`).size;
            progress = fileSize / files[request.params.videoId].size;
        }
        response.send({
            id: files[request.params.videoId].id,
            state: files[request.params.videoId].state,
            progress: Math.round(progress * 100)
        });
    } else {
        response.send({ error: "id not found" });
    }
});

App.get("/status/:videoId", function (request, response) {
    response.send({
        state: (!files[request.params.videoId] || files[request.params.videoId].state != State.AVAILABLE) ? State.UNAVAILABLE : State.AVAILABLE
    });
});

App.use("/get/:videoId", function (request, response) {
    if (FileSystem.existsSync(Path.join(__dirname, FILE_DIR, `${request.params.videoId}.m4a`))) {
        response.sendFile(Path.join(__dirname, FILE_DIR, `${request.params.videoId}.m4a`));
    } else {
        response.send({ error: `Could not get ${request.params.videoId}.m4a, file does not exist` });
    }
});

App.delete("/:videoId", function (request, response) {
    deleteFile(request.params.videoId);
    files[request.params.videoId].state = State.DELETED;
    save();
    response.send({ state: "deleted" });
});

App.get("/list/current", function (request, response) {
    checkFilesDir();
    response.send(FileSystem.readdirSync(FILE_DIR));
});

App.get("/manifest", function (request, response) {
    response.send(JSON.parse(FileSystem.readFileSync(DATA_FILE, "utf8")));
});

App.get("/*", (request, response) => {
    response.send({ state: "Nothing to do" });
});

App.listen(process.env.PORT || PORT, function () {
    console.log(`Example app listening on port ${process.env.PORT || PORT}`)
});