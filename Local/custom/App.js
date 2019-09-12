
let EXTRACT_DURATION = 2000;

let lastScreen = "";
let currentScreen = "tracks";
let currentTrackId = "";

let tracks = {};
let artists = {};
let tracksArray = [];
let currentIndex = -1;
let player = null;

const connection = new WebSocket("wss://melophony.ddns.net");

connection.onmessage = function (event) {
    console.warn(event.data)
    let data = JSON.parse(event.data);

    switch (data.event) {
        case "progress": {
            if (data.progress == 100) {
                toast(`Done downloading ${data.id}`);
                download(data.id);
            }
            progress(data.id, data.progress);
            break;
        };
    }
};

async function start() {
    tracks = await (await fetch("http://localhost:1958/availableTracks")).json();
    artists = await (await fetch("http://localhost:1958/artists")).json();
    tracksArray = Object.values(tracks);
    tracksArray.sort((a, b) => new Date(b.creationDate) - new Date(a.creationDate));

    player = document.getElementById("player");
};

function get(v, defaultValue) {
    return v || defaultValue;
}

async function changeScreen(screen) {
    lastScreen = currentScreen;
    currentScreen = screen;
    document.getElementById("content").innerHTML = await (await fetch(`http://localhost:1958/screen/${screen}`)).text();
}

function back() {
    changeScreen(lastScreen);
}

async function filter(text) {
    document.getElementById("tracks").innerHTML = await (await fetch(`http://localhost:1958/screen/${currentDataType}/filter/${text}`)).text();
}

async function modifyTrack(id = currentTrackId) {
    player.onended = function() {};
    player.ontimeupdate = function() {};
    await changeScreen(`track/modify/${id}`);
    new InputRange("trackModificator", document.getElementById("trackModificator"), tracks[id], "modifyTrackStart", "modifyTrackEnd");
}

async function createArtist() {
    let artist = await (await fetch(`http://localhost:1958/artist`, {
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

function modifyArtist() {

}

function synchronize() {
    fetch("http://localhost:1958/synchronize");
}

function download(id) {
    fetch(`http://localhost:1958/download/${id}`).then(data => toast("OK"));
}

function deleteItem(type, id) {
    fetch(`http://localhost:1958/${type}/${id}`, { method: "DELETE" }).then(data => {
        changeScreen(`${type}s`);
        toast("OK");
    });
}

function requestServerDownload(videoId) {
    fetch(`https://melophony.ddns.net/${videoId}`, { method: "PUT" }).then(data => toast("Download requested"));
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
    console.warn(value, Math.max(0, parseInt(value) + (EXTRACT_DURATION / 1000)));
    tracks[id].endTime = Math.max(0, parseInt(value) + (EXTRACT_DURATION / 1000));
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

    await fetch(`http://localhost:1958/${type}/${id}`, {
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

    player.src = `/tracks/${track.videoId}.m4a`;
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