
import FileSystem from "fs";
import YTDL from "ytdl-core";
import { exec } from "child_process";

import File from "./../model/File";
import Track from "./../model/Track";

const FILE_DIR = "files";

function downloadTrack(videoId, files, tracks, artists, modifiedTracks, db) {
    deleteFile(videoId);
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

                let track = false;
                if (!Object.values(tracks).find(t => t.videoId === videoId)) {
                    track = new Track(info.player_response.videoDetails.title, info.player_response.videoDetails.lengthSeconds, artists, videoId);
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
                    if (track) {
                        tracks[track.id].state = Track.AVAILABLE;
                    }
                    db.save();
                    console.log(`Download done for ${videoId}`);
                });
            }
        }
    });
    return { added: videoId };
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
