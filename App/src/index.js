import "core-js/stable";
import "regenerator-runtime/runtime";

import React from "react";
import ReactDOM from "react-dom";
import App from "./App.js";

import ActionManager from "./utils/ActionManager";
import ConfigurationManager from "./utils/ConfigurationManager";
import DataStorage from "./utils/DataStorage";
import MediaManager from "./utils/MediaManager";

const SERVER_ADDRESS = "https://192.168.1.18:1804";

global.actionManager = new ActionManager();
global.configurationManager = new ConfigurationManager();
global.dataStorage = new DataStorage();
global.mediaManager = new MediaManager(global.dataStorage);

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
