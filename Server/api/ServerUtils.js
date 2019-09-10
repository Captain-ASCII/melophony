
import FileSystem from "fs";
import YTDL from "ytdl-core";
import { exec } from "child_process";

import Track from "./../model/Track";

const FILE_DIR = "files";

function downloadTrack(videoId, files, tracks, artists, modifiedTracks, db) {
    files[videoId] = new File(videoId);
    files._save();
    console.log(`${videoId}: `, files[videoId]);

    YTDL.getInfo(`https://www.youtube.com/watch?v=${videoId}`, {}, (error, info) => {
        if (error) {
            console.log(`Error YTDL info: ${error}`);
            return `Error: ${error}`;
        }

        for (let i in info.formats) {
            if (info.formats[i].container == "m4a") {
                let format = info.formats[i];
                console.log(`Found information for ${videoId}: [ itag: ${format.itag}, length: ${format.clen} ]`);

                files[videoId].size = format.clen;
                files[videoId].state = Track.DOWNLOADING;

                if (!Object.values(tracks).find(t => t.videoId === videoId)) {
                    let track = new Track(info.player_response.videoDetails.title, info.player_response.videoDetails.lengthSeconds, artists, videoId);
                    tracks[track.id] = track;
                    modifiedTracks[track.id] = track;
                }

                db.save();
                checkFilesDir();
                exec(`ytdl -q ${format.itag} https://www.youtube.com/watch?v=${videoId} > ${FILE_DIR}/${videoId}.m4a`, (error, stdout, stderr) => {
                    if (error) {
                        console.log(`Error YTDL download: ${error}`);
                        return `Error: ${error}`;
                    }
                    files[videoId].state = Track.AVAILABLE;
                    tracks[track.id].state = Track.AVAILABLE;
                    db.save();
                    console.log(`Download done for ${videoId}`);
                });

                setInterval(_ => {
                    const progress = getDownloadProgress(videoId, files);
                    EventListener.notify("downloadProgress", [ progress ]);
                }, 2000);
            }
        }
    });
    return { added: videoId };
}

function getDownloadProgress(videoId, files) {
    if (FileSystem.existsSync(`${ServerUtils.FILE_DIR}/${videoId}.m4a`)) {
        const fileSize = FileSystem.statSync(`${ServerUtils.FILE_DIR}/${videoId}.m4a`).size;
        return 100 * (fileSize / files[videoId].size);
    }
    return 0;
}

function deleteFile(id) {
    if (FileSystem.existsSync(`${FILE_DIR}/${id}.m4a`)) {
        FileSystem.unlinkSync(`${FILE_DIR}/${id}.m4a`);
    }
}

function checkFilesDir() {
    if (!FileSystem.existsSync(FILE_DIR)) {
        FileSystem.mkdirSync(FILE_DIR);
    }
}

export { FILE_DIR, downloadTrack, deleteFile, checkFilesDir };