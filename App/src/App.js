import React, { Component } from "react";
import { hot } from "react-hot-loader";

class App extends Component {

    playPause() {
        if (player.paused) {
            play();
        } else {
            pause();
        }
    }

    previous() {
        currentIndex = shuffleMode ? Math.floor(Math.random() * tracksArray.length) : (currentIndex - 1) % tracksArray.length;
        startPlay(`${tracksArray[currentIndex].id}`, currentIndex);
    }

    next() {
        currentIndex = shuffleMode ? Math.floor(Math.random() * tracksArray.length) : (currentIndex + 1) % tracksArray.length;
        startPlay(`${tracksArray[currentIndex].id}`, currentIndex);
    }

    async displayScreen(screen) {
        lastScreen = currentScreen;
        currentScreen = screen;
        document.getElementById("content").innerHTML = await (await fetch(`${SERVER_ADDRESS}/screen/${screen}`)).text();
    }

    async displayTrackScreen() {
        displayScreen(currentDisplayType);
    }

    render() {
        return(
            <div class="App">
                <div class="main-container">
                    <div class="sidebar left" >
                        <div class="button" onClick={this.displayTrackScreen} >Titles</div>
                        <div class="button" onClick={this.displayScreen} >Artists</div>
                        <div id="toaster">
                            <div id="toasterText">?!</div>
                        </div>
                    </div>
                    <div id="content">

                    </div>
                    <div class="sidebar right" >
                        <div class="border"></div>
                        <div class="content-right">

                        </div>
                    </div>
                </div>
                <div id="header">
                    <div id="AppHeader">
                        <div class="logo" >
                            <img src="/melophony.png" style={{ height: "100%" }}/>
                        </div>
                        <h1>Melophony</h1>
                    </div>
                    <div id="headerActions">
                        <i onClick={this.synchronize} class="fa fa-download icon button"></i>
                    </div>
                </div>
                <div id="footer">
                    <audio id="player">
                        <p>If you are reading this, it is because your browser does not support the audio element.</p>
                    </audio>
                    <div id="controls">
                        <div class="button icon" onClick={this.previous} ><i class="fa fa-backward fa-2x" ></i></div>
                        <div class="button icon" onClick={this.playPause} ><i id="playButton" class="fa fa-play fa-2x" tabIndex="-1" ></i></div>
                        <div class="button icon" onClick={this.next} ><i class="fa fa-forward fa-2x" ></i></div>
                    </div>
                    <div id="currentTrackInfo" onClick={this.modifyTrack} ></div>
                    <div id="tracker"></div>
                </div>
            </div>
        );
    }
}

export default hot(module)(App);