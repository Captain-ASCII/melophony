
let extractTimeout = null;

let currentDataType = "tracks";
let currentDisplayType = "list";
let shuffleMode = false;

let lastScreen = "";
let currentScreen = "tracks";

let tracks = {};
let artists = {};
let tracksArray = [];
let currentIndex = -1;
let currentTrackId = "";
let player = null;

function commonStart() {
    tracksArray = Object.values(tracks);
    tracksArray.sort((a, b) => new Date(b.creationDate) - new Date(a.creationDate));

    player = document.getElementById("player");
}

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

function switchTrackMode(element) {
    if (shuffleMode) {
        element.classList.remove("active");
    } else {
        element.classList.add("active");
    }
    shuffleMode = !shuffleMode;
}

function modifyTrackStart(id, value) {
    player.src = `/files/${tracks[id].videoId}.m4a`;
    playExtract(value);
    document.querySelector("#trackModificator > .trackBar").style.left = `calc(${getPercentage(id, value)}% + 10px)`;
    tracks[id].startTime = parseInt(value);
}

function modifyTrackEnd(id, value) {
    player.src = `/files/${tracks[id].videoId}.m4a`;
    playExtract(value);
    document.querySelector("#trackModificator > .trackBar").style.right = `calc(${100 - getPercentage(id, value)}% + 10px)`;
    console.warn(value, Math.max(0, parseInt(value) + (EXTRACT_DURATION / 1000)));
    tracks[id].endTime = Math.max(0, parseInt(value) + (EXTRACT_DURATION / 1000));
}

/* Display */

async function changeScreen(screen) {
    lastScreen = currentScreen;
    currentScreen = screen;
    document.getElementById("content").innerHTML = await (await fetch(`${SERVER_ADDRESS}/screen/${screen}`)).text();
}

function back() {
    changeScreen(lastScreen);
}

async function modifyTrack(id = currentTrackId) {
    player.onended = function() {};
    player.ontimeupdate = function() {};
    await changeScreen(`track/modify/${id}`);
    new InputRange("trackModificator", document.getElementById("trackModificator"), tracks[id], "modifyTrackStart", "modifyTrackEnd");
}

async function createArtist() {
    let artist = await (await fetch(`${SERVER_ADDRESS}/artist`, {
        method: "POST",
        body: document.getElementById("artist").value,
        headers: { "Content-Type": "text/plain" }
    })).json();
    artists[artist.id] = artist;

    let artistOption = document.createElement("option");
    artistOption.value = artist.name;
    let attribute = document.createAttribute("data-value");
    attribute.value = artist.id;
    artistOption.setAttributeNode(attribute);

    document.getElementById("artistNames").appendChild(artistOption);
}

function changeTrackDisplay(dataType, displayType) {
    currentDataType = dataType;
    currentDisplayType = displayType;
    changeScreen(dataType);
}

async function filter(text) {
    document.getElementById("tracks").innerHTML = await (await fetch(`${SERVER_ADDRESS}/screen/${currentDataType}/filter/${text}`)).text();
}

function progress(videoId, progressValue) {
    const downloadProgressBar = document.getElementById(`${videoId}Progress`);

    downloadProgressBar.firstElementChild.style.width = `${progressValue}%`;
    downloadProgressBar.lastElementChild.innerHTML = `${progressValue}%`;
}

function toast(text) {
    const toaster = document.getElementById("toaster");
    toaster.innerHTML = text;
    toaster.style.transform = "translateX(0%)";
    setTimeout(_ => document.getElementById("toaster").style.transform = "translateX(-110%)", 3000);
}

function get(v, defaultValue) {
    return v || defaultValue;
}

function getPercentage(id, value) {
    return (value / tracks[id].duration) * 100;
}

async function saveAndHide(type, id) {
    let collection = (type === "artist") ? artists : tracks;

    let inputs = document.querySelectorAll(".form-data");
    for (let input of inputs) {
        if (input.list) {
            let listElement = document.querySelector(`#${input.list.id} option[value='${input.value}']`);
            if (listElement) {
                collection[id][input.id] = listElement.getAttribute("data-value");
            }
        } else {
            collection[id][input.id] = input.value;
        }
    }

    await fetch(`${SERVER_ADDRESS}/${type}/${id}`, {
        method: "PUT",
        body: JSON.stringify(collection[id]),
        headers: { 'Content-Type': 'application/json' }
    });
    back();
}

function startPlay(id, index) {
    currentIndex = index;
    currentTrackId = id;

    let track = tracks[id];
    currentTrack = track;
    let artist = artists[currentTrack.artist] || { name: "Unknown" };

    player.src = `/files/${track.videoId}.m4a`;
    player.currentTime = track.startTime;

    player.ontimeupdate = function(event) {
        if (player.currentTime > track.endTime) {
            next();
        }
    };
    document.getElementById("currentTrackInfo").innerHTML = `${artist.name} - ${currentTrack.title}`;
    new InputRange("tracker", document.getElementById("tracker"), track).asReader(player);

    play();
}

function previous() {
    currentIndex = shuffleMode ? Math.floor(Math.random() * tracksArray.length) : (currentIndex - 1) % tracksArray.length;
    startPlay(`${tracksArray[currentIndex].id}`, currentIndex);
}

function next() {
    currentIndex = shuffleMode ? Math.floor(Math.random() * tracksArray.length) : (currentIndex + 1) % tracksArray.length;
    startPlay(`${tracksArray[currentIndex].id}`, currentIndex);
}

function deleteItem(type, id) {
    fetch(`${SERVER_ADDRESS}/${type}/${id}`, { method: "DELETE" }).then(data => {
        changeScreen(`${type}s`);
        toast("OK");
    });
}

function requestServerDownload(videoId) {
    fetch(`${SERVER_ADDRESS}/file/${videoId}`, { method: "POST" }).then(data => {
        changeScreen("tracks");
        toast("Download requested");
    });
}

function modifyArtist() {

}