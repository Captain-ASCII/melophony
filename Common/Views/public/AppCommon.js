
// function start() {}

// /* Navigation */

// function changeScreen(screen) {}
// function filter(text) {}
// function modifyTrack(id = currentTrack.id) {}

// /* Track management */

// function synchronize() {}
// function toast(text) {}

/* Modification Screens */

// function hide() {}
// function saveAndHide(id) {}

// /* Track Modification Screen */

// function modifyTrackStart(id, value) {}
// function modifyTrackEnd(id, value) {}
// function download(videoId) {}
// function requestServerDownload(videoId) {}
// function deleteTrack(id) {}

/* Artist Modification Screen */

// function createArtist() {}
// function modifyArtist(id) {}
// function deleteArtist(id) {}

/* Track player */

// function startPlay(id) {}
// function previous()
// function next() {}

/* Player */

let extractTimeout = null;

function play() {
    if (player.src == "") {
        next();
    } else {
        player.onended = function() { next(); };
        player.play();
        document.getElementById("playButton").className = "fa fa-pause fa-2x";
    }
}

function pause() {
    player.pause();
    document.getElementById("playButton").className = "fa fa-play fa-2x";
}

function playPause() {
    if (player.paused) {
        play();
    } else {
        pause();
    }
}

function playExtract(time) {
    player.currentTime = time;
    player.play();
    if (extractTimeout) {
        clearTimeout(extractTimeout);
    }
    extractTimeout = setTimeout(_ => player.pause(), EXTRACT_DURATION);
}
