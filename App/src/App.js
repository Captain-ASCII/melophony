import React, { Component } from "react";

import { hot } from "react-hot-loader";
import { BrowserRouter as Router, Switch, Route, Link } from "react-router-dom";

import ArtistModificationScreen from "./screens/ArtistModificationScreen";
import ArtistOverviewScreen from "./screens/ArtistOverviewScreen";
import ArtistsScreen from "./screens/ArtistsScreen";
import TrackCreationScreen from "./screens/TrackCreationScreen";
import TrackModificationScreen from "./screens/TrackModificationScreen";
import TracksScreen from "./screens/TracksScreen";

import ConfirmOverlay from "./components/utils/ConfirmOverlay";
import InputRange from "./components/utils/InputRange";
import SwitchButton from "./components/utils/Switch";

class App extends Component {

    componentDidMount() {
        global.mediaManager.setPlayer();
    }

    switchNetwork(enabled) {
        configurationManager.set("serverAddress", (enabled ? "https://melophony.ddns.net" : "http://localhost:1958"));
        console.warn(configurationManager.get("serverAddress"))
    }

    synchronize() {
        apiManager.get("synchronize");
    }

    render() {
        return(
            <Router>
                <div class="App">
                    <div class="main-container">
                        <div class="sidebar left" >
                            <Link to="/tracks" ><div class="button">Titles</div></Link>
                            <Link to="/artists" ><div class="button">Artists</div></Link>
                            <div id="toaster">
                                <div id="toasterText">?!</div>
                            </div>
                        </div>
                        <div id="content">
                            <Switch>
                                <Route path="/tracks" component={TracksScreen} />
                                <Route path="/track/modify/:id" component={TrackModificationScreen} />
                                <Route path="/track/create" component={TrackCreationScreen} />
                                <Route path="/artists" component={ArtistsScreen} />
                                <Route path="/artist/modify/:id" component={ArtistModificationScreen} />
                                <Route path="/artist/:id" component={ArtistOverviewScreen} />
                                <Route path="/" component={TracksScreen} />
                            </Switch>
                        </div>
                        <div class="sidebar right" >
                            <div class="border"></div>
                            <div class="content-right">

                            </div>
                        </div>
                    </div>
                    <div id="header">
                        <Link to="/" >
                            <div id="AppHeader">
                                <div class="logo" >
                                    <img src="/img/melophony.png" style={{ height: "100%" }}/>
                                </div>
                                <h1>Melophony</h1>
                            </div>
                        </Link>
                        <div id="headerActions">
                            <i onClick={this.synchronize} class="fa fa-download icon button"></i>
                            <SwitchButton icon="network-wired" title="Should connect to network for data"
                                          configurationSwitch="networkEnabled" onSwitch={this.switchNetwork} />
                        </div>
                    </div>
                    <div id="footer">
                        <audio id="player">
                            <p>If you are reading this, it is because your browser does not support the audio element.</p>
                        </audio>
                        <div id="controls">
                            <div class="button icon" onClick={ _ => global.mediaManager.previous() } ><i class="fa fa-backward fa-2x" ></i></div>
                            <div class="button icon" onClick={ _ => global.mediaManager.playPause() } ><i id="playButton" class="fa fa-play fa-2x" tabIndex="-1" ></i></div>
                            <div class="button icon" onClick={ _ => global.mediaManager.next() } ><i class="fa fa-forward fa-2x" ></i></div>
                        </div>
                        <Link to={`/track/modify/${ mediaManager.getCurrentTrack().id }`} id="currentTrackInfoLink" >
                            <div id="currentTrackInfo" ></div>
                        </Link>
                        <InputRange asReader />
                    </div>
                    <ConfirmOverlay />
                </div>
            </Router>
        );
    }
}

export default hot(module)(App);