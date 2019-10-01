import "core-js/stable";
import "regenerator-runtime/runtime";

import React from "react";
import ReactDOM from "react-dom";
import App from "./App.js";

import MediaManager from "./utils/MediaManager";
import DataStorage from "./utils/DataStorage";
import ActionManager from "./utils/ActionManager";

const SERVER_ADDRESS = "https://192.168.1.18:1804";

global.dataStorage = new DataStorage();
global.mediaManager = new MediaManager(global.dataStorage);
global.actionManager = new ActionManager();

global.configuration = {
    serverAddress: "https://192.168.1.18:1804",
    shuffleMode: true
};

async function start() {
    let tracks = await (await fetch(`${SERVER_ADDRESS}/tracks`)).json();
    let artists = await (await fetch(`${SERVER_ADDRESS}/artists`)).json();

    global.dataStorage.set("tracks", tracks);
    global.dataStorage.set("artists", artists);

    ReactDOM.render(<App />, document.getElementById("root"));
}

start();
