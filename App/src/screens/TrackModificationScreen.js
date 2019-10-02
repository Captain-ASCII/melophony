import React, { Component } from "react";

import CloseButton from "../components/utils/CloseButton";
import InputRange from "../components/utils/InputRange";

export default class TrackModificationScreen extends Component {

    constructor(props) {
        super(props);

        this.artistsNames = dataStorage.getAsArray("artists").map(artist => <option data-value={ artist.id } value={ artist.name } />);
        this.track = dataStorage.get(`/tracks/${this.props.match.params.id}`);
        this.artist = dataStorage.get(`/artists/${this.track.artist}`);
    }

    render() {
        return (
            <div id="modificationPage">
                <div id="modificationPageHeader">
                    <CloseButton />
                    <h2 id="modificationPageTitle">{ this.artist.name } - { this.track.title }</h2>
                    <div id="saveButton" class="button raised" onClick={ _ => this.saveAndHide("track", this.track.id) } >Save</div>
                </div>
                <div id="modificationDownloadProgress">
                    <div id={`${this.track.videoId}Progress`} class="progressBar"></div>
                </div>
                <div class="columns">
                    <div>
                        <div class="input">
                            <i class="fa fa-music fa-2x icon"></i>
                            <input type="text" class="form-data" id="title" defaultValue={ this.track.title } />
                        </div>
                        <div class="input">
                            <i class="fa fa-male fa-2x icon"></i>
                            <input type="text" list="artistNames" class="form-data" id="artist" defaultValue={ this.artist.name } />
                            <i class="fa fa-plus fa-1x icon button" onClick={ _ => this.createArtist() }></i>
                            <datalist id="artistNames">{ this.artistNames }</datalist>
                        </div>
                        <div class="input">
                            <i class="fa fa-ruler fa-2x icon"></i>
                            <input type="text" class="form-data" id="duration" defaultValue={ this.track.duration } />
                        </div>

                        <div class="input">
                            <i class="fa fa-fingerprint fa-2x icon"></i>
                            <input type="text" disabled defaultValue={ this.track.id } />
                        </div>
                        <div class="input">
                            <i class="fa fa-clock fa-2x icon"></i>
                            <input type="text" disabled defaultValue={ this.track.creationDate } />
                        </div>
                        <div class="input">
                            <i class="fa fa-file-contract fa-2x icon"></i>
                            <input type="text" disabled class={ this.track.status } defaultValue={ this.track.status } />
                        </div>
                        <div class="input">
                            <i class="fab fa-youtube fa-2x icon"></i>
                            <input type="text" class="form-data" id="videoId" defaultValue={ this.track.videoId } />
                        </div>
                    </div>
                    <div></div>
                    <div id="serverInformation">
                        <h2>Actions</h2>
                        <div class="actions">
                            <div class="button raised" onClick={ _ => this.download(this.track.videoId) } >Get locally</div>
                            <div class="button raised" onClick={ _ => this.requestServerDownload(this.track.videoId) } >Download</div>
                        </div>
                    </div>
                </div>

                <div class="delimiter"></div>

                <h2 style={{ marginLeft: 66 }} >Modify track duration</h2>
                <div class="input">
                    <i class="fa fa-ruler fa-2x icon"></i>
                    <InputRange multiRange />
                </div>

                <div class="delimiter"></div>

                <div class="actions">
                    <div class="button raised alert" onClick={ _ => this.deleteItem("track", this.track.id) } >Delete</div>
                </div>
            </div>
        );
    }
}