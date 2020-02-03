
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
            if (info.formats[i].mimeType && info.formats[i].mimeType.startsWith("audio/mp4")) {
                let format = info.formats[i];
                console.log(`Found information for ${videoId}: [ itag: ${format.itag}, length: ${format.clen} ]`);

                files[videoId].size = format.clen;
                files[videoId].state = Track.DOWNLOADING;

                let track = false;
                if (!Object.values(tracks).find(t => t.videoId === videoId)) {
                    track = new Track(info.player_response.videoDetails.title, info.player_response.videoDetails.lengthSeconds, artists, videoId);
                    tracks[track.id] = track;
                    modifiedTracks[track.id] = track;
                    global.eventListener.notify("trackAdded", [ track ]);
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
                        tracks[track.id].status = Track.AVAILABLE;
                    }
                    global.eventListener.notify("downloadEnd", [ videoId ]);

                    db.save();
                    console.log(`Download done for ${videoId}`);
                });

                let progressInterval = setInterval(_ => {
                    const progress = getDownloadProgress(videoId, files);
                    global.eventListener.notify("downloadProgress", [ videoId, progress ]);

                    if (progress == 100) {
                        clearTimeout(progressInterval);
                    }
                }, 2000);
		break
            }
        }
    });
    return { added: videoId };
}

function getDownloadProgress(videoId, files) {
    if (FileSystem.existsSync(`${FILE_DIR}/${videoId}.m4a`)) {
        const fileSize = FileSystem.statSync(`${FILE_DIR}/${videoId}.m4a`).size;
        return Math.round(100 * (fileSize / files[videoId].size));
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

export { FILE_DIR, downloadTrack, deleteFile, checkFilesDir, getDownloadProgress };
