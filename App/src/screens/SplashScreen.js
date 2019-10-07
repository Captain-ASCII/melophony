import React, { Component } from "react";

export default class SplashScreen extends Component {

    render() {
        return (
            <div id="splash">
                <img id="splashImg" src="/img/melophony.png" />
                <h1 id="splashTitle" >Melophony</h1>
            </div>
        );
    }
}