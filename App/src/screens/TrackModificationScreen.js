import React, { Component } from "react";

import InputRange from "../components/utils/InputRange";

import AbstractModificationScreen from "./AbstractModificationScreen";

export default class TrackModificationScreen extends AbstractModificationScreen {

    constructor(props) {
        super(props);


        this.artistsNames = dataStorage.getAsArray("artists").map(artist => <option key={ artist.id } data-value={ artist.id } value={ artist.name } />);
        this.data = dataStorage.get(`/tracks/${this.props.match.params.id}`);
        this.artist = dataStorage.get(`/artists/${this.data.artist}`);

        this.type = "track";
        this.title = `${ this.artist.name } - ${ this.data.title }`;

        this.state = { artistName: this.artist.name };
    }

    download() {
        apiManager.get(`download/${this.data.videoId}`, _ => false);
    }

    requestServerDownload() {

    }

    deleteItem() {

    }

    createArtist() {
        apiManager.post("artist", this.state.artistName);
    }

    renderForm() {
        return (
            <div>
                <div class="columns">
                    <div>
                        <div class="input">
                            <i class="fa fa-music fa-2x icon"></i>
                            <input type="text" class="form-data" id="title" defaultValue={ this.data.title } />
                        </div>
                        <div class="input">
                            <i class="fa fa-male fa-2x icon"></i>
                            <input type="text" list="artistNames" class="form-data" id="artist"
                                   autoComplete="off" onInput={ e => this.setState({ artistName: e.target.value }) } defaultValue={ this.artist.name } />
                            <i class="fa fa-plus fa-1x icon button" onClick={ _ => this.createArtist() }></i>
                            <datalist id="artistNames">{ this.artistsNames }</datalist>
                        </div>
                        <div class="input">
                            <i class="fa fa-ruler fa-2x icon"></i>
                            <input type="text" class="form-data" id="duration" defaultValue={ this.data.duration } />
                        </div>

                        <div class="input">
                            <i class="fa fa-fingerprint fa-2x icon"></i>
                            <input type="text" disabled defaultValue={ this.data.id } />
                        </div>
                        <div class="input">
                            <i class="fa fa-clock fa-2x icon"></i>
                            <input type="text" disabled defaultValue={ this.data.creationDate } />
                        </div>
                        <div class="input">
                            <i class="fa fa-file-contract fa-2x icon"></i>
                            <input type="text" disabled class={ this.data.status } defaultValue={ this.data.status } />
                        </div>
                        <div class="input">
                            <i class="fab fa-youtube fa-2x icon"></i>
                            <input type="text" class="form-data" id="videoId" defaultValue={ this.data.videoId } />
                        </div>
                    </div>
                    <div id="serverInformation">
                        <h2 style={{ marginLeft: 5 }} >Actions</h2>
                        <div class="actions">
                            <div class="button raised" onClick={ _ => this.download() } >Get locally</div>
                            <div class="button raised" onClick={ _ => this.requestServerDownload() } >Download</div>
                            <div class="button raised alert" onClick={ _ => this.deleteItem("track") } >Delete</div>
                        </div>
                    </div>
                </div>

                <div class="delimiter"></div>

                <h2 class="centeredTitle" >Modify track duration</h2>
                <div class="input">
                    <i class="fa fa-ruler fa-2x icon"></i>
                    <InputRange track={this.data} multiRange />
                </div>
            </div>
        );
    }
}