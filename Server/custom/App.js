
const EXTRACT_DURATION = 2000;
const WS_PROTOCOL = "wss";
let DOMAIN = "melophony.ddns.net";
let SERVER_ADDRESS = `https://${DOMAIN}`;

function switchLocalMode(element) {
    switchButton(element);
    DOMAIN = "192.168.1.18";
}

async function start() {
    tracks = await (await fetch(`${SERVER_ADDRESS}/tracks`)).json();
    artists = await (await fetch(`${SERVER_ADDRESS}/artists`)).json();

    commonStart();
};