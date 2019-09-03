
import FileSystem from "fs";
import ReadLine from "readline-sync";
import fetch from "node-fetch";

const tracks = JSON.parse(FileSystem.readFileSync("tracks.json", "utf8"));
const artists = JSON.parse(FileSystem.readFileSync("artists.json", "utf8"));

function generateId() {
    let result = '';
    let characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    for (let i = 0; i < 8; i++) {
        result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
}

function createArtists() {
    for (let track of Object.values(tracks)) {
        if (!Object.values(artists).find(t => t.name.toUpperCase() == track.artist.toUpperCase())) {
            artists[generateId()] = {
                name: track.artist
            };
        }
    }

    console.warn(artists);
    FileSystem.writeFileSync("artists.json", JSON.stringify(artists), "utf8");
}

function modifyTracksWithArtists() {
    for (let i in tracks) {
        for (let j in artists) {
            if (tracks[i].artist.toUpperCase() == artists[j].name.toUpperCase()) {
                tracks[i].artist = j;
            }
        }
    }

    console.warn(tracks);
    // FileSystem.writeFileSync("tracks.json", JSON.stringify(tracks), "utf8");
}

function getUntrackedFiles() {
    FileSystem.readdir("tracks", async (error, items) => {
        let promises = [];
        for (let item of items) {
            if (!Object.values(tracks).find(t => `${t.videoId}.m4a` == item)) {
                let videoId = item.substring(0, item.lastIndexOf("."));
                let title = ReadLine.question(`title for: http://localhost:1958/tracks/${item} ? `);
                let artist = ReadLine.question(`artist ? `);
                let artistId = Object.keys(artists)[0];
                for (let i in artists) {
                    if (artists[i].name.toUpperCase() == artist.toUpperCase()) {
                        console.warn("found !");
                        artistId = i;
                    }
                }
                let trackId = generateId();
                let track = {
                    id: trackId,
                    title: title,
                    artist: artistId,
                    album: "Unknown",
                    imageSrc: {
                        uri: `https://i.ytimg.com/vi/${videoId}/mqdefault.jpg`
                    },
                    imageExtension: "jpg",
                    creationDate: new Date().toISOString(),
                    status: "Unavailable",
                    duration: 0,
                    startTime: 0,
                    endTime: 0,
                    lastPlay: "",
                    playCount: 0,
                    rating: 0,
                    progress: 0,
                    videoId: videoId
                };
                console.warn(track);
                let confirm = ReadLine.question(`confirm ? `);
                if (confirm == "y") {
                    let data = await (await fetch(`https://melophony.ddns.net/track/${trackId}`, {
                        method: "PUT",
                        body: JSON.stringify(track),
                        headers: { "Content-Type": "application/json" }
                    })).json()
                    console.warn(data);
                } else {
                    console.warn("not sent")
                }
            }
        }
    });
}

// async function modifyModificationTracks() {
//     let mTracks = await (await fetch("https://melophony.ddns.net/modification/tracks")).json();
//     for (let i in mTracks) {
//         mTracks[i].status = "available";
//         // let data = await (await fetch(`https://melophony.ddns.net/track/${trackId}`, {
//         //     method: "PUT",
//         //     body: JSON.stringify(mTracks[i]),
//         //     headers: { "Content-Type": "application/json" }
//         // })).json()
//         console.mTracks[i]
//     }
// }


// modifyModificationTracks();

// getUntrackedFiles();

// modifyTracksWithArtists();



