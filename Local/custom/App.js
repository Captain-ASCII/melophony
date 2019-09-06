
let EXTRACT_DURATION = 2000;

let tracks = {};
let artists = {};
let tracksArray = [];
let player = null;

async function start() {
    tracks = await (await fetch("http://localhost:1958/availableTracks")).json();
    artists = await (await fetch("http://localhost:1958/artists")).json();
    tracksArray = Object.values(tracks);

    player = document.getElementById("player");
};

function get(v, defaultValue) {
    return v || defaultValue;
}

async function changeScreen(screen) {
    document.getElementById("content").innerHTML = await (await fetch(`http://localhost:1958/screen/${screen}`)).text();
}

async function filter(text) {
    document.getElementById("tracks").innerHTML = await (await fetch(`http://localhost:1958/screen/tracks/filter/${text}`)).text();
}

async function modifyTrack(id) {
    if (!id) {
        return;
    }

    player.onended = function() {};
    await changeScreen(`modify/track/${id}`);
    new InputRange("trackModificator", document.getElementById("trackModificator"), tracks[id], "modifyTrackStart", "modifyTrackEnd");
}

async function createArtist() {
    let artist = await (await fetch(`http://localhost:1958/artist`, {
        method: "POST",
        body: document.getElementById("artist").value,
        headers: { "Content-Type": "text/plain" }
    })).json();
    artists[artist.id] = artist;
}

function modifyArtist() {

}

function synchronize() {
    fetch("http://localhost:1958/synchronize");
}

function download(id) {
    fetch(`http://localhost:1958/download/${id}`).then(data => toast("OK"));
}

function deleteTrack(id) {
    fetch(`http://localhost:1958/track/${id}`, { method: "DELETE" }).then(data => {
        changeScreen("tracks");
        toast("OK");
    });
}

function requestServerDownload(videoId) {
    fetch(`https://melophony.ddns.net/${videoId}`, { method: "PUT" }).then(data => toast("OK"));
}

function toast(text) {
    const toaster = document.getElementById("toaster");
    toaster.innerHTML = text;
    toaster.style.transform = "translateX(0%)";
    setTimeout(_ => document.getElementById("toaster").style.transform = "translateX(-110%)", 3000);
}

function getPercentage(id, value) {
    return (value / tracks[id].duration) * 100;
}

function modifyTrackStart(id, value) {
    player.src = `/tracks/${tracks[id].videoId}.m4a`;
    playExtract(value);
    document.querySelector("#trackModificator > .trackBar").style.left = `calc(${getPercentage(id, value)}% + 10px)`;
    tracks[id].startTime = parseInt(value);
}

function modifyTrackEnd(id, value) {
    player.src = `/tracks/${tracks[id].videoId}.m4a`;
    playExtract(value);
    document.querySelector("#trackModificator > .trackBar").style.right = `calc(${100 - getPercentage(id, value)}% + 10px)`;
    tracks[id].endTime = parseInt(value + (EXTRACT_DURATION / 1000));
}

function hide() {
    changeScreen("tracks");
}

async function saveAndHide(id) {
    let inputs = document.querySelectorAll(".form-data");
    for (let input of inputs) {
        if (input.list) {
            console.warn(`${input.list.id} option[value='${input.value}']`)
            tracks[id][input.id] = document.querySelector(`#${input.list.id} option[value='${input.value}']`).getAttribute("data-value");
        } else {
            tracks[id][input.id] = input.value;
        }
    }
    await fetch(`http://localhost:1958/track/${id}`, {
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