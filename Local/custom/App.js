
let EXTRACT_DURATION = 2000;

let tracks = {};
let artists = {};
let tracksArray = [];
let player = null;
let extractTimeout = null;
let isBeingModified = false;
let trackListHTML = "";

async function start() {
    tracks = await (await fetch("http://localhost:1958/availableTracks")).json();
    artists = await (await fetch("http://localhost:1958/artists")).json();
    tracksArray = Object.values(tracks);

    trackListHTML = document.getElementById("tracks").innerHTML;

    player = document.getElementById("player");

    player.onended = function() {
        if (!isBeingModified) {
            next();
        }
    };
};

function get(v, defaultValue) {
    return v || defaultValue;
}

async function changeScreen(screen) {
    document.getElementById("content").innerHTML = await (await fetch(`http://localhost:1958/screen/${screen}`)).text();
}

async function filter(text) {
    if (text == "") {
        document.getElementById("tracks").innerHTML = trackListHTML;
    } else {
        document.getElementById("tracks").innerHTML = await (await fetch(`http://localhost:1958/screen/filter/tracks/${text}`)).text();
    }
}

async function modifyTrack(id = currentTrack.id) {
    if (!id) {
        return;
    }

    isBeingModified = true;
    let track = tracks[id];
    console.warn(tracks, id, tracks[id])
    player.src = `/tracks/${track.videoId}.m4a`;
    let content = document.getElementById("content");
    trackListHTML = content.innerHTML;

    content.innerHTML = await (await fetch(`http://localhost:1958/screen/modify/track/${id}`)).text();
    new InputRange("trackModificator", document.getElementById("trackModificator"), track, "modifyTrackStart", "modifyTrackEnd");

    content.style.overflowY = "hidden";
}

function modifyArtist() {

}

function synchronize() {
    fetch("http://localhost:1958/synchronize");
}

function download(id) {
    fetch(`http://localhost:1958/download/${id}`).then(data => toast("OK"));
}

function toast(text) {
    document.getElementById("toaster").style.transform = "translateX(0%)";
    setTimeout(_ => document.getElementById("toaster").style.transform = "translateX(-110%)", 3000);
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
    isBeingModified = false;
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
    fetch(`http://localhost:1958/track/${id}`, {
        method: "PUT",
        body: JSON.stringify(tracks[id]),
        headers: { 'Content-Type': 'application/json' }
    });
    hide();
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

function previous() {

}

function next() {
    let index = Math.floor(Math.random() * tracksArray.length);
    startPlay(`${tracksArray[index].id}`);
}