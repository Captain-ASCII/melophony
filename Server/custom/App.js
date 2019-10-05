
const EXTRACT_DURATION = 2000;
const WS_PROTOCOL = "wss";
let DOMAIN = "melophony.ddns.net";
let SERVER_ADDRESS = `https://${DOMAIN}`;
let userId = "";

function switchLocalMode(element) {
    let networking = DOMAIN == "melophony.ddns.net";
    DOMAIN = networking ? "192.168.1.18" : "melophony.ddns.net";
    SERVER_ADDRESS = `https://${DOMAIN}`;
    switchButton(element, networking);
    fetch(`${SERVER_ADDRESS}/user/${userId}/configuration/networkMode`, { method: "PUT", body: networking });
}

async function start() {
    tracks = await (await fetch(`${SERVER_ADDRESS}/tracks`)).json();
    artists = await (await fetch(`${SERVER_ADDRESS}/artists`)).json();
    userId = await (await fetch(`${SERVER_ADDRESS}/user`)).json();

    commonStart();
};