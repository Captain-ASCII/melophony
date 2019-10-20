import React, { Component } from "react";

import CloseButton from "../components/utils/CloseButton";

export default class TrackCreationScreen extends Component {

    constructor(props) {
        super(props);

        this.videoIdInput = React.createRef();
    }

    requestServerDownload() {
        apiManager.post(`file/${this.videoIdInput.current.value}`);
    }

    render() {
        return (
            <div id="AddTrackScreen" >
                <div id="modificationPageHeader">
                    <CloseButton />
                    <h2 id="modificationPageTitle">Add a new track</h2>
                    <div class="button raised" onClick={ _ => this.requestServerDownload() } >Download</div>
                </div>
                <div class="input">
                    <i class="fab fa-youtube fa-2x icon"></i>
                    <input ref={this.videoIdInput} type="text" class="form-data" id="videoId" defaultValue="" placeholder="Youtube video ID" />
                </div>
            </div>
        );
    }
}