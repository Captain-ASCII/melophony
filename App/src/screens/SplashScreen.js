import React, { Component } from "react";

import Select from "../components/utils/Select";

export default class SplashScreen extends Component {

    displaySessionParameters() {
        document.getElementById("sessionParameters").style.display = "flex";
    }

    async configureNetwork(value) {
        configurationManager.set("serverAddress", value);
        configurationManager.set("networkEnabled", value == "https://melophony.ddns.net");

        this.props.getRequiredData();
    }

    render() {
        return (
            <div id="splash">
                <i id="sessionParametersIcon" onClick={ _ => this.displaySessionParameters() } class="fa fa-cog icon button"></i>
                <div id="sessionParameters">
                    <Select id="serverUrl" placeholder="Network configuration" icon="network-wired"
                            onSelection={ value => this.configureNetwork(value) } >
                        <option value="https://melophony.ddns.net" >Online</option>
                        <option value="https://192.168.1.18:1804" >Offline</option>
                        <option value="http://localhost:1958" >Local</option>
                    </Select>
                </div>
                <img id="splashImg" src="/img/melophony.png" />
                <h1 id="splashTitle" >Melophony</h1>
            </div>
        );
    }
}