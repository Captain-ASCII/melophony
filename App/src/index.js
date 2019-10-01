import "core-js/stable";
import "regenerator-runtime/runtime";

import React from "react";
import ReactDOM from "react-dom";
import App from "./App.js";

import MediaManager from "./utils/MediaManager";

global.mediaManager = new MediaManager();

ReactDOM.render(<App />, document.getElementById("root"));