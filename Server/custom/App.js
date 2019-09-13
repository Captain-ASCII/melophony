
const EXTRACT_DURATION = 2000;
const SERVER_ADDRESS = "https://melophony.ddns.net";

async function start() {
    tracks = await (await fetch(`${SERVER_ADDRESS}/tracks`)).json();
    artists = await (await fetch(`${SERVER_ADDRESS}/artists`)).json();

    commonStart();
};