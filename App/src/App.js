import React, { Component } from "react";

import { hot } from "react-hot-loader";
import { BrowserRouter as Router, Switch, Route, Link } from "react-router-dom";

import TracksScreen from "./screens/TracksScreen";
import ArtistsScreen from "./screens/ArtistsScreen";

class App extends Component {

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
                                <Route path="/tracks"><TracksScreen /></Route>
                                <Route path="/artists"><ArtistsScreen /></Route>
                                <Route path="/"><TracksScreen /></Route>
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
                                    <img src="/melophony.png" style={{ height: "100%" }}/>
                                </div>
                                <h1>Melophony</h1>
                            </div>
                        </Link>
                        <div id="headerActions">
                            <i onClick={this.synchronize} class="fa fa-download icon button"></i>
                        </div>
                    </div>
                    <div id="footer">
                        <audio id="player">
                            <p>If you are reading this, it is because your browser does not support the audio element.</p>
                        </audio>
                        <div id="controls">
                            <div class="button icon" onClick={global.mediaManager.previous} ><i class="fa fa-backward fa-2x" ></i></div>
                            <div class="button icon" onClick={global.mediaManager.playPause} ><i id="playButton" class="fa fa-play fa-2x" tabIndex="-1" ></i></div>
                            <div class="button icon" onClick={global.mediaManager.next} ><i class="fa fa-forward fa-2x" ></i></div>
                        </div>
                        <div id="currentTrackInfo" onClick={this.modifyTrack} ></div>
                        <div id="tracker"></div>
                    </div>
                </div>
            </Router>
        );
    }
}

export default hot(module)(App);