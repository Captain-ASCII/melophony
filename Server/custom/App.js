
const EXTRACT_DURATION = 2000;
const DOMAIN = "melophony.ddns.net";
const SERVER_ADDRESS = `https://${DOMAIN}`;
const WS_PROTOCOL = "wss";

async function start() {
    tracks = await (await fetch(`${SERVER_ADDRESS}/tracks`)).json();
    artists = await (await fetch(`${SERVER_ADDRESS}/artists`)).json();

    commonStart();
};