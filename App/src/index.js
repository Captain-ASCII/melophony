import "core-js/stable";
import "regenerator-runtime/runtime";

import React from "react";
import ReactDOM from "react-dom";
import App from "./App.js";
import SplashScreen from "./screens/SplashScreen.js";

import ActionManager from "./utils/ActionManager";
import ApiManager from "./utils/ApiManager";
import ConfigurationManager from "./utils/ConfigurationManager";
import DataStorage from "./utils/DataStorage";
import MediaManager from "./utils/MediaManager";

const SERVER_ADDRESS = "https://192.168.1.18:1804";

global.actionManager = new ActionManager();
global.apiManager = new ApiManager();
global.configurationManager = new ConfigurationManager();
global.dataStorage = new DataStorage();
global.mediaManager = new MediaManager(global.dataStorage);

async function start() {
    let tracks = await (await fetch(`${global.configurationManager.get("serverAddress")}/tracks`)).json();
    let artists = await (await fetch(`${global.configurationManager.get("serverAddress")}/artists`)).json();

    global.dataStorage.set("tracks", tracks);
    global.dataStorage.set("artists", artists);

    ReactDOM.render(<App />, document.getElementById("root"));
}

ReactDOM.render(<SplashScreen />, document.getElementById("root"));
start();
