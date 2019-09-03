
// function start() {}

// /* Navigation */

// function changeScreen(screen) {}
// function filter(text) {}
// function modifyTrack(id = currentTrack.id) {}
// function modifyArtist(id) {}

// /* Track management */

// function synchronize() {}
// function download(videoId) {}
// function toast(text) {}

// /* Track Modification Screen */

// function modifyTrackStart(id, value) {}
// function modifyTrackEnd(id, value) {}
// function hide() {}
// function saveAndHide(id) {}

// function startPlay(id) {}
// function previous()
// function next() {}

/* Player */

function play() {
    if (player.src == "") {
        next();
    } else {
        player.play();
        document.getElementById("playButton").className = "flatButton fa fa-pause fa-2x";
    }
}

function pause() {
    player.pause();
    document.getElementById("playButton").className = "flatButton fa fa-play fa-2x";
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
