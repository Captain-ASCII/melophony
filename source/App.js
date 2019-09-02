
const EXTRACT_DURATION = 2000;
const SERVER_ADDRESS = "https://melophony.ddns.net";

let tracks = {};
let artists = {};
let player = null;
let extractTimeout = null;
let trackListHTML = "";

async function start() {
    tracks = await (await fetch(`${SERVER_ADDRESS}/tracks`)).json();
    artists = await (await fetch(`${SERVER_ADDRESS}/artists`)).json();

    trackListHTML = document.getElementById("content").innerHTML;

    player = document.getElementById("player");
};

function get(v, defaultValue) {
    return v || defaultValue;
}

function startPlay(id) {
    let track = tracks[id];
    currentTrack = track;
    let artist = artists[currentTrack.artist] || { name: "Unknown" };

    player.src = `/tracks/${track.videoId}.m4a`;
    player.currentTime = track.startTime;
    document.getElementById("currentTrackInfo").innerHTML = `${artist.name} - ${currentTrack.title}`;
    new InputRange("tracker", document.getElementById("tracker"), track).asReader(player);

    play();
}

function next() {
    let tracksArray = Object.values(tracks);
    let index = Math.floor(Math.random() * tracksArray.length);
    startPlay(`${tracksArray[index].id}`);
}

function formatDuration(duration) {
    return `${Math.floor(duration/60)}m${duration%60}s`;
}

async function filter(text) {
    if (text == "") {
        document.getElementById("tracks").innerHTML = trackListHTML;
    } else {
        document.getElementById("tracks").innerHTML = await (await fetch(`${SERVER_ADDRESS}/screen/filter/tracks/${text}`)).text();
    }
}

async function modifyTrack(id = currentTrack.id) {
    if (!id) {
        return;
    }
    let track = tracks[id];

    player.src = `/tracks/${track.videoId}.m4a`;
    player.onended = _ => false;

    let content = document.getElementById("content");
    trackListHTML = content.innerHTML;
    content.innerHTML = await (await fetch(`${SERVER_ADDRESS}/screen/modify/track/${id}`)).text();

    new InputRange("trackModificator", document.getElementById("trackModificator"), track, "modifyTrackStart", "modifyTrackEnd");

    content.style.overflowY = "hidden";
}

async function changeScreen(screen) {
    document.getElementById("content").innerHTML = await (await fetch(`${SERVER_ADDRESS}/screen/${screen}`)).text();
}

/* Modification Screen */

function playExtract(time) {
    player.currentTime = time;
    player.play();
    if (extractTimeout) {
        clearTimeout(extractTimeout);
    }
    extractTimeout = setTimeout(_ => player.pause(), EXTRACT_DURATION);
}

function getPercentage(id, value) {
    return (value / tracks[id].duration) * 100;
}

function modifyTrackStart(id, value) {
    playExtract(value);
    document.querySelector("#trackModificator > .trackBar").style.left = `calc(${getPercentage(id, value)}% + 10px)`;
    tracks[id].startTime = parseInt(value);
}

function modifyTrackEnd(id, value) {
    playExtract(value);
    document.querySelector("#trackModificator > .trackBar").style.right = `calc(${100 - getPercentage(id, value)}% + 10px)`;
    tracks[id].endTime = parseInt(value + (EXTRACT_DURATION / 1000));
}

function hide() {
    let content = document.getElementById("content");

    content.innerHTML = trackListHTML;
    content.style.overflowY = "scroll";
}

function saveAndHide(id) {
    let inputs = document.querySelectorAll(".form-data");
    console.warn(tracks[id], inputs);
    for (let input of inputs) {
        tracks[id][input.id] = input.value;
    }
    console.warn(tracks[id])
    fetch(`${SERVER_ADDRESS}/track/${id}`, {
        method: "PUT",
        body: JSON.stringify(tracks[id]),
        headers: { 'Content-Type': 'application/json' }
    });
    hide();
}

/* Player */

function play() {
    if (player.src == "") {
        next();
    } else {
        player.play();
        document.getElementById("playButton").className = "flatButton fa fa-pause fa-2x";

        player.onended = function() {
            next();
        };
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

function toast(text) {
    document.getElementById("toaster").style.transform = "translateX(0%)";
    setTimeout(_ => document.getElementById("toaster").style.transform = "translateX(-110%)", 3000);
}