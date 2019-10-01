
export default class MediaManager {

    constructor() {
        this.currentIndex = -1;
    }

    startPlay(id, index) {
        this.currentIndex = index;

        let track = tracks[id];
        let artist = artists[track.artist] || { name: "Unknown" };

        player.src = `/files/${track.videoId}.m4a`;
        player.currentTime = track.startTime;

        player.ontimeupdate = function(event) {
            if (player.currentTime > track.endTime) {
                next();
            }
        };
        document.getElementById("currentTrackInfo").innerHTML = `${artist.name} - ${track.title}`;
        new InputRange("tracker", document.getElementById("tracker"), track).asReader(player);

        play();
    }

    previous() {
        this.currentIndex = shuffleMode ? Math.floor(Math.random() * tracksArray.length) : (this.currentIndex - 1) % tracksArray.length;
        startPlay(`${tracksArray[this.currentIndex].id}`, this.currentIndex);
    }

    play() {
        if (player.src == "") {
            next();
        } else {
            player.onended = function() { next(); };
            player.play();
            document.getElementById("playButton").className = "fa fa-pause fa-2x";
        }
    }

    pause() {
        player.pause();
        document.getElementById("playButton").className = "fa fa-play fa-2x";
    }

    playPause() {
        if (player.paused) {
            play();
        } else {
            pause();
        }
    }

    next() {
        this.currentIndex = shuffleMode ? Math.floor(Math.random() * tracksArray.length) : (this.currentIndex + 1) % tracksArray.length;
        startPlay(`${tracksArray[this.currentIndex].id}`, this.currentIndex);
    }

    playExtract(time) {
        player.currentTime = time;
        player.play();
        if (extractTimeout) {
            clearTimeout(extractTimeout);
        }
        extractTimeout = setTimeout(_ => player.pause(), EXTRACT_DURATION);
    }
}